import CommandObject from './CommandObject';
import { COMMAND_TYPES } from './constants';

export default class ResizeCommandObject extends CommandObject {
  constructor(undoHandler, data, isRepeat) {
    super(undoHandler, true, { data, type: COMMAND_TYPES.CHANGE_VERTEXT_COUNT });
    this.getWorkspaceObject = undoHandler.getCurrShape;
    this.targetObject = data.targetShape;
    this.newValue = data.newValue; // resize data
    this.oldValue = data.oldValue; // resize data
    this.commandName = `Resize ${this.targetObject.type}`;
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
    this.undoHandler.updateShape(this.targetObject.id, { ...this.oldValue });
    this.undoHandler.selectShape(this.targetObject.id, { ...this.oldValue });
  }

  /* override to redo the operation of this command, which means to
   * undo the undo. This should ONLY be called if the immediate
   * previous operation was an Undo of this command. Anything that
   * can be undone can be redone, so there is no need for a canRedo.
   */
  redo() {
    this.undoHandler.updateShape(this.targetObject.id, { ...this.newValue });
    this.undoHandler.selectShape(this.targetObject.id, { ...this.newValue });
  }

  /* Cannot repeat resize action.
   */
  canRepeat() {
    return false;
  }

  /* override to execute the operation again, this time possibly on
   * a new object. Thus, this typically uses the same value but a new
   * selectedObject.
   */
  repeat() {}
}
