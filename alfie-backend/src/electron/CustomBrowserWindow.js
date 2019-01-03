const electron = require("electron");
const { BrowserWindow } = electron;

class CustomBrowserWindow extends BrowserWindow {
  constructor(props) {
    super(props);
  }

  show() {
    this.send("show");
    super.show();
  }

  hide() {
    this.send("hide");
    super.hide();
  }

  notify(title, body, icon) {
    this.send("notify", { title, body, icon });
  }

  send(channel, ...args) {
    // add some custom logging here
    this.webContents.send(channel, ...args);
  }
}

module.exports = CustomBrowserWindow;
