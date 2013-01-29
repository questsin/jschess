/*jsl:import SvgPieceData.js*/
/*jsl:import SvgCreator.js*/
/*jsl:import SvgPixelPosition.js*/
/*jsl:import PiecePosition.js*/
/*jsl:import Board.js*/
/*jsl:import WRaphael.js*/
/*jsl:import Utils.js*/
/*jsl:import Config.js*/
/*jsl:import SvgConfigTmpl.js*/
var SvgBoard = Class.create(/** @lends SvgBoard# */{
  /**
    @class a whole board to play with
    creates a new instance
    @param {Board} board instance to use as the abstract board.
    @param {object} dict overridables to the configuration for this object.
    @return the new instance
    @constructor
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  initialize: function(board,dict) {
    // lets create a config connected to our template
    this.config = new Config(SvgConfigTmpl.getInstance());
    // lets override with user preferences
    this.config.override(dict);
    // lets check the config
    this.config.check();
    // now we are ready to go...
    // get RW vars from the config
    this.boardview = this.getValue('boardview');
    this.size = this.getValue('size');
    if (this.getValue('do_letters')) {
      var partial = this.getValue('partial');
      this.square = this.getValue('size') / (8 + partial);
      this.offX = this.square * (partial / 2);
      this.offY = this.square * (partial / 2);
    } else {
      this.square = this.getValue('size') / 8.0;
      this.offX = 0;
      this.offY = 0;
    }
    // real code starts here
    this.board = board;
    this.raphaelPrep();
    this.drawBoard();
    if (this.getValue('do_letters')) {
      this.drawBorder();
    }
    // hook the board to our graphics
    var that = this;
    this.board.addPiecePostAddCallback(function(boardPiece,piecePosition) {
      that.postAddPiece(boardPiece, piecePosition);
    });
    this.board.addPiecePostRemoveCallback(function(boardPiece,piecePosition) {
      that.postRemovePiece(boardPiece, piecePosition);
    });
    this.board.addPiecePostMoveCallback(function(boardPiece,fromPos,toPos) {
      that.postMovePiece(boardPiece, fromPos, toPos);
    });
    this.overlay();
    // build the glow object
    this.glow_obj = {};
    this.glow_obj.width = this.getValue('glow_width');
    this.glow_obj.fill = this.getValue('glow_fill');
    this.glow_obj.opacity = this.getValue('glow_opacity');
    this.glow_obj.offsetx = this.getValue('glow_offsetx');
    this.glow_obj.offsety = this.getValue('glow_offsety');
    this.glow_obj.color = this.getValue('glow_color');
    // selection variables
    // last board position
    this.lastPos = undefined;
    // current board position
    this.currentPos = undefined;
    // selected piece
    this.selectedPiece = undefined;
    // selected rec
    this.selectedRec = undefined;
  },
  /**
    get the logical board [Board] associated with this [SvgBoard]
    @return [Board] the logical board associated with this [SvgBoard]
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  getBoard: function() {
    return this.board;
  },
  /**
    get the config value for a key
    @param {string} key the key to get the config for.
    @return {anything} the value of the configuration option
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  getValue: function(key) {
    return this.config.getValue(key);
  },
  /**
    Prepare the raphael paper so we could do graphics
    @return nothing
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  raphaelPrep: function() {
    // async way
    /*
    var widget=this
    Raphael(this.getValue('id'),this.getValue('size'),this.getValue('size'),function() {
      widget.paper=this
      widget.drawBoard()
    })
    */
    // sync way
    this.paper = new WRaphael(
      this.getValue('id'),
      this.getValue('size'),
      this.getValue('size')
    );
    /*
    this.paper=Raphael(
      this.getValue('id'),
      this.getValue('size'),
      this.getValue('size')
    );
    */
    this.elem = $(this.getValue('id'));
    var offset = this.elem.cumulativeOffset();
    this.startX = offset.left;
    this.startY = offset.top;
  },
  /**
    Fill a rectangle using the default color
    This method must take board rotation into consideration
    It currently doesn't because the board looks the same in terms
    of white/black square when you totally flip it. If we ever support
    90% flips then this method must be modified.
    @param {rect} rec Raphael.js rectangle object to fill.
    @param {boolean} anim do you want animation (slow transition).
    @return nothing
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  rectFill: function(rec,anim) {
    var piecePosition = rec.data('pos');
    var mod;
    if (this.boardview == 'white' || this.boardview == 'black') {
      mod = 1;
    } else {
      mod = 0;
    }
    var val;
    if ((piecePosition.x + piecePosition.y) % 2 == mod) {
      if (this.getValue('gradients')) {
        val = this.getValue('white_square_gradient');
      } else {
        val = this.getValue('white_square_color');
      }
    } else {
      if (this.getValue('gradients')) {
        val = this.getValue('black_square_gradient');
      } else {
        val = this.getValue('black_square_color');
      }
    }
    if (anim) {
      // TODO: animation with gradients looks bad
      if (this.getValue('gradients')) {
        rec.attr('fill', val);
      } else {
        var ms = this.getValue('move_ms');
        rec.animate({fill: val},ms);
      }
    } else {
      rec.attr('fill', val);
    }
  },
  /**
    Draw the boarder
    @return nothing
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  drawBorder: function() {
    this.texts = [];
    var part = 0.5;
    var partial = this.getValue('partial');
    for (var y = 0; y < 8; y++) {
      var txt1 = this.paper.text(
        this.square * (partial / 2) * part,
        (y + 0.5) * this.square + this.offY,
        8 - y
      );
      this.texts.push(txt1);
      var txt2 = this.paper.text(
        this.offX + this.square * 8.0 + this.square * (partial / 2) * part,
        (y + 0.5) * this.square + this.offY,
        8 - y
      );
      this.texts.push(txt2);
    }
    for (var x = 0; x < 8; x++) {
      var txt3 = this.paper.text(
        (x + 0.5) * this.square + this.offX,
        this.square * (partial / 2) * part,
        String.fromCharCode(x + 'A'.charCodeAt(0))
      );
      this.texts.push(txt3);
      var txt4 = this.paper.text(
        (x + 0.5) * this.square + this.offX,
        this.offY + this.square * 8.0 + this.square * (partial / 2) * part,
        String.fromCharCode(x + 'A'.charCodeAt(0))
      );
      this.texts.push(txt4);
    }
  },
  /**
    Translate a position from a rectangle position
    to a logical position according to board rotation.
    @param {PiecePosition} pos the position to translate.
    @return {PiecePosition} the logical position
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  translatePos: function(pos) {
    if (this.boardview == 'white') {
      return new PiecePosition(pos.x, pos.y);
    }
    if (this.boardview == 'black') {
      return new PiecePosition(7 - pos.x, 7 - pos.y);
    }
    if (this.boardview == 'left') {
      return new PiecePosition(pos.y, pos.x);
    }
    if (this.boardview == 'right') {
      return new PiecePosition(7 - pos.y, 7 - pos.x);
    }
    throw 'boardview is not correct';
  },
  /**
    Draw the board (white and black squares)
    @return nothing
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  drawBoard: function() {
    var that = this;
    this.recs = [];
    for (var x = 0; x < 8; x++) {
      var rec_line = [];
      for (var y = 0; y < 8; y++) {
        var rec = this.paper.rect(
          x * this.square + this.offX,
          y * this.square + this.offY,
          this.square,
          this.square
        );
        rec.attr({
          stroke: this.getValue('rec_stroke_color'),
          'stroke-width': this.getValue('rec_stroke_width')
        });
        rec_line.push(rec);
        var piecePosition = new PiecePosition(x, 7 - y);
        rec.data('pos', piecePosition);
        this.rectFill(rec, false);
        rec.click(function(tpos,trec,type) {
          return function() {
            var ttpos = that.translatePos(tpos);
            that.eventPosition(ttpos, trec, type);
          };
        }(piecePosition, rec, 'click'));
        rec.mousedown(function(tpos,trec,type) {
          return function() {
            var ttpos = that.translatePos(tpos);
            that.eventPosition(ttpos, trec, type);
          };
        }(piecePosition, rec, 'mousedown'));
        /*
        rec.mousemove(function(tpos,trec,type) {
          return function() {
            var ttpos=that.translatePos(tpos);
            that.eventPosition(ttpos,trec,type);
          };
        }(piecePosition,rec,'mousemove'));
        */
        rec.mouseout(function(tpos,trec,type) {
          return function() {
            var ttpos = that.translatePos(tpos);
            that.eventPosition(ttpos, trec, type);
          };
        }(piecePosition, rec, 'mouseout'));
        rec.mouseover(function(tpos,trec,type) {
          return function() {
            var ttpos = that.translatePos(tpos);
            that.eventPosition(ttpos, trec, type);
          };
        }(piecePosition, rec, 'mouseover'));
        rec.mouseup(function(tpos,trec,type) {
          return function() {
            var ttpos = that.translatePos(tpos);
            that.eventPosition(ttpos, trec, type);
          };
        }(piecePosition, rec, 'mouseup'));
      }
      rec_line.reverse();
      this.recs.push(rec_line);
    }
  },
  /**
    Create an overlay rectange for the entire board
    @return nothing
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  overlay: function() {
    if (this.getValue('do_select_global')) {
      var that = this;
      var delta = 0;
      var rec = this.paper.rect(this.offX + delta, this.offY + delta, this.square * 8.0 - delta, this.square * 8.0 - delta);
      rec.attr({fill: Raphael.getColor()});
      rec.attr({opacity: 0.0});
      /*
      rec.mousemove(function(evt,x,y) {
        that.eventGlobal(evt,x-that.startX-that.offX,y-that.startY-that.offY,'mousemove');
      });
      */
      rec.mouseover(function(evt,x,y) {
        that.eventGlobal(evt, x - that.startX - that.offX, y - that.startY - that.offY, 'mouseover');
      });
      rec.mouseout(function(evt,x,y) {
        that.eventGlobal(evt, x - that.startX - that.offX, y - that.startY - that.offY, 'mouseout');
      });
      rec.toFront();
      this.fullRec = rec;
    }
    /*
    if(this.getValue('do_select_piecerec')) {
      var rec_out=this.paper.rect(this.offX+delta,this.offY+delta,this.square*8.0-delta,this.square*8.0-delta);
      rec_out.attr({opacity:0.0});
      rec_out.mouseout(function(evt,x,y) {
        that.eventGlobal(evt,x-that.startX-that.offX,y-that.startY-that.offY,'mouseout');
      });
      rec_out.toFront();
    }
    */
  },
  /**
    Callback method that is called whenever a piece is added to the board
    This method is to be used to do something after a piece is added, removed etc.
    @return nothing
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  postGraphics: function() {
    if (this.getValue('do_select_global')) {
      this.fullRec.toFront();
    }
  },
  /**
    Callback method that is called after the logical board adds a piece.
    This is where we add the SVG representation of the piece in real graphics.
    @param {BoardPiece} boardPiece the piece that was added.
    @param {PiecePosition} piecePosition the position where the piece was added.
    @return nothing
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  postAddPiece: function(boardPiece,piecePosition) {
    var that = this;
    var svgPiece = SvgCreator.createPiece(this.config, boardPiece.color, boardPiece.type);
    // calculate transform (move and scale)
    var pixelPos = this.posToPixels(piecePosition);
    var m = Raphael.matrix();
    m.translate(pixelPos.x + this.offX, pixelPos.y + this.offY);
    m.scale(this.square / svgPiece.size, this.square / svgPiece.size);
    var transform = m.toTransformString();
    // now put it on the paper
    var set = svgPiece.toSet(this.paper, transform);
    set.eventRegister(function(iboardPiece) {
      return function(eventName) {
        that.eventPiece(iboardPiece, eventName);
      };
    }(boardPiece), ['click', 'mouseover', 'mouseout']);
    //}(boardPiece),['click','mouseover','mouseout','mousemove','mouseup','mousedown']);
    // lets put our own data with the piece
    var svgPieceData = new SvgPieceData(set, pixelPos);
    boardPiece.setData(svgPieceData);
    this.postGraphics();
  },
  /**
    Callback method that is called after the logical board removes a piece.
    @param {BoardPiece} boardPiece the piece to add.
    @param {PiecePosition} piecePosition the position where the piece was removed.
    @return nothing
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  postRemovePiece: function(boardPiece,piecePosition) {
    Utils.fakeUse(piecePosition);
    var svgPieceData = boardPiece.getData();
    svgPieceData.set.remove();
    boardPiece.unsetData();
  },
  /**
    Translates position (0..7,0..7) to pixels
    This method must take board rotation into consideration
    @param {PiecePosition} piecePosition logical (0..7,0..7) to translate.
    @return {SvgPixelPosition} position in pixels
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  posToPixels: function(piecePosition) {
    if (this.boardview == 'white') {
      return new SvgPixelPosition(
        piecePosition.x * this.square,
        (7 - piecePosition.y) * this.square
      );
    }
    if (this.boardview == 'black') {
      return new SvgPixelPosition(
        (7 - piecePosition.x) * this.square,
        piecePosition.y * this.square
      );
    }
    if (this.boardview == 'left') {
      return new SvgPixelPosition(
        piecePosition.y * this.square,
        (7 - piecePosition.x) * this.square
      );
    }
    if (this.boardview == 'right') {
      return new SvgPixelPosition(
        (7 - piecePosition.y) * this.square,
        piecePosition.x * this.square
      );
    }
    throw 'boardview is bad';
  },
  /**
    Translates pixel position (x,y) to board position (0..7,0..7)
    This method must take board rotation into consideration
    @param {SvgPixelPosition} svgPixelPosition object to translate.
    @return {PiecePosition} logical position.
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  pixelsToPos: function(svgPixelPosition) {
    var x = Math.floor((svgPixelPosition.x) / this.square);
    var y = Math.floor((svgPixelPosition.y) / this.square);
    if (this.boardview == 'white') {
      return new PiecePosition(x, 7 - y);
    }
    if (this.boardview == 'black') {
      return new PiecePosition(7 - x, y);
    }
    if (this.boardview == 'left') {
      return new PiecePosition(y, 7 - x);
    }
    if (this.boardview == 'right') {
      return new PiecePosition(7 - y, x);
    }
    throw 'boardview is bad';
  },
  pixelsToPosForgiving: function(svgPixelPosition) {
    var x = Math.floor((svgPixelPosition.x) / this.square);
    var y = Math.floor((svgPixelPosition.y) / this.square);
    if (x > 7 || x < 0 || y > 7 || y < 0) {
      return undefined;
    }
    if (this.boardview == 'white') {
      return new PiecePosition(x, 7 - y);
    }
    if (this.boardview == 'black') {
      return new PiecePosition(7 - x, y);
    }
    if (this.boardview == 'left') {
      return new PiecePosition(y, 7 - x);
    }
    if (this.boardview == 'right') {
      return new PiecePosition(7 - y, x);
    }
    throw 'boardview is bad';
  },
  /**
    Resize the board
    @param {set} set Raphael set to resize.
    @return {nothing} nothing.
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  resize: function(set) {
    var m = Raphael.matrix();
    m.scale(1.7, 1.7);
    var transformString = m.toTransformString();
    set.forEach(function(el) {
      //el.animate({transform: transformString},ms);
      el.transform(transformString);
      //el.scale(5,5);
    },this);
  },
  /**
    Shows or hides a given piece according to parameter
    @param {BoardPiece} boardPiece piece to show or hide.
    @param {boolean} hide show or hide the piece.
    @return nothing
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  showHidePiece: function(boardPiece,hide) {
    var data = boardPiece.getData();
    data.forEach(function(el) {
      if (hide) {
        el.hide();
      } else {
        el.show();
      }
    });
  },
  /**
    Quick method to show a piece
    @param {BoardPiece} boardPiece the piece to show.
    @return {nothing} nothing
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  showPiece: function(boardPiece) {
    this.showHidePiece(boardPiece, false);
  },
  /**
    Quick method to hide a piece
    @param {BoardPiece} boardPiece the piece to hide.
    @return {nothing} nothing
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  hidePiece: function(boardPiece) {
    this.showHidePiece(boardPiece, true);
  },
  /**
    Callback called when the logical board moves a piece
    @param {BoardPiece} boardPiece the piece to move.
    @param {PiecePosition} fromPiecePosition position from which to move.
    @param {PiecePosition} toPiecePosition position to which to move.
    @return {nothing} nothing
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  postMovePiece: function(boardPiece,fromPiecePosition,toPiecePosition) {
    this.timeMovePiece(boardPiece, fromPiecePosition, toPiecePosition);
  },
  /**
    Move a piece on the board (including animation if so configured)
    @param {BoardPiece} boardPiece the piece to move.
    @param {PiecePosition} fromPiecePosition position from which to move.
    @param {PiecePosition} toPiecePosition position to which to move.
    @return {nothing} nothing
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  timeMovePiece: function(boardPiece,fromPiecePosition,toPiecePosition) {
    Utils.fakeUse(fromPiecePosition);
    var ms = this.getValue('move_ms');
    var pixelPosFrom = boardPiece.getData().pixelPos;
    var pixelPosTo = this.posToPixels(toPiecePosition);
    boardPiece.getData().forEach(function(el) {
      var m = Raphael.matrix();
      m.translate(pixelPosTo.x - pixelPosFrom.x, pixelPosTo.y - pixelPosFrom.y);
      var transformString = m.toTransformString();
      el.animate({transform: transformString},ms);
    });
  },
  /**
    Flips the board (see it from the other side)
    If the board is 90 deg left it be will 90 deg right.
    Black view will turn to white and white to black.
    @return {nothing} nothing
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  flip: function() {
    var oldview = this.boardview;
    switch (this.boardview) {
      case 'white':
        this.boardview = 'black';
        break;
      case 'black':
        this.boardview = 'white';
        break;
      case 'left':
        this.boardview = 'right';
        break;
      case 'right':
        this.boardview = 'left';
        break;
      default:
        throw 'boardview is bad';
    }
    // now redraw the board (after the change of view)
    this.redraw(oldview);
  },
  /**
    Rotate the board to the right 90 degrees
    @return {nothing} nothing
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  rotateright: function() {
    var oldview = this.boardview;
    if (!this.boardview in SvgBoard.ObjRotateRight) {
      throw 'boardview is bad';
    }
    this.boardview = SvgBoard.ObjRotateRight[this.boardview];
    // now redraw the board (after the change of view)
    this.redraw(oldview);
  },
  /**
    Rotate the board to the left 90 degrees
    @return {nothing} nothing
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  rotateleft: function() {
    var oldview = this.boardview;
    if (!this.boardview in SvgBoard.ObjRotateLeft) {
      throw 'boardview is bad';
    }
    this.boardview = SvgBoard.ObjRotateLeft[this.boardview];
    // now redraw the board (after the change of view)
    this.redraw(oldview);
  },
  /**
    toString function
    This method is not yet implemented and will throw an exception.
    @return {string} a string representation of this object
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  toString: function() {
    throw 'not yet implemented';
  },
  /**
    Make a piece glow
    @param {BoardPiece} boardPiece the piece to make glow.
    @param {object} glow properties to pass to the glow function as per Raphael.js.
    @return {nothing} nothing.
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  glow: function(boardPiece,glow) {
    var svgPieceData = boardPiece.getData();
    if (glow) {
      svgPieceData.extra = svgPieceData.set.glow(this.glow_obj);
    } else {
      svgPieceData.extra.remove();
      svgPieceData.extra = undefined;
    }
  },
  /**
    Redraw the entire board
    @param {viewType} oldview the old view of the board.
    @return {nothing} nothing.
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  redraw: function(oldview) {
    Utils.fakeUse(oldview);
    // redraw the pieces
    var that = this;
    this.board.forEachPiece(function(boardPiece,position) {
      that.timeMovePiece(boardPiece, position, position);
    });
    // redraw the squares
    for (var x = 0; x < 8; x++) {
      for (var y = 0; y < 8; y++) {
        this.rectFill(this.getRec(new PiecePosition(x, y)), true);
      }
    }
  },
  /**
    Event handler for events happening on the pieces.
    Types of events: click, mouseover and more...
    @param {BoardPiece} boardPiece instance the event happened on.
    @param {string} type the type of event that happened.
    @return {nothing} nothing.
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  eventPiece: function(boardPiece, type) {
    //Utils.fakeUse(boardPiece,type);
    if (this.getValue('do_select_piecerec')) {
      if (type == 'mouseover') {
        var piecePosition = this.board.getPiecePosition(boardPiece);
        if (this.currentPos == undefined || piecePosition.notEqual(this.currentPos)) {
          this.lastPos = this.currentPos;
          this.currentPos = piecePosition;
          this.newPosition();
        }
      }
    }
  },
  /**
    Events for position. Positions are logical and do
    not depend on the flipping of the board.
    Types of events: mouseover, mouseout, click and more.
    @param {PiecePosition} piecePosition the position of the event.
    @param {rect} rec the Raphael.js rectangle where the event happened.
    @param {string} type which is the name of the event that happened.
    @return {nothing} nothing.
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  eventPosition: function(piecePosition,rec,type) {
    if (this.getValue('do_select_piecerec')) {
      if (type == 'mouseover') {
        this.lastPos = this.currentPos;
        this.currentPos = piecePosition;
        this.newPosition();
      }
      /*
      if(type=='mouseout') {
        // this is done with a timeout just for getting out of the board...
        var pos=this.currentPos;
        var that=this;
        window.setTimeout(function() {
          if(pos!=undefined && pos.equal(that.currentPos)) {
            that.lastPos=that.currentPos;
            that.currentPos=undefined;
            that.newPosition();
          }
        },100);
      }
      */
    }
    if (this.getValue('do_select_click')) {
      if (type == 'click') {
        if (this.selected) {
          if (this.selected == rec) {
            this.rectFill(this.selected, false);
            this.selected = undefined;
          } else {
            this.rectFill(this.selected, false);
            rec.attr('fill', this.getValue('select_color'));
            this.selected = rec;
          }
        } else {
          rec.attr('fill', this.getValue('select_color'));
          this.selected = rec;
        }
      }
    }
  },
  eventGlobal: function(eventtype,x,y,type) {
    Utils.fakeUse(eventtype);
    if (this.getValue('do_select_global')) {
      if (type == 'mouseover' || type == 'mousemove') {
        var piecePosition = this.pixelsToPosForgiving(new SvgPixelPosition(x, y));
        if (piecePosition != undefined) {
          if (this.currentPos == undefined) {
            this.lastPos = undefined;
            this.currentPos = piecePosition;
            this.newPosition();
          } else {
            if (piecePosition.notEqual(this.currentPos)) {
              this.lastPos = this.currentPos;
              this.currentPos = piecePosition;
              this.newPosition();
            }
          }
        } else {
          // forget about this event?!?
          Utils.pass();
        }
      }
      if (type == 'mouseout') {
        this.lastPos = this.currentPos;
        this.currentPos = undefined;
        this.newPosition();
      }
    }
    if (this.getValue('do_select_piecerec')) {
      if (type == 'mouseout') {
        this.lastPos = this.currentPos;
        this.currentPos = undefined;
        this.newPosition();
      }
    }
  },
  /**
    Internal method. This method is called whenever
    the cursor changes position over the board and ONLY when
    it changes position.
    No parameters are passed because This method uses:
    this.selectedPiece, this.selectedRec, this.lastPos, this.currentPos
    to do it's work.
    @return {nothing} nothing.
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  newPosition: function() {
    if (this.currentPos == undefined) {
      if (this.selectedPiece != undefined) {
        if (this.getValue('do_select_piece')) {
          this.glow(this.selectedPiece, false);
          this.selectedPiece = undefined;
        }
      }
      if (this.selectedRec != undefined) {
        if (this.getValue('do_select_square')) {
          this.rectFill(this.selectedRec, false);
          this.selectedRec = undefined;
        }
      }
    } else {
      if (this.board.hasPieceAtPosition(this.currentPos)) {
        var boardPiece = this.board.getPieceAtPosition(this.currentPos);
        //this.eventPiece(boardPiece,'square'+type);
        if (this.getValue('do_select_piece')) {
          if (this.selectedPiece == undefined) {
            this.selectedPiece = boardPiece;
            this.glow(this.selectedPiece, true);
          } else {
            this.glow(this.selectedPiece, false);
            this.selectedPiece = boardPiece;
            this.glow(this.selectedPiece, true);
          }
        }
      } else {
        if (this.selectedPiece != undefined) {
          if (this.getValue('do_select_piece')) {
            this.glow(this.selectedPiece, false);
            this.selectedPiece = undefined;
          }
        }
      }
      if (this.getValue('do_select_square')) {
        var rec = this.getRec(this.currentPos);
        if (this.selectedRec == undefined) {
          this.selectedRec = rec;
          this.selectedRec.attr('fill', this.getValue('over_color'));
        } else {
          this.rectFill(this.selectedRec, false);
          this.selectedRec = rec;
          this.selectedRec.attr('fill', this.getValue('over_color'));
        }
      }
    }
  },
  /**
    Return the square at a position.
    This method must take into consideraton board rotation
    @param {PiecePosition} piecePosition the logical position for which to return the square.
    @return {rec} the Raphael.js rec in question.
    @author mark.veltzer@gmail.com (Mark Veltzer)
  */
  getRec: function(piecePosition) {
    if (this.boardview == 'white') {
      return this.recs[piecePosition.x][piecePosition.y];
    }
    if (this.boardview == 'black') {
      return this.recs[7 - piecePosition.x][7 - piecePosition.y];
    }
    if (this.boardview == 'left') {
      return this.recs[piecePosition.y][piecePosition.x];
    }
    if (this.boardview == 'right') {
      return this.recs[7 - piecePosition.y][7 - piecePosition.x];
    }
    throw 'boardview is bad';
  }
});
// static data
SvgBoard.ObjRotateRight = {
  white: 'left',
  left: 'black',
  black: 'right',
  right: 'white'
};
SvgBoard.ObjRotateLeft = {
  white: 'right',
  right: 'black',
  black: 'left',
  left: 'white'
};
