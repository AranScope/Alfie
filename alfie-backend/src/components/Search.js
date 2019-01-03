const { loadPlugins } = require("../main/plugin-loader");

class Search {
  constructor() {
    this.shortcutProviders = loadPlugins();

    this.currentShortcuts = [];
    this.currentSearchTerms = [];
  }

  execute(index) {
    this.currentShortcuts[index].execute(this.currentSearchTerms);
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
}

exports.Search = new Search();
