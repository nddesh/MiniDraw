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
import ChangeVertexCountCommandObject from '../../shared/commandObjects/ChangeVertexCountCommandObject';
import MoveShapeCommandObject from '../../shared/commandObjects/MoveShapeCommandObject';
import ResizeCommandObject from '../../shared/commandObjects/ResizeCommandObject';
import ChangeLayerOrderObjects from '../../shared/commandObjects/ChangeLayerOrderObjects';

import { addEventListeners } from './utils';
import { FaTextHeight } from 'react-icons/fa';

import { doc, onSnapshot } from 'firebase/firestore';

const defaultState = {
  workspaceName: null,
  // controls
  currMode: defaultValues.mode,
  currBorderColor: defaultValues.borderColor,
  currBorderWidth: defaultValues.borderWidth,
  currFillColor: defaultValues.fillColor,
  currVertexCount: 3,
  //defaultValues.vertexCount
  currText: '',
  currResizeData: null,
  // defaultValues.text

  tempBorderWidth: null,
  tempFillColor: null,
  tempBorderColor: null,
  tempShape: null,
  tempResizeData: null,
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

class WorkspaceRoute extends Component {
  state = {
    ...defaultState,
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
      changeCurrVertexCount: this.changeCurrVertexCount,
      moveForward: this.moveForward,
      moveBackward: this.moveBackward,
      canMoveForward: this.canMoveForward,
      canMoveBackward: this.canMoveBackward,
    };
  }

  componentDidMount() {
    this.props.getWorkspaceData(this.props.workspaceId, this.undoHandler).then((res) => {
      this.setState({ workspaceName: res.name, ...res });
    });
    this.workspaceSVG = document.getElementById('workspace-svg');
    // Add undo/redo event listeners.
    addEventListeners(this);
    this.unsubscribeFirestore = onSnapshot(
      doc(this.props.firestore, 'workspaces', this.props.workspaceId),
      (document) => {
        if (document) {
          const data = document.data();
          if (data) {
            const { workspaceData } = data;
            const { shapesMap, shapes } = workspaceData || {};
            if (
              shapesMap &&
              shapesMap[this.state.selectedShapeId] &&
              shapesMap[this.state.selectedShapeId].visible !== true
            ) {
              this.selectShape(undefined);
            }
            // Workaround to check whether the workspace was reset from others
            if (
              shapes &&
              shapes.length <= 0 &&
              this.state.shapes.length !== shapes.length &&
              shapesMap &&
              Object.keys(shapesMap).length <= 0 &&
              Object.keys(shapesMap).length !== Object.keys(this.state.shapesMap)
            ) {
              alert('Oops! Someone has reset the workspace. Your workspace will also be reset.');
              this.setState({ ...defaultState, workspaceName: this.state.workspaceName });
            } else {
              this.setState({ ...workspaceData });
            }
          } else {
            window.location = '/';
          }
        }
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
        this.props.updateWorkspaceData(
          this.props.workspaceId,
          {
            shapes: this.state.shapes,
            shapesMap: this.state.shapesMap,

            // commandList: this.state.commandList.map((command) => {
            //   return command.getDataForSave();
            // }),
            // currCommand: this.state.currCommand,
          },
          this.state.workspaceName
        );
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
    const { borderColor, borderWidth, fillColor, vertexCount, inputText } = data || {};
    this.setState({ selectedShapeId: id });
    if (id) {
      const {
        borderColor: currBorderColor,
        borderWidth: currBorderWidth,
        fillColor: currFillColor,
        vertexCount: currVertexCount,
        inputText: currInputText,
      } = this.state.shapesMap[this.state.shapes.filter((shapeId) => shapeId === id)[0]];
      this.setState({
        currBorderColor: borderColor ? borderColor : currBorderColor,
        currBorderWidth: borderWidth ? borderWidth : currBorderWidth,
        currFillColor: fillColor ? fillColor : currFillColor,
        currVertexCount: vertexCount ? vertexCount : currVertexCount,
        currInputText: inputText ? inputText : currInputText,
        currMode: 'select',
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
   * ORDERING
   * ---------------------------------------------*/
  getVisibleShapes = () => {
    const visibleShapes = this.state.shapes.filter(
      (id) => this.state.shapesMap[id]?.visible === true
    );
    return visibleShapes;
  };
  moveForward = (isRepeat) => {
    // Find the nextElementId in visibleShapes
    const visibleShapes = this.getVisibleShapes();
    const selectedElementIndexInVisibleShapes = visibleShapes.indexOf(this.state.selectedShapeId);
    const nextElementId = visibleShapes[selectedElementIndexInVisibleShapes + 1];

    // In this.state.shapes
    const selectedElementIndex = this.state.shapes.indexOf(this.state.selectedShapeId);
    const nextElementIndex = this.state.shapes.indexOf(nextElementId);

    const newShapes = [...this.state.shapes];
    newShapes[selectedElementIndex] = this.state.shapes[nextElementIndex];
    newShapes[nextElementIndex] = this.state.shapes[selectedElementIndex];

    // create new command object
    this.setState({ shapes: newShapes });

    if (this.getCurrShape()) {
      const data = {
        type: 'forward',
        oldValue: selectedElementIndex,
        newValue: nextElementIndex,
        targetShape: this.state.selectedShapeId,
        switchedShape: nextElementId,
        mode: this.state.shapesMap[this.state.selectedShapeId].type,
      };
      const commandObj = new ChangeLayerOrderObjects(this.undoHandler, data, isRepeat);
      if (commandObj.canExecute()) {
        commandObj.execute();
      }
    }
  };
  moveBackward = (isRepeat) => {
    // Find the nextElementId in visibleShapes
    const visibleShapes = this.getVisibleShapes();
    const selectedElementIndexInVisibleShapes = visibleShapes.indexOf(this.state.selectedShapeId);
    const prevElementId = visibleShapes[selectedElementIndexInVisibleShapes - 1];

    const selectedElementIndex = this.state.shapes.indexOf(this.state.selectedShapeId);
    const prevElementIndex = this.state.shapes.indexOf(prevElementId);

    const newShapes = [...this.state.shapes];
    newShapes[selectedElementIndex] = this.state.shapes[prevElementIndex];
    newShapes[prevElementIndex] = this.state.shapes[selectedElementIndex];
    this.setState({ shapes: newShapes });

    if (this.getCurrShape()) {
      const data = {
        type: 'backward',
        oldValue: selectedElementIndex,
        newValue: prevElementIndex,
        targetShape: this.state.selectedShapeId,
        switchedShape: prevElementId,
        mode: this.state.shapesMap[this.state.selectedShapeId].type,
      };
      const commandObj = new ChangeLayerOrderObjects(this.undoHandler, data, isRepeat);
      if (commandObj.canExecute()) {
        commandObj.execute();
      }
    }
  };

  canMoveForward = () => {
    if (!this.state.selectedShapeId) {
      return false;
    }
    const visibleShapes = this.getVisibleShapes();
    if (visibleShapes.indexOf(this.state.selectedShapeId) >= visibleShapes.length - 1) {
      return false;
    }
    return true;
  };
  canMoveBackward = () => {
    if (!this.state.selectedShapeId) {
      return false;
    }
    const visibleShapes = this.getVisibleShapes();
    if (visibleShapes.indexOf(this.state.selectedShapeId) <= 0) {
      return false;
    }
    return true;
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
    // console.log('addShape: ', shapeData);
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
    if (!this.state.tempResizeData) {
      this.disableUpdateFirestore(() => {
        this.startResizeShape(newData);
      });
    }
    this.setState({ currResizeData: newData });
    if (this.state.selectedShapeId) {
      this.updateShape(this.state.selectedShapeId, newData);
    }
  };
  startResizeShape = (newData) => {
    this.setState({ tempResizeData: newData });
  };
  stopResizeShape = () => {
    this.enableUpdateFirestore(() => {
      if (this.state.tempResizeData !== this.state.currResizeData && this.getCurrShape()) {
        const data = {
          oldValue: this.state.tempResizeData,
          newValue: this.state.currResizeData,
          targetShape: this.getCurrShape(),
        };
        const commandObj = new ResizeCommandObject(this.undoHandler, data);
        if (commandObj.canExecute()) {
          commandObj.execute();
        }
      }
      this.setState({ tempResizeData: null });
    });
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
    if (this.state.selectedShapeId) {
      const data = {
        oldValue: this.state.currBorderColor,
        newValue: borderColor,
        targetShape: this.getCurrShape(),
      };
      const commandObj = new ChangeBorderColorCommandObject(this.undoHandler, data, isRepeat);
      if (commandObj.canExecute()) {
        commandObj.execute();
      }
      this.setState({ currBorderColor: borderColor });
      this.updateShape(this.state.selectedShapeId, { borderColor });
    } else {
      this.setState({ currBorderColor: borderColor });
    }
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
    if (this.state.selectedShapeId) {
      const data = {
        oldValue: this.state.currFillColor,
        newValue: fillColor,
        targetShape: this.getCurrShape(),
      };

      const commandObj = new ChangeFillColorCommandObject(this.undoHandler, data, isRepeat);
      if (commandObj.canExecute()) {
        commandObj.execute();
      }
      this.setState({ currFillColor: fillColor });
      this.updateShape(this.state.selectedShapeId, { fillColor });
    } else {
      this.setState({ currFillColor: fillColor });
    }
  };

  /**---------------------------------------------
   * CHANGE VERTEX COUNT
   * ---------------------------------------------*/
  changeCurrVertexCount = (vertexCount, isRepeat) => {
    if (vertexCount && this.state.currVertexCount && this.getCurrShape()) {
      const data = {
        oldValue: this.state.currVertexCount,
        newValue: vertexCount,
        targetShape: this.getCurrShape(),
      };
      const commandObj = new ChangeVertexCountCommandObject(this.undoHandler, data, isRepeat);
      if (commandObj.canExecute()) {
        commandObj.execute();
      }
    }

    this.setState({ currVertexCount: vertexCount });

    if (this.state.selectedShapeId) {
      this.updateShape(this.state.selectedShapeId, { vertexCount });
    }
  };

  /**---------------------------------------------
   * TEXT CHANGE
   * ---------------------------------------------*/
  changeCurrText = (text) => {
    this.setState({ currText: text });
    if (this.state.selectedShapeId) {
      this.updateShape(this.state.selectedShapeId, { text });
    }
  };
  submitText = (text) => {
    // if (this.state.selectedShapeId) {
    //   this.updateShape(this.state.selectedShapeId, { text });
    // }
  };

  /**---------------------------------------------
   * RESET WORKSPACE
   * ---------------------------------------------*/
  resetWorkspace = () => {
    const result = window.confirm(
      'Do you want to reset this workspace? All data will be deleted and this action cannot be undone.'
    );
    if (result) {
      this.setState({
        ...defaultState,
        workspaceName: this.state.workspaceName,
      });
    }
  };

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
      currText,
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
            changeBorderColor: this.changeBorderColor,
            currBorderWidth,
            changeCurrBorderWidth: this.changeCurrBorderWidth,
            startSlideBorderWidth: this.startSlideBorderWidth,
            stopSlideBorderWidth: this.stopSlideBorderWidth,
            currFillColor,
            changeFillColor: this.changeFillColor,
            currVertexCount,
            changeCurrVertexCount: this.changeCurrVertexCount,
            currText,
            changeCurrText: this.changeCurrText,

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

            moveForward: this.moveForward,
            moveBackward: this.moveBackward,
            canMoveForward: this.canMoveForward(),
            canMoveBackward: this.canMoveBackward(),

            resetWorkspace: this.resetWorkspace,
          }}
        >
          <h1>{this.state.workspaceName}</h1>
          {/* <Layers objects={this.state.shapes} shapesMap={this.state.shapesMap} /> */}
          <div
            style={{ position: 'relative', width: '100%', height: '1000px', overflowX: 'scroll' }}
          >
            <Workspace />
            <ControlPanel />
            <CommandListPanel
              commands={this.state.commandList}
              currCommandIndex={this.state.currCommand}
            />
            <Layers
              objects={this.getVisibleShapes() ? this.getVisibleShapes().reverse() : []}
              shapesMap={this.state.shapesMap}
              selectedShapeId={this.state.selectedShapeId}
            />
          </div>
        </ControlContext.Provider>
      </React.Fragment>
    );
  }
}

const WorkspaceWrapper = ({ ...props }) => {
  const { workspaceId } = useParams();
  const { firestore, getWorkspaceData, updateWorkspaceData } = React.useContext(FirebaseContext);
  return (
    <div style={{ margin: 'auto', overflowX: 'scroll' }}>
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
