
document.addEventListener("DOMContentLoaded", function() {
  board = buildBoard(boardDim,boardDim);
  setBonuses();
  fillTileBag();
  // displayRack(players,playerCount);
  setButtonEvents()
});

let boardDim = 14
const rackSize = 7;
let playerCount = 4;
let board = [];
let tileBag = [];
let players = [];
let currentPlayer = 0;
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

function fixTiles(playedTiles) {
  if (playedTiles.length > 0) {
    let tile = playedTiles.pop();
    fixTiles(playedTiles);
    board[tile.row][tile.col].fixedLetter = tile.letter;
    board[tile.row][tile.col].playedLetter = '';
    $(`#board_${tile.row}_${tile.col}`).addClass('fixed');
    // console.log(tile);
  }
}

function clearInvalidTiles(playedTiles) {
  // console.log(playedTiles);
  if (playedTiles.length > 0) {
    let tile = playedTiles.pop();
    clearInvalidTiles(playedTiles);
    let row = tile.row;
    let col = tile.col;
    // console.log(board[row][col]);
    let bonus = board[row][col].bonus
    let letter = board[row][col].playedLetter;
    board[row][col].fixedLetter = '';
    board[row][col].playedLetter = '';
    let position = $(`#board_${row}_${col}`);
    position.removeClass(tile.letter);
    position.addClass(bonus);
    position.removeClass('placed');
    $(board[row][col]).data('playedTile',undefined);
    // console.log(players[currentPlayer].tiles)
    returnTileToRack(letter,players[currentPlayer].tiles.length - 1)
  }
}

function returnTileToRack(letter,idx) {
  returned = false;
  if (idx > 0) {
    returned = returnTileToRack(letter,idx - 1);
  }
  let player = players[currentPlayer];

  if (!returned && player.tiles[idx] == '') {
    player.tiles[idx] = letter.split('_')[0];
    returned = true;
  }

  return returned;
}

function submitWord() {
  let playedTiles = getPlayedTiles(boardDim,boardDim);
  if (!validatePlacement(playedTiles)) {
    return false;
  }

  let wordsValid = validateWords();
  if (wordsValid) {
    players[currentPlayer].score += scoreWords();
    fixTiles(playedTiles);
    refillRack(currentPlayer,rackSize);
    clearRacks(players,playerCount);
    wordsToValidate = [];

  } else {
    clearInvalidTiles(playedTiles);
    wordsToValidate = [];

    // returnTilesToRack(playedTiles);
  }
  nextPlayer();
}

function assembleWord(word, idx) {
  let wordStr = '';
  if (idx > 0) {
    wordStr = assembleWord(word, idx - 1);
  }
  wordStr = wordStr + word[idx].letter;
  return wordStr;
}

function validateWords() {
  console.log(`validateWords ${wordsToValidate.length}` );
  for (let word of wordsToValidate) {
    let wordStr = assembleWord(word, word.length - 1);
    let idx = binaryFind(wordStr,words,0,words.length-1)
    if (idx == -1) {
      console.log(wordStr + ' ' + idx);
      $('#message').text(`The word '${wordStr}' is not valid.`);
      return false;
    }
  }
  return true;
}

let tileValues = {
  a : 1,
  b : 3,
  c : 3,
  d : 2,
  e : 1,
  f : 4,
  g : 2,
  h : 4,
  i : 1,
  j : 8,
  k : 5,
  l : 1,
  m : 3,
  n : 1,
  o : 1,
  p : 3,
  q : 10,
  r : 1,
  s : 1,
  t : 1,
  u : 1,
  v : 4,
  w : 4,
  x : 8,
  y : 4,
  z : 10
}

function scoreWord(word, idx) {
  let scoreObj = { score : 0, multiple : 1 };
  if (idx > 0) {
    scoreObj = scoreWord(word, idx - 1);
  }
  let letterScore = tileValues[word[idx].letter];
  console.log(`letterScore ${letterScore} ${word[idx].letter}`);
  if (word[idx].played) {
    switch (word[idx].bonus) {
      case 'double_letter_position':
        letterScore = letterScore * 2;
      break;
      case 'triple_letter_position':
        letterScore = letterScore * 3;
      break;
      case 'double_word_position':
        scoreObj.multiple = scoreObj.multiple * 2;
      break;
      case 'start_position':
        scoreObj.multiple = scoreObj.multiple * 2;
      break;
      case 'triple_word_position':
        scoreObj.multiple = scoreObj.multiple * 3;
      break;
    }
  }
  scoreObj.score = scoreObj.score + letterScore;
  console.log(scoreObj);
  return scoreObj;
}

function scoreWords () {
  let score = 0;
  for (let word of wordsToValidate) {
    let scoreObj =  scoreWord(word, word.length - 1);
    score = score + scoreObj.score * scoreObj.multiple;
  }
  console.log(score);
  return score;
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
  if (direction == 'horizontal') {
    if (col > 0 && board[row][col - 1].fixedLetter != '') {
      otherWord = true
    }
    if (col < boardDim && board[row][col + 1].fixedLetter != '') {
      otherWord = true
    }
    if (otherWord) {
      console.log(`checkForOtherWords calling seekRight ${row} ${col} ${wordsToValidate.length}`);
      let rightmost = seekRight(row, col);
      wordsToValidate.push(buildLeft(row,rightmost,true));
    }
  } else {
    if (row > 0 && board[row - 1][col].fixedLetter != '') {
      otherWord = true
    }
    if (row < boardDim && board[row + 1][col].fixedLetter != '') {
      otherWord = true
    }
    if (otherWord) {
      let bottommost = seekDown(row, col);
      wordsToValidate.push(buildUp(bottommost,col,true));
    }
  }
}

// starting from the bottommost tile in the contiguous word, recurse through the
// word and build it from the top.
function buildUp(row, col,shouldCheck) {
  console.log(`buildUp ${row} ${col} horizontal`);
  if (board[row][col].playedLetter != '' && shouldCheck) {
    checkForOtherWords(row, col, 'horizontal');
  }
  let word = [];
  let letter = board[row][col].fixedLetter || board[row][col].playedLetter;
  if (row > 0 && letter != '') {
    word = buildUp(row - 1, col,shouldCheck);
  }
  if (letter != '') {

    word.push({
      row : row,
      col : col,
      letter : letter.split('_')[0],
      bonus : board[row][col].bonus,
      played : (board[row][col].playedLetter != '')
    })
  }
  return word;
}

// starting from the rightmost tile in the contiguous word, recurse through the
// word and build it from the left.
function buildLeft(row, col, shouldCheck) {
  console.log(`buildLeft ${row} ${col} vertical`);
  if (board[row][col].playedLetter != '' && shouldCheck) {
    checkForOtherWords(row, col, 'vertical');
  }
  let word = [];
  let letter = board[row][col].fixedLetter || board[row][col].playedLetter;
  if (col > 0 && letter != '') {
    word = buildLeft(row, col - 1, shouldCheck);
  }
  if (letter != '') {
    word.push({
      row : row,
      col : col,
      letter : letter.split('_')[0],
      bonus : board[row][col].bonus,
      played : (board[row][col].playedLetter != '')
    })
  }
  return word;
}

// find the righmost tile in the contiguous word
function seekRight(row, col) {
  let letter = board[row][col].playedLetter || board[row][col].fixedLetter;
  console.log(`seekRight ${row} ${col} ${letter}`);
  let rightmost;
  // console.log(letter);
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
  // console.log(letter);
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
  // console.log(idx);
  if (word[idx].played) {
    count++;
  }
  // console.log(`played letters in word: ${count}`);
  return count;
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

    // console.log('direction '+tilesAligned.direction);
    if (tilesAligned.direction == 'vertical') {
      let bottommost = seekDown(row, col);
      word = buildUp(bottommost,col,true);
    } else {
      console.log(`validatePlacement calling seekRight ${row} ${col}`);
      let rightmost = seekRight(row, col);
      word = buildLeft(row,rightmost,true);
    }

    let playedCount = getPlayedTileCountFromWord(word, word.length - 1);
    if (playedCount < playedTiles.length) {
      $('#message').text(`There can't be any spaces between played tiles.`)
      return false;
    }

    let isAdjacent = checkAdjacency(word, word.length-1);
    console.log(`isAdjacent ${isAdjacent}`);
    if (!isAdjacent) {
      $('#message').text(`Your word must connect to an existing word.`)
      return false;
    }
    wordsToValidate.push(word);

  } else {
    console.log(`Single Letter Word`);
    let rightmost = seekRight(row, col);
    horizontalWord = buildLeft(row,rightmost,false);
    if (horizontalWord.length > 1 ) {
      wordsToValidate.push(horizontalWord);
    }
    let bottommost = seekDown(row, col);
    verticalWord = buildUp(bottommost,col,false);
    if (verticalWord.length > 1 ) {
      wordsToValidate.push(verticalWord);
    }
    if (wordsToValidate.length == 0) {
      wordsToValidate.push([{
        row : row,
        col : col,
        letter : board[row][col].playedLetter.split('_')[0],
        bonus : board[row][col].bonus,
        played : true
      }]);
    }
  }

  // Check for adjacency to existing word.
  // console.log(word);

  $('#message').text('Placement is valid.');
  return true;
}

function checkAdjacency(word, idx) {
  // console.log(`letter ${word[idx].letter} idx ${idx}`);
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

function setPlayerCount(e) {
  let position = $(e.target);
  playerCount = $(position).attr('id').split('_')[0];
  addPlayers(playerCount);
  fillRacks(players);
  clearRacks(players,playerCount);
  $('#playerButtons').addClass('isHidden')
  $('#players').removeClass('isHidden')
  $('#buttons').removeClass('isHidden')
  showCurrentPlayer();
}

function setButtonEvents() {
  $('#ready_button').click(showCurrentPlayer);
  $('#pass_button').click(passTurn);
  $('#submit_button').click(submitWord);
  $('#1_player_button').click(setPlayerCount);
  $('#2_player_button').click(setPlayerCount);
  $('#3_player_button').click(setPlayerCount);
  $('#4_player_button').click(setPlayerCount);
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

function passTurn() {
  let playedTiles = getPlayedTiles(boardDim,boardDim);
  clearInvalidTiles(playedTiles);
  nextPlayer();
}

function nextPlayer() {
  if (currentPlayer == playerCount - 1) {
    currentPlayer = 0;
  } else {
    currentPlayer++;
  }
  clearRacks(players,playerCount);
  $('#ready_button').removeClass('isHidden');
  $('#pass_button').addClass('isHidden');
  $('#submit_button').addClass('isHidden');
}

function showCurrentPlayer() {
  $('#message').text(``);
  $('#ready_button').addClass('isHidden');
  $('#pass_button').removeClass('isHidden');
  $('#submit_button').removeClass('isHidden');
  displayRack(players,playerCount);
}

function clearRacks(players,id) {
  if (id > 0) {
    let player = players[id-1];
    clearRacks(players,id-1);
    $(`#player_${id-1}`).empty();
    $(`#player_${id-1}`).append(`<div class="h4 text-left player_title">Player ${id-1} - Score: ${players[id-1].score}</div>`);
  }
}

function displayRack(players,idx) {
  if (idx > 0) {
    let player = players[idx-1];
    displayRack(players,idx-1);
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

function fillRacks(players) {
  if (players.length > 0) {
    let player = players.pop();
    fillRacks(players);
    player.tiles = pickTiles(7-player.tiles.length);
    players.push(player);
  }
}

function refillRack(id,idx) {
  if (idx > 0) {
    refillRack(id,idx - 1);
  }
  if (tileBag.length > 0 && players[id].tiles[idx] == '') {
    players[id].tiles[idx] = pickTiles(1)[0];
  }
  // console.log(players[id].tiles);
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
  // addLetterToBag('blank', 2);
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
