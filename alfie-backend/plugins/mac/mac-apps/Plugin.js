const fs = require("fs");
const path = require("path");

const electron = require("electron");
const { shell } = electron;

const { Plugin, Shortcut } = require("../../../src/interfaces/Plugin");
const { SearchTree } = require("../../../src/common/collections");

const { exec } = require("child_process");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function hasIcon(appPath) {
  let resourcesPath = path.join(appPath, "Contents", "Resources");

  if (fs.existsSync(resourcesPath)) {
    let files = fs.readdirSync(resourcesPath);

    let potentialIcons = files.filter(file => /^.*.icns$/.test(file));

    return potentialIcons.length > 0;
  }

  return false;
}

function findApplicationIconUri(appPath, appName) {
  let resourcesPath = path.join(appPath, "Contents", "Resources");

  if (fs.existsSync(resourcesPath)) {
    let files = fs.readdirSync(resourcesPath);

    let potentialIcons = files.filter(file => /^.*.icns$/.test(file));

    if (potentialIcons.length == 0) return null; // no icons in directory

    let bestIcon = potentialIcons[0];

    if (potentialIcons.length > 1) {
      let iconNamePriority = [
        `^${appName.replace(".app", "")}\.icns$`,
        /^.*app.*\.icns$/i,
        /^.*icon.*\.icns$/i
      ];

      outer: for (let iconRegex of iconNamePriority) {
        for (let icon of potentialIcons) {
          if (icon.match(iconRegex, "i")) {
            bestIcon = icon;
            break outer;
          }
        }
      }
    }

    let iconPath = path.join(resourcesPath, bestIcon);
    return iconPath;
  }

  // todo:  "http://icons.iconarchive.com/icons/custom-icon-design/flatastic-11/256/Application-icon.png"

  return null; // no resource directory
}

async function copyIconToLocal(appName, iconPath) {
  let newIconPath = `./icons/${appName.replace(".app", ".icns")}`;

  return new Promise((resolve, reject) => {
    fs.copyFile(iconPath, newIconPath, err => {
      if (err) reject(err);
      resolve();
    });
  });
}

function convertLocalIconsToPng() {
  return new Promise((resolve, reject) => {
    exec(
      // "pwd >> test.txt",
      // "for file in ./icons/*.icns; do echo ${file} >> test.txt; done",
      'cd icons; for file in *.icns; do sips -Z 100 -s format png "${file}" --out "../web-icons/${file%icns}png"; done',
      (err, stdout, stderr) => {
        if (err) reject(err);

        resolve();
      }
    );
  });
}

class OpenMacAppPlugin extends Plugin {
  constructor() {
    super();
    const directories = [
      "/Applications",
      "/Applications/Utilities",
      "/System/Library/CoreServices/"
    ];
    this.searchTree = new SearchTree();
    this.pluginsMap = {};

    let appNamesAndPaths = [].concat(
      ...directories.map(directory =>
        fs
          .readdirSync(directory)
          .filter(
            appName =>
              appName.endsWith(".app") && hasIcon(path.join(directory, appName))
          )
          .map(appName => ({
            appName,
            appPath: path.join(directory, appName),
            appIconPath: findApplicationIconUri(
              path.join(directory, appName),
              appName
            ),
            appWebIconPath: `/Users/aran/work/web/alfie/alfie-backend/web-icons/${appName.replace(
              ".app",
              ".png"
            )}`
          }))
      )
    );

    Promise.all(
      appNamesAndPaths.map(({ appName, appPath, appIconPath }) => {
        if (appIconPath) {
          return copyIconToLocal(appName, appIconPath);
        } else {
          return new Promise((resolve, reject) => resolve());
        }
      })
    ).then(() => {
      convertLocalIconsToPng().then(() => {});
    });

    appNamesAndPaths.forEach(({ appName, appPath, appWebIconPath }) => {
      let keys = [appName.toLowerCase()];
      let words = appName.toLowerCase().split(" ");

      if (words.length > 1) {
        words.slice(1).forEach(word => keys.push(word.toLowerCase()));
      }

      keys.forEach(key => {
        this.searchTree.add(key.toLowerCase());
        this.pluginsMap[key.toLowerCase()] = new OpenMacAppShortcut(
          appName,
          appPath,
          appWebIconPath
        );
      });
    });
  }

  filter(searchTerms) {
    if (searchTerms.length >= 1) {
      return this.searchTree
        .find(searchTerms.join(" ").toLowerCase())
        .map(shortcutName => this.pluginsMap[shortcutName]);
    } else {
      return [];
    }
  }

  execute(pluginName, searchTerms) {
    return this.pluginsMap[pluginName].execute();
  }
}

class OpenMacAppShortcut extends Shortcut {
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
    return true;
  }

  matches(searchTerms) {
    if (searchTerms.length == 1) {
      return this.appName.toLowerCase().includes(searchTerms[0].toLowerCase());
    }

    return false;
  }
}

module.exports = OpenMacAppPlugin;
