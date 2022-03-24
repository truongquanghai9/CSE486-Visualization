import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import { csv } from "d3";
import nodeList from "./Network/node_list.csv"
import edgeList from "./Network/edge_list.csv"
import {Node as StreetNode} from "../Street/StreetInfo"
import {initGrid} from "./GridInit/GridInitialization";
import "./Map.css";
import Node from "../Street/Node"
import Queue from "@supercharge/queue-datastructure";

const Map = () => {
    const [nodes, setNodes] = useState({});
    const [nodeSet, setNodeSet] = useState({});
    const [grid, setGrid] = useState([]);
    const [adjMap, setAdjMap] = useState({});
    
    useEffect(async () => {
        let list = {};
        let tempSet = {};
        let tempGrid = [];
        await csv(nodeList).then(data => {
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
            setNodes({...list});
            setNodeSet({...tempSet});
            tempGrid = initGrid(0, 0);
        });
        let tempMap = {};
        await csv(edgeList).then(data => {
            data.forEach(d => {
                if (tempMap[d.u] === undefined || tempMap[d.u] === null) {
                    tempMap[d.u] = [];
                }
                tempMap[parseInt(d.u)].push({v: parseInt(d.v), street: d.name});
            });
            setAdjMap(tempMap);
            const visited = new Set();
            let tempList = {...list};
            for (let u in tempMap) {
                if (visited.has(u)) continue;
                for (const node of tempMap[u]) {
                    let v = node.v, street = node.street;
                    visited.add(u + ',' + v);
                    if (!visited.has(v + ',' + u)) {
                        let diffX = list[u].x - list[v].x;
                        let diffY = list[u].y - list[v].y;
                        if (tempGrid[list[v].x][list[v].y].change != 0 && tempGrid[list[u].x][list[u].y].change != 0) {
                            if (tempGrid[list[u].x][list[u].y].change == 1) {
                                
                            } else if (tempGrid[list[v].x][list[v].y].change == 1) {

                            } else if (tempGrid[list[u].x][list[v].x].change == 2) {

                            } else if (tempGrid[list[v].x][list[u].x].change == 2) {

                            }
                        }
                        if ((diffX >= 0 && diffY >= 0) || (diffX <= 0 && diffY >= 0)) {
                            // right || left
                            if (tempGrid[list[v].x][list[v].y].change != 0) {
                                list[u].y = list[v].y;
                            } else {
                                list[v].y = list[u].y;
                            }
                            for (let i = Math.min(list[u].x, list[v].x); i <= Math.max(list[u].x, list[v].x); i++) {
                                tempGrid[i][list[v].y].street = street;
                                tempGrid[i][list[v].y].isChanged = true;
                            }
                        } else if ((diffX >= 0 && diffY <= 0) || (diffX <= 0 && diffY <= 0)) {
                            // down or up
                            if (tempGrid[list[v].x][list[u].y].change != 0) {
                                list[u].x = list[v].x;
                            } else {
                                list[v].x = list[u].x;
                            }
                            for (let i = Math.min(list[u].y, list[v].y); i <= Math.max(list[u].y, list[v].y); i++) {
                                tempGrid[list[v].x][i].street = street;
                                tempGrid[list[v].x][i].isChanged = true;
                            }
                        }
                        // tempGrid[list[u].x][list[u].y].isChanged = true;
                        // tempGrid[list[v].x][list[v].y].isChanged = true;
                    }
                }
            }
            setNodes(list);
            setGrid(tempGrid);
        });
    }, []);
    
    // const dfs = (list, tempList, tempMap, tempGrid, visited, u) => {
    //     if (visited.has(u) || tempMap[u] === undefined || tempMap[u] === null) return;
    //     visited.add(u);
    //     for (const node of tempMap[u]) {
    //         let v = node.v, street = node.street;
    //         visited.add(u + ',' + v);
    //         if (!visited.has(v + ',' + u)) {
    //             let diffX = tempList[u].x - tempList[v].x;
    //             let diffY = tempList[u].y - tempList[v].y;
    //             if (tempGrid[list[v].x][list[v].y].isChanged && tempGrid[list[u].x][list[u].y].isChanged) {
    //                 console.log("yes");
    //             }
    //             if ((diffX >= 0 && diffY >= 0) || (diffX <= 0 && diffY >= 0)) {
    //                 // right || left
    //                 if (tempGrid[list[v].x][list[v].y].isChanged) {
    //                     list[u].y = list[v].y;
    //                 } else {
    //                     list[v].y = list[u].y;
    //                 }
    //                 for (let i = Math.min(list[u].x, list[v].x); i <= Math.max(list[u].x, list[v].x); i++) {
    //                     tempGrid[i][list[v].y].street = street;
    //                     tempGrid[i][list[v].y].isChanged = true;
    //                 }
    //             } else if ((diffX >= 0 && diffY <= 0) || (diffX <= 0 && diffY <= 0)) {
    //                 // down or up
    //                 if (tempGrid[list[v].x][list[u].y].isChanged) {
    //                     list[u].x = list[v].x;
    //                 } else {
    //                     list[v].x = list[u].x;
    //                 }
    //                 for (let i = Math.min(list[u].y, list[v].y); i <= Math.max(list[u].y, list[v].y); i++) {
    //                     tempGrid[list[v].x][i].street = street;
    //                     tempGrid[list[v].x][i].isChanged = true;
    //                 }
    //             }
    //             // tempGrid[list[u].x][list[u].y].isChanged = true;
    //             // tempGrid[list[v].x][list[v].y].isChanged = true;
    //             dfs(list, tempList, tempMap, tempGrid, visited, v);
    //         }
    //     }
    // }
    
    const radius = 6371;
    const latlngToGlobalXY = (lat, lng) => {
        //Calculates x based on cos of average of the latitudes
        let x = radius*lng*Math.cos(40.77235563526895);
        //Calculates y based on latitude
        let y = radius*lat;
        return {x: x, y: y}
    }
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