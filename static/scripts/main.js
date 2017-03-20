document.addEventListener("DOMContentLoaded", function() {
  let boardDim = 14
  board = buildBoard(boardDim,boardDim);
  // console.dir(board);
  setBonuses();
});

const rackSize = 7;
let board = [];

function buildBoard(rows,cols) {
  let board = [];
  // console.log(`buildBoard: ${rows} ${cols}`);
  if (rows > 0) {
    board = board.concat(buildBoard(rows-1,cols));
  }
  $('#board').append(`<div id="row_${rows}" class="boardRow">`);
  board.push(buildRow(rows,cols));
  // $('#board').append(`</div>`);
  return board;
}

function buildRow(rowNum,colNum) {
  // console.log(`buildRow: ${rowNum} ${colNum}`);
  let boardRow = [];
  if (colNum > 0) {
    boardRow = boardRow.concat(buildRow(rowNum,colNum-1));
  }
  let position = {
      bonus: 'empty_position',
      row: rowNum,
      col: colNum,
      fixedLetter: '',
      playedLetter: '',
    };
  $(`#row_${rowNum}`).append(`<div id="${rowNum}_${colNum}" class="position ${position.bonus}" data="${rowNum}_${colNum}"></div>`);
  boardRow.push(position)
  return boardRow;
}

function placeLetter(row,col,letter) {
  if (board[row][col].bonus != '') {
    switch (board[row][col].bonus) {
      case 'start_position':
        $(`#${row}_${col}`).removeClass('start_position');
      break;
      case 'triple_word_position':
        $(`#${row}_${col}`).removeClass('triple_word_position');
      break;
      case 'double_word_position':
        $(`#${row}_${col}`).removeClass('double_word_position');
      break;
      case 'triple_letter_position':
        $(`#${row}_${col}`).removeClass('triple_letter_position');
      break;
      case 'double_letter_position':
        $(`#${row}_${col}`).removeClass('double_letter_position');
      break;
      default:
      $(`#${row}_${col}`).removeClass('empty_position');
    }
  }
  $(`#${row}_${col}`).addClass(letter+'tile');
  board[row][col].playedLetter = letter;
}

function removeLetter(row,col) {
  $(`#${row}_${col}`).removeClass(letter+'tile');
  board[row][col].playedLetter = '';
  if (board[row][col].bonus != '') {
    switch (board[row][col].bonus) {
      case 'start_position':
        $(`#${row}_${col}`).addClass('start_position');
      break;
      case 'triple_word_position':
        $(`#${row}_${col}`).addClass('triple_word_position');
      break;
      case 'double_word_position':
        $(`#${row}_${col}`).addClass('double_word_position');
      break;
      case 'triple_letter_position':
        $(`#${row}_${col}`).addClass('triple_letter_position');
      break;
      case 'double_letter_position':
        $(`#${row}_${col}`).addClass('double_letter_position');
      break;
      default:
      $(`#${row}_${col}`).addClass('empty_position');
    }
  }
}

function finalizeLetter(row,col) {
  board[row][col].fixedLetter = board[row][col].playedLetter;
}

function setTile(row,col,bonus) {
  // console.log(`${row} : ${col} : ${board[row][col]} : ${board[row][col].bonus} : ${bonus}`);
  board[row][col][bonus] = bonus;
  $(`#${row}_${col}`).addClass(bonus);
}

function setBonuses() {
  setStartPosition();
  setTripleWordScores();
  setDoubleWordScores();
  setTripleLetterScores();
  setDoubleLetterScores();
}

function setStartPosition() {
  setTile(7,7,'start_position');
}

function setTripleWordScores() {
  setTile(0,0,'triple_word_position');
  setTile(0,7,'triple_word_position');
  setTile(0,14,'triple_word_position');
  setTile(7,0,'triple_word_position');
  setTile(7,14,'triple_word_position');
  setTile(14,0,'triple_word_position');
  setTile(14,7,'triple_word_position');
  setTile(14,14,'triple_word_position');
}

function setDoubleWordScores() {
  setTile(1,1,'double_word_position');
  setTile(2,2,'double_word_position');
  setTile(3,3,'double_word_position');
  setTile(4,4,'double_word_position');
  setTile(13,1,'double_word_position');
  setTile(12,2,'double_word_position');
  setTile(11,3,'double_word_position');
  setTile(10,4,'double_word_position');
  setTile(1,13,'double_word_position');
  setTile(2,12,'double_word_position');
  setTile(3,11,'double_word_position');
  setTile(4,10,'double_word_position');
  setTile(13,13,'double_word_position');
  setTile(12,12,'double_word_position');
  setTile(11,11,'double_word_position');
  setTile(10,10,'double_word_position');
}

function setTripleLetterScores() {
  setTile(1,5,'triple_letter_position');
  setTile(1,9,'triple_letter_position');
  setTile(5,1,'triple_letter_position');
  setTile(5,5,'triple_letter_position');
  setTile(5,9,'triple_letter_position');
  setTile(5,13,'triple_letter_position');
  setTile(9,1,'triple_letter_position');
  setTile(9,5,'triple_letter_position');
  setTile(9,9,'triple_letter_position');
  setTile(9,13,'triple_letter_position');
  setTile(13,5,'triple_letter_position');
  setTile(13,9,'triple_letter_position');
}

function setDoubleLetterScores() {
  setTile(0,3,'double_letter_position');
  setTile(0,11,'double_letter_position');
  setTile(2,6,'double_letter_position');
  setTile(2,8,'double_letter_position');
  setTile(3,0,'double_letter_position');
  setTile(3,7,'double_letter_position');
  setTile(3,14,'double_letter_position');
  setTile(6,2,'double_letter_position');
  setTile(6,6,'double_letter_position');
  setTile(6,8,'double_letter_position');
  setTile(6,12,'double_letter_position');
  setTile(7,3,'double_letter_position');
  setTile(7,11,'double_letter_position');
  setTile(14,3,'double_letter_position');
  setTile(14,11,'double_letter_position');
  setTile(12,6,'double_letter_position');
  setTile(12,8,'double_letter_position');
  setTile(11,0,'double_letter_position');
  setTile(11,7,'double_letter_position');
  setTile(11,14,'double_letter_position');
  setTile(8,2,'double_letter_position');
  setTile(8,6,'double_letter_position');
  setTile(8,8,'double_letter_position');
  setTile(8,12,'double_letter_position');
}
