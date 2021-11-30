import CommandObject from './CommandObject';
import { COMMAND_TYPES } from './constants';

export default class ChangeBorderWidthCommandObject extends CommandObject {
  constructor(undoHandler, data, isRepeat) {
    super(undoHandler, true, { data, type: COMMAND_TYPES.CHANGE_BORDER_WIDTH });
    this.getWorkspaceObject = undoHandler.getCurrShape;
    this.targetObject = data.targetShape;
    this.newValue = data.newValue; // color
    this.oldValue = data.oldValue; // color
    this.commandName = `${isRepeat ? `[Repeat] ` : ''}Change ${
      this.targetObject.type
    } Border Width to ${this.newValue}`;
    this.repeatAction = undoHandler.changeBorderWidth;
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
    this.undoHandler.updateShape(this.targetObject.id, { borderWidth: this.oldValue });
    this.undoHandler.selectShape(this.targetObject.id, { borderWidth: this.oldValue });
  }

  /* override to redo the operation of this command, which means to
   * undo the undo. This should ONLY be called if the immediate
   * previous operation was an Undo of this command. Anything that
   * can be undone can be redone, so there is no need for a canRedo.
   */
  redo() {
    this.undoHandler.updateShape(this.targetObject.id, { borderWidth: this.newValue });
    this.undoHandler.selectShape(this.targetObject.id, { borderWidth: this.newValue });
  }

  /* override to return true if this operation can be repeated in the
   * current context
   */
  canRepeat() {
    // Must have selected object
    // The current selected shape should not be the same shape as in the command.
    const currentWorkspaceShape = this.getWorkspaceObject();
    const commamndShape = this.targetObject;
    if (currentWorkspaceShape.id === commamndShape.id) return false;
    return this.getWorkspaceObject() !== null && this.getWorkspaceObject() !== undefined;
  }

  /* override to execute the operation again, this time possibly on
   * a new object. Thus, this typically uses the same value but a new
   * selectedObject.
   */
  repeat() {
    this.repeatAction(this.newValue, true);
  }
}
