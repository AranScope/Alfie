const electron = require("electron");
const { shell, ipcMain } = electron;

const { Plugin, Shortcut } = require("../../../src/interfaces/Plugin");

class SearchOnWebsitePlugin extends Plugin {
  constructor() {
    super();
    this.shortcuts = [
      new SearchOnWebsiteShortcut(
        "Confluence",
        "https://confluence.com/search?q=",
        "https://cdn1.iconfinder.com/data/icons/social-media-2106/24/social_media_social_media_logo_confluence-512.png"
      ),
      new SearchOnWebsiteShortcut(
        "Google",
        "https://google.com/search?q=",
        "https://cdn4.iconfinder.com/data/icons/new-google-logo-2015/400/new-google-favicon-512.png"
      ),
      new SearchOnWebsiteShortcut(
        "Bing",
        "https://www.bing.com/search?q=",
        "https://cdn2.iconfinder.com/data/icons/social-icons-color/512/bing-512.png"
      ),
      new SearchOnWebsiteShortcut(
        "Amazon",
        "https://www.amazon.co.uk/s/field-keywords=",
        "https://cdn2.iconfinder.com/data/icons/social-icons-color/512/amazon-512.png"
      ),
      new SearchOnWebsiteShortcut(
        "GitHub",
        "https://github.com/search?q=",
        "https://image.flaticon.com/icons/svg/25/25231.svg"
      ),
      new SearchOnWebsiteShortcut(
        "YouTube",
        "https://www.youtube.com/results?search_query=",
        "https://cdn1.iconfinder.com/data/icons/logotypes/32/youtube-512.png"
      )
    ];
  }

  filter(searchTerms) {
    return this.shortcuts.filter(shortcut => shortcut.matches(searchTerms));
  }
}

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

    // return searchTerms.some(searchTerm =>
    //   this.websiteName.toLowerCase().includes(searchTerm)
    // );
  }
}

module.exports = new SearchOnWebsitePlugin();
