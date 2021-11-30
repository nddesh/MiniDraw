import React from "react";

export default ({
  type,
  x,
  y,
  width,
  height,
}) => {
    // create 8 points for the selection box
    if(type !== "line" ) {
        const r = 5.5;
        const points = [
            { x: x - r, y: y - r},    // top left               
            { x: x + width/2, y: y - r },   // left middle
            { x: x + width, y: y - r},   // left bottom
            { x: x + width + r, y: y + height + r}, // bottom right
            { x: x + width/2, y: y + height + r }, // right middle
            { x: x + width + r, y: y + height/2 }, // bottom middle
            { x: x - r, y: y + height + r }, // top right
            { x: x - r, y: y +height/2 }, // top middle
        ];
        const keys = points.map((point, index) => {
            // console.log(point);
            return `${index}`;
        });

        var selectionGroup = [];
        var arrayLength = points.length;
        for (var i = 0; i < arrayLength; i++) {
            const s = points[i];
            // create a circle for each point
            // console.log(s);
            selectionGroup.push(<circle
                key={`selction_group_keys_${i}`}
                id={`selction_group_${i}`}
                className="selectionGroup"
                cx={s.x}
                cy={s.y}
                r="5"
                fill="red"
                stroke="black"
                strokeWidth="2"
            />);
        }


        return selectionGroup;
    } else {
        return null;
    }
};