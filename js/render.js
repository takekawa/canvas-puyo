var canvas = document.getElementsByTagName( 'canvas' )[ 0 ];
var ctx = canvas.getContext( '2d' );
var W = 300, H = 600;
var BLOCK_W = W / COLS, BLOCK_H = H / ROWS;

function drawBlock( x, y ) {
    ctx.fillRect( BLOCK_W * x, BLOCK_H * y, BLOCK_W - 1 , BLOCK_H - 1 );
    ctx.strokeRect( BLOCK_W * x, BLOCK_H * y, BLOCK_W - 1 , BLOCK_H - 1 );
}

function drawSmallBlock( x, y ) {
    ctx.fillRect( BLOCK_W * x, BLOCK_H * y, BLOCK_W/2 - 1 , BLOCK_H/2 - 1 );
    ctx.strokeRect( BLOCK_W * x, BLOCK_H * y, BLOCK_W/2 - 1 , BLOCK_H/2 - 1 );
}

function render() {
    ctx.fillStyle = 'black';
    ctx.fillRect( 0, 0, W, H );

    ctx.strokeStyle = 'black';
    for ( var x = 0; x < COLS; ++x ) {
        for ( var y = 2; y < ROWS ; ++y ) {
            if ( board[ y ][ x ] ) {
                ctx.fillStyle = board[ y ][ x ];
                drawBlock( x, y );
            }
        }
    }

    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'black';
    for ( var y = 0; y < 2; ++y ) {
        for ( var x = 0; x < 2; ++x ) {
            if ( current[ y ][ x ] && currentY + y > 1) {
                ctx.fillStyle =  current[ y ][ x ];
                drawBlock( currentX + x, currentY + y );
            }
        }
    }

    for ( var i = 0; i < 2; ++i ) {
        var index = (color_index + i)%puyocolors.length;
        var col =puyocolors[index];
        for ( var x = 0; x < 2; ++x ) {
            ctx.fillStyle =  col[x];
            drawSmallBlock( 4.5+i,x*0.5 )
        }
    }

    ctx.font = "bold 20pt Sans-Serif"; 
    ctx.fillStyle = "white"
    ctx.fillText("点数予定地",BLOCK_H/2,BLOCK_W/2);
    
}

setInterval( render, 30 );
