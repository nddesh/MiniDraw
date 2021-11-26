// you will need to MODIFY this and other files to make them work with command objects, 
// instead of directly performing the actions
import React, { useContext } from "react";

import "../Layers/Layers.css";


const Layers = () => {
  // use useContext to access the functions & values from the provider
  return (
    <div className="Layers">
      <p>Layer 1</p>
      <p>Layer 2</p>
    </div>
  );
};

export default Layers;
