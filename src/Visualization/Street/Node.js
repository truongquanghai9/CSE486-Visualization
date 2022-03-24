import React from "react"
import "./Node.css"

const Node = ({row, col, isStart, isGoal, isWall, street}) => {
    const specificClass = isStart ? "start" : isGoal ? "goal" : isWall ? "wall" : "";
    return (
        <td id={`node-${row}-${col}`}
            className={`node ${specificClass} ${street.replace(/\s+/g, '')}`}>
        </td>
    )
}

export default Node;