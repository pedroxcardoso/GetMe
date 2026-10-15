const { app, BrowserWindow, clipboard, dialog, ipcMain, protocol, shell } = require("electron");
const { spawn, execFile } = require("node:child_process");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { promisify } = require("node:util");
const { randomUUID } = require("node:crypto");

protocol.registerSchemesAsPrivileged([
  { scheme: "getme", privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

// Keep the previous userData folder so the GETME V1 rebrand preserves local preferences.
app.setPath("userData", path.join(app.getPath("appData"), "pipoca-pixel-downloader"));

const execFileAsync = promisify(execFile);
const providers = ["youtube", "x", "instagram", "tiktok"];
const formats = ["mp4", "mp3"];
const resolutions = ["2160", "1080", "720", "480"];
const hosts = {
  youtube: new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"]),
  x: new Set(["x.com", "www.x.com", "twitter.com", "www.twitter.com", "mobile.twitter.com"]),
  instagram: new Set(["instagram.com", "www.instagram.com", "m.instagram.com", "instagr.am"]),
  tiktok: new Set(["tiktok.com", "www.tiktok.com", "m.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"]),
};
const setupUrls = {
  ytDlp: "https://github.com/yt-dlp/yt-dlp/releases/latest",
  ffmpeg: "https://ffmpeg.org/download.html",
};

let mainWindow = null;
let settingsWriteQueue = Promise.resolve();
const jobs = new Map();

function dataFile(name) {
  return path.join(app.getPath("userData"), name);
}

function defaultSettings() {
  return {
    downloadPath: app.getPath("downloads"),
    openAfterDownload: false,
    theme: "dark",
    themePreferenceVersion: 2,
    toolPaths: { ytDlp: "", ffmpeg: "" },
  };
}

async function readJson(name, fallback) {
  try {
    return JSON.parse(await fsp.readFile(dataFile(name), "utf8"));
  } catch {
    return fallback;
  }
}

async function readSettings() {
  const fallback = defaultSettings();
  const stored = await readJson("settings.json", fallback);
  return {
    downloadPath: typeof stored.downloadPath === "string" ? stored.downloadPath : fallback.downloadPath,
    openAfterDownload: stored.openAfterDownload === true,
    theme: stored.themePreferenceVersion === 2 && stored.theme === "light" ? "light" : "dark",
    toolPaths: {
      ytDlp: typeof stored.toolPaths?.ytDlp === "string" ? stored.toolPaths.ytDlp : "",
      ffmpeg: typeof stored.toolPaths?.ffmpeg === "string" ? stored.toolPaths.ffmpeg : "",
    },
  };
}

async function writeJsonAtomically(name, value) {
  const destination = dataFile(name);
  await fsp.mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.${randomUUID()}.tmp`;
  await fsp.writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await fsp.rename(temporary, destination);
}

function assertTrustedSender(event) {
  const frameUrl = event.senderFrame?.url;
  if (!frameUrl) throw new Error("Origem inválida para esta ação.");
  const url = new URL(frameUrl);
  const isPackagedApp = url.protocol === "getme:" && url.hostname === "app";
  const isDevApp = isAllowedDevUrl(frameUrl);
  if (!isPackagedApp && !isDevApp) throw new Error("Origem inválida para esta ação.");
}

function isAllowedDevUrl(value) {
  if (app.isPackaged || !process.env.GETME_DEV_SERVER_URL) return false;
  try {
    const expected = new URL(process.env.GETME_DEV_SERVER_URL);
    const actual = new URL(value);
    return expected.protocol === "http:" && expected.hostname === "127.0.0.1" && actual.origin === expected.origin;
  } catch {
    return false;
  }
}

function handle(channel, callback) {
  ipcMain.handle(channel, async (event, ...args) => {
    assertTrustedSender(event);
    return callback(...args);
  });
}

function binaryNames(tool) {
  if (tool === "ytDlp") return process.platform === "win32" ? ["yt-dlp.exe", "yt-dlp"] : ["yt-dlp"];
  return process.platform === "win32" ? ["ffmpeg.exe", "ffmpeg"] : ["ffmpeg"];
}

function executableCandidates(configuredPath, tool) {
  const candidates = [];
  if (configuredPath) candidates.push(configuredPath);
  const names = binaryNames(tool);
  const localTools = path.join(app.getPath("userData"), "tools");
  for (const name of names) candidates.push(path.join(localTools, name));
  for (const entry of (process.env.PATH || "").split(path.delimiter).filter(Boolean)) {
    for (const name of names) candidates.push(path.join(entry, name));
  }
  return [...new Set(candidates)];
}

async function findExecutable(tool, configuredPath) {
  for (const candidate of executableCandidates(configuredPath, tool)) {
    try {
      if (!(await fsp.stat(candidate)).isFile()) continue;
      const args = tool === "ytDlp" ? ["--version"] : ["-version"];
      const { stdout, stderr } = await execFileAsync(candidate, args, { timeout: 5000, windowsHide: true, maxBuffer: 16_000 });
      const version = String(stdout || stderr).split(/\r?\n/, 1)[0].trim();
      return {
        available: Boolean(version),
        version: version || null,
        path: candidate,
        source: configuredPath && path.resolve(candidate) === path.resolve(configuredPath) ? "configurado" : "encontrado",
      };
    } catch {
      // Keep looking: a broken PATH entry should not prevent a later valid one from working.
    }
  }
  return { available: false, version: null, path: null, source: "não encontrado" };
}

async function inspectTools() {
  const settings = await readSettings();
  const [ytDlp, ffmpeg] = await Promise.all([
    findExecutable("ytDlp", settings.toolPaths.ytDlp),
    findExecutable("ffmpeg", settings.toolPaths.ffmpeg),
  ]);
  return { ytDlp, ffmpeg, downloadPath: settings.downloadPath };
}

function validateRequest(request) {
  if (!request || !providers.includes(request.provider)) throw new Error("Escolha uma plataforma válida.");
  if (!formats.includes(request.format) || (request.provider !== "youtube" && request.format !== "mp4")) {
    throw new Error("Esse formato não está disponível nesta plataforma.");
  }
  if (!resolutions.includes(String(request.resolution))) throw new Error("Escolha uma resolução válida.");
  if (typeof request.url !== "string" || request.url.length > 4096) throw new Error("Cole um link válido da plataforma selecionada.");
  let parsed;
  try {
    parsed = new URL(request.url.trim());
  } catch {
    throw new Error("Cole um endereço completo, começando com https://.");
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || (parsed.port && parsed.port !== "443")) {
    throw new Error("Use um link HTTPS público, sem nome de usuário ou senha.");
  }
  if (!hosts[request.provider].has(parsed.hostname.toLowerCase())) {
    throw new Error(`Este link não pertence à tela de ${request.provider}. Escolha a plataforma certa e tente de novo.`);
  }
  if (request.provider === "instagram" && !/^\/(?:reel|reels)\//i.test(parsed.pathname)) {
    throw new Error("Cole o link direto de um Reel público do Instagram.");
  }
  if (request.provider === "x" && !/\/status\/\d+/i.test(parsed.pathname)) {
    throw new Error("Cole o link de um post do X que tenha vídeo.");
  }
  if (request.provider === "tiktok" && !["vm.tiktok.com", "vt.tiktok.com"].includes(parsed.hostname.toLowerCase()) && !/\/@[^/]+\/video\/\d+/i.test(parsed.pathname)) {
    throw new Error("Cole o link direto de um vídeo do TikTok.");
  }
  return parsed.toString();
}

function emitJob(job, patch = {}) {
  Object.assign(job, patch);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("download:event", {
      id: job.id,
      provider: job.provider,
      format: job.format,
      status: job.status,
      title: job.title,
      filePath: job.filePath,
      percent: job.percent,
      speed: job.speed,
      eta: job.eta,
      message: job.message,
    });
  }
}

function safeFilePath(filePath, destination) {
  if (!filePath) return null;
  const resolved = path.resolve(filePath);
  const relative = path.relative(path.resolve(destination), resolved);
  if (!relative || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))) return resolved;
  return null;
}

function ytDlpArguments(request, destination, ffmpegPath) {
  const args = [
    "--ignore-config",
    "--no-playlist",
    "--no-warnings",
    "--no-colors",
    "--newline",
    "--progress",
    "--progress-delta", "1",
    "--progress-template", "download:__GETME_PROGRESS__%(progress._percent_str)s|%(progress._speed_str)s|%(progress._eta_str)s",
    "--print", "before_dl:__GETME_TITLE__%(title)s",
    "--print", "after_move:__GETME_FILE__%(filepath)s",
    "--trim-filenames", "180",
    "--output-na-placeholder", "sem-titulo",
    "--output", "%(title)s [%(id)s].%(ext)s",
    "--paths", destination,
  ];

  if (request.format === "mp3") {
    args.push("--format", "bestaudio/best", "--extract-audio", "--audio-format", "mp3", "--audio-quality", "0");
  } else {
    const limit = String(request.resolution);
    args.push("--format", `bv*[height<=${limit}][ext=mp4]+ba[ext=m4a]/b[height<=${limit}][ext=mp4]/b[height<=${limit}]`, "--remux-video", "mp4");
  }
  if (ffmpegPath) args.push("--ffmpeg-location", ffmpegPath);
  args.push("--", request.url);
  return args;
}

function cleanLine(value) {
  return value.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "").replace(/\u0000/g, "").trim();
}

function friendlyDownloadError(output) {
  const value = cleanLine(output).slice(-5000);
  if (/ffmpeg|ffprobe/i.test(value) && /not found|not installed|unable to/i.test(value)) {
    return "O FFmpeg não foi encontrado. Confira o caminho dele em Configurações.";
  }
  if (/unsupported url|no suitable extractor/i.test(value)) {
    return "Este link não pôde ser reconhecido. Confirme se ele é público e se o yt-dlp está atualizado.";
  }
  if (/private|sign in|login required|confirm you.re not a bot|members-only/i.test(value)) {
    return "A plataforma exige login ou restringe este conteúdo. O GETME não usa cookies nem tenta contornar essa restrição.";
  }
  if (/429|too many requests|rate limit|captcha|403 forbidden/i.test(value)) {
    return "A plataforma limitou ou bloqueou esta tentativa. Aguarde um pouco e tente novamente mais tarde.";
  }
  return "A plataforma não concluiu este download. Confirme se o link está público, atualize o yt-dlp e tente novamente.";
}

async function appendHistory(entry) {
  const current = await readJson("history.json", []);
  const rows = Array.isArray(current) ? current.filter((row) => row && typeof row.id === "string") : [];
  rows.unshift(entry);
  await writeJsonAtomically("history.json", rows.slice(0, 100));
}

function cancelProcess(child) {
  if (process.platform === "win32") {
    const taskkill = spawn("taskkill.exe", ["/pid", String(child.pid), "/t", "/f"], { windowsHide: true, stdio: "ignore" });
    taskkill.unref();
    return;
  }
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
}

async function startDownload(rawRequest) {
  const url = validateRequest(rawRequest);
  const settings = await readSettings();
  const capabilities = await inspectTools();
  if (!capabilities.ytDlp.available) throw new Error("Configure o yt-dlp em Configurações antes de baixar.");
  if (!capabilities.ffmpeg.available) throw new Error("Configure o FFmpeg em Configurações antes de baixar ou converter.");
  try {
    if (!(await fsp.stat(settings.downloadPath)).isDirectory()) throw new Error("Escolha uma pasta de destino existente em Configurações.");
  } catch {
    throw new Error("A pasta de destino não está disponível. Escolha outra em Configurações.");
  }

  const request = { ...rawRequest, url, resolution: String(rawRequest.resolution) };
  const job = {
    id: randomUUID(),
    provider: request.provider,
    format: request.format,
    destination: settings.downloadPath,
    status: "starting",
    title: "Preparando o arquivo…",
    filePath: null,
    percent: null,
    speed: "",
    eta: "",
    message: "",
    cancelled: false,
    output: "",
  };
  const child = spawn(capabilities.ytDlp.path, ytDlpArguments(request, settings.downloadPath, capabilities.ffmpeg.path), {
    windowsHide: true,
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" },
  });
  job.child = child;
  jobs.set(job.id, job);
  emitJob(job, { status: "downloading", message: "Conectando à plataforma…" });

  let stdoutBuffer = "";
  let stderrBuffer = "";
  function consume(chunk, stream) {
    const input = stream === "stdout" ? chunk : "";
    job.output = `${job.output}${chunk}`.slice(-12000);
    const buffered = stream === "stdout" ? (stdoutBuffer += input) : (stderrBuffer += chunk);
    const lines = buffered.split(/\r?\n/);
    if (stream === "stdout") stdoutBuffer = lines.pop() || "";
    else stderrBuffer = lines.pop() || "";
    for (const rawLine of lines) {
      const line = cleanLine(rawLine);
      if (line.startsWith("__GETME_TITLE__")) {
        const title = line.slice("__GETME_TITLE__".length).trim();
        if (title) emitJob(job, { title, message: "Baixando…" });
      } else if (line.startsWith("__GETME_FILE__")) {
        const parsed = line.slice("__GETME_FILE__".length).trim();
        job.filePath = safeFilePath(parsed, job.destination);
      } else if (line.includes("__GETME_PROGRESS__")) {
        const data = line.slice(line.indexOf("__GETME_PROGRESS__") + "__GETME_PROGRESS__".length).split("|");
        const percentValue = data[0]?.match(/([\d.]+)\s*%/);
        emitJob(job, {
          percent: percentValue ? Math.min(100, Math.max(0, Number(percentValue[1]))) : null,
          speed: data[1]?.trim() || "",
          eta: data[2]?.trim() || "",
          message: "Baixando…",
        });
      }
    }
  }

  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk) => consume(chunk, "stdout"));
  child.stderr.on("data", (chunk) => consume(chunk, "stderr"));
  child.once("error", (error) => {
    job.output += `\n${error.message}`;
  });
  child.once("close", async (code) => {
    jobs.delete(job.id);
    if (job.cancelled) {
      emitJob(job, { status: "cancelled", message: "Download cancelado." });
      return;
    }
    if (code !== 0) {
      emitJob(job, { status: "error", message: friendlyDownloadError(job.output) });
      return;
    }
    const completedAt = new Date().toISOString();
    const filePath = safeFilePath(job.filePath, job.destination);
    try {
      await appendHistory({
        id: job.id,
        provider: job.provider,
        format: job.format,
        title: job.title === "Preparando o arquivo…" ? path.basename(filePath || "Arquivo baixado") : job.title,
        filePath,
        destination: job.destination,
        createdAt: completedAt,
      });
      emitJob(job, { status: "done", percent: 100, filePath, message: "Download concluído!" });
      if (settings.openAfterDownload && filePath) shell.showItemInFolder(filePath);
    } catch {
      emitJob(job, { status: "done", percent: 100, filePath, message: "Download concluído; não consegui atualizar o histórico local." });
    }
  });
  return job.id;
}

function installHandlers() {
  handle("settings:read", readSettings);
  handle("settings:save", async (patch) => {
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) throw new Error("Preferências inválidas.");
    const current = await readSettings();
    const next = { ...current };
    if (typeof patch.openAfterDownload === "boolean") next.openAfterDownload = patch.openAfterDownload;
    if (patch.theme === "light" || patch.theme === "dark") next.theme = patch.theme;
    next.themePreferenceVersion = 2;
    settingsWriteQueue = settingsWriteQueue.catch(() => {}).then(() => writeJsonAtomically("settings.json", next));
    await settingsWriteQueue;
    return next;
  });

  handle("tools:inspect", inspectTools);
  handle("tools:choose-path", async (tool) => {
    if (tool !== "ytDlp" && tool !== "ffmpeg") throw new Error("Escolha um executável válido.");
    const filters = process.platform === "win32" ? [{ name: "Programa", extensions: ["exe"] }] : [{ name: "Programa", extensions: ["*"] }];
    const result = await dialog.showOpenDialog(mainWindow, { title: tool === "ytDlp" ? "Selecionar yt-dlp" : "Selecionar FFmpeg", properties: ["openFile"], filters });
    if (result.canceled || !result.filePaths[0]) return null;
    const selectedPath = result.filePaths[0];
    const settings = await readSettings();
    const toolLabel = tool === "ytDlp" ? "ytDlp" : "ffmpeg";
    const checked = await findExecutable(toolLabel, selectedPath);
    if (!checked.available || path.resolve(checked.path) !== path.resolve(selectedPath)) {
      throw new Error("Este arquivo não parece ser um executável válido para a ferramenta selecionada.");
    }
    const patch = { toolPaths: { ...settings.toolPaths, [toolLabel]: selectedPath } };
    await saveSettings(patch);
    return selectedPath;
  });
  handle("tools:open-setup", async (tool) => {
    const url = tool === "ytDlp" ? setupUrls.ytDlp : tool === "ffmpeg" ? setupUrls.ffmpeg : null;
    if (!url) throw new Error("Página de instalação inválida.");
    await shell.openExternal(url);
  });
  handle("clipboard:read", () => clipboard.readText());

  handle("folder:choose-download", async () => {
    const settings = await readSettings();
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Escolha onde guardar seus arquivos",
      defaultPath: settings.downloadPath,
      properties: ["openDirectory", "createDirectory"],
    });
    if (result.canceled || !result.filePaths[0]) return null;
    const selectedPath = path.resolve(result.filePaths[0]);
    await saveSettings({ downloadPath: selectedPath });
    return selectedPath;
  });

  handle("download:start", startDownload);
  handle("download:cancel", async (id) => {
    const job = jobs.get(id);
    if (!job) return;
    job.cancelled = true;
    emitJob(job, { message: "Cancelando…" });
    cancelProcess(job.child);
  });

  handle("history:list", async () => {
    const rows = await readJson("history.json", []);
    return Array.isArray(rows) ? rows.filter((row) => row && typeof row.id === "string").slice(0, 100) : [];
  });
  handle("history:remove", async (id) => {
    if (typeof id !== "string" || id.length > 80) throw new Error("Registro inválido.");
    const rows = await readJson("history.json", []);
    const kept = Array.isArray(rows) ? rows.filter((row) => row && row.id !== id) : [];
    await writeJsonAtomically("history.json", kept.slice(0, 100));
  });
  handle("file:open", async (filePath) => {
    if (typeof filePath !== "string") return;
    const resolved = path.resolve(filePath);
    const rows = await readJson("history.json", []);
    const isRecorded = Array.isArray(rows) && rows.some((row) => row?.filePath && path.resolve(row.filePath) === resolved);
    if (!isRecorded) throw new Error("Este arquivo não faz parte do histórico do GETME.");
    if (!(await fsp.stat(resolved).catch(() => null))?.isFile()) throw new Error("O arquivo não está mais nesta pasta.");
    const error = await shell.openPath(resolved);
    if (error) throw new Error(error);
  });
  handle("file:reveal", async (filePath) => {
    if (typeof filePath !== "string") throw new Error("Arquivo inválido.");
    const resolved = path.resolve(filePath);
    const rows = await readJson("history.json", []);
    const isRecorded = Array.isArray(rows) && rows.some((row) => row?.filePath && path.resolve(row.filePath) === resolved);
    if (!isRecorded) throw new Error("Este arquivo não faz parte do histórico do GETME.");
    if (!(await fsp.stat(resolved).catch(() => null))?.isFile()) throw new Error("O arquivo não está mais nesta pasta.");
    shell.showItemInFolder(resolved);
  });
}

async function saveSettings(patch) {
  const current = await readSettings();
  const next = { ...current, ...patch, themePreferenceVersion: 2, toolPaths: { ...current.toolPaths, ...(patch.toolPaths || {}) } };
  settingsWriteQueue = settingsWriteQueue.catch(() => {}).then(() => writeJsonAtomically("settings.json", next));
  await settingsWriteQueue;
  return next;
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

async function serveRenderer(request) {
  const url = new URL(request.url);
  if (url.hostname !== "app") return new Response("Not found", { status: 404 });
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  if (pathname === "/" || pathname === "") pathname = "/index.html";
  const rendererRoot = path.resolve(__dirname, "..", "dist");
  const target = path.resolve(rendererRoot, `.${pathname}`);
  const relative = path.relative(rendererRoot, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return new Response("Not found", { status: 404 });
  try {
    const body = await fsp.readFile(target);
    return new Response(body, {
      headers: {
        "Content-Type": mimeTypes[path.extname(target).toLowerCase()] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-src 'none'",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 402,
    height: 874,
    minWidth: 360,
    minHeight: 680,
    backgroundColor: "#000000",
    title: "GETME",
    icon: path.join(__dirname, "assets", "getme.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  mainWindow.webContents.on("will-navigate", (event, targetUrl) => {
    const parsed = new URL(targetUrl);
    const isLocalApp = parsed.protocol === "getme:" && parsed.hostname === "app";
    const isDevApp = isAllowedDevUrl(targetUrl);
    if (!isLocalApp && !isDevApp) event.preventDefault();
  });
  mainWindow.on("closed", () => { mainWindow = null; });

  const developmentUrl = process.env.GETME_DEV_SERVER_URL;
  if (!app.isPackaged && developmentUrl) mainWindow.loadURL(developmentUrl);
  else mainWindow.loadURL("getme://app/index.html");
}

app.whenReady().then(() => {
  protocol.handle("getme", serveRenderer);
  installHandlers();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
