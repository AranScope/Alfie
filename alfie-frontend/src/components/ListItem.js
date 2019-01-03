import React from "react";
import styled from "styled-components";

import { Item } from "../styles/shared";

const ListItem = styled.li`
  ${Item}
  list-style-type: none;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.5rem;

  &.selected {
    background-color: hsla(190, 60%, 30%, 0.85);
  }

  &:hover {
    cursor: pointer;
  }
`;

export default props => (
  <ListItem
    onMouseEnter={() => props.requestFocus(props.index)}
    className={props.selected ? "selected" : ""}
    {...props}
  >
    {props.children}
  </ListItem>
);
