const electron = require("electron");
const { shell, ipcMain } = electron;
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const { Plugin, Shortcut } = require("../../../src/interfaces/Plugin");

module.exports = class CommonWebsitePlugin extends Plugin {
  constructor() {
    super();
    this.shortcuts = [];

    fs.readFile(path.join(__dirname, "config.yml"), (err, data) => {
      let config = yaml.safeLoad(data, "utf8");
      this.shortcuts = config.sites.map(
        ({ name, url }) => new OpenWebsiteShortcut(name, url)
      );
    });
  }

  filter(searchTerms) {
    return this.shortcuts.filter(shortcut => shortcut.matches(searchTerms));
  }
};

class OpenWebsiteShortcut extends Shortcut {
  constructor(websiteName, url) {
    super();
    this.websiteName = websiteName;
    this.url = url;
    this.imageUrl = path.join(
      __dirname,
      "resources",
      `${this.websiteName.toLowerCase()}.svg`
    );
  }

  getName(searchTerms) {
    return `Open ${this.websiteName} in browser`;
  }

  getDescription(searchTerms) {
    return this.url;
  }

  getImageUrl(searchTerms) {
    return this.imageUrl;
  }

  execute(searchTerms) {
    shell.openExternal(`${this.url}`);
    return true;
  }

  matches(searchTerms) {
    if (searchTerms.length == 1) {
      return this.websiteName
        .toLowerCase()
        .includes(searchTerms[0].toLowerCase());
    }

    return false;
  }
}
