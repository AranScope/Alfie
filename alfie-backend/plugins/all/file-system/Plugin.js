const fs = require("fs");
const path = require("path");

const electron = require("electron");
const { shell } = electron;

const { Plugin, Shortcut } = require("../../../src/interfaces/Plugin");

const { exec } = require("child_process");

module.exports = class FileSystemPlugin extends Plugin {
  constructor() {
    super();
    const directories = ["/Applications"];
  }

  filter(searchTerms) {}

  execute(pluginName, searchTerms) {
    return this.pluginsMap[pluginName].execute();
  }
};

class OpenFileShortcut extends Shortcut {
  constructor(appName, uri, imageUri) {
    super();
    this.appName = appName;
    this.uri = uri;
    this.imageUri = imageUri;
  }

  getName(searchTerms) {
    return `${this.appName.replace(".app", "")}`;
  }

  getDescription(searchTerms) {
    return this.uri;
  }

  getImageUrl(searchTerms) {
    return this.imageUri;
  }

  execute(searchTerms) {
    shell.openItem(this.uri);
  }
}
