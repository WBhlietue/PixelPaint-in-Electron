const { app, BrowserWindow } = require("electron");

var win;
const createWindow = () => {
    win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        
    });
    win.maximize()
    win.loadURL(__dirname + "/app/page/index.html");
};

app.whenReady().then(() => {
    createWindow();
});
