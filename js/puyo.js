var COLS = 6;  //列数
var ROWS = 14; //行数
var board = []; //盤情報(何色のぷよがどこに存在するか?)
var lose;     //ゲーム終了フラグ
var interval; //tick関数用のタイマID
var rensaInterval; //連鎖用のタイマID
var current;  //おちているぷよの形情報
var currentX, currentY; // おちているぷよの位置情報
var newX, newY;         // ぷよの移動先の候補
var colors = ['blue', 'yellow' ,'red', 'green', 'gray']; //ぷよの色
var puyocolors = []; //ぷよの色の配列(createColors参照)
var color_index =0;  //ぷよの色の配列のインデックス
var inputFlag=true;
var rensaCount = 0;
var puyoGroup = [];
var score = 0;
var anotherX = 0;
var anotherY = 0;

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
        if ( current[0][1] != 0 ){  //  **
            newX = - 1;
                         //  --
	        if(currentY == 13 || board[currentY+1][currentX] != 0 ) {
		        newY--;
	        }
        }else if ( current[1][0] != 0){  //  *-
            newY = 1;                    //  *-
	        if(currentX == 5){
		        newX--;
	        }else if(board[currentY+1][currentX+newX+1] != 0){
		        newY--;
	        }
        }
        
    }else if ( current[1][1] != 0 ){
        if ( current[0][1] != 0 ){  //  --
            newY = -1;              //  **
            if ( currentX == -1 ) {
            	newX++;
            	newY++;
            }
        }else if ( current[1][0] != 0){ //  -*
            newX = 1;                   //  -*
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
        if ( current[0][1] != 0 ){ //  **
	        //  --
            newY = -1;
        }else if ( current[1][0] != 0){  //  *-
	        //  *- 
            newX = -1;
            if ( board[ currentY + 1 ][ currentX - 1 ] != 0 ) {
            	newX++;
            }
        }
    }else if ( current[1][1] != 0 ){     
        if ( current[0][1] != 0 ){       //  -- 
            //  **    
            newX = +1;
            if ( board[ currentY ][ currentX + 2 ] != 0 ) {
            	newX--;
            }

        }else if ( current[1][0] != 0){  //  -*
            //  -*
            newY = +1;
            if ( currentY == 12 || board[ currentY + 2 ][ currentX + 1 ] != 0 ) {
            	newY--;
            }
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
        scorer();
        packPuyos();         //空きを詰める
        rensaCount++;
        puyoGroup = [];
        return true;

    }

    //連鎖終了処理
    if (interval == 0) {
        clearInterval(rensaInterval);
        newShape();
        interval = setInterval( tick, 250 );
        inputFlag = true;
        rensaCount = 0                
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
    if( puyo.col == 0 || puyo.col == 'gray') return false;

    //同じ色のぷよを探す
    findPuyos(same_puyos,marked);

    //ぷよの集合が4つ以上からなる場合
    if(same_puyos.length >= 4){
    	var pi = { size: same_puyos.length, color: same_puyos[ 0 ].col };
    	puyoGroup.push(pi);
        while( puyo = same_puyos.pop()){
        	clearOPuyo( puyo );
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
    if(        marked[puyo.y][puyo.x] == true) {
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
        //        f0001( rotated );
        if ( valid( newX, newY, rotated ) ) {
            current = rotated;
            currentX = currentX + newX
            currentY = currentY + newY
        }else if ( valid( newX + anotherX, newY + anotherY, rotated ) ) {
        	current = rotated;
            currentX = currentX + newX + anotherX
            currentY = currentY + newY + anotherY;
        }
        break;
    case 'leftRotate':
        var leftRotated = leftRotate( current );
        f0001( leftRotated );
        if ( valid( newX, newY, leftRotated ) ) {
            current = leftRotated
            currentX = currentX + newX
            currentY = currentY + newY;
        }else if ( valid( newX + anotherX, newY + anotherY, leftRotated ) ) {
        	current = leftRotated;
            currentX = currentX + newX + anotherX
            currentY = currentY + newY + anotherY;
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

function scorer() {
	var colorBonus = [ 0, 0, 3, 6, 12];
	var rensaBonus = [ 0, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 480, 512, 544];
	var connectBonus = [ 0, 0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,];
	var currentBonus = 0;
	var erasedPuyos = 0;
	var uniquecolors = []
	for ( var  x = 0; x < puyoGroup.length; x++ ) {
		currentBonus = currentBonus + connectBonus[puyoGroup[x].size];
	}
	currentBonus = currentBonus + rensaBonus[rensaCount];
	for ( var  y = 0; y < puyoGroup.length; y++ ) {
		erasedPuyos = erasedPuyos + puyoGroup[y].size;
	}
	for ( var  z = 0; z < puyoGroup.length; z++ ) {
		var inserted = false;
		for ( var i = 0; i < uniquecolors.length; i++ ) {
			if ( uniquecolors[i] == puyoGroup[z].color ) {
				inserted = true;
				break;
			}
		}
		if ( inserted == false ) {
			uniquecolors.push(puyoGroup[z].color);
		}
	}
	currentBonus = currentBonus + connectBonus[uniquecolors.length];
	currentBonus = currentBonus || 1;
	score = score + currentBonus*10*erasedPuyos;
}

function clearOPuyo( puyo ) {
	for ( var x = -1 ; x < 2; x++ ) {
		for ( var y = -1 ; y < 2; y++ ) {
			if ( Math.abs(x) != Math.abs(y) &&  
			0 <= (puyo.y + y) &&  
			(puyo.y + y) < board.length &&
			0 <= (puyo.x + x) && 
			(puyo.x + x) < board[0].length &&
			board[puyo.y + y][puyo.x + x] == 'gray' ) {
				board[puyo.y + y][puyo.x + x] = 0;
			} 
		}
	}
}

function newGame() {
    clearInterval(interval);
    init();
    newShape();
    lose = false;
    interval = setInterval( tick, 250 );
    score = 0;
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

