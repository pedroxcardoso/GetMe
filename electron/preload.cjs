const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("getme", {
  readSettings: () => ipcRenderer.invoke("settings:read"),
  saveSettings: (patch) => ipcRenderer.invoke("settings:save", patch),
  inspectTools: () => ipcRenderer.invoke("tools:inspect"),
  chooseDownloadFolder: () => ipcRenderer.invoke("folder:choose-download"),
  chooseToolPath: (tool) => ipcRenderer.invoke("tools:choose-path", tool),
  openSetupPage: (tool) => ipcRenderer.invoke("tools:open-setup", tool),
  readClipboard: () => ipcRenderer.invoke("clipboard:read"),
  startDownload: (request) => ipcRenderer.invoke("download:start", request),
  cancelDownload: (id) => ipcRenderer.invoke("download:cancel", id),
  onDownloadEvent: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on("download:event", listener);
    return () => ipcRenderer.removeListener("download:event", listener);
  },
  listHistory: () => ipcRenderer.invoke("history:list"),
  removeHistoryEntry: (id) => ipcRenderer.invoke("history:remove", id),
  openFile: (path) => ipcRenderer.invoke("file:open", path),
  revealFile: (path) => ipcRenderer.invoke("file:reveal", path),
});
