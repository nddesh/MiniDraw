import React from "react";
export default ({
  id,
  x,
  y,
  width,
  height,
  vertexCount,
  fillColor,
  borderColor,
  borderWidth,
  filter,
  radius,
}) => {
    const points = [];

    // const radius = Math.sqrt(width * width + height * height) / 2;
    const angle = ((vertexCount - 2) * 180) / (2*vertexCount);
    const top = y + height / 2;
    const left = x + width / 2;
    const fac = 2 * Math.PI / vertexCount;
    for (let i = 0; i < vertexCount; i++) {
      const x_t = left + radius * Math.cos(i * fac + angle / 180 * Math.PI);
      const y_t = top + radius * Math.sin(i * fac + angle / 180 * Math.PI);
      points.push(
        `${x_t},${y_t}`
      );
    }
    const path = points.join(' ');
    

  return (
    <polygon
      id={id}
      points={path}
      fill={fillColor}
      stroke={borderColor}
      strokeWidth={borderWidth}
      filter={filter}
    />
  );
};