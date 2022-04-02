import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import { csv } from "d3";
import nodeList from "./Network/node_list.csv"
import edgeList from "./Network/edge_list.csv"
import {Node as StreetNode} from "../Street/StreetInfo"
import {getBoard, initGrid} from "./GridInit/GridInitialization";
import "./Map.css";
import Node from "../Street/Node"
import model1 from './Network/vol_predictions.json';

const Map = () => {
    const [grid, setGrid] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [hourlyTraffic1, setHourlyTraffic1] = useState([]);
    // hour state
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
                        let v = node.v, street = u + '-' + node.v;
                        // tempGrid[list[u].x][list[u].y].isNode = true;
                        // tempGrid[list[v].x][list[v].y].isNode = true;
                        tempGrid[list[u].x][list[u].y].street = street;
                        tempGrid[list[v].x][list[v].y].street = street;
                        let x0 = list[u].x, y0 = list[u].y, x1 = list[v].x, y1 = list[v].y;
                        let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
                        let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
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
                            tempGrid[x0][y0].street = street;
                        }
                    }
                }
                setGrid(() => tempGrid);
                setDataLoaded(true);
            });
        });
        const tempHourlyTraffic = new Array(24);
        for (let i = 0; i < 24; i++) {
            tempHourlyTraffic[i] = {};
        }
        for (const edge in model1) {
            if (edge) {
                for (let i = 0; i < 24; i++) {
                    tempHourlyTraffic[i][edge] = model1[edge].volume[i];
                }
            }
        }
        setHourlyTraffic1(tempHourlyTraffic);
    }, []);

    useEffect(() => {
        if (hourlyTraffic1.length != 0) {
            setColorWithHour(15);
        }
    }, [hourlyTraffic1]);

    const setColorWithHour = (hour: number) => {
        for (const edge in hourlyTraffic1[hour]) {
            if (edge) {
                const allEdge: HTMLElement[] = document.getElementsByClassName(edge.toString());
                for(let i=0 ; i<allEdge.length; i++){
                    const vol = hourlyTraffic1[hour][edge];
                    allEdge[i].style.backgroundColor = `rgba(${convertToTGBA(vol[0])}, ${convertToTGBA(vol[1])}, ${convertToTGBA(vol[2])}, ${vol[3]})`;
                }
            }
        }
    }

    const convertToTGBA = (str) => {
        return parseFloat(str) * 255;
    }

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