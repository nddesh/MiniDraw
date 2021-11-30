import React from "react";

export default ({
  id,
  x,
  y,
  fillColor,
  borderColor,
  borderWidth,
}) => {

  return (
    <foreignObject id={id} x={x} y={y} width="300" height="200">
        <textarea autoFocus type="text" width="500px" className="textarea resize-ta" style={{borderWidth: borderWidth, borderColor: borderColor, backgroundColor: fillColor}}/>
    </foreignObject>
  );
};


