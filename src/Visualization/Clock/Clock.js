import React, { useEffect, useState } from 'react';
import './Clock.css';
const Clock = ({ grid, createMapImage, arrayIndex }) => {
  // Image array is to get the image faster without having to redo it everytime
  const [imageArray, setImageArray] = useState(new Array(4));
  const [hour, setHour] = useState(0);
  const [speed, setSpeed] = useState(1000);

  // Run at first, and everytime the hour change
  useEffect(() => {
    //Interval to update the hour within the speed rate
    const interval = setInterval(() => {
      updateHour();
      updateMap();
    }, speed);
    return () => {
      clearInterval(interval);
    };
  }, [hour]);

  // Update the map when the hour change
  const updateMap = () => {
    // get image
    console.log(imageArray);
    let img = document.getElementById('image');

    let imgDict;
    if (
      imageArray[arrayIndex] === null ||
      imageArray[arrayIndex] === undefined
    ) {
      imgDict = {};
    } else {
      imgDict = imageArray[arrayIndex];
    }

    let new_img;
    console.log('Current Arr, Hour:', arrayIndex, imgDict, hour);
    if (!(hour in imgDict)) {
      console.log('Create object & Insert to Dict');

      // create new image
      new_img = createMapImage(grid, hour);

      // setting new image to image dict
      imgDict[hour] = new_img;
      imageArray[arrayIndex] = imgDict;
      setImageArray(imageArray);
    } else {
      new_img = imgDict[hour];
    }

    // setting image to new image and display on screen
    img.src = new_img.src;
  };

  // update the hour
  const updateHour = () => {
    if (hour + 1 >= 24) {
      setHour(0);
    } else {
      setHour((prev) => prev + 1);
    }
  };

  return (
    <div>
      <div id="clock">
        <div>{hour < 10 ? `0${hour}` : hour}:00</div>
      </div>
      <div id="speed-control">
        <button onClick={() => setSpeed(1000)}>1x</button>
        <button onClick={() => setSpeed(500)}>2x</button>
        <button onClick={() => setSpeed(200)}>5x</button>
        <button onClick={() => setSpeed(100)}>10x</button>
      </div>
    </div>
  );
};

export default Clock;
