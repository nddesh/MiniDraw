// you will need to MODIFY this and other files to make them work with command objects,
// instead of directly performing the actions
import React, { useContext } from 'react';

import '../Layers/Layers.css';

const ListItem = ({ type, index, selected }) => {
  return (
    <div className={`${selected ? 'list-item-selected' : ''}`}>
      {type} 
    </div>
  );
};

const Layers = ({ objects = [], shapesMap = {}, selectedShapeId }) => {
  // use useContext to access the functions & values from the provider
  // console.log(objects, shapesMap);
  return (
    <div className="Layers">
      <h4>Layers</h4>
      {objects.map((id, index) => {
        const object = shapesMap[id];
        return (
          <ListItem key={id} type={object.type} index={index} selected={id === selectedShapeId} />
        );
      })}
    </div>
  );
};

export default Layers;
