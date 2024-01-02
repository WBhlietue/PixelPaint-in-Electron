const { app, BrowserWindow } = require("electron");
const path = require('path');
var win;
const createWindow = () => {
    win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        
    });
    win.maximize()
    win.loadURL(`file://${path.join(__dirname, 'app', 'page', 'index.html')}`);

};

app.whenReady().then(() => {
    createWindow();
});
