var COLS = 10, ROWS = 20;
var board = [];
var lose;
var interval;
var current; //
var currentX, currentY; // position
var colors = [
    'cyan', 'orange', 'blue', 'yellow', 'red', 'green', 'purple'
];

function newShape() {

    var shape = [ Math.floor( Math.random() * colors.length ),0,
		  Math.floor( Math.random() * colors.length ),0 ]

    current = [];
    for ( var y = 0; y < 2; ++y ) {
        current[ y ] = [];
        for ( var x = 0; x < 2; ++x ) {
            var i = 2 * y + x;
            if ( typeof shape[ i] != 'undefined' && shape[ i ] ) {
                current[ y ][ x ] = shape[i];
            }
            else {
                current[ y ][ x ] = 0;
            }
        }
    }
    currentX = 5;
    currentY = 0;
}

function init() {
    // initialize board 
    for ( var y = 0; y < ROWS; ++y ) {
        board[ y ] = [];
        for ( var x = 0; x < COLS; ++x ) {
            board[ y ][ x ] = 0;
        }
    }
}

function tick() {
    if ( valid( 0, 1 ) ) {
        ++currentY;
    }
    else {
        freeze();
        clearPuyos();
        if (lose) {
            newGame();
            return false;
        }    
        newShape();
    }
}

function freeze() {
    for ( var y = 0; y < 2; ++y ) {
        for ( var x = 0; x < 2; ++x ) {
            if ( current[ y ][ x ] ) {
                board[ y + currentY ][ x + currentX ] = current[ y ][ x ];
            }
        }
    }
}

function rotate( current ) {
    var newCurrent = [];
    for ( var y = 0; y < 2; ++y ) {
        newCurrent[ y ] = [];
        for ( var x = 0; x < 2; ++x ) {
            newCurrent[ y ][ x ] = current[ 1 - x ][ y ];
        }
    }

    return newCurrent;
}

function clearPuyos() {
    // TODO
}

function keyPress( key ) {
    switch ( key ) {
        case 'left':
            if ( valid( -1 ) ) {
                --currentX;
            }
            break;
        case 'right':
            if ( valid( 1 ) ) {
                ++currentX;
            }
            break;
        case 'down':
            if ( valid( 0, 1 ) ) {
                ++currentY;
            }
            break;
        case 'rotate':
            var rotated = rotate( current );
            if ( valid( 0, 0, rotated ) ) {
                current = rotated;
            }
            break;
    }
}

function valid( offsetX, offsetY, newCurrent ) {
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;
    offsetX = currentX + offsetX;
    offsetY = currentY + offsetY;
    newCurrent = newCurrent || current;



    for ( var y = 0; y < 2; ++y ) {
        for ( var x = 0; x < 2; ++x ) {
            if ( newCurrent[ y ][ x ] ) {
                if ( typeof board[ y + offsetY ] == 'undefined'
                  || typeof board[ y + offsetY ][ x + offsetX ] == 'undefined'
                  || board[ y + offsetY ][ x + offsetX ]
                  || x + offsetX < 0
                  || y + offsetY >= ROWS
                  || x + offsetX >= COLS ) {
                    if (offsetY == 1) lose = true;
                    return false;
                }
            }
        }
    }
    return true;
}

function newGame() {
    clearInterval(interval);
    init();
    newShape();
    lose = false;
    interval = setInterval( tick, 250 );
}

newGame();