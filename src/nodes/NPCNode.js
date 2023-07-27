import React, { memo, useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { connectionAvaliable } from "../utils/commonUtils";
import "./styles.css";

export default memo(({ data }) => {
  const [getTrigger, setTrigger] = useState(false);
  const refreshUI = () => {
    setTrigger(!getTrigger);
  };

  // Conditions
  const conditionsGet = () => {
    return data["conditions"] || [];
  };
  const conditionAdd = () => {
    const arr = [...conditionsGet(), ""];
    data["conditions"] = arr;
    refreshUI();
  };
  const conditionDel = () => {
    const arr = [...conditionsGet()];
    arr.pop();
    data["conditions"] = arr;
    refreshUI();
  };
  const conditionUpdate = (index, value) => {
    const arr = [...conditionsGet()];
    arr[index] = value;
    data["conditions"] = arr;
    refreshUI();
  };

  // Text
  const textGet = () => {
    return data["text"] || "";
  };
  const textUpdate = (value) => {
    data["text"] = value;
    refreshUI();
  };

  // Events
  const eventsGet = () => {
    return data["events"] || [];
  };
  const eventAdd = () => {
    const arr = [...eventsGet(), ""];
    data["events"] = arr;
    refreshUI();
  };
  const eventDel = () => {
    const arr = [...eventsGet()];
    arr.pop();
    data["events"] = arr;
    refreshUI();
  };
  const eventUpdate = (index, value) => {
    const arr = [...eventsGet()];
    arr[index] = value;
    data["events"] = arr;
    refreshUI();
  };

  // Connect
  const { getNode } = useReactFlow();
  const isConnectable = (line) => {
    let source = getNode(line["source"]);
    let target = getNode(line["target"]);
    return connectionAvaliable(
      source["type"],
      line["sourceHandle"],
      target["type"],
      line["targetHandle"]
    );
  };

  return (
    <div style={{ width: "100%" }}>
      <div className="title-box">NPC ({data.name})</div>
      <div className="box">
        Conditions:
        <button onClick={conditionDel} className="actionButton">
          -
        </button>
        <button onClick={conditionAdd} className="actionButton">
          +
        </button>
        {conditionsGet().map((value, index) => (
          <input
            key={index}
            type="text"
            placeholder={`condition ${index + 1}`}
            value={value}
            onChange={(e) => conditionUpdate(index, e.target.value)}
            className="nodrag input"
          />
        ))}
        <hr className="line"></hr>
        Text:
        <textarea
          className="nodrag textArea"
          value={textGet()}
          onChange={(e) => textUpdate(e.target.value)}
        />
        <hr className="line"></hr>
        Events:
        <button onClick={eventDel} className="actionButton">
          -
        </button>
        <button onClick={eventAdd} className="actionButton">
          +
        </button>
        {eventsGet().map((value, index) => (
          <input
            key={index}
            type="text"
            placeholder={`event ${index + 1}`}
            value={value}
            onChange={(e) => eventUpdate(index, e.target.value)}
            className="nodrag input"
          />
        ))}
      </div>

      <Handle
        id="handleIn"
        type="target"
        position={Position.Top}
        className="handleIn"
        isValidConnection={(e) => isConnectable(e)}
      />
      <Handle
        id="handleOut"
        type="source"
        position={Position.Bottom}
        className="handleOut"
        isValidConnection={(e) => isConnectable(e)}
      />
      <Handle
        id="handleN"
        type="source"
        position={Position.Right}
        className="handleN"
        isValidConnection={(e) => isConnectable(e)}
      />
    </div>
  );
});
