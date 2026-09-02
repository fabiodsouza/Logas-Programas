const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, "app", "icon.ico"),
    webPreferences: {
      // O app usa apenas HTML/CSS/JS locais e localStorage; nada de Node no front.
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Remove a barra de menu padrão do Electron (Arquivo/Editar/etc.)
  Menu.setApplicationMenu(null);

  win.loadFile(path.join(__dirname, "app", "index.html"));

  // ----- Senha para fechar o programa -----
  // Ao clicar no X, pede a senha na própria janela; só fecha se confirmada.
  let podeFechar = false;
  win.on("close", (e) => {
    if (podeFechar) return;
    e.preventDefault();
    win.webContents
      .executeJavaScript(
        "window.__askClosePassword ? window.__askClosePassword() : true"
      )
      .then((ok) => {
        if (ok) {
          podeFechar = true;
          win.close();
        }
      })
      .catch(() => {
        // Em caso de erro inesperado, não trava o usuário: permite fechar.
        podeFechar = true;
        win.close();
      });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
