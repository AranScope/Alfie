const electron = require("electron");
const { shell } = electron;

const { Plugin, Shortcut } = require("../../../src/interfaces/Plugin");

class CalculatorPlugin extends Plugin {
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
}

class CalculatorShortcut extends Shortcut {
  constructor(result) {
    super();
    this.result = result;
    this.imageUrl =
      "https://cdn2.iconfinder.com/data/icons/circle-icons-1/64/calculator-512.png";
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

module.exports = new CalculatorPlugin();
