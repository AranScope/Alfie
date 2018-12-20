class SearchTree {
  constructor() {
    this._tree = {};
  }

  add(token) {
    function _add(token, _subtree) {
      if (!token) {
        _subtree["isToken"] = true;
        return;
      }

      let character = token.charAt(0);

      if (!(character in _subtree)) {
        _subtree[character] = {};
      }

      _add(token.slice(1), _subtree[character]);
    }

    _add(token, this._tree);
  }

  find(subToken) {
    // traverse to the end of the token in the tree
    function _traverse(token, _subtree) {
      if (!token) return _subtree;

      let character = token.charAt(0);
      if (!(character in _subtree)) return {};
      return _traverse(token.slice(1), _subtree[character]);
    }

    let results = [];

    // perform a breadth first search in the subtree for all tokens
    function _search(_subtree, acc) {
      if ("isToken" in _subtree) {
        results.push(acc);
      }

      let characters = Object.keys(_subtree).filter(key => key !== "isToken");

      characters.forEach(character => {
        _search(_subtree[character], acc + character);
      });
    }

    let traversalResult = _traverse(subToken, this._tree);
    _search(traversalResult, subToken);
    return results;
  }

  contains(token) {
    function _contains(token, _subtree) {
      if (!token) return "isToken" in _subtree;

      let character = token.charAt(0);
      if (!(character in _subtree)) return false;
      return _contains(token.slice(1), _subtree[character]);
    }

    return _contains(token, this._tree);
  }

  print() {
    console.log(JSON.stringify(this._tree, null, 4));
  }
}

exports.SearchTree = SearchTree;

// let tree = new SearchTree();
// tree.add("hello");
// tree.add("help");
// tree.add("hell no");
// tree.add("instagram");
// tree.print();
// console.log(tree.contains("hello"));
// console.log(`searched for 'he', found: ${tree.find("he")}`);
