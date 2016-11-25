const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const rf=require("fs")

const path = require('path')
const url = require('url')
global.MOBILE_UA="Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36"
global.DEFAULT_UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.87 Safari/537.36"
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

const ipc = require('electron').ipcMain
var dataPath=path.join(__dirname,"data/shareData.json");
var shareData= JSON.parse(rf.readFileSync(dataPath,"utf-8"))

ipc.on("shareData",function(event,type,key,val){
  if(type=="get"){
    event.returnValue=shareData[key]||"";
  }else {
    shareData[key]=val;
    event.returnValue="";
  }
})

function createWindow () {
  //var protocol=electron.protocol;
  //console.log(protocol)
  //protocol.registerStringProtocol('atom', (request, callback) => {
  //  console.log(JSON.stringify(request))
  //  callback("xx")
  //}, (error) => {
  //  if (error) console.error('Failed to register protocol')
  //})
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1000, height: 700,webPreferences:{webSecurity:false}})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    rf.writeFileSync(dataPath,JSON.stringify(shareData))
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})






