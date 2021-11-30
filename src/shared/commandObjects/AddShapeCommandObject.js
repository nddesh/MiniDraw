import CommandObject from './CommandObject';
import { COMMAND_TYPES } from './constants';

export default class AddShapeCommandObject extends CommandObject {
  constructor(undoHandler, data, isRepeat) {
    super(undoHandler, true, { data, type: COMMAND_TYPES.ADD_SHAPE });
    this.getWorkspaceObject = undoHandler.getCurrShape;
    this.data = data;
    this.selectedObj = data;
    this.commandName = `${isRepeat ? `[Repeat] ` : ''}Create ${data.type}`;
    this.repeatAction = undoHandler.addShape;
  }

  /* override to return true if this command can be executed,
   *  e.g., if there is an object selected
   */
  canExecute() {
    return this.selectedObj !== null; // global variable for selected
  }

  /* override to execute the action of this command.
   * pass in false for addToUndoStack if this is a command which is NOT
   * put on the undo stack, like Copy, or a change of selection or Save
   */
  execute() {
    if (this.canExecute()) {
      if (this.addToUndoStack) this.undoHandler.registerExecution(this);
    }
  }

  /* override to undo the operation of this command
   */
  undo() {
    const currState = this.undoHandler.getCurrState();
    let shapesMap = { ...currState.shapesMap };
    shapesMap[this.selectedObj.id].visible = false;
    this.undoHandler.updateState({
      shapesMap,
      selectedShapeId: undefined,
    });
  }

  /* override to redo the operation of this command, which means to
   * undo the undo. This should ONLY be called if the immediate
   * previous operation was an Undo of this command. Anything that
   * can be undone can be redone, so there is no need for a canRedo.
   */
  redo() {
    const currState = this.undoHandler.getCurrState();
    let shapesMap = { ...currState.shapesMap };
    shapesMap[this.selectedObj.id].visible = true;
    this.undoHandler.updateState({
      shapesMap,
      selectedShapeId: this.selectedObj.id,
    });
  }

  /* override to return true if this operation can be repeated in the
   * current context
   */
  canRepeat() {
    return !this.getWorkspaceObject();
  }

  /* override to execute the operation again, this time possibly on
   * a new object. Thus, this typically uses the same value but a new
   * selectedObject.
   */
  repeat() {
    const { id, finalCoords, initCoords, ...restData } = this.data;
    const newData = {
      ...restData,
      finalCoords: { x: this.data.finalCoords.x + 10, y: this.data.finalCoords.y + 10 },
      initCoords: { x: this.data.initCoords.x + 10, y: this.data.initCoords.y + 10 },
    };
    this.repeatAction(newData, true);
  }
}
