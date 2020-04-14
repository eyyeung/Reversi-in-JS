let Piece = require("./piece");

/**
 * Returns a 2D array (8 by 8) with two black pieces at [3, 4] and [4, 3]
 * and two white pieces at [3, 3] and [4, 4]
 */
function _makeGrid () {
  const baseGrid=[];
  for (let i=0;i<8;i++){
    let row= new Array(8);
    baseGrid.push(row);
  }

  baseGrid[3][3] = new Piece("white");
  baseGrid[4][4] = new Piece("white");
  baseGrid[3][4] = new Piece("black");
  baseGrid[4][3] = new Piece("black");
  return baseGrid;
}

/**
 * Constructs a Board with a starting grid set up.
 */
function Board () {
  this.grid = _makeGrid();
}


Board.DIRS = [
  [ 0,  1], [ 1,  1], [ 1,  0],
  [ 1, -1], [ 0, -1], [-1, -1],
  [-1,  0], [-1,  1]
];

/**
 * Checks if a given position is on the Board.
 */
Board.prototype.isValidPos = function (pos) {
  if ((pos[0]>=0&&pos[0]<=7)&&(pos[1]>=0&&pos[1]<=7)){
    return true;
  }else{
    return false;
  }
};

/**
 * Returns the piece at a given [x, y] position,
 * throwing an Error if the position is invalid.
 */
Board.prototype.getPiece = function (pos) {
  if (this.isValidPos(pos)){
    return this.grid[pos[0]][pos[1]];
  }else{
    throw new Error("Invalid position. Position should be an array of the form [row,column]");
  }
};

/**
 * Checks if the piece at a given position
 * matches a given color.
 */
Board.prototype.isMine = function (pos, color) {
  if (this.getPiece(pos)){
    const piece=this.getPiece(pos);
    return piece.color===color;
  }
};

/**
 * Checks if a given position has a piece on it.
 */
Board.prototype.isOccupied = function (pos) {
  if (this.getPiece(pos)){
    return true;
  }else{
    return false;
  }
};

/**
 * Recursively follows a direction away from a starting position, adding each
 * piece of the opposite color until hitting another piece of the current color.
 * It then returns an array of all pieces between the starting position and
 * ending position.
 *
 * Returns an empty array if it reaches the end of the board before finding another piece
 * of the same color.
 *
 * Returns empty array if it hits an empty position.
 *
 * Returns empty array if no pieces of the opposite color are found.
 */
Board.prototype._positionsToFlip = function(pos, color, dir, piecesToFlip){
  // if variable doesn't exist then establish it
  if (!piecesToFlip){
    piecesToFlip = [];
    // otherwise add the position to the array
  } else{
    piecesToFlip.push(pos);
  }
  let nextPos = [pos[0] + dir[0], pos[1]+dir[1]];
  // reaches end of board
  if (!this.isValidPos(nextPos)){
    return [];
    //reaches an empty position
  } else if (!this.isOccupied(nextPos)){
    return [];
    // reaches another piece that is mine, return the array of containing all the in between pieces
  } else if (this.isMine(nextPos, color)){
    return piecesToFlip.length === 0 ? [] : piecesToFlip;
  } else{
    // recursive checking the next position
    return this._positionsToFlip(nextPos,color,dir,piecesToFlip);
  }
};

/**
 * Checks that a position is not already occupied and that the color
 * taking the position will result in some pieces of the opposite
 * color being flipped.
 */
Board.prototype.validMove = function (pos, color) {
  // if the new position is not occupied, and the array containing the positons to flip is not empty, then it is valid
  if (this.isOccupied(pos)){
    return false;
  } else{
    for (let i=0;i<Board.DIRS.length;i++){
      const piecesToFlip = this._positionsToFlip(pos,color,Board.DIRS[i]);
      if (piecesToFlip.length>0){
        return true;
      }
    }
    return false;
  }
};

/**
 * Adds a new piece of the given color to the given position, flipping the
 * color of any pieces that are eligible for flipping.
 *
 * Throws an error if the position represents an invalid move.
 */
Board.prototype.placePiece = function (pos, color) {
  if (this.validMove(pos,color)){
    this.grid[pos[0]][pos[1]]= new Piece(color);
    let positions = [];
    for (let i=0;i<Board.DIRS.length;i++){
      positions = positions.concat(this._positionsToFlip(pos,color,Board.DIRS[i]));
    }
    for (let posInd=0;posInd<positions.length;posInd++){
        this.getPiece(positions[posInd]).flip();
    }
  }else{
    throw new Error("Invalid move!")
  }
};

/**
 * Produces an array of all valid positions on
 * the Board for a given color.
 */
Board.prototype.validMoves = function (color) {
  const validPos=[];
  for (let i=0;i<8;i++){
    for (let j=0;j<8;j++){
      let pos=[i,j]
      if (this.validMove(pos,color)){
        validPos.push(pos);
      }
    }
  }
  return validPos;
};

/**
 * Checks if there are any valid moves for the given color.
 */
Board.prototype.hasMove = function (color) {
  return (this.validMoves(color).length !== 0);
};



/**
 * Checks if both the white player and
 * the black player are out of moves.
 */
Board.prototype.isOver = function () {
  return (!this.hasMove('white') && !this.hasMove('black'));
};




/**
 * Prints a string representation of the Board to the console.
 */
Board.prototype.print = function () {
  console.log(`     0  1  2  3  4  5  6  7    `)
  for (i=0;i<8;i++){
    let rowString = ` ${i} |`
    for (j=0;j<8;j++){
      let pos = [i,j];
      rowString += (this.getPiece(pos) ? ` ${this.getPiece(pos).toString()} ` : " . ");
    }
    console.log(rowString);
  }
};



module.exports = Board;
