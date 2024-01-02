const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
var win;
const createWindow = () => {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.maximize();
  win.loadURL(`file://${path.join(__dirname, "app", "page", "index.html")}`);
  ipcMain.on("save-file", (event) => {
    const options = {
      title: "Save File",
      defaultPath: app.getPath("documents"), // 设置默认保存路径
      filters: [
        { name: "Image", extensions: ["png"] },
        { name: "All Files", extensions: ["*"] },
      ],
    };

    dialog
      .showSaveDialog(win, options)
      .then((result) => {
        if (!result.canceled && result.filePath) {
          event.sender.send("save-file-res", result.filePath);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  });
};

app.whenReady().then(() => {
  createWindow();
});
