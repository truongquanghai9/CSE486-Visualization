import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { csv, sum } from 'd3';
import nodeList from './Network/node_list.csv';
import edgeList from './Network/edge_list.csv';
import { Node as StreetNode } from '../Street/StreetInfo';
import { getBoard, initGrid } from './GridInit/GridInitialization';
import './Map.css';
import Node from '../Street/Node';
import model1 from './Network/vol_predictions.json';
// import Canvas from './Canvas';

function CanvasMap() {
  const [grid, setGrid] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [hourlyTraffic1, setHourlyTraffic1] = useState([]);
  const [gridImage1, setGridImage1] = useState([]);

  useEffect(() => {
    let list = {};
    let tempSet = {};
    let tempGrid = [];
    csv(nodeList).then((data) => {
      data.forEach((d) => {
        let xy = latlngToGlobalXY(parseFloat(d.y), parseFloat(d.x));
        let id = parseInt(d.id);
        let newNode = {
          x: Math.ceil(470480 - xy.x),
          y: Math.ceil(260480 - xy.y),
        };
        list[id] = newNode;
        if (tempSet[newNode.x] === undefined || tempSet[newNode.x] === null) {
          tempSet[newNode.x] = {};
        }
        tempSet[newNode.x][newNode.y] = id;
      });
      tempGrid = initGrid(0, 0);
      let tempMap = {};
      csv(edgeList).then((data) => {
        data.forEach((d) => {
          if (tempMap[d.u] === undefined || tempMap[d.u] === null) {
            tempMap[d.u] = [];
          }
          tempMap[parseInt(d.u)].push({ v: parseInt(d.v), street: d.name });
        });
        for (let u in tempMap) {
          for (const node of tempMap[u]) {
            let v = node.v,
              street = u + '-' + node.v;
            tempGrid[list[u].x][list[u].y].street = street;
            tempGrid[list[v].x][list[v].y].street = street;
            let x0 = list[u].x,
              y0 = list[u].y,
              x1 = list[v].x,
              y1 = list[v].y;
            let dx = Math.abs(x1 - x0),
              sx = x0 < x1 ? 1 : -1;
            let dy = -Math.abs(y1 - y0),
              sy = y0 < y1 ? 1 : -1;
            let err = dx + dy,
              e2;

            while (true) {
              if (x0 == x1 && y0 == y1) break;

              e2 = 2 * err;

              // EITHER horizontal OR vertical step (but not both!)
              if (e2 > dy) {
                err += dy;
                x0 += sx;
              } else {
                // <--- this "else" makes the difference
                err += dx;
                y0 += sy;
              }
              tempGrid[x0][y0].street = street;
            }
          }
        }

        // createSampleCanvas();
        // generateJPG(tempGrid);
        createMapCanvas(tempGrid);

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
        for (let i = 0; i < 1; i++) {
          tempHourlyTraffic[i][edge] = model1[edge].volume[i];
        }
      }
    }
    setHourlyTraffic1(tempHourlyTraffic);
  }, []);

  const convertToRGBA = (str) => {
    return parseFloat(str) * 255;
  };

  // function volumeToColorString(colors) {
  //   return `rgba(${convertToRGBA(colors[0])},
  //       ${convertToRGBA(colors[1])},
  //       ${convertToRGBA(colors[2])},
  //       ${colors[3]})`;
  // }

  // const getColor = (edge: string, hour: number) => {
  //   if (edge === null || edge === undefined || edge === '')
  //     return `rgba(0, 0, 0, 1)`;
  //   const colors = model1[edge]['volume'][hour];
  //   return volumeToColorString(colors);
  // };

  // function generateJPG(map) {
  //   let height = map[0].length;
  //   let width = map.length;

  //   const canvas = document.getElementById('canvas2');
  //   const ctx = canvas.getContext('2d');
  //   // const image = ctx.createImageData(width, height);
  //   const image = ctx.createImageData(100, 100);

  //   let offset = 0;
  //   let printed = 0;

  //   for (let y = height - 1; y > 0; y--) {
  //     for (let x = 0; x < width; x++) {
  //       let v = map[x][y];
  //       v = nodeToPixel(v);

  //       if (sum(v) > 200 && printed < 100) {
  //         // console.log(v, offset);
  //         printed += 1;
  //       }
  //       if (offset < 100) {
  //         // console.log(v, offset);
  //       }

  //       image.data[offset] = v[0];
  //       image.data[offset + 1] = v[2];
  //       image.data[offset + 2] = v[3];
  //       image.data[offset + 3] = v[4];
  //       offset += 4;
  //     }
  //   }
  //   console.log('Finished');
  //   ctx.putImageData(image, 20, 20);
  // }

  function createMapCanvas(map) {
    let height = map[0].length;
    let width = map.length;

    // console.log(height, width);

    const canvas3 = document.getElementById('canvas3');

    const ctx = canvas3.getContext('2d');
    const image = ctx.createImageData(width, height);

    // let printed = 0;
    // Iterate through every pixel
    for (let i = 0; i < image.data.length; i += 4) {
      let x = (i / 4) % width;
      let y = height - 1 - parseInt(i / (width * 4));
      let v = map[x][y];
      v = nodeToPixel(v);

      // if (printed < 10 && sum(v) > 400) {
      //   console.log(x, y, v, map[x]);
      //   printed++;
      // }

      // Modify pixel data
      image.data[i + 0] = v[0]; // R value
      image.data[i + 1] = v[1]; // G value
      image.data[i + 2] = v[2]; // B value
      image.data[i + 3] = 255; // A value
    }

    // Draw image data to the canvas
    ctx.putImageData(image, 0, 0);
    document.body.style.background = 'url(' + canvas3.toDataURL() + ')';
  }

  // function createSampleCanvas() {
  //   const canvas = document.getElementById('canvas1');
  //   const ctx = canvas.getContext('2d');
  //   const imageData = ctx.createImageData(100, 100);

  //   // Iterate through every pixel
  //   for (let i = 0; i < imageData.data.length; i += 4) {
  //     // Percentage in the x direction, times 255
  //     let x = ((i % 400) / 400) * 255;
  //     // Percentage in the y direction, times 255
  //     let y = (Math.ceil(i / 400) / 100) * 255;

  //     // Modify pixel data
  //     imageData.data[i + 0] = x; // R value
  //     imageData.data[i + 1] = y; // G value
  //     imageData.data[i + 2] = 255 - x; // B value
  //     imageData.data[i + 3] = 255; // A value
  //   }

  //   // Draw image data to the canvas
  //   ctx.putImageData(imageData, 20, 20);
  // }

  function getColorArray(model, street, hour) {
    let arr = model[street]['volume'][hour];
    return [
      convertToRGBA(arr[0]),
      convertToRGBA(arr[1]),
      convertToRGBA(arr[2]),
      convertToRGBA(arr[3]),
    ];
  }

  function nodeToPixel(node, hour = 1) {
    if (node.street.length === 0) {
      return [0, 0, 0, 255];
    }
    return getColorArray(model1, node.street, 1);
  }

  const latlngToGlobalXY = (lat, lng) => {
    const radius = 6371;
    // Calculates x based on cos of average of the latitudes
    let x = radius * lng * Math.cos(40.77235563526895);
    // Calculates y based on latitude
    let y = radius * lat;
    return { x: x, y: y };
  };
  // <div>
  //   <h1>Hello Worldly</h1>
  //   <canvas id="canvas1"></canvas>
  //   <canvas id="canvas2"></canvas>
  // </div>

  return <canvas id="canvas3" width="700" height="1180"></canvas>;
}
export default CanvasMap;
