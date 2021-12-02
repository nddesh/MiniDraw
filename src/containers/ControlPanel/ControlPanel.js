// you will need to MODIFY this and other files to make them work with command objects,
// instead of directly performing the actions
import { repeat } from 'lodash';
import React, { useContext } from 'react';

import { FaTrash } from 'react-icons/fa';
import { ImUndo, ImRedo } from 'react-icons/im';

import CursorImg from '../../assets/img/cursor.png';
import LineImg from '../../assets/img/line.png';
import PolygonImg from '../../assets/img/polygon.png';
import TextImg from '../../assets/img/text.png';
import ControlContext from '../../contexts/control-context';

import './ControlPanel.css';

const Modes = ({ currMode, changeCurrMode, currBorderColor, currFillColor, selectShape }) => {
  return (
    <div className="Control">
      <h3>Mode:</h3>
      <div className="Modes">
        <div
          className={['Mode', currMode === 'select' ? 'Active' : null].join(' ')}
          onClick={() => changeCurrMode('select')}
        >
          <img src={CursorImg} alt="cursor" />
        </div>
        <div
          className={['Mode', currMode === 'line' ? 'Active' : null].join(' ')}
          onClick={() => {
            changeCurrMode('line');
            selectShape(undefined);
          }}
        >
          <img src={LineImg} alt="line" />
        </div>
        <div
          className={['Mode', currMode === 'rect' ? 'Active' : null].join(' ')}
          onClick={() => {
            changeCurrMode('rect');
            selectShape(undefined);
          }}
        >
          <div
            style={{
              backgroundColor: currFillColor,
              width: 36,
              height: 20,
              border: `2px solid ${currBorderColor}`,
            }}
          ></div>
        </div>
        <div
          className={['Mode', currMode === 'ellipse' ? 'Active' : null].join(' ')}
          onClick={() => {
            changeCurrMode('ellipse');
            selectShape(undefined);
          }}
        >
          <div
            style={{
              backgroundColor: currFillColor,
              width: 36,
              height: 20,
              border: `2px solid ${currBorderColor}`,
              borderRadius: '50%',
            }}
          ></div>
        </div>
        <div
          className={['Mode', currMode === 'polygon' ? 'Active' : null].join(' ')}
          onClick={() => {
            changeCurrMode('polygon');
            selectShape(undefined);
          }}
        >
          <img src={PolygonImg} alt="polygon" />
        </div>
        <div
          className={['Mode', currMode === 'text' ? 'Active' : null].join(' ')}
          onClick={() => {
            changeCurrMode('text');
            selectShape(undefined);
          }}
        >
          <img src={TextImg} alt="text" />
        </div>
      </div>
    </div>
  );
};

const ColorPickerPopup = ({
  currColor,
  setCurrColor,
  stopChangeColor,
  conflictColors,
  onClose,
}) => {
  const [color, setColor] = React.useState(currColor);
  const handleConfirm = () => {
    setCurrColor(color);
    stopChangeColor();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className={'color-picker-popup-container'}>
      <h4>Select Color</h4>
      <input
        type="color"
        id="head"
        name="head"
        value={color}
        // onBlur={stopChangeColor}
        onChange={(e) => {
          if (
            !(
              document.getElementById('head').value === 'transparent' &&
              conflictColors.includes('transparent')
            )
          )
            var color = document.getElementById('head');
          currColor = e.target.value;
          color.setAttribute('value', currColor);
          setColor(currColor);
        }}
      />
      <div className={'color-picker-popup-buttons'}>
        <button onClick={handleConfirm}>Confirm</button>
        <button onClick={handleCancel} className={'delete-button'}>
          Cancel
        </button>
      </div>
    </div>
  );
};
const ColorPicker = ({ title, currColor, setCurrColor, stopChangeColor, conflictColors }) => {
  const [open, setOpen] = React.useState(false);

  const handleOpenPopup = () => {
    setOpen(true);
  };
  const handleClosePopup = () => {
    setOpen(false);
  };
  return (
    <div className="Control">
      <h3>{title}</h3>
      <div className="Modes">
        <div className={'color-picker-wrapper'}>
          <div className={'color-picker-open-button'} onClick={handleOpenPopup}>
            <div
              className={'color-picker-open-button-inner'}
              style={{ backgroundColor: currColor }}
            ></div>
          </div>
          {open ? (
            <ColorPickerPopup
              currColor={currColor}
              setCurrColor={setCurrColor}
              stopChangeColor={stopChangeColor}
              conflictColors={conflictColors}
              onClose={handleClosePopup}
            />
          ) : null}
        </div>
        {/* <input
          type="color"
          id="head"
          name="head"
          value={currColor}
          onBlur={stopChangeColor}
          onChange={(e) => {
            if (
              !(
                document.getElementById('head').value === 'transparent' &&
                conflictColors.includes('transparent')
              )
            )
              var color = document.getElementById('head');
            currColor = e.target.value;
            color.setAttribute('value', currColor);
            setCurrColor(currColor);
          }}
        ></input> */}
      </div>
    </div>
  );
};

const BorderColor = ({
  currMode,
  currBorderColor,
  changeCurrBorderColor,
  currFillColor,
  stopChangeBorderColor,
}) => {
  return (
    <ColorPicker
      title={'Border color:'}
      currColor={currBorderColor}
      setCurrColor={changeCurrBorderColor}
      conflictColors={[currFillColor, currMode === 'line' ? 'transparent' : null]}
      stopChangeColor={stopChangeBorderColor}
    />
  );
};

const FillColor = ({
  currFillColor,
  changeCurrFillColor,
  stopChangeFillColor,
  currBorderColor,
}) => {
  return (
    <ColorPicker
      title={'Fill color:'}
      currColor={currFillColor}
      setCurrColor={changeCurrFillColor}
      conflictColors={[currBorderColor]}
      stopChangeColor={stopChangeFillColor}
    />
  );
};

const BorderWidth = ({
  currBorderWidth,
  changeCurrBorderWidth,
  stopSlideBorderWidth,
  startSlideBorderWidth,
}) => {
  return (
    <div className="Control">
      <h3>Border width:</h3>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="range"
          tabIndex="-1"
          style={{ width: 200 }}
          onChange={(e) => changeCurrBorderWidth(e.target.value)}
          onMouseDown={(e) => startSlideBorderWidth(e.target.value)}
          onMouseUp={(e) => stopSlideBorderWidth(e.target.value)}
          min={1}
          max={30}
          value={currBorderWidth}
        />
        &nbsp;&nbsp;&nbsp;
        <span>{currBorderWidth}</span>
      </div>
    </div>
  );
};

const VertexCount = ({ currVertexCount, changeCurrVertexCount, currMode }) => {
  return (
    <div className="Control">
      <h3>Vertex count:</h3>
      <div className="VertexCountButtonsContainer">
        <button
          className="VertexCountButton"
          onClick={() => changeCurrVertexCount(currVertexCount - 1)}
          disabled={currVertexCount === 3}
        >
          -
        </button>
        <span>{currVertexCount}</span>
        <button
          className="VertexCountButton"
          onClick={() => changeCurrVertexCount(currVertexCount + 1)}
          disabled={currVertexCount === 20}
        >
          +
        </button>
      </div>
    </div>
  );
};

// const submitText

const TextInput = ({ currText, changeCurrText, cancelText, submitText }) => {
  return (
    <div className="Control">
      <h3>Text Input:</h3>
      <textarea
        value={currText}
        onChange={(e) => changeCurrText(e.target.value)}
        // onBlur={stopChangeText}
        autoFocus
        type="text"
        width="500px"
        className="textarea resize-ta"
      />
      {/* cancel and submit button */}
      <div>
        {/* <button className="btn btn-primary" onClick={() => cancelText()}>Close</button> */}
        {/* <button className="btn btn-primary" className="text-buttons" onClick={() => submitText()}>Submit</button> */}
      </div>
    </div>
  );
};

const Delete = ({ selectedShapeId, deleteSelectedShape }) => {
  return (
    <div className="Control">
      <h3>Delete:</h3>
      <div className="DeleteButtonsContainer">
        <button
          onClick={() => deleteSelectedShape()}
          disabled={!selectedShapeId}
          style={{
            cursor: !selectedShapeId ? 'not-allowed' : null,
          }}
        >
          <FaTrash className="ButtonIcon" /> Delete
        </button>{' '}
      </div>
    </div>
  );
};

const UndoRedo = ({ undo, redo, repeat, disableUndo, disableRedo, canRepeat }) => {
  return (
    <div className="Control">
      <h3>Undo / Redo:</h3>
      <div className="UndoRedoButtonsContainer">
        <button disabled={disableUndo} onClick={() => undo()}>
          <ImUndo className="ButtonIcon" />
          Undo
        </button>
        {disableRedo && canRepeat ? (
          <button onClick={() => repeat()}>Repeat</button>
        ) : (
          <button disabled={disableRedo} onClick={() => redo()}>
            <ImRedo className="ButtonIcon" />
            Redo
          </button>
        )}
      </div>
    </div>
  );
};

const OrderPanel = ({ moveForward, moveBackward, disableMoveForward, disableMoveBackward }) => {
  return (
    <div className="Control">
      <h3>Send Forward/Backward:</h3>
      <div className="UndoRedoButtonsContainer">
        <button disabled={disableMoveForward} onClick={() => moveForward()}>
          {/* <ImUndo className="ButtonIcon" /> */}
          Send Forward
        </button>

        <button disabled={disableMoveBackward} onClick={() => moveBackward()}>
          {/* <ImRedo className="ButtonIcon" /> */}
          Send Backward
        </button>
      </div>
    </div>
  );
};

const ResetPanel = ({ resetWorkspace }) => {
  return (
    <div className="Control">
      <h3>Reset Workspace</h3>
      <div className="UndoRedoButtonsContainer">
        <button onClick={resetWorkspace} className={'delete-button'}>
          Reset Workspace
        </button>
      </div>
    </div>
  );
};
const ControlPanel = () => {
  // use useContext to access the functions & values from the provider
  const {
    currMode,
    changeCurrMode,
    currBorderColor,
    changeCurrBorderColor,
    stopChangeBorderColor,
    currFillColor,
    changeCurrFillColor,
    currVertexCount,
    changeCurrVertexCount,
    stopChangeFillColor,
    currBorderWidth,
    changeCurrBorderWidth,
    stopSlideBorderWidth,
    startSlideBorderWidth,
    selectedShapeId,
    selectShape,
    deleteSelectedShape,
    shapesMap,
    currText,
    changeCurrText,
    submitText,
    undo,
    redo,
    repeat,
    canUndo,
    canRedo,
    canRepeat,
    moveForward,
    moveBackward,
    canMoveForward,
    canMoveBackward,
    resetWorkspace,
  } = useContext(ControlContext);

  return (
    <div className="ControlPanel">
      <Modes
        currMode={currMode}
        changeCurrMode={changeCurrMode}
        currBorderColor={currBorderColor}
        currFillColor={currFillColor}
        selectShape={selectShape}
      />
      {currMode === 'text' && (
        <TextInput currText={currText} changeCurrText={changeCurrText} submitText={submitText} />
      )}
      <VertexCount
        currVertexCount={currVertexCount}
        changeCurrVertexCount={changeCurrVertexCount}
        currmode={currMode}
      />
      <BorderColor
        currMode={currMode}
        currBorderColor={currBorderColor}
        changeCurrBorderColor={changeCurrBorderColor}
        currFillColor={currFillColor}
        stopChangeBorderColor={stopChangeBorderColor}
      />
      <BorderWidth
        currBorderWidth={currBorderWidth}
        changeCurrBorderWidth={changeCurrBorderWidth}
        stopSlideBorderWidth={stopSlideBorderWidth}
        startSlideBorderWidth={startSlideBorderWidth}
      />
      <FillColor
        currFillColor={currFillColor}
        changeCurrFillColor={changeCurrFillColor}
        currBorderColor={currBorderColor}
        stopChangeFillColor={stopChangeFillColor}
      />
      <Delete selectedShapeId={selectedShapeId} deleteSelectedShape={deleteSelectedShape} />
      <UndoRedo
        undo={undo}
        redo={redo}
        repeat={repeat}
        disableUndo={!canUndo}
        disableRedo={!canRedo}
        canRepeat={canRepeat}
      />
      <OrderPanel
        moveForward={moveForward}
        moveBackward={moveBackward}
        disableMoveForward={!canMoveForward}
        disableMoveBackward={!canMoveBackward}
      />
      <ResetPanel resetWorkspace={resetWorkspace} />
    </div>
  );
};

export default ControlPanel;
