// fill in operations here to perform the undo/redo using the command objects
import React, { Component } from 'react';

import ControlPanel from './containers/ControlPanel/ControlPanel';
import Workspace from './containers/Workspace/Workspace';

import ControlContext from './contexts/control-context';
import { genId, defaultValues } from './shared/util';
import Layers from './containers/Layers/Layers';

import CommandListPanel from './containers/CommandListPanel/CommandListPanel';

import AddShapeCommandObject from './shared/commandObjects/AddShapeCommandObject';
import DeleteShapeCommandObject from './shared/commandObjects/DeleteShapeCommandObject';
import ChangeFillColorCommandObject from './shared/commandObjects/ChangeFillColorCommandObject';
import ChangeBorderColorCommandObject from './shared/commandObjects/ChangeBorderColorCommandObject';
import ChangeBorderWidthCommandObject from './shared/commandObjects/ChangeBorderWidthCommandObject';
import MoveShapeCommandObject from './shared/commandObjects/MoveShapeCommandObject';

import './App.css';
class App extends Component {
  state = {
    // controls
    currMode: defaultValues.mode,
    currBorderColor: defaultValues.borderColor,
    currBorderWidth: defaultValues.borderWidth,
    currFillColor: defaultValues.fillColor,

    tempBorderWidth: null,
    tempShape: null,

    // workspace
    shapes: [],
    shapesMap: {},
    selectedShapeId: undefined,

    // handling undo/redo
    commandList: [],
    currCommand: -1,
    disableUndo: false,
    disableRedo: false,

    isCommandKeyPress: false,
    isControlKeyPress: false,
    isShiftKeyPress: false,
  };

  constructor() {
    super();

    /*
     * pass this undoHandler into command object constructors:
     *  e.g. let cmdObj = new ChangeFillColorCommandObject(this.undoHandler);
     */
    this.undoHandler = {
      registerExecution: this.registerExecution,
      getCurrState: this.getCurrState,
      updateState: this.updateState,
      getCurrShape: this.getCurrShape,
      updateShape: this.updateShape,
      selectShape: this.selectShape,
      // TODO: fill this up with whatever you need for the command objects
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', (e) => {
      if (this.state.isCommandKeyPress && !this.state.isShiftKeyPress) {
        if (e.key === 'z') this.undo();
        if (e.key === 'Shift') this.setState({ isShiftKeyPress: true });
      } else if (this.state.isCommandKeyPress && this.state.isShiftKeyPress) {
        if (e.key === 'z') this.redo();
      } else if (this.state.isControlKeyPress) {
        if (e.key === 'z') this.undo();
        if (e.key === 'y') this.redo();
      } else {
        if (e.key === 'Meta') this.setState({ isCommandKeyPress: true });
        if (e.key === 'Control') this.setState({ isControlKeyPress: true });
        if (e.key === 'Shift') this.setState({ isShiftKeyPress: true });
      }
    });
    document.addEventListener('keyup', (e) => {
      if (this.state.isCommandKeyPress) {
        if (e.key === 'Meta') this.setState({ isCommandKeyPress: false });
      }
      if (this.state.isControlKeyPress) {
        if (e.key === 'Controle') this.setState({ isControleKeyPress: false });
      }
      if (this.state.isShiftKeyPress) {
        if (e.key === 'Shift') this.setState({ isShiftKeyPress: false });
      }
    });
  }

  getCurrState = () => {
    return this.state;
  };

  getCurrShape = () => {
    return this.state.shapesMap[this.state.selectedShapeId];
  };

  updateState = (updatedState) => {
    this.setState({ ...this.state, ...updatedState });
  };

  /*
   * TODO:
   * add the commandObj to the commandList so
   * that is available for undoing.
   */
  registerExecution = (commandObject) => {
    let newCommandList = [...this.state.commandList];
    if (this.state.currCommand !== this.state.commandList.length - 1) {
      newCommandList = [...this.state.commandList].slice(0, this.state.currCommand + 1);
    }

    newCommandList.push(commandObject);
    this.setState({ commandList: newCommandList, currCommand: this.state.currCommand + 1 });
  };

  canUndo = () => {
    return this.state.currCommand >= 0;
  };
  canRedo = () => {
    return this.state.currCommand < this.state.commandList.length - 1;
  };
  /*
   * TODO:
   * actually call the undo method of the command at
   * the current position in the undo stack
   */
  undo = () => {
    if (this.canUndo()) {
      const commandToUndo = this.state.commandList[this.state.currCommand];
      commandToUndo.undo();
      this.setState({ currCommand: this.state.currCommand - 1 });
    }
  };

  /*
   * TODO:
   * actually call the redo method of the command at
   * the current position in the undo stack.
   */
  redo = () => {
    if (this.canRedo()) {
      const commandToRedo = this.state.commandList[this.state.currCommand + 1];
      commandToRedo.redo();
      this.setState({ currCommand: this.state.currCommand + 1 });
    }
  };

  selectShape = (id, data) => {
    const { borderColor, borderWidth, fillColor } = data || {};
    this.setState({ selectedShapeId: id });
    if (id) {
      const {
        borderColor: currBorderColor,
        borderWidth: currBorderWidth,
        fillColor: currFillColor,
      } = this.state.shapesMap[this.state.shapes.filter((shapeId) => shapeId === id)[0]];
      this.setState({
        currBorderColor: borderColor ? borderColor : currBorderColor,
        currBorderWidth: borderWidth ? borderWidth : currBorderWidth,
        currFillColor: fillColor ? fillColor : currFillColor,
      });
    }
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
    const data = { id, ...shapeData };
    const commandObj = new AddShapeCommandObject(this.undoHandler, data);
    if (commandObj.canExecute()) {
      commandObj.execute();
    }
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
  startMoveShape = (id) => {
    let shapesMap = { ...this.state.shapesMap };
    this.setState({ tempShape: shapesMap[id] });
  };
  stopMoveShape = () => {
    if (
      this.state.tempShape &&
      this.getCurrShape() &&
      this.state.tempShape.initCoords.x !== this.getCurrShape().initCoords.x
    ) {
      const data = {
        shape: this.getCurrShape,
        oldValue: this.state.tempShape,
        newValue: this.getCurrShape(),
      };
      const commandObj = new MoveShapeCommandObject(this.undoHandler, data);
      if (commandObj.canExecute()) {
        commandObj.execute();
      }
    }

    this.setState({ tempShape: null });
  };

  // deleting a shape sets its visibility to false, rather than removing it
  deleteSelectedShape = () => {
    let shapesMap = { ...this.state.shapesMap };
    shapesMap[this.state.selectedShapeId].visible = false;
    this.setState({ shapesMap, selectedShapeId: undefined });

    if (this.getCurrShape()) {
      const commandObj = new DeleteShapeCommandObject(this.undoHandler, {
        shape: this.getCurrShape(),
      });
      if (commandObj.canExecute()) {
        commandObj.execute();
      }
    }
  };

  changeCurrMode = (mode) => {
    if (mode === 'line') {
      this.setState({
        currMode: mode,
        currBorderColor: defaultValues.borderColor,
      });
    } else {
      this.setState({ currMode: mode });
    }
  };

  changeCurrBorderColor = (borderColor) => {
    if (borderColor !== this.state.currBorderColor && this.getCurrShape()) {
      const data = { oldValue: this.state.currBorderColor, newValue: borderColor };
      const commandObj = new ChangeBorderColorCommandObject(this.undoHandler, data);
      if (commandObj.canExecute()) {
        commandObj.execute();
      }
    }

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
  startSlideBorderWidth = (borderWidth) => {
    this.setState({ tempBorderWidth: borderWidth });
  };
  stopSlideBorderWidth = (borderWidth) => {
    if (borderWidth !== this.state.tempBorderWidth && this.getCurrShape()) {
      const data = { oldValue: this.state.tempBorderWidth, newValue: borderWidth };
      const commandObj = new ChangeBorderWidthCommandObject(this.undoHandler, data);
      if (commandObj.canExecute()) {
        commandObj.execute();
      }
    }
    this.setState({ tempBorderWidth: null });
  };

  changeCurrFillColor = (fillColor) => {
    if (fillColor !== this.state.currFillColor && this.getCurrShape()) {
      const data = { oldValue: this.state.currFillColor, newValue: fillColor };
      const commandObj = new ChangeFillColorCommandObject(this.undoHandler, data);
      if (commandObj.canExecute()) {
        commandObj.execute();
      }
    }

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
            startSlideBorderWidth: this.startSlideBorderWidth,
            stopSlideBorderWidth: this.stopSlideBorderWidth,
            currFillColor,
            changeCurrFillColor: this.changeCurrFillColor,

            shapes,
            shapesMap,
            addShape: this.addShape,
            moveShape: this.moveShape,
            startMoveShape: this.startMoveShape,
            stopMoveShape: this.stopMoveShape,
            selectedShapeId,
            selectShape: this.selectShape,

            deleteSelectedShape: this.deleteSelectedShape,

            undo: this.undo,
            redo: this.redo,
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
          }}
        >
          <Layers />

          <Workspace />
          <ControlPanel />
          <CommandListPanel
            commands={this.state.commandList}
            currCommandIndex={this.state.currCommand}
          />
          {/* <div style={{ position: 'absolute', top: '10px', left: '1110px', width: '200px', border: '1px solid black'  }}>
            {this.state.commandList.map((command, index) => {
              return (
                <div
                  key={command.commandId}
                  style={{
                    backgroundColor: index === this.state.currCommand ? 'lightgrey' : 'transparent',
                  }}
                >
                  {command.commandName}
                </div>
              );
            })}
          </div> */}
        </ControlContext.Provider>
      </React.Fragment>
    );
  }
}

export default App;

// // fill in operations here to perform the undo/redo using the command objects
// import React, { Component } from "react";

// import ControlPanel from "./containers/ControlPanel/ControlPanel";
// import Workspace from "./containers/Workspace/Workspace";
// import Layers from "./containers/Layers/Layers";
// // import LoginBar from "./containers/LoginBar/LoginBar";

// import ControlContext from "./contexts/control-context";
// import { genId, defaultValues } from "./shared/util";

// import "./App.css";

// class App extends Component {
//   state = {
//     // controls
//     currMode: defaultValues.mode,
//     currBorderColor: defaultValues.borderColor,
//     currBorderWidth: defaultValues.borderWidth,
//     currFillColor: defaultValues.fillColor,

//     // workspace
//     shapes: [],
//     shapesMap: {},
//     selectedShapeId: undefined,

//     // handling undo/redo
//     commandList: [],
//     currCommand: -1,
//   };

//   constructor() {
//     super();

//     /*
//      * pass this undoHandler into command object constructors:
//      *  e.g. let cmdObj = new ChangeFillColorCommandObject(this.undoHandler);
//      */
//     this.undoHandler = {
//       registerExecution: this.registerExecution,
//       // TODO: fill this up with whatever you need for the command objects
//     };
//   }

//   /*
//    * TODO:
//    * add the commandObj to the commandList so
//    * that is available for undoing.
//    */
//   registerExecution = (commandObject) => {};

//   /*
//    * TODO:
//    * actually call the undo method of the command at
//    * the current position in the undo stack
//    */
//   undo = () => {
//     console.log("undo");
//   };

//   /*
//    * TODO:
//    * actually call the redo method of the command at
//    * the current position in the undo stack.
//    */
//   redo = () => {
//     console.log("redo");
//   };

//   // add the shapeId to the array, and the shape itself to the map
//   addShape = (shapeData) => {
//     let shapes = [...this.state.shapes];
//     let shapesMap = { ...this.state.shapesMap };
//     const id = genId();
//     shapesMap[id] = {
//       ...shapeData,
//       id,
//     };
//     shapes.push(id);
//     this.setState({ shapes, shapesMap, selectedShapeId: id });
//   };

//   // get the shape by its id, and update its properties
//   updateShape = (shapeId, newData) => {
//     let shapesMap = { ...this.state.shapesMap };
//     let targetShape = shapesMap[shapeId];
//     shapesMap[shapeId] = { ...targetShape, ...newData };
//     this.setState({ shapesMap });
//   };

//   moveShape = (newData) => {
//     if (this.state.selectedShapeId) {
//       this.updateShape(this.state.selectedShapeId, newData);
//     }
//   };

//   // deleting a shape sets its visibility to false, rather than removing it
//   deleteSelectedShape = () => {
//     let shapesMap = { ...this.state.shapesMap };
//     shapesMap[this.state.selectedShapeId].visible = false;
//     this.setState({ shapesMap, selectedShapeId: undefined });
//   };

//   changeCurrMode = (mode) => {
//     if (mode === "line") {
//       this.setState({
//         currMode: mode,
//         currBorderColor: defaultValues.borderColor,
//       });
//     } else {
//       this.setState({ currMode: mode });
//     }
//   };

//   changeCurrBorderColor = (borderColor) => {
//     this.setState({ currBorderColor: borderColor });
//     if (this.state.selectedShapeId) {
//       this.updateShape(this.state.selectedShapeId, { borderColor });
//     }
//   };

//   changeCurrBorderWidth = (borderWidth) => {
//     this.setState({ currBorderWidth: borderWidth });
//     if (this.state.selectedShapeId) {
//       this.updateShape(this.state.selectedShapeId, { borderWidth });
//     }
//   };

//   changeCurrFillColor = (fillColor) => {
//     this.setState({ currFillColor: fillColor });
//     if (this.state.selectedShapeId) {
//       this.updateShape(this.state.selectedShapeId, { fillColor });
//     }
//   };

//   render() {
//     const {
//       currMode,
//       currBorderColor,
//       currBorderWidth,
//       currFillColor,
//       shapes,
//       shapesMap,
//       selectedShapeId,
//     } = this.state;

//     // update the context with the functions and values defined above and from state
//     // and pass it to the structure below it (control panel and workspace)
//     return (
//       <React.Fragment>
//         <ControlContext.Provider
//           value={{
//             currMode,
//             changeCurrMode: this.changeCurrMode,
//             currBorderColor,
//             changeCurrBorderColor: this.changeCurrBorderColor,
//             currBorderWidth,
//             changeCurrBorderWidth: this.changeCurrBorderWidth,
//             currFillColor,
//             changeCurrFillColor: this.changeCurrFillColor,

//             shapes,
//             shapesMap,
//             addShape: this.addShape,
//             moveShape: this.moveShape,
//             selectedShapeId,
//             selectShape: (id) => {
//               this.setState({ selectedShapeId: id });
//               if (id) {
//                 const { borderColor, borderWidth, fillColor } = shapesMap[
//                   shapes.filter((shapeId) => shapeId === id)[0]
//                 ];
//                 this.setState({
//                   currBorderColor: borderColor,
//                   currBorderWidth: borderWidth,
//                   currFillColor: fillColor,
//                 });
//               }
//             },
//             deleteSelectedShape: this.deleteSelectedShape,

//             undo: this.undo,
//             redo: this.redo,
//           }}
//         >
//           <Layers/>
//           <Workspace />
//           <ControlPanel />
//         </ControlContext.Provider>
//       </React.Fragment>
//     );
//   }
// }

// export default App;
