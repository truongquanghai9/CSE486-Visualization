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
import './bitmap';
// import Canvas from './Canvas';

function CanvasMap() {
  const [grid, setGrid] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [hourlyTraffic1, setHourlyTraffic1] = useState([]);
  const [gridImage1, setGridImage1] = useState([]);
  var mapImageArray = [];

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

        createMapImage(tempGrid, 0);

        // for (let i = 0; i < 24; i++) {
        //   let cur_img = createMapImage(tempGrid, i);
        //   var new_image = document.createElement('img');
        //   new_image = cur_img;
        //   // document.body.appendChild(cur_img);
        //   mapImageArray.push();
        // }

        setGrid(() => tempGrid);
        setDataLoaded(true);
      });
    });

    // const tempHourlyTraffic = new Array(24);
    // for (let i = 0; i < 24; i++) {
    //   tempHourlyTraffic[i] = {};
    // }

    // for (const edge in model1) {
    //   if (edge) {
    //     for (let i = 0; i < 1; i++) {
    //       tempHourlyTraffic[i][edge] = model1[edge].volume[i];
    //     }
    //   }
    // }
    // setHourlyTraffic1(tempHourlyTraffic);
  }, []);

  const convertToRGBA = (str) => {
    return parseFloat(str) * 255;
  };

  function createMapImage(map, hour) {
    let height = map[0].length;
    let width = map.length;

    // console.log(height, width);

    const canvas = document.getElementById('real_canvas');
    canvas.width = visualViewport.width * 2;
    canvas.height = canvas.width * (height / width);
    const ctx = canvas.getContext('2d');
    canvas.imageSmoothEnabled = false;
    ctx.imageSmoothEnabled = false;
    ctx.scale(5, 5);
    const image = ctx.createImageData(width, height);

    let printed = 0;
    // Iterate through every pixel
    for (let i = 0; i < image.data.length; i += 4) {
      let x = (i / 4) % width;
      let y = height - 1 - parseInt(i / (width * 4));
      let v = map[x][y];
      v = nodeToPixel(v, hour);

      if (printed < 10 && sum(v) > 400) {
        console.log(x, y, v, hour);
        printed++;
      }

      // Modify pixel data
      image.data[i + 0] = v[0]; // R value
      image.data[i + 1] = v[1]; // G value
      image.data[i + 2] = v[2]; // B value
      image.data[i + 3] = 255; // A value
    }

    function createMapPNG(map, hour) {
      createImageBitmap();
    }

    function createMapPNG(image) {
      const bitmap = createImageBitmap(image);
      

    }

    // Draw image data to the canvas
    // ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // ctx.putImageData(image, 0, 0);

    var jpgImage = imagedata_to_image(image);
    ctx.drawImage(jpgImage, 0, 0);

    return jpgImage;
    // document.body.style.background = 'url(' + canvas.toDataURL() + ')';
    // const img = document.createElement('img');
    // img.src = 'url(' + jpgImage.toDataURL() + ')';
    // img.id = 'img-' + hour;
    // document.body.appendChild(img);

    // document.body.style.background = 'url(' + jpgImage.toDataURL() + ')';
  }

  function imagedata_to_image(imagedata) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = imagedata.width;
    canvas.height = imagedata.height;
    ctx.putImageData(imagedata, 0, 0);
    var image = new Image();
    image.src = canvas.toDataURL();
    return image;
  }

  function getColorArray(model, street, hour) {
    let arr = model[street]['volume'][hour];
    return [
      convertToRGBA(arr[0]),
      convertToRGBA(arr[1]),
      convertToRGBA(arr[2]),
      convertToRGBA(arr[3]),
    ];
  }

  function nodeToPixel(node, hour) {
    if (node.street.length === 0) {
      return [0, 0, 0, 255];
    }
    return getColorArray(model1, node.street, hour);
  }

  const latlngToGlobalXY = (lat, lng) => {
    const radius = 6371;
    // Calculates x based on cos of average of the latitudes
    let x = radius * lng * Math.cos(40.77235563526895);
    // Calculates y based on latitude
    let y = radius * lat;
    return { x: x, y: y };
  };

  return (
    <div>
      <canvas id="real_canvas"></canvas>
    </div>
  );
}
export default CanvasMap;
