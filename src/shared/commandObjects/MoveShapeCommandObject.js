import CommandObject from './CommandObject';
import { COMMAND_TYPES } from './constants';

export default class ChangeBorderWidthCommandObject extends CommandObject {
  constructor(undoHandler, data) {
    super(undoHandler, true, { data, type: COMMAND_TYPES.MOVE_SHAPE });
    this.targetObject = data.targetShape;
    this.newValue = data.newValue; // shape
    this.oldValue = data.oldValue; // shape
    this.commandName = `Move ${this.targetObject.type}`;
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
    const updateData = {
      initCoords: this.oldValue.initCoords,
      finalCoords: this.oldValue.finalCoords,
    };
    this.undoHandler.updateShape(this.targetObject.id, { ...updateData });
    this.undoHandler.selectShape(this.targetObject.id, { ...updateData });
  }

  /* override to redo the operation of this command, which means to
   * undo the undo. This should ONLY be called if the immediate
   * previous operation was an Undo of this command. Anything that
   * can be undone can be redone, so there is no need for a canRedo.
   */
  redo() {
    const updateData = {
      initCoords: this.newValue.initCoords,
      finalCoords: this.newValue.finalCoords,
    };
    this.undoHandler.updateShape(this.targetObject.id, { ...updateData });
    this.undoHandler.selectShape(this.targetObject.id, { ...updateData });
  }

  /* Move command cannot be repeated */
  canRepeat() {
    return false
  }
  repeat() {
    console.log('move command cannot be repeated')
  }
}
