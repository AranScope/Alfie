const fs = require("fs");
const path = require("path");

const electron = require("electron");
const { shell } = electron;

const { Plugin, Shortcut } = require("../../src/Plugin");
const { SearchTree } = require("../../src/collections");

const { exec } = require("child_process");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const request = require("request");

function getIconForApp(appName) {
  let fileName = `./icons/${appName}.png`;

  // 1. get the html
  console.log("request:", appName);
  const requestUrl = `http://www.iconarchive.com/search?q=${appName}`;
  request(requestUrl, (error, response, body) => {
    // console.log("error:", error); // Print the error if one occurred
    // console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
    // console.log("body:", body); // Print the HTML for the Google homepage.

    // 2. get into dom format
    const dom = new JSDOM(body);

    // 3. extract image src URL
    let query = dom.window.document.querySelector(".icondetail a img");

    if (!query) return;
    let imageSrcUrl = query.src;
    // 4. download the image to the icons folder
    request(imageSrcUrl).pipe(fs.createWriteStream(fileName));
  });

  // 5. return the path to the image
  return path.join("/Users/aran/work/web/alfie/alfie-backend", fileName);
}

function findApplicationIconUri(appPath) {
  let resourcesPath = path.join(appPath, "Contents", "Resources");

  if (fs.existsSync(resourcesPath)) {
    let files = fs.readdirSync(resourcesPath);

    console.log(files);
    let potentialIcons = files.filter(file => /^.*.icns$/.test(file));

    if (potentialIcons.length == 0) return null; // no icons in directory

    let icon = potentialIcons[0];
    let iconPath = path.join(resourcesPath, icon);
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
          .filter(appName => appName.endsWith(".app"))
          .map(appName => ({
            appName,
            appPath: path.join(directory, appName),
            appIconPath: findApplicationIconUri(path.join(directory, appName)),
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
      console.log("copied all apps to local filesystem");

      convertLocalIconsToPng().then(() => {
        console.log("converted all icons to png");
      });
    });

    console.log("apps: ", appNamesAndPaths);

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
    if (searchTerms.length == 1) {
      return this.searchTree
        .find(searchTerms[0].toLowerCase())
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
    return `Open ${this.appName.replace(".app", "")}`;
  }

  getDescription(searchTerms) {
    return this.uri;
  }

  getImageUrl(searchTerms) {
    return this.imageUri;
  }

  execute(searchTerms) {
    console.log("opening ", this.uri);
    shell.openItem(this.uri);
  }

  matches(searchTerms) {
    if (searchTerms.length == 1) {
      return this.appName.toLowerCase().includes(searchTerms[0].toLowerCase());
    }

    return false;
  }
}

module.exports = new OpenMacAppPlugin();
