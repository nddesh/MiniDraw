import React from "react";

export default ({
  id,
  x,
  y,
  fillColor,
  inputText,
  filter,
}) => {
  console.log(inputText);
  return (
    <text 
      id={id}
      x={x}
      y={y}
      fill={fillColor}
      filter={filter}
    >{inputText}</text>
  );
};


