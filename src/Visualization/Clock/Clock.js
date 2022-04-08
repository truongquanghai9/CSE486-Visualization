import React, {useEffect, useState} from 'react';
import "./Clock.css";
const Clock = ({grid, createMapImage}) => {
    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);
    const [second, setSecond] = useState(0);
    const [speed, setSpeed] = useState(1000);


    useEffect(() => {
        const interval = setInterval(() => {
            updateSecond();
        }, speed);
        return () => {
            clearInterval(interval);
        };
    }, [second]);

    const updateSecond = () => {
        if (second + 1 >= 60) {
            setSecond(0);
            updateMinute();
        } else {
            setSecond(prev => prev + 1);
        }
    }

    const updateMinute = () => {
        if (minute + 1 >= 60) {
            setMinute(0);
            updateHour();
        } else {
            setMinute(prev => prev + 1);
        }
    }

    const updateHour = () => {
        const img = document.getElementById('image');
        if (hour + 1 >= 24) {
            setHour(0);
            createMapImage(grid, 0).then(res => img.src = res.src);
        } else {
            setHour(prev => prev + 1);
            createMapImage(grid, hour + 1).then(res => img.src = res.src);
        }
    }
    return (
    <div>
        <div id="clock">
            <div>{hour < 10 ? `0${hour}`: hour}</div>
            :
            <div>{minute < 10 ? `0${minute}`: minute}</div>
            :
            <div>{second < 10 ? `0${second}`: second}</div>
        </div>
        <div id="speed-control">
            <button onClick={() => setSpeed(1000)}>Normal</button>
            <button onClick={() => setSpeed(100)}>10x</button>
            <button onClick={() => setSpeed(10)}>100x</button>
            <button onClick={() => setSpeed(1)}>1000x</button>
        </div>
    </div>
    );
}

export default Clock;

