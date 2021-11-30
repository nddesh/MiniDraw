import CommandObject from './CommandObject';
import { COMMAND_TYPES } from './constants';

export default class DeleteShapeCommandObject extends CommandObject {
  constructor(undoHandler, data, isRepeat) {
    super(undoHandler, true, { data, type: COMMAND_TYPES.DELETE_SHAPE });
    this.getWorkspaceObject = undoHandler.getCurrShape;
    this.targetObject = data.targetShape;
    this.commandName = `${isRepeat ? `[Repeat] ` : ''}Delete ${this.targetObject.type}`;
    this.repeatAction = undoHandler.deleteSelectedShape;
  }

  /* override to return true if this command can be executed,
   *  e.g., if there is an object selected
   */
  canExecute() {
    return this.targetObject !== null && this.targetObject !== undefined; // global variable for selected
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
    shapesMap[this.targetObject.id].visible = true;
    this.undoHandler.updateState({
      shapesMap,
      selectedShapeId: this.targetObject.id,
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
    shapesMap[this.targetObject.id].visible = false;
    this.undoHandler.updateState({
      shapesMap,
      selectedShapeId: undefined,
    });
  }

  /* override to return true if this operation can be repeated in the
   * current context
   */
  canRepeat() {
    return this.getWorkspaceObject() !== null && this.getWorkspaceObject() !== undefined;
  }
  repeat() {
    this.repeatAction({ isRepeat: true });
  }
}
