const electron = require("electron");
const path = require("path");

const { shell } = electron;

const { Plugin, Shortcut } = require("../../../src/interfaces/Plugin");

module.exports = class CalculatorPlugin extends Plugin {
  constructor() {
    super();
  }

  filter(searchTerms) {
    let expr = searchTerms.join(" ");

    if (/^([-+/*]\d+(\.\d+)?)*/.test(expr)) {
      try {
        let result = eval(expr);
        if (parseFloat(result)) {
          return [new CalculatorShortcut(result)];
        }
      } catch (e) {}
    }

    return [];
  }
};

class CalculatorShortcut extends Shortcut {
  constructor(result) {
    super();
    this.result = result;
    this.imageUrl = path.join(__dirname, "resources", "calculator.svg");
  }

  getName(searchTerms) {
    return this.result;
  }

  getDescription(searchTerms) {
    return "Calculate the typed expression";
  }

  getImageUrl(searchTerms) {
    return this.imageUrl;
  }

  execute(searchTerms) {
    // do nothing
  }
}
