import AddShapeCommandObject from './AddShapeCommandObject';
import DeleteShapeCommandObject from './DeleteShapeCommandObject';
import ChangeFillColorCommandObject from './ChangeFillColorCommandObject';
import ChangeBorderColorCommandObject from './ChangeBorderColorCommandObject';
import ChangeBorderWidthCommandObject from './ChangeBorderWidthCommandObject';
import MoveShapeCommandObject from './MoveShapeCommandObject';
import { COMMAND_TYPES } from './constants';

export const createCommandInstance = (undoHandler, data) => {
  const type = data.type;
  let commandObj;
  switch (type) {
    case COMMAND_TYPES.ADD_SHAPE:
      commandObj = new AddShapeCommandObject(undoHandler, data.data);
      break;
    case COMMAND_TYPES.DELETE_SHAPE:
      commandObj = new DeleteShapeCommandObject(undoHandler, data.data);
      break;
    case COMMAND_TYPES.MOVE_SHAPE:
      commandObj = new MoveShapeCommandObject(undoHandler, data.data);
      break;
    case COMMAND_TYPES.CHANGE_FILL_COLOR:
      commandObj = new ChangeFillColorCommandObject(undoHandler, data.data);
      break;
    case COMMAND_TYPES.CHANGE_BORDER_COLOR:
      commandObj = new ChangeBorderColorCommandObject(undoHandler, data.data);
      break;
    case COMMAND_TYPES.CHANGE_BORDER_WIDTH:
      commandObj = new ChangeBorderWidthCommandObject(undoHandler, data.data);
      break;
    default:
      alert('invalid type');
      commandObj = null;
  }
  // if (commandObj.canExecute()) {
  //   commandObj.execute();
  // }
  return commandObj;
};
