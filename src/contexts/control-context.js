import { createContext } from "react";

// create a context with default values
const controlContext = createContext({
  currMode: "rect",
  changeCurrMode: () => {},
  currBorderColor: "",
  changeCurrBorderColor: () => {},
  currBorderWidth: 1,
  changeCurrBorderWidth: () => {},
  currFillColor: "",
  changeCurrFillColor: () => {},
  currVertexCount: 3,
  changeCurrVertexCount: () => {},
  currText: "",
  changeCurrText: () => {},

  shapes: [],
  shapesMap: {},
  addShape: () => {},
  moveShape: () => {},
  selectedShapeId: "", // a string or undefined
  selectShape: () => {},
  deleteSelectedShape: () => {},

  undo: () => {},
  redo: () => {},
});

export default controlContext;
