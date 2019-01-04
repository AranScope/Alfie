// Modules to control application life and create native browser window
const electron = require("electron");
const { app } = electron;
const BrowserWindow = require("../electron/CustomBrowserWindow");
const path = require("path");
const url = require("url");
const ora = require("ora");

const chalk = require("chalk");

const handlers = require("./event-handlers");
const configLoader = require("./config-loader");

(function() {
  console.log(chalk.green.bold("Setting up core electron app"));

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
      // vibrancy: "light"
    });

    mainWindow.setMenu(null);

    const loadPageSpinner = ora("Loading main web page");

    mainWindow.loadURL(
      url.format({
        pathname: path.join(
          __dirname,
          "../../../alfie-frontend/build/index.html"
        ),
        protocol: "file:",
        slashes: true
      })
    );

    loadPageSpinner.text = "Loaded main web page";
    loadPageSpinner.succeed();

    mainWindow.hide();

    handlers.init(electron, mainWindow);

    configLoader.init(electron, mainWindow);

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
})();
