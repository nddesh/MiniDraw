import { connectFirestoreEmulator } from '@firebase/firestore';
import CommandObject from './CommandObject';
import { COMMAND_TYPES } from './constants';

export default class ChangeLayerOrderObjects extends CommandObject {
  constructor(undoHandler, data, isRepeat) {
    super(undoHandler, true, { data, type: COMMAND_TYPES.CHANGE_LAYER_ORDER });
    this.getWorkspaceObject = undoHandler.getCurrShape;
    this.targetObject = data.targetShape;
    this.switchedObject = data.switchedShape;
    this.newValue = data.newValue; 
    this.oldValue = data.oldValue; 
    this.type = data.type;
    this.mode = data.mode;
    this.canMoveForward = undoHandler.canMoveForward;
    this.canMoveBackward = undoHandler.canMoveBackward;
    this.commandName = `${isRepeat ? `[Repeat] ` : ''} Send ${this.mode} ${this.type}`;
    this.repeatAction = this.type === 'forward' ? undoHandler.moveForward : undoHandler.moveBackward;
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
    // this.undoHandler.updateShape(this.targetObject.id, { ...this.oldValue });
    // this.undoHandler.selectShape(this.targetObject.id, { ...this.oldValue });
    const currState = this.undoHandler.getCurrState();
    let newShapes = [...currState.shapes ];
    newShapes[this.oldValue] = this.targetObject;
    newShapes[this.newValue] = this.switchedObject;
    this.undoHandler.updateState({ shapes: newShapes });
    this.undoHandler.selectShape(this.targetObject);
  }

  /* override to redo the operation of this command, which means to
   * undo the undo. This should ONLY be called if the immediate
   * previous operation was an Undo of this command. Anything that
   * can be undone can be redone, so there is no need for a canRedo.
   */
  redo() {
    const currState = this.undoHandler.getCurrState();
    let newShapes = [...currState.shapes ];
    newShapes[this.newValue] = this.targetObject;
    newShapes[this.oldValue] = this.switchedObject;
    this.undoHandler.updateState({ shapes: newShapes });
    this.undoHandler.selectShape(this.targetObject);
  }



 

  
  canRepeat() {
    // must have a slected object
    // if forward, must not be the topmost object
    // if backward, must not be the bottommost object
    const currentWorkspaceShape = this.getWorkspaceObject();
    const commamndShape = this.targetObject;
    if (!this.getWorkspaceObject() || currentWorkspaceShape.id === commamndShape.id) {
        return false;
    } 

    // console.log(this.newValue, this.oldValue, this.canMoveForward(), this.canMoveBackward());


    if (this.type === 'forward') {
        return this.canMoveForward();
    }
    if (this.type === 'backward') {
        return this.canMoveBackward();
    }

    return true;
  }

  /* override to execute the operation again, this time possibly on
   * a new object. Thus, this typically uses the same value but a new
   * selectedObject.
   */
  repeat() {
      this.repeatAction(true);
  }
}
