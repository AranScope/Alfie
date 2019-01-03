import React from "react";
import styled from "styled-components";

const List = styled.ul`
  padding: 0;
  margin: 0;
`;
export default props => <List>{props.children}</List>;
