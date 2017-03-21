document.addEventListener("DOMContentLoaded", function() {
  let boardDim = 14
  board = buildBoard(boardDim,boardDim);
  setBonuses();
  fillTileBag();
  addPlayers(playerCount);
  fillRack(players);
  displayRack(players,playerCount);
  setButtonEvents()
});

const rackSize = 7;
const playerCount = 4;
let board = [];
let tileBag = [];
let players = [];
let currentPlayer = 1;
let selectedTile = '';

function addPlayers(count) {
  if (count > 0) {
    addPlayers(count-1);
    players.push({
      id:count-1,
      score:0,
      tiles:[]
    });
    $(`#players`).append(`<div id="player_${count-1}" class="tile_rack"></div>`);
    $(`#player_${count-1}`).append(`<div class="h4 text-left player_title">Player ${count-1} - Score: ${players[count-1].score}</div>`);
  }
}

function setButtonEvents() {
  $('#next_player').click(nextPlayer);
  let positions = $(`.position`);
  setPositionEvents(positions,positions.length-1);
}

function overPosition(e) {
  if (selectedTile != '') {
    let position = $(e.target);
    let row = $(position).attr('id').split('_')[0];
    let col = $(position).attr('id').split('_')[1];
    if (board[row][col].playedLetter == '' && board[row][col].fixedLetter == '') {
      let bonus = board[row][col].bonus;
      position.removeClass(bonus);
      position.addClass($(`#${selectedTile}`).data('tile'));
    }
  }
}

function outPosition(e) {
  if (selectedTile != '') {
      let position = $(e.target);
    let row = $(position).attr('id').split('_')[0];
    let col = $(position).attr('id').split('_')[1];
    if (board[row][col].playedLetter == '' && board[row][col].fixedLetter == '') {
      let bonus = board[row][col].bonus;
      position.addClass(bonus);
      position.removeClass($(`#${selectedTile}`).data('tile'));
    }
  }
}

function placeTile(e) {
  console.log('placeTile');
  let position = $(e.target);
  let row = $(position).attr('id').split('_')[0];
  let col = $(position).attr('id').split('_')[1];
  if (selectedTile != '' && board[row][col].fixedLetter == '') {
    if (board[row][col].playedLetter == '') {
      console.log('currently empty '+$(`#${selectedTile}`).data('tile'));

      let bonus = board[row][col].bonus;
      position.addClass($(`#${selectedTile}`).data('tile'));
      position.removeClass(bonus);
      $(`#${selectedTile}`).addClass('placedTile')
      board[row][col].playedLetter = selectedTile;
      selectedTile = '';
    }
  } else if (selectedTile == '' && board[row][col].playedLetter != '') {
    //TODO return tile to rack (i.e. change it's class from played.)
    let removedTile = board[row][col].playedLetter;
    position.addClass(removedTile+'_tile');
  }
}

function setPositionEvents(positions,count) {
  if (count > 0) {
    let position = positions[count];
    $(position).hover(overPosition,outPosition);
    $(position).click(placeTile);
    setPositionEvents(positions,count-1);
  }
}

function nextPlayer() {
  if (currentPlayer == playerCount - 1) {
    currentPlayer = 0;
  } else {
    currentPlayer++;
  }
  clearRack(players,playerCount);
  displayRack(players,playerCount);
}

function clearRack(players,id) {
  if (id > 0) {
    let player = players[id-1];
    clearRack(players,id-1);
    $(`#player_${id-1}`).empty();
    $(`#player_${id-1}`).append(`<div class="h4 text-left player_title">Player ${id-1} - Score: ${players[id-1].score}</div>`);
  }
}

function displayRack(players,id) {
  if (id > 0) {
    let player = players[id-1];
    displayRack(players,id-1);
    appendTiles(player.id,player.tiles.length)
  }
}

function appendTiles(playerId,count) {
  if (count > 0) {
    let tiles = appendTiles(playerId,count-1);
    $(`#player_${playerId}`).append(`<div id="player_${playerId}_tile_${count}" class="${playerId == currentPlayer ? players[playerId].tiles[count-1] + '_tile' : 'blank_tile'} rack_tile ${playerId == currentPlayer ? ' currentPlayer' : ''}"></div>`);
    $(`#player_${playerId}_tile_${count}`).data( "tile", players[playerId].tiles[count-1]+ '_tile');
    if (playerId == currentPlayer) {
      $(`#player_${playerId}_tile_${count}`).click(selectTile);
    }
  }
}

function selectTile(e) {
  let playerId = $(e.target).attr('id').substring(7,8);
  unselectTiles(playerId,players[playerId].tiles.length);
  if (selectedTile != $(e.target).attr('id')) {
    $(e.target).addClass('selectedTile');
    selectedTile = $(e.target).attr('id');
  } else {
    selectedTile = '';
    $(e.target).removeClass('selectedTile');
  }
}

function unselectTiles(playerId,count) {
  if (count > 0) {
    let player = players[playerId];
    unselectTiles(playerId,count-1);
    $(`#player_${playerId}_tile_${count}`).removeClass('selectedTile');
  }
}

function fillRack(players) {
  if (players.length > 0) {
    let player = players.pop();
    fillRack(players);
    player.tiles = pickTiles(7-player.tiles.length);
    players.push(player);
  }
}

function pickTiles(count) {
  let tiles = [];
  if (count > 0 ) {
    tiles = pickTiles(count-1);
    let randomTile = tileBag.splice(Math.floor(Math.random()*tileBag.length),1)[0]
    tiles.push(randomTile);
  }
  return tiles;
}

function fillTileBag() {
  addLetterToBag('a', 9);
  addLetterToBag('b', 2);
  addLetterToBag('c', 2);
  addLetterToBag('d', 4);
  addLetterToBag('e', 12);
  addLetterToBag('f', 2);
  addLetterToBag('g', 3);
  addLetterToBag('h', 2);
  addLetterToBag('i', 9);
  addLetterToBag('j', 1);
  addLetterToBag('k', 1);
  addLetterToBag('l', 4);
  addLetterToBag('m', 2);
  addLetterToBag('n', 6);
  addLetterToBag('o', 8);
  addLetterToBag('p', 2);
  addLetterToBag('q', 1);
  addLetterToBag('r', 6);
  addLetterToBag('s', 4);
  addLetterToBag('t', 6);
  addLetterToBag('u', 4);
  addLetterToBag('v', 2);
  addLetterToBag('w', 2);
  addLetterToBag('x', 1);
  addLetterToBag('y', 2);
  addLetterToBag('z', 1);
  addLetterToBag('blank', 2);
}

function addLetterToBag(letter, count) {
  if (count > 0) {
    addLetterToBag(letter,count-1);
    tileBag.push(letter);
  }
}

function buildBoard(rows,cols) {
  let board = [];
  if (rows > 0) {
    board = board.concat(buildBoard(rows-1,cols));
  }
  $('#board').append(`<div id="row_${rows}" class="boardRow">`);
  board.push(buildRow(rows,cols));
  return board;
}

function buildRow(rowNum,colNum) {
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
  board[row][col]['bonus'] = bonus;
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
