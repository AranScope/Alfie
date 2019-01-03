const electron = require("electron");
const { BrowserWindow } = electron;

class CustomBrowserWindow extends BrowserWindow {
  constructor(props) {
    super(props);
  }

  show() {
    this.webContents.send("show");
    super.show();
  }

  hide() {
    this.webContents.send("hide");
    super.hide();
  }
}

module.exports = CustomBrowserWindow;
