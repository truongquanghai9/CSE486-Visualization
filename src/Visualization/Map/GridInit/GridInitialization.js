import React from 'react';
import { Node } from '../../Street/StreetInfo';

export const getBoard = () => {
  return { row: 700, col: 1180 };
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

export const revertVisitedNode = (grid) => {
  const retGrid = grid;
  for (let row = 0; row < getBoard().row; row++) {
    for (let col = 0; col < getBoard().col; col++) {
      grid[row][col].isVisited = false;
    }
  }
  return retGrid;
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

export const newGridNodeWithWall = (grid, row, col) => {
  const tempGrid = grid.slice();
  tempGrid[row][col].isWall = !tempGrid[row][col].isWall;
  return tempGrid;
};

export const moveObject = (
  grid,
  row,
  col,
  object,
  startNode,
  goalNode,
  setStartNode,
  setGoalNode
) => {
  const tempRow =
    object === 'start1' || object === 'start2' ? startNode.row : goalNode.row;
  const tempCol =
    object === 'start1' || object === 'start2' ? startNode.col : goalNode.col;
  if (object === 'start1' || object === 'start2') {
    grid[tempRow][tempCol].isStart = false;
    grid[row][col].isStart = true;
    setStartNode({ row: row, col: col });
  } else {
    grid[tempRow][tempCol].isGoal = false;
    grid[row][col].isGoal = true;
    setGoalNode({ row: row, col: col });
  }
};
