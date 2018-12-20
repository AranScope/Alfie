const electron = require("electron");
const { shell } = electron;

const { Plugin, Shortcut } = require("../../src/Plugin");

class OpenWebsitePlugin extends Plugin {
  constructor() {
    super();
    this.urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
  }

  filter(searchTerms) {
    if (searchTerms.length == 1) {
      if (this.urlRegex.test(searchTerms[0])) {
        return [new OpenWebsiteShortcut(searchTerms[0])];
      }
    }

    return [];
  }
}

class OpenWebsiteShortcut extends Shortcut {
  constructor(url) {
    super();
    this.url = url;
    this.imageUrl =
      "https://cdn3.iconfinder.com/data/icons/streamline-icon-set-free-pack/48/Streamline-17-512.png";
  }

  getName(searchTerms) {
    return this.url;
  }

  getDescription(searchTerms) {
    return "Open the typed URL";
  }

  getImageUrl(searchTerms) {
    return this.imageUrl;
  }

  execute(searchTerms) {
    console.log("execute");
    console.log("opening URL", this.url);
    let url = this.url;
    if (!/(http:\/\/|https:\/\/).*/.test(this.url)) {
      url = `https://${this.url}`;
    }
    shell.openExternal(url);
    // ui should close
    return true;
  }
}

module.exports = new OpenWebsitePlugin();
