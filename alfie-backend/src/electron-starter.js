// Modules to control application life and create native browser window
const electron = require("electron");
const { app, BrowserWindow, shell, ipcMain, globalShortcut } = electron;
const path = require("path");
const url = require("url");

const { Search } = require("./Search");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // useContentSize: true,
    transparent: true,
    frame: false,
    movable: false,
    alwaysOnTop: true,
    center: true,
    resizable: false
  });

  const bounds = electron.screen.getPrimaryDisplay().bounds;

  // and load the index.html of the app.
  // mainWindow.loadURL("http://localhost:3001");
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "../../alfie-frontend/build/index.html"),
      protocol: "file:",
      slashes: true
    })
  );

  mainWindow.hide();

  function toggleVisibility() {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    } else {
      mainWindow.hide();
    }
  }
  const ret = globalShortcut.register("Command+Shift+Space", toggleVisibility);
  const ret2 = globalShortcut.register("Control+Space", toggleVisibility);

  if (!ret) {
    console.log("shortcut registration failed");
  }

  // console.log(WebShortcuts.filter(["Google"])[0].execute(["Tree shoes"]));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools({ mode: "undocked" });

  ipcMain.on("maximize", event => {
    mainWindow.show();
  });

  ipcMain.on("minimize", event => {
    mainWindow.hide();
  });

  ipcMain.on("search", (event, searchTerms) => {
    console.log("search requested from frontend");
    event.sender.send("search-result", Search.search(searchTerms));
  });

  ipcMain.on("initial-size", (event, width, height) => {
    let x = bounds.x + (bounds.width - width) / 2;
    let y = bounds.height / 6;
    mainWindow.setSize(width, height);
    mainWindow.setPosition(x, y);
  });

  ipcMain.on("size-update", (event, width, height) => {
    console.log("size update");
    mainWindow.setSize(
      width,
      Math.min(bounds.height - (2 * bounds.height) / 6, height)
    );
  });

  ipcMain.on("execute", (event, index) => {
    if (Search.execute(index)) {
      mainWindow.hide();
    }
  });

  mainWindow.on("blur", mainWindow.hide);

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
