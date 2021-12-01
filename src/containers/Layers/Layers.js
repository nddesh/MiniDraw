// you will need to MODIFY this and other files to make them work with command objects, 
// instead of directly performing the actions
import React, { useContext } from "react";

import "../Layers/Layers.css";

const ListItem = ({type, index }) => {
  return (
    <div>
      {type}{' '}
      {index}
    </div>
  );
};

const Layers = ({objects =[], shapesMap={}}) => {
  // use useContext to access the functions & values from the provider
  // console.log(objects, shapesMap);
  return (
    <div className="Layers">
      <h4>Layers</h4>
      {objects.map((id, index) => {
        const object = shapesMap[id];
        console.log("hi");
        return (
          <ListItem
            key={id}
            type={object.type}
            index={index}
            key={`${object.type}_${index}`}
          />
        );
      })}
    </div>
  );
};

export default Layers;