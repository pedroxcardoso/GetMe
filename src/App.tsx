import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  AudioLines,
  Check,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  FileVideo2,
  Folder,
  FolderOpen,
  HardDrive,
  History,
  Link2,
  LoaderCircle,
  Pause,
  Play,
  Search,
  Settings2,
  ShieldCheck,
  Video,
  X,
} from "lucide-react";
import { GetmeMark, PlatformIcon } from "./components/GetmeMark";
import { PixelThemeToggle } from "./components/PixelThemeToggle";
import type {
  AppSettings,
  Capabilities,
  ColorTheme,
  DownloadEvent,
  DownloadRequest,
  HistoryEntry,
  OutputFormat,
  Provider,
  Resolution,
  ToolStatus,
} from "./env";

type Page = Provider | "history" | "settings";
type Job = DownloadEvent & { sourceUrl: string };

const PROVIDERS: { id: Provider; label: string; short: string }[] = [
  { id: "youtube", label: "YouTube", short: "YT" },
  { id: "x", label: "X (Twitter)", short: "X" },
  { id: "instagram", label: "Instagram", short: "IG" },
  { id: "tiktok", label: "TikTok", short: "TT" },
];

const URL_PLACEHOLDERS: Record<Provider, string> = {
  youtube: "https://www.youtube.com/watch?v=...",
  x: "https://x.com/perfil/status/...",
  instagram: "https://www.instagram.com/reel/...",
  tiktok: "https://www.tiktok.com/@perfil/video/...",
};

const DEFAULT_SETTINGS: AppSettings = {
  downloadPath: "",
  openAfterDownload: false,
  theme: "light",
  toolPaths: { ytDlp: "", ffmpeg: "" },
};

const ALL_RESOLUTIONS: Resolution[] = ["2160", "1080", "720", "480"];
const SOCIAL_RESOLUTIONS: Resolution[] = ["1080", "720", "480"];

function friendlyError(error: unknown) {
  return error instanceof Error ? error.message : "Não consegui concluir esta ação. Tente novamente.";
}

function providerName(provider: Provider) {
  return PROVIDERS.find((item) => item.id === provider)?.label || provider;
}

function formatName(format: OutputFormat) {
  return format.toUpperCase();
}

function isProviderPage(page: Page): page is Provider {
  return PROVIDERS.some((item) => item.id === page);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data desconhecida";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

function shortPath(value: string) {
  if (!value) return "Pasta Downloads do computador";
  return value.length > 60 ? `…${value.slice(-57)}` : value;
}

function GetmeWordmark() {
  return (
    <div className="wordmark" aria-label="GETME">
      <span className="wordmark-text">GETME<span className="wordmark-period">✦</span></span>
      <span className="wordmark-tag">PIXEL MEDIA BOX</span>
    </div>
  );
}

function NavButton({
  active,
  children,
  icon,
  label,
  badge,
  onClick,
}: {
  active: boolean;
  children?: ReactNode;
  icon: ReactNode;
  label: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-current={active ? "page" : undefined}
      className={`nav-button ${active ? "is-active" : ""}`}
      onClick={onClick}
      type="button"
    >
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
      {badge && <span className="nav-badge">{badge}</span>}
      {children}
    </button>
  );
}

function StatusLine({ children, kind = "info" }: { children: ReactNode; kind?: "info" | "warning" | "success" }) {
  return (
    <div className={`status-line status-${kind}`} role={kind === "warning" ? "alert" : "status"}>
      {kind === "success" ? <Check aria-hidden="true" size={15} /> : kind === "warning" ? <CircleAlert aria-hidden="true" size={15} /> : <ShieldCheck aria-hidden="true" size={15} />}
      <span>{children}</span>
    </div>
  );
}

function ToolPill({ tool, status }: { tool: string; status: ToolStatus | undefined }) {
  const ready = status?.available === true;
  return (
    <span aria-label={`${tool}: ${ready ? "pronto" : "não encontrado"}`} className={`tool-pill ${ready ? "tool-ready" : "tool-missing"}`}>
      <span className="status-dot" aria-hidden="true" />
      <span>{tool}</span>
    </span>
  );
}

function SelectionCard({
  active,
  description,
  icon,
  label,
  onClick,
  tone,
}: {
  active: boolean;
  description: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  tone: "mint" | "butter";
}) {
  return (
    <button
      aria-pressed={active}
      className={`selection-card selection-${tone} ${active ? "is-selected" : ""}`}
      onClick={onClick}
      type="button"
    >
      <span className="selection-check" aria-hidden="true">{active && <Check size={13} strokeWidth={3} />}</span>
      <span className="selection-icon">{icon}</span>
      <span className="selection-copy"><strong>{label}</strong><small>{description}</small></span>
    </button>
  );
}

function JobCard({
  job,
  onCancel,
  onRetry,
  onOpenFile,
  onOpenFolder,
}: {
  job: Job;
  onCancel: (id: string) => void;
  onRetry: (job: Job) => void;
  onOpenFile: (path: string) => void;
  onOpenFolder: (path: string) => void;
}) {
  const active = job.status === "starting" || job.status === "downloading";
  const percent = job.percent === null ? null : Math.round(job.percent);
  return (
    <article className={`job-card ${active ? "job-active" : ""} ${job.status === "error" || job.status === "cancelled" ? "job-error" : ""}`}>
      <div className="job-icon-wrap"><PlatformIcon provider={job.provider} size={24} /></div>
      <div className="job-main">
        <div className="job-heading">
          <div className="job-title-group">
            <strong className="job-title">{job.title}</strong>
            <span className="job-subtitle">{providerName(job.provider)} <span aria-hidden="true">·</span> {formatName(job.format)}</span>
          </div>
          {active && (
            <button aria-label="Cancelar download" className="icon-button cancel-button" onClick={() => onCancel(job.id)} type="button">
              <Pause aria-hidden="true" size={15} />
            </button>
          )}
          {job.status === "done" && <span className="complete-label"><Check aria-hidden="true" size={13} /> Pronto</span>}
        </div>
        <div className="progress-track" role="progressbar" aria-label={`Progresso do download de ${job.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent ?? undefined}>
          <span className={`progress-fill ${percent === null && active ? "is-indeterminate" : ""}`} style={{ width: percent === null ? undefined : `${percent}%` }} />
        </div>
        <div className="job-foot">
          <span className={`job-message ${job.status === "error" ? "text-danger" : ""}`} role={job.status === "error" ? "alert" : "status"}>{job.message || (active ? "Preparando…" : "")}</span>
          <span className="job-meta">
            {active && <>{job.speed && <span>{job.speed}</span>}{job.eta && <span>~ {job.eta}</span>}</>}
            {percent !== null && active && <span>{percent}%</span>}
          </span>
        </div>
        {!active && job.status === "done" && (
          <div className="job-actions">
            {job.filePath && <button className="text-button" onClick={() => onOpenFile(job.filePath!)} type="button"><Play size={13} /> Abrir arquivo</button>}
            {job.filePath && <button className="text-button" onClick={() => onOpenFolder(job.filePath!)} type="button"><FolderOpen size={13} /> Mostrar na pasta</button>}
          </div>
        )}
        {(job.status === "error" || job.status === "cancelled") && (
          <button className="text-button retry-button" onClick={() => onRetry(job)} type="button"><ArrowRight size={13} /> Usar este link novamente</button>
        )}
      </div>
    </article>
  );
}

function ToolCard({
  title,
  status,
  description,
  pathValue,
  onChoose,
  onSetup,
}: {
  title: string;
  status: ToolStatus | undefined;
  description: string;
  pathValue: string;
  onChoose: () => void;
  onSetup: () => void;
}) {
  const ready = status?.available === true;
  return (
    <article className={`tool-card ${ready ? "tool-card-ready" : "tool-card-missing"}`}>
      <div className="tool-card-top">
        <span className="tool-card-icon">{ready ? <Check size={18} /> : <CircleAlert size={18} />}</span>
        <div><h3>{title}</h3><p>{description}</p></div>
        <span className={`tool-badge ${ready ? "" : "badge-warning"}`}>{ready ? "Pronto" : "Precisa configurar"}</span>
      </div>
      {ready && status?.version && <p className="tool-version">Versão {status.version} <span>·</span> {status.source === "encontrado" ? "encontrado no sistema" : "caminho salvo"}</p>}
      {pathValue && <p className="tool-path" title={pathValue}>{pathValue}</p>}
      <div className="tool-actions">
        <button className="soft-button" onClick={onChoose} type="button"><FolderOpen size={15} /> {ready ? "Trocar executável" : "Localizar executável"}</button>
        <button className="text-button" onClick={onSetup} type="button">Onde baixar? <ExternalLink size={13} /></button>
      </div>
    </article>
  );
}

function App() {
  const [page, setPage] = useState<Page>("youtube");
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [theme, setTheme] = useState<ColorTheme>(DEFAULT_SETTINGS.theme);
  const [isThemeSaving, setIsThemeSaving] = useState(false);
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<OutputFormat>("mp4");
  const [resolution, setResolution] = useState<Resolution>("1080");
  const [fieldError, setFieldError] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyFilter, setHistoryFilter] = useState<Provider | "all">("all");
  const [historyError, setHistoryError] = useState("");
  const [folderError, setFolderError] = useState("");
  const [folderNotice, setFolderNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [bootError, setBootError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [clipboardMessage, setClipboardMessage] = useState("");
  const urlRef = useRef<HTMLInputElement>(null);

  const refreshHistory = useCallback(async () => {
    setHistory(await window.getme.listHistory());
  }, []);

  const refreshTools = useCallback(async () => {
    const [freshSettings, freshCapabilities] = await Promise.all([
      window.getme.readSettings(),
      window.getme.inspectTools(),
    ]);
    setSettings(freshSettings);
    setTheme(freshSettings.theme);
    setCapabilities(freshCapabilities);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([window.getme.readSettings(), window.getme.inspectTools(), window.getme.listHistory()])
      .then(([savedSettings, tools, savedHistory]) => {
        if (!active) return;
        setSettings(savedSettings);
        setTheme(savedSettings.theme);
        setCapabilities(tools);
        setHistory(savedHistory);
      })
      .catch((error: unknown) => { if (active) setBootError(friendlyError(error)); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => window.getme.onDownloadEvent((incoming) => {
    setJobs((current) => {
      const existing = current.find((job) => job.id === incoming.id);
      const next: Job = { ...(existing || { sourceUrl: "" }), ...incoming, sourceUrl: existing?.sourceUrl || "" };
      const others = current.filter((job) => job.id !== incoming.id);
      return [next, ...others].slice(0, 10);
    });
    if (incoming.status === "done") void refreshHistory();
  }), [refreshHistory]);

  useEffect(() => {
    const title = page === "history" ? "Histórico" : page === "settings" ? "Configurações" : providerName(page);
    document.title = `${title} — GETME`;
  }, [page]);

  useEffect(() => {
    if (isProviderPage(page) && page !== "youtube" && format === "mp3") setFormat("mp4");
  }, [page, format]);

  const toolsReady = Boolean(capabilities?.ytDlp.available && capabilities.ffmpeg.available);
  const selectedProvider = isProviderPage(page) ? page : "youtube";
  const availableResolutions = selectedProvider === "youtube" ? ALL_RESOLUTIONS : SOCIAL_RESOLUTIONS;
  const providerJobs = useMemo(() => jobs.filter((job) => isProviderPage(page) && job.provider === page), [jobs, page]);
  const filteredHistory = useMemo(() => {
    const query = historyQuery.trim().toLocaleLowerCase("pt-BR");
    return history.filter((item) => {
      if (historyFilter !== "all" && item.provider !== historyFilter) return false;
      if (!query) return true;
      return `${item.title} ${providerName(item.provider)} ${item.filePath || ""}`.toLocaleLowerCase("pt-BR").includes(query);
    });
  }, [history, historyFilter, historyQuery]);

  function navigate(nextPage: Page) {
    setPage(nextPage);
    setFieldError("");
    setSettingsError("");
    setSettingsMessage("");
    setActionError("");
    if (isProviderPage(nextPage)) {
      setFormat("mp4");
      setResolution("1080");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isProviderPage(page) || isStarting) return;
    const trimmed = url.trim();
    if (!trimmed) {
      setFieldError("Cole o link do vídeo para continuar.");
      urlRef.current?.focus();
      return;
    }
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      setFieldError("Use o link completo, começando com https://.");
      urlRef.current?.focus();
      return;
    }
    if (parsed.protocol !== "https:") {
      setFieldError("Por segurança, o link precisa começar com https://.");
      urlRef.current?.focus();
      return;
    }
    setFieldError("");
    setIsStarting(true);
    try {
      const request: DownloadRequest = { url: trimmed, provider: page, format, resolution };
      const id = await window.getme.startDownload(request);
      setJobs((current) => {
        const existing = current.find((job) => job.id === id);
        if (existing) return current.map((job) => job.id === id ? { ...job, sourceUrl: trimmed } : job);
        const localJob: Job = {
          id,
          provider: page,
          format,
          sourceUrl: trimmed,
          status: "starting",
          title: "Preparando o arquivo…",
          filePath: null,
          percent: null,
          speed: "",
          eta: "",
          message: "Conectando à plataforma…",
        };
        return [localJob, ...current].slice(0, 10);
      });
    } catch (error) {
      setFieldError(friendlyError(error));
      urlRef.current?.focus();
    } finally {
      setIsStarting(false);
    }
  }

  async function handlePaste() {
    try {
      const pasted = await window.getme.readClipboard();
      if (!pasted) {
        setClipboardMessage("A área de transferência está vazia.");
        urlRef.current?.focus();
        return;
      }
      setUrl(pasted.trim());
      setFieldError("");
      setClipboardMessage("Link colado.");
      urlRef.current?.focus();
    } catch (error) {
      setClipboardMessage(friendlyError(error));
    }
  }

  async function chooseDownloadFolder() {
    try {
      const folder = await window.getme.chooseDownloadFolder();
      if (folder) {
        setSettings((current) => ({ ...current, downloadPath: folder }));
        setSettingsMessage("Pasta de destino atualizada.");
        setSettingsError("");
        setFolderNotice("Pasta de destino atualizada.");
        setFolderError("");
      }
    } catch (error) {
      setFolderError(friendlyError(error));
      setSettingsError(friendlyError(error));
    }
  }

  async function chooseToolPath(tool: "ytDlp" | "ffmpeg") {
    try {
      const selected = await window.getme.chooseToolPath(tool);
      if (selected) {
        await refreshTools();
        setSettingsMessage(`${tool === "ytDlp" ? "yt-dlp" : "FFmpeg"} configurado.`);
        setSettingsError("");
      }
    } catch (error) {
      setSettingsError(friendlyError(error));
    }
  }

  async function toggleOpenAfterDownload() {
    try {
      const next = await window.getme.saveSettings({ openAfterDownload: !settings.openAfterDownload });
      setSettings(next);
      setSettingsMessage("Preferência salva neste computador.");
      setSettingsError("");
    } catch (error) {
      setSettingsError(friendlyError(error));
    }
  }

  async function toggleTheme() {
    if (isThemeSaving) return;
    const previous = theme;
    const next: ColorTheme = previous === "light" ? "dark" : "light";
    setTheme(next);
    setIsThemeSaving(true);
    try {
      const saved = await window.getme.saveSettings({ theme: next });
      setSettings(saved);
      setSettingsMessage("Tema salvo neste computador.");
      setSettingsError("");
    } catch (error) {
      setTheme(previous);
      setActionError(`Não consegui salvar o tema. ${friendlyError(error)}`);
    } finally {
      setIsThemeSaving(false);
    }
  }

  async function removeHistory(id: string) {
    try {
      await window.getme.removeHistoryEntry(id);
      setHistory((current) => current.filter((item) => item.id !== id));
      setHistoryError("");
    } catch (error) {
      setHistoryError(friendlyError(error));
    }
  }

  async function openDownloadedFile(filePath: string, reveal: boolean) {
    try {
      if (reveal) await window.getme.revealFile(filePath);
      else await window.getme.openFile(filePath);
      setActionError("");
    } catch (error) {
      setActionError(friendlyError(error));
    }
  }

  async function cancelDownload(id: string) {
    try {
      await window.getme.cancelDownload(id);
      setActionError("");
    } catch (error) {
      setActionError(friendlyError(error));
    }
  }

  async function openSetupPage(tool: "ytDlp" | "ffmpeg") {
    try {
      await window.getme.openSetupPage(tool);
    } catch (error) {
      setSettingsError(friendlyError(error));
    }
  }

  function providerIcon(provider: Provider) {
    return <PlatformIcon provider={provider} size={23} />;
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark"><GetmeMark size={42} /></div>
          <GetmeWordmark />
        </div>
        <div className="nav-section-label">BAIXAR DE</div>
        <nav aria-label="Plataformas" className="platform-nav">
          {PROVIDERS.map((item) => {
            const count = jobs.filter((job) => job.provider === item.id && (job.status === "starting" || job.status === "downloading")).length;
            return <NavButton key={item.id} active={page === item.id} icon={providerIcon(item.id)} label={item.label} badge={count ? String(count) : undefined} onClick={() => navigate(item.id)} />;
          })}
        </nav>
        <div className="nav-divider" />
        <div className="nav-section-label">SUA BIBLIOTECA</div>
        <nav aria-label="Biblioteca" className="library-nav">
          <NavButton active={page === "history"} icon={<History aria-hidden="true" size={19} />} label="Histórico" onClick={() => navigate("history")} />
        </nav>
        <div className="sidebar-bottom">
          <div className="local-card">
            <span className="local-card-icon"><HardDrive aria-hidden="true" size={17} /></span>
            <div><strong>Seu computador</strong><small>Arquivos ficam por aqui.</small></div>
            <span className="local-dot" aria-label="Modo local ativo" />
          </div>
          <NavButton active={page === "settings"} icon={<Settings2 aria-hidden="true" size={19} />} label="Configurações" onClick={() => navigate("settings")} />
          <div className="sidebar-version"><span className="version-pixel" aria-hidden="true" /> GETME v1.0.0 · V1</div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span className="compact-brand"><GetmeMark size={23} />GETME</span><ChevronRight aria-hidden="true" size={14} /><strong>{isProviderPage(page) ? providerName(page) : page === "history" ? "Histórico" : "Configurações"}</strong></div>
          <div className="topbar-status"><ToolPill tool="yt-dlp" status={capabilities?.ytDlp} /><ToolPill tool="FFmpeg" status={capabilities?.ffmpeg} /><PixelThemeToggle disabled={isThemeSaving} theme={theme} onToggle={() => void toggleTheme()} /></div>
        </header>

        <nav aria-label="Navegação principal" className="mobile-tabbar">
          {PROVIDERS.map((item) => {
            const count = jobs.filter((job) => job.provider === item.id && (job.status === "starting" || job.status === "downloading")).length;
            return (
              <button aria-current={page === item.id ? "page" : undefined} className={`mobile-tab ${page === item.id ? "is-active" : ""}`} key={item.id} onClick={() => navigate(item.id)} type="button">
                <span className="mobile-tab-icon">{providerIcon(item.id)}{count > 0 && <i>{count}</i>}</span>
                <span>{item.id === "instagram" ? "Insta" : item.id === "youtube" ? "YouTube" : item.id === "tiktok" ? "TikTok" : "X"}</span>
              </button>
            );
          })}
          <button aria-current={page === "history" ? "page" : undefined} className={`mobile-tab ${page === "history" ? "is-active" : ""}`} onClick={() => navigate("history")} type="button">
            <span className="mobile-tab-icon"><History aria-hidden="true" size={20} /></span><span>Hist.</span>
          </button>
          <button aria-current={page === "settings" ? "page" : undefined} className={`mobile-tab ${page === "settings" ? "is-active" : ""}`} onClick={() => navigate("settings")} type="button">
            <span className="mobile-tab-icon"><Settings2 aria-hidden="true" size={20} /></span><span>Ajustes</span>
          </button>
        </nav>

        {bootError && <div className="boot-error" role="alert"><CircleAlert size={17} /> {bootError} <button className="text-button" onClick={() => { setBootError(""); setIsLoading(true); void refreshTools().finally(() => setIsLoading(false)); }} type="button">Tentar novamente</button></div>}
        {actionError && <div className="action-feedback" role="alert"><CircleAlert aria-hidden="true" size={15} />{actionError}<button aria-label="Fechar aviso" onClick={() => setActionError("")} type="button"><X size={14} /></button></div>}

        {isLoading && (
          <section className="loading-screen" role="status" aria-live="polite"><span className="loading-mascot"><GetmeMark size={72} /></span><LoaderCircle className="spin" size={20} /><span>Arrumando a caixinha…</span></section>
        )}

        {!isLoading && isProviderPage(page) && (
          <div className="page-content provider-page">
            <div className="page-title-row">
              <div className="page-title-icon">{providerIcon(page)}</div>
              <div><span className="eyebrow eyebrow-muted">SUA PRÓXIMA PARADA</span><h2>{providerName(page)}</h2></div>
              <span className="page-ready-tag"><span className="tiny-pixel" /> PRONTO PRA GUARDAR</span>
            </div>
            {!toolsReady && (
              <div className="setup-callout" role="status">
                <span className="setup-callout-icon"><Settings2 aria-hidden="true" size={19} /></span>
                <div><strong>Uma preparação rapidinha</strong><p>O GETME precisa do yt-dlp e do FFmpeg para transformar links em arquivos.</p></div>
                <button className="soft-button" onClick={() => navigate("settings")} type="button">Configurar motores <ArrowRight size={15} /></button>
              </div>
            )}

            <section className="download-panel pixel-card" aria-labelledby="download-title">
              <div className="section-heading">
                <div className="step-badge">01</div>
                <div><span className="eyebrow eyebrow-muted">UM LINK, UM ARQUIVO</span><h3 id="download-title">Comece por aqui</h3></div>
                <span className="section-spark" aria-hidden="true">✦</span>
              </div>
              <form noValidate onSubmit={handleSubmit}>
                <label className="field-label" htmlFor="media-url">Cole o link de {providerName(page)}</label>
                <div className={`url-field ${fieldError ? "field-invalid" : ""}`}>
                  <Link2 aria-hidden="true" className="url-field-icon" size={18} />
                  <input
                    ref={urlRef}
                    autoComplete="off"
                    id="media-url"
                    aria-invalid={Boolean(fieldError)}
                    aria-describedby={fieldError ? "url-error" : "url-help"}
                    maxLength={4096}
                    name="media-url"
                    onChange={(event) => { setUrl(event.target.value); if (fieldError) setFieldError(""); }}
                    onCompositionStart={(event) => { event.currentTarget.dataset.composing = "true"; }}
                    onCompositionEnd={(event) => { delete event.currentTarget.dataset.composing; }}
                    placeholder={URL_PLACEHOLDERS[page]}
                    spellCheck={false}
                    type="url"
                    value={url}
                  />
                  {url && <button aria-label="Limpar link" className="url-action clear-url" onClick={() => { setUrl(""); setFieldError(""); urlRef.current?.focus(); }} type="button"><X size={15} /></button>}
                  <button className="url-action paste-action" onClick={() => void handlePaste()} type="button"><span>Colar</span><ArrowDownToLine aria-hidden="true" size={14} /></button>
                </div>
                {fieldError ? <p className="field-error" id="url-error" role="alert"><CircleAlert aria-hidden="true" size={14} /> {fieldError}</p> : <p className="field-help" id="url-help"><span className="help-pixel" aria-hidden="true" />{clipboardMessage || "O link precisa ser público e desta plataforma."}</p>}

                <div className="option-divider" />
                <div className="option-group">
                  <div className="option-title"><span className="step-badge step-badge-small">02</span><div><strong>Escolha o formato</strong><small>Qual caixinha combina com você?</small></div></div>
                  <div className="selection-grid" role="group" aria-label="Formato do arquivo">
                    <SelectionCard active={format === "mp4"} description="Vídeo com imagem" icon={<FileVideo2 aria-hidden="true" size={22} />} label="MP4" onClick={() => setFormat("mp4")} tone="mint" />
                    {page === "youtube" && <SelectionCard active={format === "mp3"} description="Só o áudio" icon={<AudioLines aria-hidden="true" size={22} />} label="MP3" onClick={() => setFormat("mp3")} tone="butter" />}
                    {page !== "youtube" && <div className="format-note"><Video aria-hidden="true" size={17} /><span>Esta plataforma salva vídeos em MP4.</span></div>}
                  </div>
                </div>

                {format === "mp4" && (
                  <div className="option-group quality-group">
                    <div className="option-title"><span className="step-badge step-badge-small">03</span><div><strong>Qualidade do vídeo</strong><small>A maior qualidade disponível até este limite.</small></div></div>
                    <div className="quality-choices" role="group" aria-label="Qualidade do vídeo">
                      {availableResolutions.map((value) => (
                        <button aria-pressed={resolution === value} className={`quality-choice ${resolution === value ? "is-selected" : ""}`} key={value} onClick={() => setResolution(value)} type="button">
                          <span>{value === "2160" ? "4K" : value + "p"}</span>{resolution === value && <Check aria-hidden="true" size={13} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="option-group destination-group">
                  <div className="option-title"><span className={`step-badge step-badge-small ${format === "mp3" ? "step-muted" : ""}`}>{format === "mp3" ? "03" : "04"}</span><div><strong>Onde guardar?</strong><small>Você pode trocar essa pasta em qualquer momento.</small></div></div>
                  <div className="destination-row">
                    <span className="destination-icon"><Folder aria-hidden="true" size={18} /></span>
                    <span className="destination-path" title={settings.downloadPath}>{shortPath(settings.downloadPath)}</span>
                    <button className="soft-button change-folder" onClick={() => void chooseDownloadFolder()} type="button">Trocar pasta</button>
                  </div>
                  {(folderError || folderNotice) && <p className={`destination-feedback ${folderError ? "text-danger" : ""}`} role={folderError ? "alert" : "status"}>{folderError || folderNotice}</p>}
                </div>

                <div className="submit-row">
                  <button className="download-button" disabled={!toolsReady || isStarting} type={!toolsReady ? "button" : "submit"} onClick={!toolsReady ? () => navigate("settings") : undefined}>
                    {isStarting ? <><LoaderCircle aria-hidden="true" className="spin" size={17} /> Preparando…</> : !toolsReady ? <><Settings2 aria-hidden="true" size={17} /> Configurar para baixar</> : <><ArrowDownToLine aria-hidden="true" size={18} /> Baixar agora <ArrowRight aria-hidden="true" size={16} /></>}
                  </button>
                  <span className="size-note"><ShieldCheck aria-hidden="true" size={14} /> Salvo direto no seu computador</span>
                </div>
              </form>
              <p className="permission-note">Use links e conteúdos que você tem autorização para guardar. Cada plataforma pode ter regras próprias.</p>
            </section>

            {providerJobs.length > 0 && (
              <section className="jobs-section" aria-labelledby="jobs-heading">
                <div className="subsection-heading"><div><span className="eyebrow eyebrow-muted">AGORA E HÁ POUCO</span><h3 id="jobs-heading">Seus downloads</h3></div><span className="count-pill">{providerJobs.length}</span></div>
                <div className="jobs-list">{providerJobs.map((job) => <JobCard key={job.id} job={job} onCancel={(id) => void cancelDownload(id)} onRetry={(retryJob) => { navigate(retryJob.provider); setUrl(retryJob.sourceUrl); urlRef.current?.focus(); }} onOpenFile={(path) => void openDownloadedFile(path, false)} onOpenFolder={(path) => void openDownloadedFile(path, true)} />)}</div>
              </section>
            )}
          </div>
        )}

        {!isLoading && page === "history" && (
          <div className="page-content history-page">
            <div className="history-heading-row">
              <div><span className="eyebrow eyebrow-muted">SUA COLEÇÃO</span><h2>Histórico <span className="history-count">{history.length}</span></h2><p>O que já chegou direitinho à sua pasta.</p></div>
              <div className="history-mascot"><GetmeMark size={76} /><span>guardadinho</span></div>
            </div>
            <section className="history-panel pixel-card" aria-labelledby="history-list-heading">
              <div className="history-toolbar">
                <div className="history-search">
                  <Search aria-hidden="true" size={17} />
                  <input aria-label="Buscar no histórico" onChange={(event) => setHistoryQuery(event.target.value)} placeholder="Buscar um arquivo..." type="search" value={historyQuery} />
                  {historyQuery && <button aria-label="Limpar busca" className="clear-search" onClick={() => setHistoryQuery("")} type="button"><X aria-hidden="true" size={15} /></button>}
                </div>
                <div className="filter-list" aria-label="Filtrar por plataforma">
                  <button aria-pressed={historyFilter === "all"} className={historyFilter === "all" ? "filter-active" : ""} onClick={() => setHistoryFilter("all")} type="button">Tudo</button>
                  {PROVIDERS.map((item) => <button aria-label={`Filtrar ${item.label}`} aria-pressed={historyFilter === item.id} className={historyFilter === item.id ? "filter-active" : ""} key={item.id} onClick={() => setHistoryFilter(item.id)} type="button"><PlatformIcon provider={item.id} size={18} /></button>)}
                </div>
              </div>
              {historyError && <div className="settings-feedback feedback-error" role="alert"><CircleAlert size={15} />{historyError}</div>}
              <div className="history-list-heading"><h3 id="history-list-heading">Arquivos concluídos</h3><span>{filteredHistory.length} {filteredHistory.length === 1 ? "item" : "itens"}</span></div>
              {filteredHistory.length === 0 ? (
                <div className="history-empty">
                  <div className="empty-doodle"><GetmeMark size={64} /></div>
                  <h3>{history.length === 0 ? "Sua pastinha está vazia." : "Nada apareceu por aqui."}</h3>
                  <p>{history.length === 0 ? "Quando um download terminar, ele vai morar nesta lista." : "Tente outra palavra ou escolha outro filtro."}</p>
                  {history.length === 0 && <button className="soft-button" onClick={() => navigate("youtube")} type="button"><ArrowDownToLine size={15} /> Fazer primeiro download</button>}
                </div>
              ) : (
                <ul className="history-list">
                  {filteredHistory.map((item) => (
                    <li className="history-row" key={item.id}>
                      <div className="history-provider-icon"><PlatformIcon provider={item.provider} size={23} /></div>
                      <div className="history-file-info"><strong title={item.title}>{item.title}</strong><span>{providerName(item.provider)} <span aria-hidden="true">·</span> {formatName(item.format)} <span aria-hidden="true">·</span> {formatDate(item.createdAt)}</span></div>
                      <div className="history-row-actions">
                        {item.filePath && <button aria-label={`Abrir arquivo ${item.title}`} className="icon-button history-action" onClick={() => void openDownloadedFile(item.filePath!, false)} title="Abrir arquivo" type="button"><Play size={15} /></button>}
                        {item.filePath && <button aria-label={`Mostrar ${item.title} na pasta`} className="icon-button history-action" onClick={() => void openDownloadedFile(item.filePath!, true)} title="Mostrar na pasta" type="button"><FolderOpen size={15} /></button>}
                        <button aria-label={`Remover ${item.title} do histórico`} className="icon-button history-action remove-history" onClick={() => void removeHistory(item.id)} title="Remover do histórico" type="button"><X size={15} /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <StatusLine>O histórico fica só neste computador. Remover um item não apaga o arquivo.</StatusLine>
          </div>
        )}

        {!isLoading && page === "settings" && (
          <div className="page-content settings-page">
            <div className="settings-heading-row">
              <div><span className="eyebrow eyebrow-muted">AJUSTE A SUA CAIXINHA</span><h2>Configurações</h2><p>Uma preparação feita uma vez. Depois, é só colar e baixar.</p></div>
              <span className="settings-mascot"><GetmeMark size={76} /></span>
            </div>

            {(settingsError || settingsMessage) && <div className={`settings-feedback ${settingsError ? "feedback-error" : "feedback-success"}`} role={settingsError ? "alert" : "status"}>{settingsError ? <CircleAlert size={15} /> : <Check size={15} />}{settingsError || settingsMessage}</div>}

            <section className="settings-section pixel-card" aria-labelledby="engines-title">
              <div className="section-heading">
                <div className="step-badge"><Settings2 aria-hidden="true" size={17} /></div>
                <div><span className="eyebrow eyebrow-muted">MOTORES LOCAIS</span><h3 id="engines-title">Só falta preparar uma vez</h3></div>
              </div>
              <p className="settings-intro">O yt-dlp conversa com as plataformas. O FFmpeg monta MP4 e converte o áudio para MP3. O GETME usa versões instaladas no seu computador; não baixa executáveis escondido.</p>
              <div className="tool-grid">
                <ToolCard title="yt-dlp" status={capabilities?.ytDlp} description="Reconhece links e busca o vídeo ou áudio." pathValue={capabilities?.ytDlp.path || settings.toolPaths.ytDlp} onChoose={() => void chooseToolPath("ytDlp")} onSetup={() => void openSetupPage("ytDlp")} />
                <ToolCard title="FFmpeg" status={capabilities?.ffmpeg} description="Une faixas de vídeo e transforma áudio em MP3." pathValue={capabilities?.ffmpeg.path || settings.toolPaths.ffmpeg} onChoose={() => void chooseToolPath("ffmpeg")} onSetup={() => void openSetupPage("ffmpeg")} />
              </div>
              <div className="setup-footnote"><ShieldCheck aria-hidden="true" size={15} /><span>O GETME executa estes programas no seu computador, sem passar por um servidor próprio.</span></div>
              <button className="soft-button refresh-tools" onClick={() => { setSettingsError(""); void refreshTools().catch((error: unknown) => setSettingsError(friendlyError(error))); }} type="button"><LoaderCircle size={15} /> Conferir novamente</button>
            </section>

            <section className="settings-section pixel-card" aria-labelledby="destination-title">
              <div className="section-heading">
                <div className="step-badge step-badge-lilac"><Folder aria-hidden="true" size={17} /></div>
                <div><span className="eyebrow eyebrow-muted">DESTINO DOS ARQUIVOS</span><h3 id="destination-title">Sua pasta de downloads</h3></div>
              </div>
              <p className="settings-intro">A pasta fica salva neste computador. Na tela de qualquer plataforma, você pode escolher um destino diferente antes do download.</p>
              <div className="settings-folder-row"><span className="destination-icon"><Folder aria-hidden="true" size={18} /></span><span className="destination-path" title={settings.downloadPath}>{shortPath(settings.downloadPath)}</span><button className="soft-button" onClick={() => void chooseDownloadFolder()} type="button">Escolher pasta</button></div>
              {folderError && <p className="destination-feedback text-danger" role="alert">{folderError}</p>}
              <label className="toggle-row">
                <span className="toggle-copy"><strong>Abrir a pasta do arquivo ao terminar</strong><small>O Explorador de Arquivos mostra onde ele foi salvo.</small></span>
                <input checked={settings.openAfterDownload} onChange={() => void toggleOpenAfterDownload()} type="checkbox" />
                <span className="toggle-switch" aria-hidden="true"><span /></span>
              </label>
            </section>

            <section className="privacy-card">
              <span className="privacy-icon"><ShieldCheck aria-hidden="true" size={18} /></span>
              <div><strong>Seu histórico é seu</strong><p>Preferências e histórico ficam em uma pasta local do GETME. Não armazenamos cookies de navegador, senhas ou histórico de links.</p></div>
            </section>
          </div>
        )}

        <footer className="app-footer">
          <span>Feito com <span className="footer-heart" aria-label="carinho">♥</span> e pixels.</span>
          <span>Baixe apenas conteúdo que você pode guardar.</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
