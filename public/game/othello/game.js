var count = 0;
var sizeSmall = 4;
var sizeMedium = 6;
var sizeLarge = 8;
var rowSize = sizeMedium;
var colSize = sizeMedium;
var modeEasy = 1;
var modeMedium = 4;
var modeHard = 7;
var gameMode = modeEasy;
var playerComputer = 1;
var playerHuman = 0;
var minInf = -Number.MAX_VALUE;
var maxInf = Number.MAX_VALUE;
var blackPiece = '<img src="game/othello/black.gif">';
var whitePiece = '<img src="game/othello/white.gif">';
var valueWhite = 1;
var valueBlack = 0;
var turnPlayer = 0;
var turnComputer = 1;
var bias = 0.0001, scale = 0.0001;
var ruleDisplayed = 0;
var rules = "RULES\n\nBoth players take it in turns to make their move which consists of placing one piece down \nin a legally acceptable position and then turning any of the opposing player’s pieces \nwhere applicable. A legal move is one that consists of, for example, a black piece being \nplaced on the board that creates a straight line (vertical, horizontal or diagonal) \nmade up of a black piece at either end and only white pieces in between. \nWhen a player achieves this, they must complete the move by turning any white pieces \nin between the two black so that they line becomes entirely black. This turning action \nmust be completed for every legal turning line that is created with the placing of the \nnew piece. It goes without say that while the example assumes the use of black as \nthe moving player, it is applicable both ways.\n\nPlayers will then continue to move alternately until they get to the end of the game \nand a winner is decided. This decision is reached by identifying which of the two opponents \nhas the most pieces on the board.";

function displayRule() {
    var ruleText= document.getElementById("rule");
    if (!ruleDisplayed) {
        ruleText.innerHTML = rules;
    } else {
        ruleText.innerHTML = "";
    }
    ruleDisplayed = 1 - ruleDisplayed;
}

/*  Evaluation function based on the distance to the closest corner
*   Distance definition: min(abs(row_i - row_j), abs(col_i - col_j))
*   Odd distance: negative score; even distance: positive score
*   Score item: (-1)^(distance)/(bias + scale*distance); bias = 0.0001, scale = 0.0001
*   Above score is for white piece, -1 * for black piece;
*   Final score: sum of all score items
*/

function evaluateByDistance(board) {
    var scoreItem = 0;
    var scoreFinal = 0;
    var distance
    for (i = 0; i < rowSize; i++) {
        for (j = 0; j < colSize; j++) {
            if (board[i][j] == valueBlack || board[i][j] == valueWhite) {
                distance = distanceToCorner(board, i, j);
                scoreItem = Math.pow(-1, distance) / (bias + scale * distance);
                if (board[i][j] == valueBlack) {
	        	    scoreItem *= -1;	
    	        }
                scoreFinal += scoreItem;
            }
        }
    }

    return scoreFinal;
}


function distanceToCorner(board, row, col) {
    var corners = new Array(Math.min(rowSize, colSize));
    var cornerNum = 4;
    // four corners
    corners[0] = new Object();
    corners[0].row = 0;
    corners[0].col = 0;
    corners[1] = new Object();
    corners[1].row = 0;
    corners[1].col = colSize - 1;
    corners[2] = new Object();
    corners[2].row = rowSize - 1;
    corners[2].col = 0;
    corners[3] = new Object();
    corners[3].row = rowSize - 1;
    corners[3].col = colSize - 1;
    
    var distance = 99999;
    for (var i = 0; i < cornerNum; i++) {
        distance = Math.min(distance, Math.max(Math.abs(row - corners[i].row), Math.abs(col - corners[i].col)));
    }
    
    return distance;
}

function evaluateByNum(board) {
    var blackSum = 0;
    var whiteSum = 0;
    for (i = 0; i < rowSize; i++) {
        for (j = 0; j < colSize; j++) {
            if (board[i][j] == 0) {
                blackSum++;
            } else if (board[i][j] == 1) {
                whiteSum++;
            }
        }
    }
    
    return whiteSum - blackSum;
}

function copyBoard(src, dst) {
    for (var i = 0; i < rowSize; i++) {
        for (var j = 0; j < colSize; j++) {
            dst[i][j] = src[i][j];
        }
    }
}

function computeScore(board, depth, player, step) {
    if (depth == 0 || !stepAvailablePlayer(player)) {
return evaluateByNum(board);    
}
    var scoreMax = -99999;
    var scoreMin = 99999;
    var scoreCur = 0;
    var boardBackup = new Array(rowSize);
    for (var i = 0; i < rowSize; i++) {
        boardBackup[i] = new Array(colSize);
    }
   
  for (i = 0; i < rowSize; i++) {
      for (j = 0; j < colSize; j++) {
              }
              }
//    copyBoard(board, boardBackup);
    for (var i = 0; i < rowSize; i++) {
        for (var j = 0; j < colSize; j++) {
            if (board[i][j] == -1 && isValidCell(board, i, j, player)) {
	        copyBoard(board, boardBackup);
                placeStep(board, i, j, player);
		var stepSub = new Object();
                scoreCur = computeScore(board, depth - 1, 1 - player, stepSub);
	        copyBoard(boardBackup, board);
		delete stepSub;
                if (player) {
		    // Use max value
                    if (scoreCur > scoreMax) {
                        scoreMax = scoreCur;
                        step.row = i;
                        step.col = j;
                    }
                    
                } else {
		    // Use min value
                    if (scoreCur < scoreMin) {
                        scoreMin = scoreCur;
                        step.row = i;
                        step.col = j;
                    }
                }
            }
        }
    }

    // Free memory   
    for (var i = 0; i < rowSize; i++) {
        delete boardBackup[i]; 
    }   
    delete boardBackup;
//    copyBoard(boardBackup, board);
if (player) {
return scoreMax;
} else {
return scoreMin;
}
 
}

function computeScoreAlphaBeta(board, depth, scoreMax, scoreMin, player, step) {
    if (depth == 0 || !stepAvailablePlayer(player)) {
        return evaluateByDistance(board);
//        return evaluateByNum(board);
    }
    
    var scoreCur = 0;
    var boardBackup = new Array(rowSize);
    for (var i = 0; i < rowSize; i++) {
        boardBackup[i] = new Array(colSize);
    }

    var skip = 0;
    for (var i = 0; i < rowSize; i++) {
        if (skip) {
            break;
        }
        for (var j = 0; j < colSize; j++) {
            if (board[i][j] == -1 && isValidCell(board, i, j, player)) {
                copyBoard(board, boardBackup);
                placeStep(board, i, j, player);
                var stepSub = new Object();
                scoreCur = computeScoreAlphaBeta(board, depth - 1, scoreMax, scoreMin, 1 - player, stepSub);
                copyBoard(boardBackup, board);
                delete stepSub;
                if (player) {
                    // Use max value
                    if (scoreCur > scoreMax) {
                        scoreMax = scoreCur;
                        step.row = i;
                        step.col = j;
                    }
                } else {
                    // Use min value
                    if (scoreCur < scoreMin) {
                        scoreMin = scoreCur;
                        step.row = i;
                        step.col = j;
                    }
                }
                if (scoreMin <= scoreMax) {
                    skip = 1;
                    break;
                }
            }
        }
    }
    // Free memory   
    for (var i = 0; i < rowSize; i++) {
        delete boardBackup[i];
    }
    delete boardBackup;
    
    if (player) {
        return scoreMax;
    } else {
        return scoreMin;
    }
}

function placePieceComputer() {
    var step=new Object();
    var score;
//    var score = computeScore(board, gameMode, playerComputer, step);
    var score = computeScoreAlphaBeta(board, gameMode, minInf, maxInf,  playerComputer, step);
    placeStep(board, step.row, step.col, playerComputer);
    updateTable(board);
    delete step;
}

function placeStep(board, row, col, player) {

    var targePiece;
    var reversePiece;
    var distance;

    player == 0 ? targePiece = 0 : targePiece = 1;
    targePiece == 1 ? reversePiece = 0 : reversePiece = 1;

    var i, j;
    for (i = 0; i < rowSize; i++) {
        for (j = 0; j < colSize; j++) {
            if (board[i][j] == targePiece) {
                distance = Math.abs(i - row) + Math.abs(j - col);
                var res = i == row ? true : false;
                res = (j == col);
                res = ((Math.abs(i - row) == Math.abs(j - col)));

                if ((distance > 1) && (i == row || j == col || (Math.abs(i - row) == Math.abs(j - col)))) {
                    // distance greater than 1 and same row/col/diagonal
		    // check if all between pieces of the other color
                    var validBetween = true;
                    if (i == row) {
                        for (var k = Math.min(j, col) + 1; k <= Math.max(j, col) - 1; k++) {
                            if (board[i][k] == -1 || board[i][k] == targePiece) {
                                validBetween = false;
                                break;
                            }
                        }
                    } else if (j == col) {
                        for (var k = Math.min(i, row) + 1; k <= Math.max(i, row) - 1; k++) {
                            if (board[k][j] == -1 || board[k][j] == targePiece) {
                                validBetween = false;
                                break;
                            }
                        }
                    } else {
                        var deltaRow = i > row ? -1 : 1;
                        var deltaCol = j > col ? -1 : 1;
                        if (distance <= 2) validBetween = false;
                        for (var m = i + deltaRow, n = j + deltaCol; m != row || n != col; m += deltaRow, n += deltaCol) {
                            if (board[m][n] == -1 || board[m][n] == targePiece) {
                                validBetween = false;
                                break;
                            }
                        }
                    }
                    if (validBetween) {
                        // revert all the pieces in between
                        var deltaRow = i > row ? -1 : 1;
                        var deltaCol = j > col ? -1 : 1;
                        if (i == row) {
                            deltaRow = 0;
                        }
                        if (j == col) {
                            deltaCol = 0;
                        }

                        for (var m = i + deltaRow, n = j + deltaCol; m != row || n != col; m += deltaRow, n += deltaCol) {
                            board[m][n] = 1 - board[m][n];
                        }
                    }
                }
            }
        }
    }
    board[row][col] = targePiece;
}

function updateTable(board) {
    var table = document.getElementById("gameBoard");
    var cells = table.getElementsByTagName("td");
    var index;
    var targetPiece;
    for (i = 0; i < rowSize; i++) {
        for (j = 0; j < colSize; j++) {
            if (board[i][j] == -1) continue;
            index = i * colSize + j;
            targetPiece = board[i][j] ?  whitePiece : blackPiece;
            cells[index].innerHTML = targetPiece;
        }
    }
}

function isValid(row, col) {

    var targePiece;
    var reversePiece;
    var distance;

    //count == 0 ? targePiece = blackPiece, reversePiece = whitePiece : targePiece = whitePiece, reversePiece = blackPiece;
    count == 0 ? targePiece = 0 : targePiece = 1;
    targePiece == 1 ? reversePiece = 0 : reversePiece = 1;
    var resR = false;

    var i, j;
    for (i = 0; i < rowSize; i++) {
        for (j = 0; j < colSize; j++) {
            if (board[i][j] == targePiece) {
                distance = Math.abs(i - row) + Math.abs(j - col);
                var res = i == row ? true : false;
                res = (j == col);
                res = ((Math.abs(i - row) == Math.abs(j - col)));

                if ((distance > 1) && (i == row || j == col || (Math.abs(i - row) == Math.abs(j - col)))) {
                    // distance greater than 1 and same row/col/diagonal
                    // check if all between pieces of the other color
                    var validBetween = true;
                    if (i == row) {
                        for (var k = Math.min(j, col) + 1; k <= Math.max(j, col) - 1; k++) {
                            if (board[i][k] == -1 || board[i][k] == targePiece) {
                                validBetween = false;
                                break;
                            }
                        }
                    } else if (j == col) {
                        for (var k = Math.min(i, row) + 1; k <= Math.max(i, row) - 1; k++) {
                            if (board[k][j] == -1 || board[k][j] == targePiece) {
                                validBetween = false;
                                break;
                            }
                        }
                    } else {
                        var deltaRow = i > row ? -1 : 1;
                        var deltaCol = j > col ? -1 : 1;
                        if (distance <= 2) validBetween = false;
                        for (var m = i + deltaRow, n = j + deltaCol; m != row || n != col; m += deltaRow, n += deltaCol) {
                            if (board[m][n] == -1 || board[m][n] == targePiece) {
                                validBetween = false;
                                break;
                            }
                        }
                    }
                    if (validBetween) {
                        resR = true;
                        // revert all the pieces in between
                        var deltaRow = i > row ? -1 : 1;
                        var deltaCol = j > col ? -1 : 1;
                        if (i == row) {
                            deltaRow = 0;
                        }
                        if (j == col) {
                            deltaCol = 0;
                        }
                        var table = document.getElementById("gameBoard");
                        var cells = table.getElementsByTagName("td");
                        var index;
                        var PieceTobe;
                        for (var m = i + deltaRow, n = j + deltaCol; m != row || n != col; m += deltaRow, n += deltaCol) {
                            board[m][n] = 1 - board[m][n];
                            index = m * colSize + n;
                            board[m][n] ? PieceTobe = whitePiece : PieceTobe = blackPiece;
                            cells[index].innerHTML = PieceTobe;
                        }
//                        break;
                    }
                }
            }
        }
    }
    return resR;
}
function isValidCell(board, row, col, player) {

    var targePiece;
    var reversePiece;
    var distance;

    //count == 0 ? targePiece = blackPiece, reversePiece = whitePiece : targePiece = whitePiece, reversePiece = blackPiece;
    player == 0 ? targePiece = 0 : targePiece = 1;
    targePiece == 1 ? reversePiece = 0 : reversePiece = 1;
    var resR = false;

    var i, j;
    for (i = 0; i < rowSize; i++) {
        for (j = 0; j < colSize; j++) {
            if (board[i][j] == targePiece) {
                distance = Math.abs(i - row) + Math.abs(j - col);
                var res = i == row ? true : false;
                res = (j == col);
                res = ((Math.abs(i - row) == Math.abs(j - col)));

                if ((distance > 1) && (i == row || j == col || (Math.abs(i - row) == Math.abs(j - col)))) {
                    // distance greater than 1 and same row/col/diagonal
                    // check if all between pieces of the other color
                    var validBetween = true;
                    if (i == row) {
                        for (var k = Math.min(j, col) + 1; k <= Math.max(j, col) - 1; k++) {
                            if (board[i][k] == -1 || board[i][k] == targePiece) {
                                validBetween = false;
                                break;
                            }
                        }
                    } else if (j == col) {
                        for (var k = Math.min(i, row) + 1; k <= Math.max(i, row) - 1; k++) {
                            if (board[k][j] == -1 || board[k][j] == targePiece) {
                                validBetween = false;
                                break;
                            }
                        }
                    } else {
                        var deltaRow = i > row ? -1 : 1;
                        var deltaCol = j > col ? -1 : 1;
                        if (distance <= 2) validBetween = false;
                        for (var m = i + deltaRow, n = j + deltaCol; m != row || n != col; m += deltaRow, n += deltaCol) {
                            if (board[m][n] == -1 || board[m][n] == targePiece) {
                                validBetween = false;
                                break;
                            }
                        }
                    }
                    if (validBetween) {
                        resR = true;
		    }
                }
            }
        }
    }
    return resR;
}

function stepAvailable() {
    var i, j;
    for (i = 0; i < rowSize; i++) {
        for (j = 0; j < colSize; j++) {
            if (board[i][j] == -1 && isValidCell(board, i, j, count)) return true;
        }
    }
    return false;
}

function stepAvailablePlayer(player) {
    var i, j;
    for (i = 0; i < rowSize; i++) {
        for (j = 0; j < colSize; j++) {
            if (board[i][j] == -1 && isValidCell(board, i, j, player)) return true;
        }
    }
    return false;
}

function exchangeTurn() {
    count = 1 - count;
}

function overMsg() {
    // count the number of black and with pieces
    var i, j;
    var countOne = 0, countZero = 0;
    for (i = 0; i < rowSize; i++) {
        for (j = 0; j < colSize; j++) {
            if (board[i][j] == 1) {
                countOne++;
            }
            if (board[i][j] == 0) {
                countZero++;
            }
        }
    }
    
    // output the msg
    var win = false;
    var gap = Math.abs(countZero - countOne);
    if (countZero > countOne) {
        alert("Great! You won by " + gap);
        return;
    }
    if (countZero == countOne) {
        alert("What a draw");
        return;
    }
    alert("Sorry, you lose by " + gap);
}

function stepByComputer() {
    var loop = 2;
    var total = 0;
    for (i = 0; i < loop; i++) {
        total += 1;
        if (total == loop)
            exchangeTurn();
        else
            placePieceComputer();
    }
}

function initTable() {
    var buf = '';
    // Create table UI
    // Add caption
    for (var i = 0; i < rowSize; i++) {
        buf += '<tr>'
        for (var j = 0; j < colSize; j++) {
            buf += '<td>';
            buf += '</td>';
        }
        buf += '</tr>'
    }
    // Create table storage and init
    board = new Array(rowSize);
    for (var i = 0; i < rowSize; i++) {
        board[i] = new Array(colSize);
        for (var j = 0; j < colSize; j++) {
            board[i][j] = -1;
        }
    }
    // Add onclick for each cell    
    document.getElementById("gameBoard").innerHTML = buf;
    var table = document.getElementById("gameBoard");
    var cells = table.getElementsByTagName("td");
    for (var i = 0, len = cells.length; i < len; i++) {
        cells[i].onclick = function (e) {
            var rowIndex = this.parentNode.rowIndex;
            var colIndex = this.cellIndex;
            if (this.innerHTML == "" && isValid(rowIndex, colIndex)) {
                if (count) {
                    this.innerHTML = whitePiece;
                    board[rowIndex][colIndex] = 1;
                } else {
                    this.innerHTML = blackPiece;
                    board[rowIndex][colIndex] = 0;
                }
                // Exchange player's turn
                exchangeTurn();
                // Check if computer has way to go 
                var noWay = false;
                while (1) {
                    if (stepAvailable()) {
                        if (count) { // Computer's turn
                            //stepByComputer();
                            placePieceComputer();
			    exchangeTurn();
                        } else { // Player's turn, wait
                            break;
                        }
                    } else {
                        if (noWay) { // Game over
                            overMsg();
			    count = 0;
		            initTable();
                            break;
                        }
                        exchangeTurn();
                        noWay = true;
                    }
                }
            }
        }
    }
    // Place for pieces in the middle of the board
    var x = (rowSize >> 1) - 1;
    var y = (colSize >> 1) - 1;
    var index = x * colSize + y;
    cells[index].innerHTML = blackPiece;
    board[x][y] = 0;
    y++;
    index = x * colSize + y;
    cells[index].innerHTML = whitePiece;
    board[x][y] = 1;
    x++;
    y--;
    index = x * colSize + y;
    cells[index].innerHTML = whitePiece;
    board[x][y] = 1;
    y++;
    index = x * colSize + y;
    cells[index].innerHTML = blackPiece;
    board[x][y] = 0;

    // Init player turn
//    count = playerComputer;
    var playTurn = document.getElementById("playerTurn");
    playTurn.innerHTML = blackPiece + " Turn";
    if (count == playerComputer) {
placePieceComputer();
exchangeTurn();

}
}

function adjustTableSize() {
    var tableSize = document.getElementById("tableSizeSelection").value;
    switch (tableSize) {
        case "small":
            rowSize = sizeSmall; 
            colSize = sizeSmall;
            break;
        case "medium": 
            rowSize = sizeMedium;
            colSize = sizeMedium;
            break;
        case "large":
            rowSize = sizeLarge;
            colSize = sizeLarge;
            break;
    }
    initTable();
}

function adjustGameMode() {
    var mode = document.getElementById("gameModeSelection").value;
switch (mode) {
    case "easy":
        gameMode = modeEasy;
        break;
    case "medium":
        gameMode = modeMedium;
        break;
    case "hard":
        gameMode = modeHard;
        break;
}

}
function changeTurn() {
    var turn = document.getElementById("turnSelection").value;
    switch (turn) {
    case "Player":
        count = 0;
        break;
    case "Computer":
        count = 1;
        break;
    }
}
