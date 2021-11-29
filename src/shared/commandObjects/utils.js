import AddShapeCommandObject from './AddShapeCommandObject';
import DeleteShapeCommandObject from './DeleteShapeCommandObject';
import ChangeFillColorCommandObject from './ChangeFillColorCommandObject';
import ChangeBorderColorCommandObject from './ChangeBorderColorCommandObject';
import ChangeBorderWidthCommandObject from './ChangeBorderWidthCommandObject';
import MoveShapeCommandObject from './MoveShapeCommandObject';
import { COMMAND_TYPES } from './constants';

export const createCommandInstance = (undoHandler, data) => {
  const type = data.type;
  switch (type) {
    case COMMAND_TYPES.ADD_SHAPE:
      return new AddShapeCommandObject(undoHandler, data.data);
    case COMMAND_TYPES.DELETE_SHAPE:
      return new DeleteShapeCommandObject(undoHandler, data.data);
    case COMMAND_TYPES.MOVE_SHAPE:
      return new MoveShapeCommandObject(undoHandler, data.data);
    case COMMAND_TYPES.CHANGE_FILL_COLOR:
      return new ChangeFillColorCommandObject(undoHandler, data.data);
    case COMMAND_TYPES.CHANGE_BORDER_COLOR:
      return new ChangeBorderColorCommandObject(undoHandler, data.data);
    case COMMAND_TYPES.CHANGE_BORDER_WIDTH:
      return new ChangeBorderWidthCommandObject(undoHandler, data.data);
    default:
      alert('invalid type');
      return null;
  }
};
