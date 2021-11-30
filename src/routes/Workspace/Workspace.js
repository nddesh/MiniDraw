import React, { Component } from 'react';
import _isEqual from 'lodash/isEqual';
import { useParams } from 'react-router-dom';

import ControlPanel from '../../containers/ControlPanel/ControlPanel';
import Workspace from '../../containers/Workspace/Workspace';

import ControlContext from '../../contexts/control-context';
import { genId, defaultValues } from '../../shared/util';
import Layers from '../../containers/Layers/Layers';
import { FirebaseContext } from '../../contexts/firebaseContext';

import CommandListPanel from '../../containers/CommandListPanel/CommandListPanel';

import AddShapeCommandObject from '../../shared/commandObjects/AddShapeCommandObject';
import DeleteShapeCommandObject from '../../shared/commandObjects/DeleteShapeCommandObject';
import ChangeFillColorCommandObject from '../../shared/commandObjects/ChangeFillColorCommandObject';
import ChangeBorderColorCommandObject from '../../shared/commandObjects/ChangeBorderColorCommandObject';
import ChangeBorderWidthCommandObject from '../../shared/commandObjects/ChangeBorderWidthCommandObject';
import MoveShapeCommandObject from '../../shared/commandObjects/MoveShapeCommandObject';

import { addEventListeners } from './utils';
import { FaTextHeight } from 'react-icons/fa';

import { doc, onSnapshot } from 'firebase/firestore';

class WorkspaceRoute extends Component {
  state = {
    // controls
    currMode: defaultValues.mode,
    currBorderColor: defaultValues.borderColor,
    currBorderWidth: defaultValues.borderWidth,
    currFillColor: defaultValues.fillColor,
    currVertexCount: 3,
    //defaultValues.vertexCount 

    tempBorderWidth: null,
    tempFillColor: null,
    tempBorderColor: null,
    tempShape: null,
    //tempVertexCount: null,

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

    // Prevent updating firestore when using slider or color picker
    // Only update when the change is done.
    disableUpdateFirestore: false,
  };

  constructor() {
    super();
    

    this.undoHandler = {
      registerExecution: this.registerExecution,
      getCurrState: this.getCurrState,
      updateState: this.updateState,
      getCurrShape: this.getCurrShape,
      updateShape: this.updateShape,
      selectShape: this.selectShape,
      deleteSelectedShape: this.deleteSelectedShape,
      addShape: this.addShape,
      changeBorderColor: this.changeBorderColor,
      changeFillColor: this.changeFillColor,
      changeBorderWidth: this.changeBorderWidth,
    };
  }

  componentDidMount() {
    this.props.getWorkspaceData(this.props.workspaceId, this.undoHandler).then((res) => {
      this.setState({ ...res });
    });
    // Add undo/redo event listeners.
    addEventListeners(this);

    this.unsubscribeFirestore = onSnapshot(
      doc(this.props.firestore, 'workspaces', this.props.workspaceId),
      (document) => {
        if (document) {
          const data = document.data();
          const { workspaceData } = data;
          this.setState({ ...workspaceData });
        }

        // console.log('Current data: ', doc.data());
      }
    );
  }

  componentWillUnmount() {
    this.unsubscribeFirestore();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!this.state.disableUpdateFirestore) {
      // update workspace data
      const watchedFields = ['shapes', 'shapesMap', 'commandList', 'currCommand'];
      const updatedList = [];

      watchedFields.forEach((f) => {
        if (!_isEqual(prevState[f], this.state[f])) {
          updatedList.push(f);
        }
      });

      if (updatedList.length > 0) {
        this.props.updateWorkspaceData(this.props.workspaceId, {
          shapes: this.state.shapes,
          shapesMap: this.state.shapesMap,
          // commandList: this.state.commandList.map((command) => {
          //   return command.getDataForSave();
          // }),
          // currCommand: this.state.currCommand,
        });
      }
    }
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
  canRepeat = () => {
    if (
      this.state.commandList.length <= 0 ||
      this.state.currCommand !== this.state.commandList.length - 1
    ) {
      return false;
    } else {
      // return true
      const latestCommand = this.state.commandList[this.state.commandList.length - 1];
      return latestCommand.canRepeat();
    }
  };

  undo = () => {
    if (this.canUndo()) {
      const commandToUndo = this.state.commandList[this.state.currCommand];
      commandToUndo.undo();
      this.setState({ currCommand: this.state.currCommand - 1 });
    }
  };

  redo = () => {
    if (this.canRedo()) {
      const commandToRedo = this.state.commandList[this.state.currCommand + 1];
      commandToRedo.redo();
      this.setState({ currCommand: this.state.currCommand + 1 });
    }
  };

  repeat = () => {
    if (this.canRepeat()) {
      const commandToRepeat = this.state.commandList[this.state.commandList.length - 1];
      commandToRepeat.repeat();
    }
  };

  selectShape = (id, data) => {
    const { borderColor, borderWidth, fillColor, vertexCount } = data || {};
    this.setState({ selectedShapeId: id });
    if (id) {
      const {
        borderColor: currBorderColor,
        borderWidth: currBorderWidth,
        fillColor: currFillColor,
        vertexCount: currVertexCount,
      } = this.state.shapesMap[this.state.shapes.filter((shapeId) => shapeId === id)[0]];
      this.setState({
        currBorderColor: borderColor ? borderColor : currBorderColor,
        currBorderWidth: borderWidth ? borderWidth : currBorderWidth,
        currFillColor: fillColor ? fillColor : currFillColor,
        currVertexCount: vertexCount ? vertexCount : currVertexCount,
      });
    }
  };

  // get the shape by its id, and update its properties
  updateShape = (shapeId, newData) => {
    let shapesMap = { ...this.state.shapesMap };
    let targetShape = shapesMap[shapeId];
    shapesMap[shapeId] = { ...targetShape, ...newData };
    this.setState({ shapesMap });
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

  disableUpdateFirestore = (callback) => {
    this.setState({ disableUpdateFirestore: true }, callback);
  };
  enableUpdateFirestore = (callback) => {
    this.setState({ disableUpdateFirestore: false }, callback);
  };
  /**---------------------------------------------
   * ADD SHAPE
   * ---------------------------------------------*/
  // add the shapeId to the array, and the shape itself to the map
  addShape = (shapeData, isRepeat) => {
    let shapes = [...this.state.shapes];
    let shapesMap = { ...this.state.shapesMap };
    const id = genId();
    shapesMap[id] = {
      ...shapeData,
      id,
    };
    shapes.push(id);
    // this.setState({ shapes, shapesMap, selectedShapeId: id });
    this.setState({ shapes, shapesMap });
    const data = { id, ...shapeData };
    const commandObj = new AddShapeCommandObject(this.undoHandler, data, isRepeat);
    if (commandObj.canExecute()) {
      commandObj.execute();
    }
  };

  /**---------------------------------------------
   * MOVE SHAPE
   * ---------------------------------------------*/
  moveShape = (newData) => {
    if (this.state.selectedShapeId) {
      this.updateShape(this.state.selectedShapeId, newData);
    }
  };
  startMoveShape = (id) => {
    this.disableUpdateFirestore(() => {
      let shapesMap = { ...this.state.shapesMap };
      this.setState({ tempShape: shapesMap[id] });
    });
  };
  stopMoveShape = () => {
    this.enableUpdateFirestore(() => {
      if (
        this.state.tempShape &&
        this.getCurrShape() &&
        this.state.tempShape.initCoords.x !== this.getCurrShape().initCoords.x
      ) {
        const data = {
          shape: this.getCurrShape(),
          oldValue: this.state.tempShape,
          newValue: this.getCurrShape(),
          targetShape: this.getCurrShape(),
        };

        const commandObj = new MoveShapeCommandObject(this.undoHandler, data);
        if (commandObj.canExecute()) {
          commandObj.execute();
        }
      }

      this.setState({ tempShape: null });
    });
  };

    /**---------------------------------------------
   * RESIZE SHAPE
   * ---------------------------------------------*/
    resizeShape = (newData) => {
      if (this.state.selectedShapeId) {
        this.updateShape(this.state.selectedShapeId, newData);
      }
    };
    startResizeShape = (id) => {
      // let shapesMap = { ...this.state.shapesMap };
      // this.setState({ tempShape: shapesMap[id] });
    };
    stopResizeShape = () => {
      // if (
      //   this.state.tempShape &&
      //   this.getCurrShape() &&
      //   this.state.tempShape.initCoords.x !== this.getCurrShape().initCoords.x
      // ) {
      //   const data = {
      //     shape: this.getCurrShape,
      //     oldValue: this.state.tempShape,
      //     newValue: this.getCurrShape(),
      //   };
  
        // const commandObj = new ResizeShapeCommandObject(this.undoHandler, data);
        // if (commandObj.canExecute()) {
        //   commandObj.execute();
        // }
      //}
  
      // this.setState({ tempShape: null });
    };

  /**---------------------------------------------
   * DELETE SHAPE
   * ---------------------------------------------*/

  // deleting a shape sets its visibility to false, rather than removing it
  deleteSelectedShape = (data, isRepeat) => {
    let shapesMap = { ...this.state.shapesMap };
    shapesMap[this.state.selectedShapeId].visible = false;
    this.setState({ shapesMap, selectedShapeId: undefined });

    if (this.getCurrShape()) {
      const commandObj = new DeleteShapeCommandObject(
        this.undoHandler,
        {
          shape: this.getCurrShape(),
          targetShape: this.getCurrShape(),
        },
        isRepeat
      );
      if (commandObj.canExecute()) {
        commandObj.execute();
      }
    }
  };

  /**---------------------------------------------
   * CHANGE BORDER COLOR
   * ---------------------------------------------*/
  // Workaround to change fill color without using color picker
  changeBorderColor = (borderColor, isRepeat) => {
    const data = {
      oldValue: this.state.currBorderColor,
      newValue: borderColor,
      targetShape: this.getCurrShape(),
    };
    const commandObj = new ChangeBorderColorCommandObject(this.undoHandler, data, isRepeat);
    if (commandObj.canExecute()) {
      commandObj.execute();
    }

    if (this.state.selectedShapeId) {
      this.updateShape(this.state.selectedShapeId, { borderColor });
    }
  };
  changeCurrBorderColor = (borderColor) => {
    if (!this.state.tempBorderColor) {
      this.disableUpdateFirestore(() => {
        this.startChangingBorderColor(borderColor);
      });
    }

    this.setState({ currBorderColor: borderColor });
    if (this.state.selectedShapeId) {
      this.updateShape(this.state.selectedShapeId, { borderColor });
    }
  };
  startChangingBorderColor = (borderColor) => {
    this.setState({ tempBorderColor: borderColor });
  };
  stopChangingBorderColor = () => {
    this.enableUpdateFirestore(() => {
      if (this.state.tempBorderColor !== this.state.currBorderColor && this.getCurrShape()) {
        const data = {
          oldValue: this.state.tempBorderColor,
          newValue: this.state.currBorderColor,
          targetShape: this.getCurrShape(),
        };
        const commandObj = new ChangeBorderColorCommandObject(this.undoHandler, data);
        if (commandObj.canExecute()) {
          commandObj.execute();
        }
      }
      this.setState({ tempFillColor: null });
    });
  };

  /**---------------------------------------------
   * CHANGE BORDER WIDTH
   * ---------------------------------------------*/
  changeBorderWidth = (borderWidth, isRepeat) => {
    const data = {
      oldValue: this.state.currBorderWidth,
      newValue: borderWidth,
      targetShape: this.getCurrShape(),
    };
    const commandObj = new ChangeBorderWidthCommandObject(this.undoHandler, data, isRepeat);
    if (commandObj.canExecute()) {
      commandObj.execute();
    }
    this.setState({ currBorderWidth: borderWidth });
    if (this.state.selectedShapeId) {
      this.updateShape(this.state.selectedShapeId, { borderWidth });
    }
  };
  changeCurrBorderWidth = (borderWidth) => {
    this.setState({ currBorderWidth: borderWidth });
    if (this.state.selectedShapeId) {
      this.updateShape(this.state.selectedShapeId, { borderWidth });
    }
  };
  startSlideBorderWidth = (borderWidth) => {
    this.disableUpdateFirestore(() => {
      this.setState({ tempBorderWidth: borderWidth });
    });
  };
  stopSlideBorderWidth = (borderWidth) => {
    this.enableUpdateFirestore(() => {
      if (borderWidth !== this.state.tempBorderWidth && this.getCurrShape()) {
        const data = {
          oldValue: this.state.tempBorderWidth,
          newValue: borderWidth,
          targetShape: this.getCurrShape(),
        };
        const commandObj = new ChangeBorderWidthCommandObject(this.undoHandler, data);
        if (commandObj.canExecute()) {
          commandObj.execute();
        }
      }
      this.setState({ tempBorderWidth: null });
    });
  };

  /**---------------------------------------------
   * CHANGE FILL COLOR
   * ---------------------------------------------*/

  // Workaround to change fill color without using color picker
  changeFillColor = (fillColor, isRepeat) => {
    const data = {
      oldValue: this.state.currFillColor,
      newValue: fillColor,
      targetShape: this.getCurrShape(),
    };
    const commandObj = new ChangeFillColorCommandObject(this.undoHandler, data, isRepeat);
    if (commandObj.canExecute()) {
      commandObj.execute();
    }
    if (this.state.selectedShapeId) {
      this.updateShape(this.state.selectedShapeId, { fillColor });
    }
  };
  changeCurrFillColor = (fillColor) => {
    if (!this.state.tempFillColor) {
      this.disableUpdateFirestore(() => {
        this.startChangingFillColor(fillColor);
      });
    }
    this.setState({ currFillColor: fillColor });
    if (this.state.selectedShapeId) {
      this.updateShape(this.state.selectedShapeId, { fillColor });
    }
  };
  startChangingFillColor = (fillColor) => {
    this.setState({ tempFillColor: fillColor });
  };
  stopChangingFillColor = () => {
    this.enableUpdateFirestore(() => {
      if (this.state.tempFillColor && this.state.currFillColor && this.getCurrShape()) {
        const data = {
          oldValue: this.state.tempFillColor,
          newValue: this.state.currFillColor,
          targetShape: this.getCurrShape(),
        };
        const commandObj = new ChangeFillColorCommandObject(this.undoHandler, data);
        if (commandObj.canExecute()) {
          commandObj.execute();
        }
      }
      this.setState({ tempFillColor: null });
    });
  };
  /**---------------------------------------------
   * CHANGE VERTEX COUNT
   * ---------------------------------------------*/
  changeCurrVertexCount = (vertexCount) => {
    // if(!this.state.tempVertexCount) {
    //   this.startChangingVertexCount(vertexCount)
    // }

    this.setState({ currVertexCount: vertexCount });
    if (this.state.selectedShapeId) {
      this.updateShape(this.state.selectedShapeId, { vertexCount });
    }
  };
  // startChangingVertexCount = (vertexCount) => {
  //   this.setState({ tempVertexCount: vertexCount });
  // };
  // stopChangingVertexCount = () => {
  //   if (this.state.tempVertexCount && this.state.currVertexCount && this.getCurrShape()) {
  //     const data = {
  //       oldValue: this.state.tempVertexCount,
  //       newValue: this.state.currVertexCount,
  //       targetShape: this.getCurrShape(),
  //     };
  //     const commandObj = new ChangeVertexCountCommandObject(this.undoHandler, data);
  //     if (commandObj.canExecute()) {
  //       commandObj.execute();
  //     }
  //   }
  //   this.setState({ tempVertexCount: null });
  // };

  /**---------------------------------------------
   * RENDER
   * ---------------------------------------------*/

  render() {
    const {
      currMode,
      currBorderColor,
      currBorderWidth,
      currFillColor,
      currVertexCount,
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
            stopChangeBorderColor: this.stopChangingBorderColor,
            currBorderWidth,
            changeCurrBorderWidth: this.changeCurrBorderWidth,
            startSlideBorderWidth: this.startSlideBorderWidth,
            stopSlideBorderWidth: this.stopSlideBorderWidth,
            currFillColor,
            changeCurrFillColor: this.changeCurrFillColor,
            stopChangeFillColor: this.stopChangingFillColor,
            currVertexCount,
            changeCurrVertexCount: this.changeCurrVertexCount,


            shapes,
            shapesMap,
            addShape: this.addShape,
            moveShape: this.moveShape,
            startMoveShape: this.startMoveShape,
            stopMoveShape: this.stopMoveShape,
            selectedShapeId,
            selectShape: this.selectShape,
            resizeShape: this.resizeShape,
            startResizeShape: this.startResizeShape,
            stopResizeShape: this.stopResizeShape,

            deleteSelectedShape: this.deleteSelectedShape,

            undo: this.undo,
            redo: this.redo,
            repeat: this.repeat,
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            canRepeat: this.canRepeat(),
          }}
        >
          <Layers />

          <Workspace />
          <ControlPanel />
          <CommandListPanel
            commands={this.state.commandList}
            currCommandIndex={this.state.currCommand}
          />
        </ControlContext.Provider>
      </React.Fragment>
    );
  }
}

const WorkspaceWrapper = ({ ...props }) => {
  const { workspaceId } = useParams();
  const { firestore, getWorkspaceData, updateWorkspaceData } = React.useContext(FirebaseContext);
  return (
    <div style={{ position: 'relative', width: '100%', height: '1000px', overflowX: 'scroll' }}>
      <WorkspaceRoute
        firestore={firestore}
        getWorkspaceData={getWorkspaceData}
        updateWorkspaceData={updateWorkspaceData}
        workspaceId={workspaceId}
        {...props}
      />
    </div>
  );
};
export default WorkspaceWrapper;
