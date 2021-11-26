// you will need to MODIFY this and other files to make them work with command objects, 
// instead of directly performing the actions
import React, { useContext } from "react";

import { FaTrash } from "react-icons/fa";
import { ImUndo, ImRedo } from "react-icons/im";

import CursorImg from "../../assets/img/cursor.png";
import LineImg from "../../assets/img/line.png";
import PolygonImg from "../../assets/img/polygon.png";
import TextImg from "../../assets/img/text.png";
import ControlContext from "../../contexts/control-context";

import "./ControlPanel.css";

const Modes = ({
  currMode,
  changeCurrMode,
  currBorderColor,
  currFillColor,
  selectShape
}) => {
  return (
    <div className="Control">
      <h3>Mode:</h3>
      <div className="Modes">
        <div
          className={["Mode", (currMode === "select"  || currMode === "line") ? "Active" : null].join(
            " "
          )}
          onClick={() => changeCurrMode("select")}
        >
          <img src={CursorImg} alt="cursor" />
        </div>
        <div
          className={["Mode", currMode === "line" ? "Active" : null].join(" ")}
          onClick={() => changeCurrMode("line")}
        >
          <img src={LineImg} alt="line" />
        </div>
        <div
          className={["Mode", currMode === "rect" ? "Active" : null].join(" ")}
          onClick={() => {changeCurrMode("rect"); selectShape(undefined)}}
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
          className={["Mode", currMode === "ellipse" ? "Active" : null].join(
            " "
          )}
          onClick={() => {changeCurrMode("ellipse"); selectShape(undefined)}}
        >
          <div
            style={{
              backgroundColor: currFillColor,
              width: 36,
              height: 20,
              border: `2px solid ${currBorderColor}`,
              borderRadius: "50%",
            }}
          ></div>
        </div>
        <div
          className={["Mode", currMode === "polygon" ? "Active" : null].join(" ")}
          onClick={() => changeCurrMode("polygon")}
        >
          <img src={PolygonImg} alt="polygon" />
        </div>
        <div
          className={["Mode", currMode === "text" ? "Active" : null].join(" ")}
          onClick={() => changeCurrMode("text")}
        >
          <img src={TextImg} alt="text" />
        </div>
      </div>
    </div>
  );
};

const ColorPicker = ({ title, currColor, setCurrColor, conflictColors }) => {
  return (
    <div className="Control">
      <h3>{title}</h3>
      <div className="Modes">
      <input type="color" id="head" name="head"
        value={currColor}
        onChange = {(e) => {
          console.log(currColor);
          if (
            !(
              document.getElementById('head').value === "transparent" &&
              conflictColors.includes("transparent")
            )
          )
            var color = document.getElementById('head');
            currColor = e.target.value;
            color.setAttribute("value", currColor);
            setCurrColor(currColor);
        }}></input>
    </div>
  </div>
  );
};

const BorderColor = ({
  currMode,
  currBorderColor,
  changeCurrBorderColor,
  currFillColor,
}) => {
  return (
    <ColorPicker
      title={"Border color:"}
      currColor={currBorderColor}
      setCurrColor={changeCurrBorderColor}
      conflictColors={[
        currFillColor,
        currMode === "line" ? "transparent" : null,
      ]}
    />
  );
};

const FillColor = ({ currFillColor, changeCurrFillColor, currBorderColor }) => {
  return (
    <ColorPicker
      title={"Fill color:"}
      currColor={currFillColor}
      setCurrColor={changeCurrFillColor}
      conflictColors={[currBorderColor]}
    />
  );
};

const BorderWidth = ({ currBorderWidth, changeCurrBorderWidth }) => {
  return (
    <div className="Control">
      <h3>Border width:</h3>
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="range"
          tabIndex="-1"
          style={{ width: 200 }}
          onChange={(e) => changeCurrBorderWidth(e.target.value)}
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

const Delete = ({ selectedShapeId, deleteSelectedShape }) => {
  return (
    <div className="Control">
      <h3>Delete:</h3>
      <div className="DeleteButtonsContainer">
        <button
          onClick={() => deleteSelectedShape()}
          disabled={!selectedShapeId}
          style={{
            cursor: !selectedShapeId ? "not-allowed" : null,
          }}
        >
          <FaTrash className="ButtonIcon" /> Delete
        </button>{" "}
      </div>
    </div>
  );
};

const UndoRedo = ({ undo, redo }) => {
  return (
    <div className="Control">
      <h3>Undo / Redo:</h3>
      <div className="UndoRedoButtonsContainer">
        <button onClick={() => undo()}>
          <ImUndo className="ButtonIcon" />
          Undo
        </button>{" "}
        <button onClick={() => redo()}>
          <ImRedo className="ButtonIcon" />
          Redo
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
    currFillColor,
    changeCurrFillColor,
    currBorderWidth,
    changeCurrBorderWidth,
    selectedShapeId,
    selectShape,
    deleteSelectedShape,
    undo,
    redo,
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
      <BorderColor
        currMode={currMode}
        currBorderColor={currBorderColor}
        changeCurrBorderColor={changeCurrBorderColor}
        currFillColor={currFillColor}
      />
      <BorderWidth
        currBorderWidth={currBorderWidth}
        changeCurrBorderWidth={changeCurrBorderWidth}
      />
      <FillColor
        currFillColor={currFillColor}
        changeCurrFillColor={changeCurrFillColor}
        currBorderColor={currBorderColor}
      />
      <Delete
        selectedShapeId={selectedShapeId}
        deleteSelectedShape={deleteSelectedShape}
      />
      <UndoRedo undo={undo} redo={redo} />
    </div>
  );
};

export default ControlPanel;