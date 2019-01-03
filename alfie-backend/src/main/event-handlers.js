function init(electron, mainWindow) {
  const { Search } = require("../components/Search");

  let { ipcMain } = electron;

  const bounds = electron.screen.getPrimaryDisplay().bounds;

  ipcMain.on("maximize", event => {
    mainWindow.show();
  });

  ipcMain.on("minimize", event => {
    mainWindow.hide();
  });

  ipcMain.on("search", (event, searchTerms) => {
    event.sender.send("search-result", Search.search(searchTerms));
  });

  ipcMain.on("initial-size", (event, width, height) => {
    let x = bounds.x + (bounds.width - width) / 2;
    let y = bounds.height / 6;
    mainWindow.setSize(width, height);
    mainWindow.setPosition(x, y);
  });

  ipcMain.on("size-update", (event, width, height) => {
    mainWindow.setSize(
      width,
      Math.min(bounds.height - (2 * bounds.height) / 6, height)
    );
  });

  ipcMain.on("execute", (event, index) => {
    if (Search.execute(index)) {
      mainWindow.hide();
    }
  });
}

module.exports = {
  init: init
};
