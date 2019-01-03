const { loadPlugins } = require("../main/plugin-loader");

module.exports = class Search {
  constructor(browserWindow) {
    this.browserWindow = browserWindow;
    this.shortcutProviders = loadPlugins(browserWindow);

    this.currentShortcuts = [];
    this.currentSearchTerms = [];
    this.lastSearch = "";
  }

  execute(index) {
    let shortcut = this.currentShortcuts[index];
    let autocompletionResult = shortcut.autoComplete(this.currentSearchTerms);
    if (autocompletionResult) {
      this.browserWindow.send("set_query", autocompletionResult);
    } else {
      this.currentShortcuts[index].execute(this.currentSearchTerms);
      this.browserWindow.send("clear_query");
    }
  }

  search(searchTerms) {
    if (searchTerms.join("") === "") {
      this.currentSearchTerms = [];
      this.currentShortcuts = [];
      return [];
    }

    this.currentSearchTerms = searchTerms;

    this.currentShortcuts = [];

    this.shortcutProviders.forEach(provider => {
      this.currentShortcuts.push.apply(
        this.currentShortcuts,
        provider.filter(searchTerms)
      );
    });

    this.currentShortcuts.forEach(shortcut => {});
    return this.currentShortcuts.map(shortcut => ({
      name: shortcut.getName(searchTerms),
      description: shortcut.getDescription(searchTerms),
      image: shortcut.getImageUrl(searchTerms)
    }));
  }
};
