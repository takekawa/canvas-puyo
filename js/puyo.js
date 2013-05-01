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
    var col = puyocolors[color_index];
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

prevcur = []

function freeze() {
    prevcur = [];
    for ( var y = 1; 0 <= y; --y ) {
        for ( var x = 0; x < 2; ++x ) {
            if ( (y + currentY) >= ROWS - 1  
            	 ||	board[ y + 1 +currentY][ x + currentX ] != 0){
                if ( current[ y ][ x ] ) {
                    //TODO sometimes, this index overflow.
                    board[ y + currentY ][ x + currentX ] = current[ y ][ x ];
                    current[y][x] = 0;
                    prevcur.push({x:x,y:y})
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

function leftRotate( current ) {

    if (current[0][0] != 0 ){
		if ( current[0][1] != 0 ){
			currentY--;
		}else if ( current[1][0] != 0){
			currentX--;}
		
    }else if ( current[1][1] != 0 ){
		if ( current[0][1] != 0 ){
			currentX++;
		}else if ( current[1][0] != 0){
			currentY++;}
    }

    
    var newCurrent = [[0,0],[0,0]];    
    for ( var y = 0; y < 2; ++y ) {
        for ( var x = 0; x < 2; ++x ) {
            newCurrent[1-y][x] = current[x][y];
        }
    }

    return newCurrent;
}

function pauseScreen(){
    if ( interval != 0 ){
		clearInterval( interval );
		interval = 0;
    }
    else {
		interval = setInterval( tick, 250 )
    }
}

function clear() {

    var is_erased;
    do {
    	is_erased = false;
 		for ( var y = 0; y < ROWS; ++y ) {
      	    for ( var x = 0; x < COLS; ++x ) {
				if ( board[y][x] != 0) {
					if ( clearPuyo(x,y) ) {
						is_erased = true;
					}
				}
			}
    	}
    	if (is_erased) packPuyos();

    }while(is_erased);


}

function packPuyos(){
    for ( var x = 0; x < COLS; ++x ) {
		for ( var y = 0; y < ROWS-1; ++y ) {
			if (board[ROWS - y - 2][x] != 0){
	    		var my = ROWS - y - 1
	    		for ( ; my < ROWS; my++) {
	    			if ( board[my][x] != 0) break;
	    		}
	    		if (my != ROWS - y - 1 &&  board[my-1][x] == 0) {
	    			board[my-1][x]  = board[ROWS -y -2][x];
	    			board[ROWS -y -2][x] = 0;
	    		}		
				
			}
		}
    }
    
}

function createPuyo(x,y,col){
    var puyo = {x: x , y: y, col: col};
    return puyo
}


function clearPuyo(x,y) {
    // 探索済箇所
    var marked = [] 
    for (var i = 0 ; i< ROWS; i++ ){
		marked[i] = []
		for (var j = 0 ; j< COLS; j++ ){
			marked[i][j] = 0
		}
    }

    //ぷよ(削除対象のぷよを指定するために利用
    var puyo = createPuyo(x,y,board[y][x]);
    //おなじ色のぷよグループ
    var same_puyos = [puyo];

    //ぷよが存在しなければ、なにもしない。
    if(puyo.col == 0) return false;

    //同じ色のぷよを探す
    findPuyos(same_puyos,marked);

    //ぷよの集合が4つ以上からなる場合
    if(same_puyos.length >= 4){
		while( puyo = same_puyos.pop()){
			board[puyo.y][puyo.x] = 0;
		}
		return true
    }
    return false;
}

function findPuyos(same_puyos,marked){

    //same_puyosの中の最後のぷよを基準にする
    var puyo = same_puyos.pop()
    
    //既にsame_puyos中に同じぷよが存在していれば、なにもしない
    for(var i = 0; i<same_puyos.length; i++){
		if (same_puyos[i].x  == puyo.x
			&& same_puyos[i].y == puyo.y
			&& same_puyos[i].col == puyo.col){
			return;
		}
    }
    same_puyos.push(puyo);

    if(puyo.col == 0) {
		marked[puyo.y][puyo.x] = true;
		return;
    }

    //既に探索済であればなにもしない
    if(	marked[puyo.y][puyo.x] == true) {
		return;
    }else{
		marked[puyo.y][puyo.x] = true;
    }

    //左側のぷよのチェック
    var x = puyo.x;
    var y = puyo.y;
    var col = puyo.col;
    if(x>0 ){
		if(board[y][x-1] == col ){
			same_puyos.push(createPuyo(x-1,y,puyo.col)); 
			findPuyos(same_puyos,marked);
		}else{
			marked[y][x-1] = true;
		}
    }

    //右側のぷよが同じ色
    if(x<COLS-1){
		if(board[y][x+1] == col){
			same_puyos.push(createPuyo(x+1,y,puyo.col)); 
			findPuyos(same_puyos,marked);
		}else{
			marked[y][x+1] = true;
		}
    }
    
    //上のぷよが同じ色の場合
    if(y>1){
		if(board[y-1][x] == col ){
			same_puyos.push(createPuyo(x,y-1,col)); 
			findPuyos(same_puyos,marked);
		}else{
			marked[y-1][x] = true;
		}
    }

    //下のぷよが同じ色の場合
    if(y<ROWS-1){
		if (board[y+1][x] == col ){
			same_puyos.push(createPuyo(x,y+1,col)); 
			findPuyos(same_puyos,marked);
		}else{
			marked[y+1][x] = true;
		}
    }

    return;
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
    case 'leftRotate':
        var leftRotated = leftRotate( current );
        if ( valid( 0, 0, leftRotated ) ) {
            current = leftRotated;
        }
        break;
    case 'pauseScreen':
        pauseScreen();
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
                    if (offsetY == 2 && offsetX == 2) lose = true;
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
