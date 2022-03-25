import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import { csv } from "d3";
import nodeList from "./Network/node_list.csv"
import edgeList from "./Network/edge_list.csv"
import {Node as StreetNode} from "../Street/StreetInfo"
import {getBoard, initGrid} from "./GridInit/GridInitialization";
import "./Map.css";
import Node from "../Street/Node"

const Map = () => {
    const [grid, setGrid] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    // (0, 2), (3, 5)
    useEffect(() => {
        let list = {};
        let tempSet = {};
        let tempGrid = [];
        csv(nodeList).then(data => {
            data.forEach(d => {
                let xy = latlngToGlobalXY(parseFloat(d.y), parseFloat(d.x));
                let id = parseInt(d.id);
                let newNode = {x: Math.ceil(470480 - xy.x), y: Math.ceil(260480 - xy.y)};
                list[id] = newNode;
                if (tempSet[newNode.x] === undefined || tempSet[newNode.x] === null) {
                    tempSet[newNode.x] = {};
                }
                tempSet[newNode.x][newNode.y] = id;
            });
            tempGrid = initGrid(0, 0);
            let tempMap = {};
            csv(edgeList).then(data => {
                data.forEach(d => {
                    if (tempMap[d.u] === undefined || tempMap[d.u] === null) {
                        tempMap[d.u] = [];
                    }
                    tempMap[parseInt(d.u)].push({v: parseInt(d.v), street: d.name});
                });
                for (let u in tempMap) {
                    for (const node of tempMap[u]) {
                        let v = node.v, street = node.street;
                        tempGrid[list[u].x][list[u].y].isNode = true;
                        tempGrid[list[v].x][list[v].y].isNode = true;
                        let x0 = list[u].x, y0 = list[u].y, x1 = list[v].x, y1 = list[v].y;
                        let dx = Math.Abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
                        let dy = -Math.Abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
                        let err = dx + dy, e2;

                        while(true)
                        {
                            if (x0 == x1 && y0 == y1) break;

                            e2 = 2 * err;

                            // EITHER horizontal OR vertical step (but not both!)
                            if (e2 > dy)
                            {
                                err += dy;
                                x0 += sx;
                            }
                            else if (e2 < dx)
                            { // <--- this "else" makes the difference
                                err += dx;
                                y0 += sy;
                            }
                            tempGrid[x0][y0].street = list[u].street;
                        }
                    }
                }
                setGrid(() => tempGrid);
                setDataLoaded(true);
            });
        });
    }, []);

    const radius = 6371;
    const latlngToGlobalXY = (lat, lng) => {
        //Calculates x based on cos of average of the latitudes
        let x = radius*lng*Math.cos(40.77235563526895);
        //Calculates y based on latitude
        let y = radius*lat;
        return {x: x, y: y}
    }
    const cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
        return (
            <Node
                key={key}
                row={rowIndex}
                col={columnIndex}
                isStart={false} isGoal={false}
                street={grid[rowIndex][columnIndex]?.street}
                isWall={grid[rowIndex][columnIndex]?.street === ''}
                style={style}
            />
        );
    };
    return (
        <div className="board-container">
            <table>
                <tbody>
                {grid.map((row, rowIdx) => {
                    return (
                        <tr key={rowIdx}>
                            {row.map((col, colIdx) => {
                                return(
                                    <Node
                                        key={colIdx}
                                        row={col.x}
                                        col={col.y}
                                        isStart={false}
                                        isGoal={false}
                                        street={col.street}
                                        isWall={col.street === ''}
                                        isNode={col.isNode}
                                    />
                                );
                            })}
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </div>
    )
}
export default Map;