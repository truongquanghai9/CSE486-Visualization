import React, { useEffect, useState } from 'react';
import { csv, sum } from 'd3';
import nodeList from './Network/node_list.csv';
import edgeList from './Network/edge_list.csv';
import { Node as StreetNode } from '../Street/StreetInfo';
import { getBoard, initGrid, multFactor } from './GridInit/GridInitialization';
import './Map.css';
import model1 from './Network/vol_predictions.json';
import Clock from '../Clock/Clock';

function CanvasMap() {
  const [grid, setGrid] = useState([]);
  const [currentModel, setModel] = useState();

  useEffect(() => {
    console.log('Start CanvasMap UseEffect');
    let list = {};
    let tempSet = {};
    let tempGrid = [];
    csv(nodeList).then((data) => {
      data.forEach((d) => {
        let xy = latlngToGlobalXY(parseFloat(d.y), parseFloat(d.x));
        let id = parseInt(d.id);
        let newNode = {
          x: Math.ceil(470480 * multFactor[0] - xy.x),
          y: Math.ceil(260480 * multFactor[1] - xy.y),
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
              if (x0 === x1 && y0 === y1) break;
              e2 = 2 * err;
              // EITHER horizontal OR vertical step (but not both!)
              if (e2 > dy) {
                err += dy;
                x0 += sx;
              } else {
                err += dx;
                y0 += sy;
              }
              tempGrid[x0][y0].street = street;
            }
          }
        }
      });
      let img = createMapImage(tempGrid, 0);
      document.body.appendChild(img);
      setGrid(() => tempGrid);
    });
  }, []);

  const convertToRGBA = (str) => {
    return parseFloat(str) * 255;
  };

  function createMapImage(map, hour) {
    if (map.length < 1 || map[0].length < 1) return;

    let height = map[0].length;
    let width = map.length;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(width, height);

    // Iterate through every pixel
    for (let i = 0; i < image.data.length; i += 4) {
      let x = (i / 4) % width;
      // flip horizontal // let x = width - ((i / 4) % width) - 1;

      let y = Math.floor(i / (width * 4));
      // flip vertical // let y = height - 1 - parseInt(i / (width * 4));

      let v = map[x][y];
      v = nodeToPixel(v, hour);

      // Modify pixel data
      image.data[i + 0] = v[0]; // R value
      image.data[i + 1] = v[1]; // G value
      image.data[i + 2] = v[2]; // B value
      image.data[i + 3] = 255; // A value
    }
    console.log('Finish Image ' + hour);
    return imagedata_to_image(image, hour);
  }

  function imagedata_to_image(imagedata, hour) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = getBoard().row;
    canvas.height = getBoard().col;
    ctx.putImageData(imagedata, 0, 0);
    var image = new Image();
    image.src = canvas.toDataURL();
    image.id = 'image';
    image.style.zIndex = 1;
    image.style.display = 'block';
    image.style.marginLeft = 'auto';
    image.style.marginRight = 'auto';
    return image;
  }

  function getColorArray(model, street, hour) {
    let arr = model[street]['volume'][hour];
    return [
      convertToRGBA(arr[0]),
      convertToRGBA(arr[1]),
      convertToRGBA(arr[2]),
    ];
  }

  function nodeToPixel(node, hour) {
    if (node.street.length === 0) {
      return [0, 0, 0];
    }
    return getColorArray(model1, node.street, hour);
  }

  const latlngToGlobalXY = (lat, lng) => {
    const radius = 6371;
    // Calculates x based on cos of average of the latitudes
    let x = radius * lng * Math.cos(40.77235563526895);
    // Calculates y based on latitude
    let y = radius * lat;
    return { x: x * multFactor[0], y: y * multFactor[1] };
  };

  const zoomIn = () => {
    var myImg = document.getElementById('image');
    var currWidth = myImg.clientWidth;
    console.log(currWidth);
    if (currWidth >= 6000) return false;
    else {
      myImg.style.width = currWidth * 1.25 + 'px';
    }
  };

  const zoomOut = () => {
    var myImg = document.getElementById('image');
    var currWidth = myImg.clientWidth;
    console.log(currWidth);
    if (currWidth <= 600) return false;
    else {
      myImg.style.width = currWidth * 0.75 + 'px';
    }
  };

  const switchModel = (event) => {
    setModel(event.target.value);
  };

  return (
    <div>
      <Clock grid={grid} createMapImage={createMapImage} />

      <div id="switching-model">
        <select onChange={switchModel}>
          <option value="1">Model 1</option>
          <option value="2">Model 2</option>
          <option value="3">Model 3</option>
        </select>
      </div>

      <div id="zoom-in-out">
        <button onClick={zoomOut}>-</button>
        <button onClick={zoomIn}>+</button>
      </div>
    </div>
  );
}
export default CanvasMap;
