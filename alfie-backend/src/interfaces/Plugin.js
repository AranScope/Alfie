const electron = require("electron");

exports.Shortcut = class Shortcut {
  execute(searchTerms) {}

  altExecute(searchTerms) {}

  getName(searchTerms) {}

  getImageUrl(searchTerms) {}

  matches(searchTerms) {}

  autoComplete(searchTerms) {
    return "";
  }
};

exports.Plugin = class Plugin {
  constructor() {}

  filter(searchTerms) {}

  isDefault() {
    return false;
  }
};
