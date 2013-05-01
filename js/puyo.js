var COLS = 6, ROWS = 14;
var board = []; 
var lose;
var interval;
var current; //
var currentX, currentY; // position
var colors = ['blue', 'yellow' ,'red', 'green'];
var puyocolors = [];
var color_index =0;

function newShape() {
	col = puyocolors[color_index];
    current = [[col[0],0],[col[1],0]];
    currentX = 2;
    currentY = 1;
    color_index  = ( color_index + 1 ) % puyocolors.length;
}

function init() {
    // initialize board 
    for ( var y = 0; y < ROWS; ++y ) {
        board[ y ] = [];
        for ( var x = 0; x < COLS; ++x ) {
            board[ y ][ x ] = 0;
        }
    }
    
    for ( var y = 0; y < 128; ++y ) {
        puyocolors[ y ] = [0,0];
    }
    
    var cols = [64,64,64,64];
    for (var x = 0; x < 256; x) {
    	var cur = (Math.ceil(Math.random()*cols.length))%cols.length;
    	if ( cols[cur] > 0 ) {
    		cols[cur]--;
    		puyocolors[x%128][Math.floor(x/128)]=colors[cur];
    		x++;
    	}
    }
}

function tick() {
    if ( valid( 0, 1 ) ) {
        ++currentY;
    } else {
        if(freeze()){
        	return;
        }
        clear();
        if (lose) {
            newGame();
            return false;
        }    
        newShape();
    }
}

function freeze() {
    for ( var y = 1; 0 <= y; --y ) {
        for ( var x = 0; x < 2; ++x ) {
            if ( (y + currentY) >= ROWS - 1  
            	||	board[ y + 1 +currentY][ x + currentX ] != 0){
                if ( current[ y ][ x ] ) {
                	//TODO sometimes, this index overflow.
                    board[ y + currentY ][ x + currentX ] = current[ y ][ x ];
                    current[y][x] = 0;
                }
            }
        }
    }

    for ( var y = 1; 0 <= y; --y ) {
        for ( var x = 0; x < 2; ++x ) {
    		if( current[y][x] ){
    			return true;
    		}
    	}
    }
    
    return false;
    
}

function rotate( current ) {
	if (current[0][0] != 0 ){
		if ( current[0][1] != 0 ){
		   currentX--;
		}else if ( current[1][0] != 0){
		   currentY++;}
		
	}else if ( current[1][1] != 0 ){
	    if ( current[0][1] != 0 ){
		   currentY--;
		}else if ( current[1][0] != 0){
		   currentX++;}
	}
	
	var newCurrent = [];    
    for ( var y = 0; y < 2; ++y ) {
        newCurrent[ y ] = [];
        for ( var x = 0; x < 2; ++x ) {
            newCurrent[ y ][ x ] = current[ 1 - x ][ y ];
        }
    }

    return newCurrent;
}

function clear() {
    return
    var is_erased = false
    do {
	is_erased = false
	for ( var y = 0; y < ROWS; ++y ) {
       	   for ( var x = 0; x < COLS; ++x ) {
		if ( board[x][y] && clearPuyo(x,y) ) {
		    is_erased = true;
		    packPuyos();
		    break;
		}
	    }
	    if ( is_erased) {
		break;
	    }
	}
    } while (!is_erased);


}

function clearPuyo(x,y) {
    return
    var col =  board[x][y]
    var puyo = new Object();
    puyo.x = x;
    puyo.y = y;
    puyo.col = col;
    same_puyos = [puyo];

    if(col == 0) return false;

    if(x>1 && board[x-1][y] == col ){
        puyo = new Object();
	puyo.x = x-1;
	puyo.y = y;
	puyo.col = col;
	same_puyos.push(puyo);
	findPuyo(same_puyos);
    }
    if(x<COLS-1 && board[x+1][y] == col){
        puyo = new Object();
	puyo.x = x+1;
	puyo.y = y;
	puyo.col = col;
	same_puyos.push(puyo);
	findPuyo(same_puyos);
    }
    if(y>1 && board[x][y-1] == col ){
        puyo = new Object();
	puyo.x = x;
	puyo.y = y-1;
	puyo.col = col;
	same_puyos.push(puyo);
	findPuyo(same_puyos);
    }
    if(y<ROWS-1 && board[x][y+1] == col){
        puyo = new Object();
	puyo.x = x;
	puyo.y = y+1;
	puyo.col = col;
	same_puyos.push(puyo) ;
	findPuyo(same_puyos);
    }

    if(same_puyos.length >= 4){
	while( puyo = same_puyos.pop()){
	    board[puyo.x][puyo.y] = 0;
	}
	return true
    }
    return false;

}

function findPuyos(array){
    var puyo = array[array.length -1];

    if(puyo.col == 0) return;

    if(puyo.x>1 && board[puyo.x-1][puyo.y] == puyo.col ){
        exsisting = false;
	for (i = 0; i < array.length; i++) {
	    if ( array[i].x == puyo.x-1 && array[i].y == puyo.y) {
		existing = true;
	    }
	    break;
	}
	if (!exsisting){
            puyonew = new Object();
	    puyonew.x = x-1;
	    puyonew.y = y;
	    puyonew.col = puyo.col;
	    same_puyos.push(puyonew);
	    findPuyo(same_puyos);
	}
    }

    if(x<COLS-1 && board[puyo.x+1][puyo.y] == puyo.col ){
        exsisting = false;
	for (i = 0; i < array.length; i++) {
	    if ( array[i].x == puyo.x+1 && array[i].y == puyo.y) {
		existing = true;
	    }
	    break;
	}
	if (!exsisting){
            puyonew = new Object();
	    puyonew.x = x+1;
	    puyonew.y = y;
	    puyonew.col = puyo.col;
	    same_puyos.push(puyonew);
	    findPuyo(same_puyos);
	}
    }

    if(y>1 && board[puyo.x][puyo.y-1] == puyo.col ){
        exsisting = false;
	for (i = 0; i < array.length; i++) {
	    if ( array[i].x == puyo.x && array[i].y == puyo.y-1) {
		existing = true;
	    }
	    break;
	}
	if (!exsisting){
            puyonew = new Object();
	    puyonew.x = x;
	    puyonew.y = y-1;
	    puyonew.col = puyo.col;
	    same_puyos.push(puyonew);
	    findPuyo(same_puyos);
	}
    }

    if(y<ROWS-1 && board[puyo.x][puyo.y+1] == puyo.col ){
        exsisting = false;
	for (i = 0; i < array.length; i++) {
	    if ( array[i].x == puyo.x && array[i].y == puyo.y+1) {
		existing = true;
	    }
	    break;
	}
	if (!exsisting){
            puyonew = new Object();
	    puyonew.x = x;
	    puyonew.y = y+1;
	    puyonew.col = puyo.col;
	    same_puyos.push(puyonew);
	    findPuyo(same_puyos);
	}
    }

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
                    if (offsetY == 3 && offsetX == 2) lose = true;
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
