var COLS = 6;  //列数
var ROWS = 14; //行数
var board = []; //盤情報(何色のぷよがどこに存在するか?)
var lose;     //ゲーム終了フラグ
var interval; //tick関数用のタイマID
var rensaInterval; //連鎖用のタイマID
var current;  //おちているぷよの形情報
var currentX, currentY; // おちているぷよの位置情報
var newX, newY;         // ぷよの移動先の候補
var colors = ['blue', 'yellow' ,'red', 'green']; //ぷよの色
var puyocolors = []; //ぷよの色の配列(createColors参照)
var color_index =0;  //ぷよの色の配列のインデックス
var inputFlag=true;

function newShape() {
    var col = puyocolors[color_index];
    current = [[col[0],0],[col[1],0]];
    currentX = 2;
    currentY = 1;
    color_index  = ( color_index + 1 ) % puyocolors.length;
}

function createColors(){
    var cols = [64,64,64,64];

    for ( var y = 0; y < 128; ++y ) {
        puyocolors[ y ] = [0,0];
    }

	//128回分のおちぷよ(2*128で256個)の色を決める
    for (var x = 0; x < 256; x) {
    	var cur = (Math.ceil(Math.random()*cols.length))%cols.length;
    	if ( cols[cur] > 0 ) {
    	    cols[cur]--;
    	    puyocolors[x%128][Math.floor(x/128)]=colors[cur];
    	    x++;
    	}
    }
}

function init() {
    for ( var y = 0; y < ROWS; ++y ) {
        board[ y ] = [];
        for ( var x = 0; x < COLS; ++x ) {
            board[ y ][ x ] = 0;
        }
    }
	createColors();
}

function tick() {
    if ( valid( 0, 1 ) ) {
        ++currentY;
	return
    }

    if(freeze()){
        return;
    }

    if(clear()){
		return;
	}

    if (lose) {
        newGame();
        return false;
    }    

    newShape();

}


function freeze() {
    for ( var y = 1; 0 <= y; --y ) {
        for ( var x = 0; x < 2; ++x ) {
			//底についた、もしくは下にぷよがある場合
            if ( (y + currentY) >= (ROWS - 1)  ||	
				 board[ y + 1 +currentY][ x + currentX ] != 0){
                if ( current[ y ][ x ] ) {
                    board[ y + currentY ][ x + currentX ] = current[ y ][ x ];
                    current[y][x] = 0;
                }
            }
        }
    }

	//おちぷよが残っている場合
    for ( var y = 1; 0 <= y; --y ) {
        for ( var x = 0; x < 2; ++x ) {
    	    if( current[y][x] ){
    			return true;
    	    }
    	}
    }
    
    return false;
    
}

//右回転
function rotate( current ) {
	newX =0;
	newY =0;
    if (current[0][0] != 0 ){
		if ( current[0][1] != 0 ){
			newX = - 1;
		}else if ( current[1][0] != 0){
			newY = 1;
		}
		
    }else if ( current[1][1] != 0 ){
		if ( current[0][1] != 0 ){
			newY = -1;
		}else if ( current[1][0] != 0){
			newX = 1;
		}
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

//左回転
function leftRotate( current ) {

	newX =0;
	newY =0;
    if (current[0][0] != 0 ){
		if ( current[0][1] != 0 ){
			newY = -1;
		}else if ( current[1][0] != 0){
			newX = -1;
		}
    }else if ( current[1][1] != 0 ){
		if ( current[0][1] != 0 ){
			newX = +1;
		}else if ( current[1][0] != 0){
			newY = +1;
		}
    }
    
    var newCurrent = [[0,0],[0,0]];    
    for ( var y = 0; y < 2; ++y ) {
        for ( var x = 0; x < 2; ++x ) {
            newCurrent[1-y][x] = current[x][y];
        }
    }

    return newCurrent;
}

//一時停止/再開
function pauseScreen(){
    if ( interval != 0 ){
		clearInterval( interval );
		interval = 0;
    }else {
		interval = setInterval( tick, 250 )
    }
}

//ぷよ削除
function clear() {

    var is_erased;
    is_erased = false;
 	for ( var y = 0; y < ROWS; ++y ) {
      	for ( var x = 0; x < COLS; ++x ) {
			if ( board[y][x] != 0) {
				//ボードの各要素にぷよがある場合は削除処理
				if ( clearPuyo(x,y) ) {
					is_erased = true;
				}
			}
		}
    }

	//連鎖処理開始
    if (is_erased){
		if (interval != 0) {
			//tickタイマをとめる
			clearInterval(interval);
			interval = 0;
			//入力処理をしない
			inputFlag = false;
			//連鎖用タイマ起動
			rensaInterval = setInterval(clear,500);
		}
		packPuyos(); 	//空きを詰める
		return true;
	}

	//連鎖終了処理
	if (interval == 0) {
		clearInterval(rensaInterval);
		newShape();
		interval = setInterval( tick, 250 );
		inputFlag = true;		
	}
	return false;

}

//ぷよをつめる
function packPuyos(){
    for ( var x = 0; x < COLS; ++x ) {
		for ( var y = 0; y < ROWS-1; ++y ) {
			var starty = ROWS - y - 2
			//ぷよが存在する場合
			if (board[starty][x] != 0){
				//何個下までぷよがないかを探索
	    		var my = starty + 1
	    		for ( ; my < ROWS; my++) {
	    			if ( board[my][x] != 0) break;
	    		}
				//ぷよが下にない場合、移動
	    		if (my != starty + 1 &&  board[my-1][x] == 0) {
	    			board[my-1][x]  = board[starty][x];
	    			board[starty][x] = 0;
	    		}		
				
			}
		}
    }
    
}

function createPuyo(x,y,col){
    var puyo = {x: x , y: y, col: col};
    return puyo;
}

function clearPuyo(x,y) {
    var marked = [];     // 探索済箇所
    for (var i = 0 ; i< ROWS; i++ ){
		marked[i] = [];
		for (var j = 0 ; j< COLS; j++ ){
			marked[i][j] = 0;
		}
    }

    var puyo = createPuyo(x,y,board[y][x]);     //ぷよ(削除対象のぷよを指定するために利用
    var same_puyos = [puyo];     //おなじ色のぷよグループ

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

function checkPuyo(cond,x,y,col,same_puyos,marked){
    if(cond){
		if(board[y][x] == col ){
			same_puyos.push(createPuyo(x,y,col)); 
			findPuyos(same_puyos,marked);
		}else{
			marked[y][x] = true;
		}
	}
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
    }

	marked[puyo.y][puyo.x] = true;
    var x = puyo.x;
    var y = puyo.y;
    var col = puyo.col;

    //左のぷよのチェック
	checkPuyo(x>0,x-1,y,col,same_puyos,marked);	
    //右のぷよのチェック
	checkPuyo(x<COLS-1,x+1,y,col,same_puyos,marked);	
    //上のぷよのチェック
	checkPuyo(y>1,x,y-1,col,same_puyos,marked);	
    //下のぷよのチェック
	checkPuyo(y<ROWS-1,x,y+1,col,same_puyos,marked);	

}

function keyPress( key ) {

	if (inputFlag == false) {
		return;
	}

    switch ( key ) {
    case 'left':
        if ( valid( -1 ) && puyoSize() > 1  ) {
            --currentX;
        }
        break;
    case 'right':
        if ( valid( 1 ) && puyoSize() > 1  ) {
            ++currentX;
        }
        break;
    case 'down':
        if ( valid( 0, 1 ) && puyoSize() > 1 ) {
            ++currentY;
        }
        break;
    case 'rotate':
        var rotated = rotate( current );
        if ( valid( newX, newY, rotated ) ) {
            current = rotated;
			currentX = currentX + newX
			currentY = currentY + newY
        }
        break;
    case 'leftRotate':
        var leftRotated = leftRotate( current );
        if ( valid( newX, newY, leftRotated ) ) {
            current = leftRotated;
			currentX = currentX + newX
			currentY = currentY + newY
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

function puyoSize() {
	var z = 0;
	for ( var y = 1; 0 <= y; --y ) {
        for ( var x = 0; x < 2; ++x ) {
        	if ( current[ x ][ y ] != 0 ) {
        		z++;
        	}
        }
    }
    return z;
}   
