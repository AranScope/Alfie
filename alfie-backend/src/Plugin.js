const electron = require("electron");

exports.Shortcut = class Shortcut {
  execute(searchTerms) {}

  getName(searchTerms) {}

  getImageUrl(searchTerms) {}

  matches(searchTerms) {}
};

exports.Plugin = class Plugin {
  constructor() {}

  filter(searchTerms) {}
};
