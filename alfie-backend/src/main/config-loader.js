const yaml = require("js-yaml");
const fs = require("fs");
const ora = require("ora");
const chalk = require("chalk");

function init(electron, mainWindow) {
  const { globalShortcut } = electron;

  function toggleVisibility() {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    } else {
      mainWindow.hide();
    }
  }

  console.log(chalk.green.bold("Loading yml configuration file:"));

  fs.readFile("../alfie-shared/config.yml", (err, data) => {
    if (err) {
      console.error("error loading config");
      process.exit(-1);
    }

    let config = yaml.safeLoad(data, "utf8");

    for (let shortcut of config.shortcuts.open) {
      const spinner = ora(`Registering global shortcut ${shortcut}`).start();
      let ret = globalShortcut.register(shortcut, toggleVisibility);

      if (ret) {
        spinner.text = `Registered global shortcut ${shortcut}`;
        spinner.succeed();
      } else {
        spinner.text = `Failed to register global shortcut ${shortcut}`;
        spinner.fail();
      }
    }

    mainWindow.send("config", config);

    if (config.debug) {
      mainWindow.webContents.openDevTools({ mode: "undocked" });
    }
  });
}

module.exports = {
  init: init
};
