const { app, BrowserWindow, ipcMain, Notification, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const { nextTick } = require('process');

let mainWindow;
// Creating window
function createWindow () {
  mainWindow = new BrowserWindow({
    icon: "logo.ico",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });
  mainWindow.maximize();
  mainWindow.loadURL(`file://${path.join(__dirname, './index.html')}`);
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  })
}

function tick(){
  var hours = new Date().getHours();
  var min = new Date().getMinutes();
  var sec = new Date().getSeconds();
  var ampm = hours >= 12 ? 'PM' : 'AM';

  if(hours == 17 || hours == 18){
    console.log("Time to take an Oath");
    showModal = ()=>{
      let modal = new BrowserWindow({show: false})
      modal.maximize();
      modal.on('close', ()=>{modal = null});
      modal.loadURL(`file://${path.join(__dirname, './timer.html')}`);
      modal.once('ready-to-show', ()=>{modal.show()})
    }

    showNotification = ()=>{
      var title = `Oath Time Starts in 10 seconds`;
      var body = `It's 11:00 AM. Please be ready and stand Up on Your Place. Thank You.`
      startNotification = new Notification({
        title: title, 
        body: body,
        timeoutType: 'default'
      });
      startNotification.show();
    }
    showNotification();

    setTimeout(showModal, 10000);
  }
}

app.whenReady().then(createWindow).then(tick);

app.on('ready', ()=>{
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
  });
})



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




// Code to Auto-Launch an App on Startup.
var AutoLaunch = require('auto-launch')
var myAppLauncher = new AutoLaunch({
  name: 'DHI Collab App'
})
myAppLauncher.enable();

myAppLauncher.isEnabled().then(function(isEnabled){
  if(isEnabled){
    return;
  }
  myAppLauncher.enable();
}).catch(function(err){
  console.log(err)
})