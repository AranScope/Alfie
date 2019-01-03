import React from "react";
import styled from "styled-components";

import List from "./List";
import ListItem from "./ListItem";

import GlobalStyle from "../styles/global";
import { Item } from "../styles/shared";

const debug = false;

const ipcRenderer = debug
  ? { on: function(...args) {}, send: function(...args) {} }
  : window.require("electron").ipcRenderer;

const SearchContainer = styled.div`
  width: 40rem;
`;

const Input = styled.input`
  ${Item}
  font-size: 3rem;

  outline: none;
  border: none;

  &:focus {
    outline: none;
  }
`;

const Image = styled.img`
  width: 2.5rem;
  margin-right: 0.5rem;
`;

const ItemText = styled.div``;

const ItemName = styled.p`
  font-size: 1.5rem;
  margin: 0;
`;

const ItemDesc = styled.p`
  font-size: 0.7rem;
  margin: 0;
  color: hsla(0, 0%, 100%, 0.5);
`;

function mod(n, m) {
  return ((n % m) + m) % m;
}

class Search extends React.Component {
  state = {
    searchResults: debug
      ? [
          {
            name: "Terminal",
            description: "/Applications/Terminal.app",
            image:
              "https://cdn4.iconfinder.com/data/icons/small-n-flat/24/terminal-512.png"
          },
          {
            name: "Terminal",
            description: "/Applications/Terminal.app",
            image:
              "https://cdn4.iconfinder.com/data/icons/small-n-flat/24/terminal-512.png"
          },
          {
            name: "Terminal",
            description: "/Applications/Terminal.app",
            image:
              "https://cdn4.iconfinder.com/data/icons/small-n-flat/24/terminal-512.png"
          },
          {
            name: "Terminal",
            description: "/Applications/Terminal.app",
            image:
              "https://cdn4.iconfinder.com/data/icons/small-n-flat/24/terminal-512.png"
          }
        ]
      : [],
    selectedIndex: 0
  };

  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.containerRef = React.createRef();

    ipcRenderer.on("search-result", (event, searchResults) => {
      console.log("search results", searchResults);
      this.setState({
        searchResults,
        selectedIndex: 0
      });
    });

    ipcRenderer.on("hide", event => this.clear());

    ipcRenderer.on("show", event => this.inputRef.current.focus());

    ipcRenderer.on("notify", (event, { title, body, icon }) => {
      let notification = new Notification(title, { body, icon });
    });

    ipcRenderer.on("set_query", (event, value) => {
      this.inputRef.current.value = value;
    });

    ipcRenderer.on("clear_query", event => this.clear);
  }

  requestFocus = index => {
    this.setState({
      selectedIndex: index
    });
  };

  clear() {
    if (this.inputRef.current.value !== "") {
      this.inputRef.current.value = "";
      this.setState({
        searchResults: []
      });
    }
  }

  executeShortcut() {
    ipcRenderer.send("execute", this.state.selectedIndex);
  }

  handleKeyDown = event => {
    switch (event.key) {
      case "Escape":
        ipcRenderer.send("minimize");
        this.clear();
        break;
      case "Enter":
        if (this.state.searchResults.length > 0) {
          this.executeShortcut();
        }
        break;
      case "ArrowUp":
        this.setState({
          selectedIndex: mod(
            this.state.selectedIndex - 1,
            this.state.searchResults.length
          )
        });
        event.preventDefault();

        break;
      case "ArrowDown":
        this.setState({
          selectedIndex: mod(
            this.state.selectedIndex + 1,
            this.state.searchResults.length
          )
        });

        event.preventDefault();

        break;
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown, false);
    this.updateWindowSize("initial-size");
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown, false);
  }

  componentDidUpdate() {
    this.updateWindowSize("size-update");
  }

  updateWindowSize(channel) {
    let elem = this.containerRef.current;
    console.log(elem.offsetWidth, elem.offsetHeight);
    ipcRenderer.send(channel, elem.offsetWidth, elem.offsetHeight);
  }

  executeSearch(query) {
    let searchTerms = query.trim().split(" ");
    console.log("search terms: ", searchTerms);

    if (searchTerms.length == 0) {
      this.setState({
        searchResults: []
      });
    } else {
      ipcRenderer.send("search", searchTerms);
    }
  }

  handleChange = event => {
    this.executeSearch(event.target.value);
  };

  handleClick = event => {
    console.log("Click!");
    console.log(event);
    let index = event.target.index;
    this.requestFocus(index);
    this.executeShortcut();
  };

  render() {
    return (
      <>
        <GlobalStyle />
        <SearchContainer ref={this.containerRef}>
          <Input
            ref={this.inputRef}
            autoFocus={true}
            type="text"
            spellCheck={false}
            onChange={this.handleChange}
          />
          <List>
            {this.state.searchResults.map((result, index) => (
              <ListItem
                key={index}
                index={index}
                requestFocus={this.requestFocus}
                onClick={this.handleClick}
                selected={this.state.selectedIndex === index}
              >
                <p>{console.log("image", result.image)}</p>

                <Image src={result.image} />
                <ItemText>
                  <ItemName>{result.name}</ItemName>
                  <ItemDesc>{result.description}</ItemDesc>
                </ItemText>
              </ListItem>
            ))}
          </List>
        </SearchContainer>
      </>
    );
  }
}

export default Search;
