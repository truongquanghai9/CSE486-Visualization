import React from 'react';
import { Node } from '../../Street/StreetInfo';

export const multFactor = 1;

export const getBoard = () => {
  return { row: 700 * multFactor, col: 1180 * multFactor };
};

export const initGrid = (startNode, goalNode) => {
  const grid = [];
  for (let row = 0; row < getBoard().row; row++) {
    const newRow = [];
    for (let col = 0; col < getBoard().col; col++) {
      newRow.push(newNode(row, col));
    }
    grid.push(newRow);
  }
  return grid;
};

export const newNode = (row, col) => {
  const newNode: Node = {
    x: row,
    y: col,
    street: '',
    change: 0,
  };
  return newNode;
};
