import React from "react"

// export interface Node {
//     x: number,
//     y: number,
//     isStart: boolean,
//     isGoal: boolean,
//     length: number,
//     isVisited: boolean,
//     isWall: boolean,
//     isVertical: boolean,
//     name: string,
//     adj: Street[]
// }
export interface Node {
    street: string,
    x: number,
    y: number,
    change: number
}