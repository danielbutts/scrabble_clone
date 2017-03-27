
document.addEventListener("DOMContentLoaded", function() {
  board = buildBoard(boardDim,boardDim);
  setBonuses();
  fillTileBag();
  addPlayers(playerCount);
  fillRack(players);
  displayRack(players,playerCount);
  setButtonEvents()
});

let boardDim = 14
const rackSize = 7;
const playerCount = 4;
let board = [];
let tileBag = [];
let players = [];
let currentPlayer = 1;
let selectedTile = '';
let wordsToValidate = [];

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

// recurses over an array of objects and returns the largest
// value for a specified field
function maxOfField(arr,field,idx) {
  let max = arr[idx-1][field];
  if (idx > 1) {
    max = maxOfField(arr,field,idx-1)
  }
  if (arr[idx-1][field] > max) {
    max = arr[idx-1][field];
  }
  return max;
}

// recurses over an array of objects and returns the largest
// value for a specified field
function minOfField(arr,field,idx) {
  let min = arr[idx-1][field];
  if (idx > 1) {
    min = minOfField(arr,field,idx-1)
  }
  if (arr[idx-1][field] < min) {
    min = arr[idx-1][field];
  }
  return min;
}

function submitWord() {
  // playedWords = [{
  //   direction : 'horizontal',
  //   startRow : 3,
  //   startCol : 4,
  //   length : 5
  // }]


  let playedTiles = getPlayedTiles(boardDim,boardDim);
  if (!validatePlacement(playedTiles)) {
    return false;
  }

  let wordsValid = validateWords();
  if (wordsValid) {
    scoreWords();
  } else {
    returnTilesToRack();
    nextPlayer();
  }
}

function validateWords() {
  console.error('validateWord not implemented!')

  // let minCol = minOfField(playedTiles,'col',playedTiles.length);
  // let maxCol = maxOfField(playedTiles,'col',playedTiles.length);
  // let minRow = minOfField(playedTiles,'row',playedTiles.length);
  // let maxRow = maxOfField(playedTiles,'row',playedTiles.length);
  //
  // let direction;
  // if (maxCol-minCol > 0) {
  //   direction = 'horizontal'
  // } else if (maxRow-minRow > 0) {
  //   direction = 'vertical'
  // }
  //
  // let tile = board[minRow][minCol];
  // let word = '';
  // if (direction == 'horizontal') {
  //   word = buildRight(tile);
  // } else if (direction == 'vertical') {
  //   word = buildDown(tile);
  // } else {
  //   // console.log(`row ${minRow} col ${minCol}`);
  //   // console.log(board[minRow][minCol]);
  //   word = board[minRow][minCol].playedLetter.split('_')[0];
  // }
  // let idx = binaryFind(word,words,0,words.length-1)
  // if (idx == -1) {
  //   $('#message').text(`The word '${word}' is not valid.`);
  //   return false;
  // }
}

function scoreWords () {
  console.error('scoreWord not implemented!');
}

function binaryFind(item,arr,start,end) {
  let idx = -1;
  if (item == arr[start]) {
    return start;
  }
  if (item == arr[end]) {
    return end;
  }
  if (start == end) {
    return -1;
  }
  let mid = Math.floor((end+start)/2);
  if (item == arr[mid]) {
    return mid;
  }

  if (item < arr[mid]) {
    if (mid - start == 1) {
      return -1;
    }
    idx = binaryFind(item,arr,start+1,mid);
  } else {
    if (end - mid == 1) {
      return -1;
    }
    idx = binaryFind(item,arr,mid,end-1);
  }
  return idx;
}

function checkIfTilesPlayed(playedTiles) {
  if (playedTiles.length == 0) {
    return { valid: false, message : 'You must play at least one tile.' };
  }
  return { valid: true };
}

function checkIfFirstPlayOnStar() {
  if (board[7][7].playedLetter == '' && board[7][7].fixedLetter == '') {
    return { valid: false, message : 'The first word must cover the star.' };
  }
  return { valid: true };
}

function checkIfTilesAligned(playedTiles, idx) {
  if (playedTiles.length == 1) {
    return true;
  }
  let alignment;
  // alignment =  false or { row : 1, col : 2 }

  let currentRow = playedTiles[idx].row;
  let currentCol = playedTiles[idx].col;

  if (idx > 0) {
    alignment = checkIfTilesAligned(playedTiles, idx-1);  // recurse through tiles
    if (alignment == false) {  // once it fails, bubble the failure up
      return false;
    }
  }

  if (alignment == undefined) { // first tile
    return { row : currentRow, col : currentCol };
  }

  if (alignment.direction == undefined) { // second tile
      // check that tile does not differ in both row and column from first tile
      if (currentRow != alignment.row && currentCol != alignment.col ) {
        return false;
      }

      // set direction based on second tile
      if (currentRow == alignment.row) {
        dir = 'horizontal';
      } else {
        dir = 'vertical';
      }
      return { row : currentRow, col : currentCol, direction : dir };
  }

  if (alignment.direction == 'horizontal' && currentRow != alignment.row) {
    return false;
  } else if (alignment.direction == 'vertical' && currentCol != alignment.col) {
    return false;
  }
  return { row : alignment.row, col : alignment.col, direction : alignment.direction };
}

// Add all words to be checked (including the played word) to a queue to be check in the same way
function checkForOtherWords(row, col, direction) {
  otherWord = false;
  if (direction = 'horizontal') {
    if (col > 0 && board[row][col - 1].fixedLetter != '') {
      otherWord = true
    }
    if (col < boardDim && board[row][col + 1].fixedLetter != '') {
      otherWord = true
    }
    if (otherWord) {
      let rightmost = seekRight(playedTiles[0].row, playedTiles[0].col);
      wordsToValidate.push(buildLeft(row,rightmost));
    }
  } else {
    if (row > 0 && board[row - 1][col].fixedLetter != '') {
      otherWord = true
    }
    if (row < boardDim && board[row + 1][col].fixedLetter != '') {
      otherWord = true
    }
    if (otherWord) {
      let bottommost = seekDown(playedTiles[0].row, playedTiles[0].col);
      wordsToValidate.push(buildUp(bottommost,col));
    }
  }
}

// starting from the bottommost tile in the contiguous word, recurse through the
// word and build it from the top.
function buildUp(row, col) {
  // checkForOtherWords(row, col, 'horizontal')
  console.log(`buildUp ${row} ${col}`);
  checkForOtherWords(row, col, 'horizontal');
  let word = [];
  let letter = board[row][col].fixedLetter || board[row][col].playedLetter;
  if (row > 0 && letter != '') {
    word = buildUp(row - 1, col);
  }
  if (letter != '') {
    word.push({
      row : row,
      col : col,
      letter : letter.split('_')[0],
      bonus : board[row][col].bonus,
      played : (board[row][col].playedLetter != undefined)
    })
  }
  return word;
}

// starting from the rightmost tile in the contiguous word, recurse through the
// word and build it from the left.
function buildLeft(row, col) {
  console.log(`buildLeft ${row} ${col}`);
  checkForOtherWords(row, col, 'vertical');
  let word = [];
  let letter = board[row][col].fixedLetter || board[row][col].playedLetter;
  if (col > 0 && letter != '') {
    word = buildLeft(row, col - 1);
  }
  if (letter != '') {
    word.push({
      row : row,
      col : col,
      letter : letter.split('_')[0],
      bonus : board[row][col].bonus,
      played : (board[row][col].playedLetter != undefined)
    })
  }
  return word;
}

// find the righmost tile in the contiguous word
function seekRight(row, col) {
  let letter = board[row][col].playedLetter || board[row][col].fixedLetter;
  let rightmost;
  console.log(letter);
  if (letter == '') {
    rightmost = col - 1;
  } else if (col < boardDim && letter != '') {
    rightmost = seekRight(row,col + 1);
  } else {
    rightmost = col;
  }
  return rightmost;
}

// find the bottommost tile in the contiguous word
function seekDown(row, col) {
  let letter = board[row][col].playedLetter || board[row][col].fixedLetter;
  let bottommost;
  console.log(letter);
  if (letter == '') {
    bottommost = row - 1;
  } else if (col < boardDim && letter != '') {
    bottommost = seekDown(row + 1,col);
  } else {
    bottommost = row;
  }
  return bottommost;
}

function getPlayedTileCountFromWord(word, idx) {
  let count = 0;
  if (idx > 0) {
    count = count + getPlayedTileCountFromWord(word, idx - 1)
  }
  console.log(idx);
  if (word[idx].played) {
    count++;
  }
  // console.log(`played letters in word: ${count}`);
  return count;
}

function returnTilesToRack(playedTiles) {
  console.error('returnTilesToRack not implemented!')
}

function validatePlacement(playedTiles) {
  let word;
  $('#message').text(''); // clear out any previous message

  // ensure that at least one tile was played
  let tilePlayed = checkIfTilesPlayed(playedTiles);
  if (!tilePlayed.valid) {
    $('#message').text(tilePlayed.message)
    return false;
  }

  // ensure the first word played covers the center star
  let starPlayed = checkIfFirstPlayOnStar();
  if (!starPlayed.valid) {
    $('#message').text(starPlayed.message)
    return false;
  }

  let row = playedTiles[0].row;
  let col = playedTiles[0].col;
  if (playedTiles.length > 1) {
    let tilesAligned = checkIfTilesAligned(playedTiles, playedTiles.length-1);
    if (!tilesAligned) {
      $('#message').text('Tiles must be placed vertically or horiontally.');
      return false;
    }

    console.log('direction '+tilesAligned.direction);
    if (tilesAligned.direction == 'vertical') {
      let bottommost = seekDown(row, col);
      word = buildUp(bottommost,col);
    } else {
      let rightmost = seekRight(row, col);
      word = buildLeft(row,rightmost);
    }

    let playedCount = getPlayedTileCountFromWord(word, word.length - 1);
    if (playedCount < playedTiles.length) {
      $('#message').text(`There can't be any spaces between played tiles.`)
      return false;
    }
  } else {

    word = [{
      row : row,
      col : col,
      letter : letter.split('_')[0],
      bonus : board[row][col].bonus,
      played : true
    }]
  }

  // Check for adjacency to existing word.
  console.log(word);
  if (!checkAdjacency(word, word.length-1)) {
    $('#message').text(`Your word must connect to an existing word.`)
    return false;
  }

  $('#message').text('Placement is valid.');
  wordsToValidate.push(word);
  return true;
}

function checkAdjacency(word, idx) {
  console.log(`letter ${word[idx].letter} idx ${idx}`);
  if (wordsToValidate.length > 0 ) {
    return true; // other connected words were found.
  }
  if (idx > 0) {
    if (checkAdjacency(word, idx - 1)) {
      return true;
    }
  }
  if (word[idx].fixedLetter != '') {
    return true;
  }
  return false;
}

function getPlayedTiles(row,col) {
  let playedTiles = [];
  if (col > 0) {
    playedTiles = getPlayedTiles(row,col - 1);
  } else if (row > 0){
    playedTiles = getPlayedTiles(row-1,boardDim);
  }
  // console.log($(board[row][col])[0]);
  if ($(board[row][col])[0].playedLetter != '') {
    // console.log($(board[row][col])[0]);
      playedTiles.push({
        row:row,
        col:col,
        letter:$(board[row][col])[0].playedLetter
    });
  }
  return playedTiles;
}

function setButtonEvents() {
  $('#pass_button').click(nextPlayer);
  $('#submit_button').click(submitWord);
  let positions = $(`.position`);
  setPositionEvents(positions,positions.length);
}

function overPosition(e) {
  let position = $(e.target).closest("div");
  let row = $(position).attr('id').split('_')[1];
  let col = $(position).attr('id').split('_')[2];
  // console.log(`${row} ${col}`);
  if (selectedTile != '') {
    if (board[row][col].playedLetter == '' && board[row][col].fixedLetter == '') {
      let bonus = board[row][col].bonus;
      position.removeClass(bonus);
      position.addClass($(`#${selectedTile}`).data('tileType'));
    }
  }
}

function outPosition(e) {
  if (selectedTile != '') {
      let position = $(e.target).closest("div");
    let row = $(position).attr('id').split('_')[1];
    let col = $(position).attr('id').split('_')[2];
    if (board[row][col].playedLetter == '' && board[row][col].fixedLetter == '') {
      let bonus = board[row][col].bonus;
      position.addClass(bonus);
      position.removeClass($(`#${selectedTile}`).data('tileType'));
    }
  }
}

function placeTile(e) {
  let position = $(e.target);
  let row = $(position).attr('id').split('_')[1];
  let col = $(position).attr('id').split('_')[2];
  let bonus = board[row][col].bonus;

  if (selectedTile != '' && board[row][col].fixedLetter == '') {
    if (board[row][col].playedLetter == '') {

      position.addClass($(`#${selectedTile}`).data('tileType'));
      position.addClass('placed');
      position.data('playedTile',selectedTile);
      position.removeClass(bonus);
      let rackPos = selectedTile.split('_')[2];
      players[currentPlayer].tiles[rackPos] = '';
      $(`#${selectedTile}`).data('position',`${row}_${col}`);
      $(`#${selectedTile}`).removeClass($(`#${selectedTile}`).data('tileType'));
      $(`#${selectedTile}`).addClass('empty_position');
      board[row][col].playedLetter = $(`#${selectedTile}`).data('tileType');
      selectedTile = '';
    }
  } else if (selectedTile == '' && board[row][col].playedLetter != '') {
    let player = position.data('playedTile').split('_')[1];
    let rackPos = position.data('playedTile').split('_')[2];
    let letter = board[row][col].playedLetter.split('_')[0];
    players[player].tiles[rackPos] = letter;
    $(`#rack_${player}_${rackPos}`).removeData('position');
    $(`#rack_${player}_${rackPos}`).addClass(`${letter}_tile`);
    $(`#rack_${player}_${rackPos}`).removeClass('empty_position');
    position.removeData('playedTile')
    board[row][col].playedLetter = '';
    position.addClass(bonus);
    position.removeClass(`${letter}_tile`);
  }
  unselectTiles(currentPlayer,players[currentPlayer].tiles.length);
}

function setPositionEvents(positions,count) {
  if (count > 0) {
    let position = positions[count-1];
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

    let tileClass = '';
    if (playerId == currentPlayer) {
      if (players[playerId].tiles[count-1] == '') {
        tileClass = 'empty_position';
      } else {
        tileClass = players[playerId].tiles[count-1] + '_tile';
      }
    } else {
      tileClass = 'blank_tile';
    }

    let currentClass = '';
    if (playerId == currentPlayer) {
      currentClass = ' currentPlayer';
    }

    // player tile div id format - rack_{player id}_{rack position}
    // (e.g. - 1_2 is player 1 [2nd player] and tile position 2 [3rd tile])
    $(`#player_${playerId}`).append(`<div id="rack_${playerId}_${count-1}" class="${tileClass} rack_tile ${currentClass}"></div>`);

    $(`#rack_${playerId}_${count-1}`).data('tileType', players[playerId].tiles[count-1]+ '_tile');
    if (playerId == currentPlayer) {
      $(`#rack_${playerId}_${count-1}`).click(selectTile);
    }
  }
}

function selectTile(e) {
  let playerId = $(e.target).attr('id').substring(5,6);
    $(e.target).addClass('fixed');
  unselectTiles(playerId,players[playerId].tiles.length);
  if (!$(e.target).hasClass('placedTile') && selectedTile != $(e.target).attr('id')) {
    $(e.target).addClass('fixed');
    selectedTile = $(e.target).attr('id');
  } else {
    selectedTile = '';
    $(e.target).removeClass('fixed');
  }
}

function unselectTiles(playerId,count) {
  if (count > 0) {
    let player = players[playerId];
    unselectTiles(playerId,count-1);
    $(`#rack_${playerId}_${count-1}`).removeClass('fixed');
    // console.log(`#rack_${playerId}_${count-1}`);
    // console.log($(`#rack_${playerId}_${count-1}`));
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

  // position div id format - board_{row}_{col}
  // (e.g. - board_1_2 is the 3rd tile from the left on the second row from the top )
  let position = {
      bonus: 'empty_position',
      row: rowNum,
      col: colNum,
      fixedLetter: '',
      playedLetter: '',
    };
  $(`#row_${rowNum}`).append(`<div id="board_${rowNum}_${colNum}" class="position ${position.bonus}"></div>`);
  boardRow.push(position)
  return boardRow;
}

function finalizeLetter(row,col) {
  board[row][col].fixedLetter = board[row][col].playedLetter;
}

function setTile(row,col,bonus) {
  board[row][col]['bonus'] = bonus;
  $(`#board_${row}_${col}`).addClass(bonus);
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
