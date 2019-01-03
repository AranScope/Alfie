const os = require("os");
const fs = require("fs");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

const pluginFoldersMap = {
  win32: "plugins/windows",
  darwin: "plugins/mac",
  linux: "plugins/linux"
};

function loadPlugins(browserWindow) {
  let platform = os.platform;
  console.log(chalk.green.bold(`Loading plugins for ${platform} platform:`));

  if (!pluginFoldersMap.hasOwnProperty(platform)) {
    console.error(`Unsupported OS: ${platform}`);
    process.exit(-1);
  }

  let pluginFolders = [pluginFoldersMap[platform], "plugins/all"];

  let shortcutProviders = [];

  for (let pluginFolder of pluginFolders) {
    let plugins = fs
      .readdirSync(pluginFolder)
      .map(pluginDir =>
        path.join("..", "..", pluginFolder, pluginDir, "Plugin")
      );
    for (let plugin of plugins) {
      const spinner = ora(`Loading plugin ${plugin}`).start();
      try {
        let Plugin = require(plugin);
        shortcutProviders.push(new Plugin());
        spinner.text = `Loaded plugin ${plugin}`;
        spinner.succeed();
      } catch (e) {
        console.error(e);
        spinner.text = `Failed to load plugin ${plugin}`;
        spinner.fail();
      }
    }
  }

  return shortcutProviders;
}

module.exports = {
  loadPlugins: loadPlugins
};
