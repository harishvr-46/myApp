const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: "logo.ico",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });
  mainWindow.loadURL(`file://${path.join(__dirname, './index.html')}`);
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  })
}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
});

setInterval(() => {
  autoUpdater.on('update-available', (progressObj) => {
    mainWindow.webContents.send('update_available');
    var NOTIFICATION_TITLE = `Update is available. Downloading now. Download speed: " + ${progressObj.bytesPerSecond}`
    var NOTIFICATION_BODY = `Downloaded ${progressObj.percent}% \n ${progressObj.transferred}/${progressObj.total}`
    notification = new Notification({
      title: NOTIFICATION_TITLE,
      body: NOTIFICATION_BODY,
      timeoutType: 'default',
      icon: path.join(__dirname, '/logo.ico')
    });
    notification.show();
    // let log_message = "Download speed: " + progressObj.bytesPerSecond;
    // log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    // log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  
  })
}, 10000);



autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
}) 

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
})