// you will need to MODIFY this and other files to make them work with command objects,
// instead of directly performing the actions
import React, { useEffect, useCallback, useContext, useState } from 'react';

import Line from './shapes/Line';
import Rect from './shapes/Rect';
import Ellipse from './shapes/Ellipse';
import Polygon from './shapes/Polygon';
import Text from './shapes/Text';
import Selection from './shapes/Selection';
import ControlContext from '../../../contexts/control-context';
import { selectShadowId } from '../../../shared/util';
import { connectFirestoreEmulator } from '@firebase/firestore';

const SVGLayer = () => {
  const {
    currMode,
    currBorderColor,
    currBorderWidth,
    currFillColor,
    currVertexCount,
    currText,
    shapes,
    shapesMap,
    addShape,
    moveShape,
    selectedShapeId,
    selectShape,
    startMoveShape,
    stopMoveShape,
    changeCurrMode,
    resizeShape,
    startResizeShape, 
    stopResizeShape,
  } = useContext(ControlContext);

  // use useState to set elements in the React state directly
  // the first element of the list is the state value
  // the second element of the list is a function to update the state value in the future
  const [drawing, setDrawing] = useState(false);
  const [initPoint, setInitPoint] = useState({ x: undefined, y: undefined });
  const [currPoint, setCurrPoint] = useState({ x: undefined, y: undefined });

  const [dragging, setDragging] = useState(false);
  const [draggingShape, setDraggingShape] = useState(undefined);
  const [resizing, setResizing] = useState(false);
  const [resizingShape, setResizingShape] = useState(undefined);

  const [mouseDownPoint, setMouseDownPoint] = useState({
    x: undefined,
    y: undefined,
  });

  const handleMouseDown = (e) => {
    if (currMode !== 'select') {
      // should create
      setDrawing(true);
      setInitPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
      setCurrPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
      e.preventDefault();
    } else {
      // should select
      if (e.target.nodeName === 'svg') {
        // deselect
        selectShape(undefined);
      } else {
        if (e.target.className?.baseVal === "selectionGroup") {
          // resize 
          // console.log("resize");
          setResizing(true);
          setMouseDownPoint({
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
          });
          setResizingShape(shapesMap[selectedShapeId]);
          startResizeShape(selectedShapeId);
        } else {
          // select
          const targetId = e.target.id;
          selectShape(targetId);
          setDragging(true);
          setMouseDownPoint({
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
          });
          setDraggingShape(shapesMap[shapes.filter((shapeId) => shapeId === targetId)[0]]);
          startMoveShape(targetId);
      }
      }
    }
  };

  const handleMouseMove = (e) => {
    if (drawing) {
      setCurrPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    } else if (dragging && draggingShape) {
      const deltaX = e.nativeEvent.offsetX - mouseDownPoint.x;
      const deltaY = e.nativeEvent.offsetY - mouseDownPoint.y;

      moveShape({
        initCoords: {
          x: draggingShape.initCoords.x + deltaX,
          y: draggingShape.initCoords.y + deltaY,
        },
        finalCoords: {
          x: draggingShape.finalCoords.x + deltaX,
          y: draggingShape.finalCoords.y + deltaY,
        },
      });
    } else if (resizing && resizingShape) {
      const deltaX = e.nativeEvent.offsetX - mouseDownPoint.x;
      const deltaY = e.nativeEvent.offsetY - mouseDownPoint.y;

      resizeShape({
        initCoords: {
          x: resizingShape.initCoords.x,
          y: resizingShape.initCoords.y,
        },
        finalCoords: {
          x: resizingShape.finalCoords.x + deltaX,
          y: resizingShape.finalCoords.y + deltaY,
        },
      });
    }
  };

  const handleMouseUp = (e) => {
    if (currMode !== 'select') {
        if (currMode !== 'text' && !(initPoint.x === currPoint.x && initPoint.y === currPoint.y)) {
          // check if it's too small
          const threshold = 10;
          let shouldCreate = true;
          const deltaX = Math.abs(initPoint.x - currPoint.x);
          const deltaY = Math.abs(initPoint.y - currPoint.y);
          if (currMode === 'line') {
            if (Math.sqrt(deltaX ** 2 + deltaY ** 2) < threshold) {
              shouldCreate = false;
            }
          } else {
            if (deltaX < threshold || deltaY < threshold) {
              shouldCreate = false;
            }
          }
          console.log(currMode);

          if (shouldCreate) {
            // if (currMode != 'line') {
              // create
              
              
              addShape({
                type: currMode,
                visible: true,
                initCoords: initPoint,
                finalCoords: currPoint,
                borderColor: currBorderColor,
                borderWidth: currBorderWidth,
                fillColor: currFillColor,
                vertexCount: currVertexCount,
                inputText: currText,
              });
              
              selectShape(undefined);
            // }
          }
      }

      // If text mode, add text to svg, change mode to select, and select the textbox
      if(currMode === 'text') {
        // create 
        console.log(e.target);
        console.log("create", currText.trim() === "");
        if(currText.trim() !== "") {
          addShape({
            type: currMode,
            visible: true,
            initCoords: initPoint,
            finalCoords: currPoint,
            borderColor: currBorderColor,
            borderWidth: currBorderWidth,
            fillColor: currFillColor,
            vertexCount: currVertexCount,
            inputText: currText,
          });
        }

        // changeCurrMode('select');
        // selectShape(e.target.id);
      }


      setDrawing(false);
      setInitPoint({ x: undefined, y: undefined });
      setCurrPoint({ x: undefined, y: undefined });
    } else {
      if (e.target.className?.baseVal == "selectionGroup") {
        // resize 
        setResizing(false);
        setResizingShape(undefined);
        setMouseDownPoint({ x: undefined, y: undefined });
        stopResizeShape();
      } else {
        setDragging(false);
        setDraggingShape(undefined);
        setMouseDownPoint({ x: undefined, y: undefined });
        stopMoveShape();
      }
    }
  };

  // useCallback gives a memoized version of the callback that changes when one of its dependencies change
  // the first argument is the function that will be run
  // the second is the dependencies that the function relies on
  const escKeyDownHandler = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        // abort
        if (drawing) {
          setDrawing(false);
          setInitPoint({ x: undefined, y: undefined });
          setCurrPoint({ x: undefined, y: undefined });
        } else if (dragging) {
          moveShape({
            initCoords: {
              x: draggingShape.initCoords.x,
              y: draggingShape.initCoords.y,
            },
            finalCoords: {
              x: draggingShape.finalCoords.x,
              y: draggingShape.finalCoords.y,
            },
          });
          setDragging(false);
          setDraggingShape(undefined);
          setMouseDownPoint({ x: undefined, y: undefined });
        }
      }
    },
    [drawing, dragging, draggingShape, moveShape]
  );

  // useEffect will run after the render is committed to the screen
  // the first argument is the function that will run
  // the second argument are the dependencies, meaning this will only run when there is a change in these values
  useEffect(() => {
    window.addEventListener('keydown', escKeyDownHandler, true);
    return () => window.removeEventListener('keydown', escKeyDownHandler, true);
  }, [escKeyDownHandler]);

  const genShape = (shapeData, key = undefined) => {
    const { initCoords, finalCoords, borderColor, borderWidth, fillColor, id, vertexCount, inputText } = shapeData;
    const filter = selectedShapeId && selectedShapeId === id ? `url(#${selectShadowId})` : null;
    switch (shapeData.type) {
      case "line": {
        return React.createElement(Line, {
          x1: initCoords.x,
          y1: initCoords.y,
          x2: finalCoords.x,
          y2: finalCoords.y,
          borderColor,
          borderWidth,
          id,
          key,
          filter,
        });
      }
      case 'rect': {
        return React.createElement(Rect, {
          x: Math.min(initCoords.x, finalCoords.x),
          y: Math.min(initCoords.y, finalCoords.y),
          width: Math.abs(finalCoords.x - initCoords.x),
          height: Math.abs(finalCoords.y - initCoords.y),
          fillColor,
          borderColor,
          borderWidth,
          id,
          key,
          filter,
        });
      }
      case 'ellipse': {
        let x = Math.min(finalCoords.x, initCoords.x);
        let y = Math.min(finalCoords.y, initCoords.y);
        let w = Math.abs(finalCoords.x - initCoords.x);
        let h = Math.abs(finalCoords.y - initCoords.y);

        return React.createElement(Ellipse, {
          cx: x + w / 2,
          cy: y + h / 2,
          rx: w / 2,
          ry: h / 2,
          fillColor,
          borderColor,
          borderWidth,
          id,
          key,
          filter,
        });
      }
      case 'polygon': {

        return React.createElement(Polygon, {
          x: Math.min(initCoords.x, finalCoords.x),
          y: Math.min(initCoords.y, finalCoords.y),
          width: Math.abs(finalCoords.x - initCoords.x),
          height: Math.abs(finalCoords.y - initCoords.y),
          vertexCount,
          fillColor,
          borderColor,
          borderWidth,
          id,
          key,
          filter,
        });
      }
      case 'text': {
        return React.createElement(Text, {
          x: Math.min(initCoords.x, finalCoords.x),
          y: Math.min(initCoords.y, finalCoords.y),
          inputText,
          fillColor,
          id,
          currMode,
          filter,
          key,
        });
      }
      default: {
        return null;
      }
    }
  };

  const renderShape = (shapeData, key) => {
    if (shapeData.visible) {
      return genShape(shapeData, key);
    } else {
      return null;
    }
  };

  const renderTempShape = () => {
    if (
      initPoint.x !== undefined &&
      initPoint.y !== undefined &&
      currPoint.x !== undefined &&
      currPoint.y !== undefined
    ) {
      return genShape({
        type: currMode,
        initCoords: initPoint,
        finalCoords: currPoint,
        borderColor: currBorderColor,
        borderWidth: currBorderWidth,
        fillColor: currFillColor,
        vertexCount: currVertexCount,
        inputText: currText,
      });
    }
  };

  const selectionHandler = () => {
    // check if a shape is selected
    if (selectedShapeId) {

      var myPathBox = document.getElementById(selectedShapeId)?.getBBox({fill: true, stroke: true, clipped: true});
      const shape = shapesMap[selectedShapeId];
      if(shape?.type) {
        return React.createElement(Selection, {
          type: shape.type,
          x: myPathBox.x,
          y: myPathBox.y,
          width: myPathBox.width,
          height: myPathBox.height,
          borderWidth: shape.borderWidth,
        });
      }
    }
  } 

  return (
    <svg
      id="workspace-svg"
      width="800"
      height="700"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {(currMode === "select") ? (selectionHandler()) : null}
      <filter id={selectShadowId} x="-100%" y="-100%" width="400%" height="400%">
        <feDropShadow dx="0" dy="0" stdDeviation="15" floodColor="rgba(0, 0, 0, 0.7)" />
      </filter>
      {shapes.map((shapeId, idx) => {
        return renderShape(shapesMap[shapeId], idx);
      })}
      {drawing && renderTempShape()}
    </svg>
  );
};

export default SVGLayer;
