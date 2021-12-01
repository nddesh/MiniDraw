import React from "react";

export default ({
  type,
  x,
  y,
  width,
  height,
  x1,
  y1,
  x2,
  y2,
  borderWidth,
}) => {
    // create 8 points for the selection box
    if(type !== "line" && type !== "text") {
        const r = 5.5 + parseInt(borderWidth);
        const points = [
            { x: x - r, y: y - r},    // top left               
            { x: x + width/2, y: y - r },   // left middle
            { x: x + width + r, y: y - r},   //  top right
            { x: x + width + r, y: y + height/2 }, // bottom middle
            { x: x + width + r, y: y + height + r}, // bottom right
            { x: x + width/2, y: y + height + r }, // right middle
            { x: x - r, y: y + height + r }, // left bottom
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
                key={`selection_group_keys_${i}`}
                id={`selection_group_${i}`}
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
    } else if (type === "line") {
        const r = 8;
        const xgrad = r * (x2-x1) / Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
        const ygrad = r * (y2-y1) / Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
        console.log(xgrad, ygrad);
        const points = [
            { x: x1 - xgrad, y: y1 - ygrad}, // bottom middle
            { x: x2 + xgrad, y: y2 + ygrad}, // top middle
        ];
    

        var selectionGroup = [];
        var arrayLength = points.length;
        // for (var i = 0; i < arrayLength; i++) {
        //     const s = points[i];
        //     // create a circle for each point
        //     // console.log(s);
        //     selectionGroup.push(<circle
        //         key={`selection_group_keys_line_${i}`}
        //         id={`selection_group_line_${i}`}
        //         className="selectionGroup"
        //         cx={s.x}
        //         cy={s.y}
        //         r="5"
        //         fill="red"
        //         stroke="black"
        //         strokeWidth="2"
        //     />);
        // }
        selectionGroup.push(<circle
            key={`selection_group_keys_line_0`}
            id={`selection_group_0`}
            className="selectionGroup"
            cx={points[0].x}
            cy={points[0].y}
            r="5"
            fill="red"
            stroke="black"
            strokeWidth="2"
        />);
        selectionGroup.push(<circle
            key={`selection_group_keys_line_4`}
            id={`selection_group_4`}
            className="selectionGroup"
            cx={points[1].x}
            cy={points[1].y}
            r="5"
            fill="red"
            stroke="black"
            strokeWidth="2"
        />);


        return selectionGroup;
    } else {
        return null;
    }
};