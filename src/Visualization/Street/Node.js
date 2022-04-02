import React from "react"
import "./Node.css"

const Node = ({row, col, isStart, isGoal, isWall, street, isNode, color}) => {
    const specificClass = isStart ? "start" : isGoal ? "goal" : isWall ? "wall" : "";
    street = street === null || street === undefined ? '' : street;
    return (
        <td id={`node-${row}-${col}`}
            // className={`node ${specificClass} ${street.replace(/\s+/g, '')}`}>
            className={`node ${specificClass} ${isNode ? "actualNode" : ""} ${street}`}
            style={{'backgroundColor': color}}
        >
        </td>
    )
}

export default Node;