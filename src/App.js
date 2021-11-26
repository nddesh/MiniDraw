// fill in operations here to perform the undo/redo using the command objects
import React, { Component } from "react";

import ControlPanel from "./containers/ControlPanel/ControlPanel";
import Workspace from "./containers/Workspace/Workspace";
import Layers from "./containers/Layers/Layers";
// import LoginBar from "./containers/LoginBar/LoginBar";

import ControlContext from "./contexts/control-context";
import { genId, defaultValues } from "./shared/util";

import "./App.css";

class App extends Component {
  state = {
    // controls
    currMode: defaultValues.mode,
    currBorderColor: defaultValues.borderColor,
    currBorderWidth: defaultValues.borderWidth,
    currFillColor: defaultValues.fillColor,

    // workspace
    shapes: [],
    shapesMap: {},
    selectedShapeId: undefined,

    // handling undo/redo
    commandList: [],
    currCommand: -1,
  };

  constructor() {
    super();

    /*
     * pass this undoHandler into command object constructors:
     *  e.g. let cmdObj = new ChangeFillColorCommandObject(this.undoHandler);
     */
    this.undoHandler = {
      registerExecution: this.registerExecution,
      // TODO: fill this up with whatever you need for the command objects
    };
  }

  /*
   * TODO:
   * add the commandObj to the commandList so
   * that is available for undoing.
   */
  registerExecution = (commandObject) => {};

  /*
   * TODO:
   * actually call the undo method of the command at
   * the current position in the undo stack
   */
  undo = () => {
    console.log("undo");
  };

  /*
   * TODO:
   * actually call the redo method of the command at
   * the current position in the undo stack.
   */
  redo = () => {
    console.log("redo");
  };

  // add the shapeId to the array, and the shape itself to the map
  addShape = (shapeData) => {
    let shapes = [...this.state.shapes];
    let shapesMap = { ...this.state.shapesMap };
    const id = genId();
    shapesMap[id] = {
      ...shapeData,
      id,
    };
    shapes.push(id);
    this.setState({ shapes, shapesMap, selectedShapeId: id });
  };

  // get the shape by its id, and update its properties
  updateShape = (shapeId, newData) => {
    let shapesMap = { ...this.state.shapesMap };
    let targetShape = shapesMap[shapeId];
    shapesMap[shapeId] = { ...targetShape, ...newData };
    this.setState({ shapesMap });
  };

  moveShape = (newData) => {
    if (this.state.selectedShapeId) {
      this.updateShape(this.state.selectedShapeId, newData);
    }
  };

  // deleting a shape sets its visibility to false, rather than removing it
  deleteSelectedShape = () => {
    let shapesMap = { ...this.state.shapesMap };
    shapesMap[this.state.selectedShapeId].visible = false;
    this.setState({ shapesMap, selectedShapeId: undefined });
  };

  changeCurrMode = (mode) => {
    if (mode === "line") {
      this.setState({
        currMode: mode,
        currBorderColor: defaultValues.borderColor,
      });
    } else {
      this.setState({ currMode: mode });
    }
  };

  changeCurrBorderColor = (borderColor) => {
    this.setState({ currBorderColor: borderColor });
    if (this.state.selectedShapeId) {
      this.updateShape(this.state.selectedShapeId, { borderColor });
    }
  };

  changeCurrBorderWidth = (borderWidth) => {
    this.setState({ currBorderWidth: borderWidth });
    if (this.state.selectedShapeId) {
      this.updateShape(this.state.selectedShapeId, { borderWidth });
    }
  };

  changeCurrFillColor = (fillColor) => {
    this.setState({ currFillColor: fillColor });
    if (this.state.selectedShapeId) {
      this.updateShape(this.state.selectedShapeId, { fillColor });
    }
  };

  render() {
    const {
      currMode,
      currBorderColor,
      currBorderWidth,
      currFillColor,
      shapes,
      shapesMap,
      selectedShapeId,
    } = this.state;

    // update the context with the functions and values defined above and from state
    // and pass it to the structure below it (control panel and workspace)
    return (
      <React.Fragment>
        <ControlContext.Provider
          value={{
            currMode,
            changeCurrMode: this.changeCurrMode,
            currBorderColor,
            changeCurrBorderColor: this.changeCurrBorderColor,
            currBorderWidth,
            changeCurrBorderWidth: this.changeCurrBorderWidth,
            currFillColor,
            changeCurrFillColor: this.changeCurrFillColor,

            shapes,
            shapesMap,
            addShape: this.addShape,
            moveShape: this.moveShape,
            selectedShapeId,
            selectShape: (id) => {
              this.setState({ selectedShapeId: id });
              if (id) {
                const { borderColor, borderWidth, fillColor } = shapesMap[
                  shapes.filter((shapeId) => shapeId === id)[0]
                ];
                this.setState({
                  currBorderColor: borderColor,
                  currBorderWidth: borderWidth,
                  currFillColor: fillColor,
                });
              }
            },
            deleteSelectedShape: this.deleteSelectedShape,

            undo: this.undo,
            redo: this.redo,
          }}
        >
          <Layers/>
          <Workspace />
          <ControlPanel />
        </ControlContext.Provider>
      </React.Fragment>
    );
  }
}

export default App;
