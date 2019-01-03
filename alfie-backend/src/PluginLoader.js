const os = require("os");
const fs = require("fs");
const path = require("path");

const pluginFoldersMap = {
  win32: "plugins/windows",
  darwin: "plugins/mac",
  linux: "plugins/linux"
};

function loadPlugins() {
  let platform = os.platform;

  if (!pluginFoldersMap.hasOwnProperty(platform)) {
    console.error(`Unsupported OS: ${platform}`);
    process.exit(-1);
  }

  let pluginFolders = [pluginFoldersMap[platform], "plugins/all"];

  let shortcutProviders = [];

  for (let pluginFolder of pluginFolders) {
    let plugins = fs
      .readdirSync(pluginFolder)
      .map(pluginDir => path.join("..", pluginFolder, pluginDir, "Plugin"));
    for (let plugin of plugins) {
      shortcutProviders.push(require(plugin));
    }
  }

  return shortcutProviders;
}

module.exports = {
  loadPlugins: loadPlugins
};
