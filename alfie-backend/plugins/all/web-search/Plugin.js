const electron = require("electron");
const { shell, ipcMain } = electron;
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const { Plugin, Shortcut } = require("../../../src/interfaces/Plugin");

module.exports = class SearchOnWebsitePlugin extends Plugin {
  constructor() {
    super();
    this.shortcuts = [];

    fs.readFile(path.join(__dirname, "config.yml"), (err, data) => {
      let config = yaml.safeLoad(data, "utf8");
      this.shortcuts = config.sites.map(
        ({ name, url, image }) => new SearchOnWebsiteShortcut(name, url, image)
      );
    });
  }

  filter(searchTerms) {
    return this.shortcuts.filter(shortcut => shortcut.matches(searchTerms));
  }
};

class SearchOnWebsiteShortcut extends Shortcut {
  constructor(websiteName, url, imageUrl) {
    super();
    this.websiteName = websiteName;
    this.url = url;
    this.imageUrl = imageUrl;
  }

  getName(searchTerms) {
    let searchQuery = searchTerms.slice(1).join(" ");

    return `Search ${this.websiteName} for '${searchQuery || "..."}'`;
  }

  getDescription(searchTerms) {
    return this.url;
  }

  getImageUrl(searchTerms) {
    return this.imageUrl;
  }

  autoComplete(searchTerms) {
    if (searchTerms.length === 1) {
      if (searchTerms[0].toLowerCase() !== this.websiteName) {
        return this.websiteName.toLowerCase() + " ";
      }
    }
    return "";
  }

  execute(searchTerms) {
    let query = searchTerms.slice(1).join(" ");

    // ui should not close
    if (query === "") return false;
    // entered a partial keyword, so expand it first
    else if (searchTerms[0].length != this.websiteName.length) {
      // this.websiteName.toLowerCase()
      // todo: We should send an update to the client with the corrected search term, and add an else
    }
    shell.openExternal(`${this.url}${query}`);
    // ui should close
    return true;
  }

  matches(searchTerms) {
    if (searchTerms.length == 1) {
      return this.websiteName
        .toLowerCase()
        .includes(searchTerms[0].toLowerCase());
    } else if (searchTerms.length >= 2) {
      return this.websiteName.toLowerCase() === searchTerms[0].toLowerCase();
    }
  }
}
