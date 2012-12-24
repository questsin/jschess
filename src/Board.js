/*jsl:import BoardPiece.js*/
/*jsl:import PieceColor.js*/
/*jsl:import PieceType.js*/
/*jsl:import PiecePosition.js*/
/**
	@class Represents a full board
	This is the main class to interact with. Using this class you
	can:
	1. Use pieces: put, remove and move them.
	2. Do something with all pieces.
	@returns the new object created
	@author <a href="mailto:mark.veltzer@gmail.com">Mark Veltzer</a>
*/
function Board() {
	// create 8x8 undefined squares
	this.bd=[];
	for(var i=0;i<8;i++) {
		var ar=[];
		for(var j=0;j<8;j++) {
			ar.push(undefined);
		}
		this.bd.push(ar);
	}
	this.pieces=[];
	// callbacks
	this.addCB=[];
	this.removeCB=[];
	this.moveCB=[];
}
/**
	toString method that allows you to get a nice printout for this type
	@returns string representation of this object
	@author <a href="mailto:mark.veltzer@gmail.com">Mark Veltzer</a>
*/
Board.prototype.toString=function() {
	var str='';
	for(var i=0;i<8;i++) {
		for(var j=0;j<8;j++) {
			str+=this.bd[i][j];
		}
		str+='\n';
	}
	return str;
};
/**
	Check that no piece is at a certain position.
	Will throw an exception if that is not the case.
	@param position position to check that no piece is at
	@returns nothing
	@author <a href="mailto:mark.veltzer@gmail.com">Mark Veltzer</a>
*/
Board.prototype.checkNoPieceAt=function(position) {
	if(this.bd[position.x][position.y]!==undefined) {
		throw 'already have piece at position '+position.toString();
	}
};
/**
	Check that piece is at a certain position.
	Will throw an exception if that is not the case.
	@param position position to check that a piece is at
	@returns nothing
	@author <a href="mailto:mark.veltzer@gmail.com">Mark Veltzer</a>
*/
Board.prototype.checkPieceAt=function(position) {
	if(this.bd[position.x][position.y]===undefined) {
		throw 'dont have piece at position '+position.toString();
	}
};
/**
	Add a piece to the position
	@param boardPiece piece to add
	@returns nothing
	@author <a href="mailto:mark.veltzer@gmail.com">Mark Veltzer</a>
*/
Board.prototype.addPiece=function(boardPiece) {
	var position=boardPiece.position;
	this.checkNoPieceAt(position);
	this.bd[position.x][position.y]=boardPiece;
	for(var f in this.addCB) {
		f(boardPiece);
	}
};
/**
	Remove a piece
	@param boardPiece piece to remove
	@returns nothing
	@author <a href="mailto:mark.veltzer@gmail.com">Mark Veltzer</a>
*/
Board.prototype.removePiece=function(boardPiece) {
	var position=boardPiece.position;
	this.checkPieceAt(position);
	for(var f in this.addCB) {
		f(boardPiece);
	}
	this.bd[position.x][position.y]=undefined;
};
/**
	Add a piece to the position (seperate pieces of data).
	@param color color of the piece (black/white)
	@param type type of the piece (rook/knight/bishop/queen/king/pawn)
	@param x x location of the piece [0..8)
	@param y y location of the piece [0..8)
	@returns nothing
	@author <a href="mailto:mark.veltzer@gmail.com">Mark Veltzer</a>
*/
Board.prototype.addPieceVals=function(color,type,x,y) {
	var boardPiece=new BoardPiece(
		new PieceColor(color),
		new PieceType(type),
		new PiecePosition(x,y)
	);
	this.addPiece(boardPiece);
};
/**
	Run a function for each piece in this position
	@param f function to be called back for each piece. This function should
	receive the piece to work on.
	@returns nothing
	@author <a href="mailto:mark.veltzer@gmail.com">Mark Veltzer</a>
*/
Board.prototype.forEachPiece=function(f) {
	for(var i=0;i<8;i++) {
		for(var j=0;j<8;j++) {
			if(this.bd[i][j]!==undefined) {
				f(this.bd[i][j]);
			}
		}
	}
};
/**
	Get a piece at a specific position
	@param position position to get the piece at
	@returns the piece at the specified position
	@author <a href="mailto:mark.veltzer@gmail.com">Mark Veltzer</a>
*/
Board.prototype.getPieceAtPosition=function(position) {
	this.checkPieceAt(position);
	return this.bd[position.x][position.y];
};
/**
	Get a piece at a specific position (in parts)
	@param x x position to get piece at [0..8)
	@param y y position to get piece at [0..8)
	@returns the piece at the specified position
	@author <a href="mailto:mark.veltzer@gmail.com">Mark Veltzer</a>
*/
Board.prototype.getPieceAtPositionVals=function(x,y) {
	return this.getPieceAtPosition(new PiecePosition(x,y));
};
/**
	Do we have a piece in a specific position?
	@param position position to check for a piece at
	@returns boolean that indicates whether there is a piece at position. 
	@author <a href="mailto:mark.veltzer@gmail.com">Mark Veltzer</a>
*/
Board.prototype.hasPieceAtPosition=function(position) {
	return this.bd[position.x][position.y]!==undefined;
};
/**
	Do we have a piece in a specific position?
	@param x x position to check for piece at [0..8)
	@param y y position to check for piece at [0..8)
	@returns boolean that indicates whether there is a piece at position. 
	@author <a href="mailto:mark.veltzer@gmail.com">Mark Veltzer</a>
*/
Board.prototype.hasPieceAtPositionVals=function(x,y) {
	return this.hasPieceAtPosition(new PiecePosition(x,y));
};
/**
	Add a callback for adding a piece
	@param f callback function
	@returns nothing
	@author <a href="mailto:mark.veltzer@gmail.com">Mark Veltzer</a>
*/
Board.prototype.addPieceAddCallback=function(f) {
	this.addCB.push(f);
};
/**
	Add a callback for removing a piece
	@param f callback function
	@returns nothing
	@author <a href="mailto:mark.veltzer@gmail.com">Mark Veltzer</a>
*/
Board.prototype.addPieceRemoveCallback=function(f) {
	this.removeCB.push(f);
};
/**
	Add a callback for moving a piece
	@param f callback function
	@returns nothing
	@author <a href="mailto:mark.veltzer@gmail.com">Mark Veltzer</a>
*/
Board.prototype.addPieceMoveCallback=function(f) {
	this.moveCB.push(f);
};
