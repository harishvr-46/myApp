const { app, BrowserWindow, ipcMain, Notification, dialog } = require('electron');
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
  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
    var NOTIFICATION_TITLE = `New version is available.`
    var NOTIFICATION_BODY = `App will be downloaded Automatically.`
    availableNotification = new Notification({
      title: NOTIFICATION_TITLE,
      body: NOTIFICATION_BODY,
      timeoutType: 'default',
      icon: path.join(__dirname, '/logo.ico')
    });
    availableNotification.show();
  })
}, 10000);


autoUpdater.on('update-downloaded', () => {
  var options = {
    type: 'question',
    buttons: ['OK', 'No'],
    title: 'Confirm Install',
    // normalizeAccessKeys: true,
    message: 'Update is downloaded. Do you want to Update Now?'
};
  const win = BrowserWindow.getFocusedWindow();
  dialog.showMessageBox(win, options)
    .then((choice) => {
        if (choice.response === 0) {
            autoUpdater.quitAndInstall()
        }else{
          message= `Update will automatically installed on next start.`;
        }
    }).catch(err => {
        console.log('ERROR', err);
    });
}) 
