var chess = document.getElementById('chess');
var context = chess.getContext('2d');
context.strokeStyle = "#bfbfbf";//定义棋盘网格颜色
// 接下来的两个变量是logo的位置
var disX = (450-182)/1.1;
var disY = (450-83)/1.1;
//在logo缩小的时候，会出现锯齿
//兼容性问题，目前只有Chrome支持，号称抗锯齿。还有种离屏渲染的方式，涉及到图形学知识和微积分，在此就不多说了。
context.imageSmoothingQuality = "high";//low|medium|high  三个选项
var logo = new Image();
logo.src = "images/logo_qiyi.png";


// 加载图片资源完成时，启动。不然你获取不到资源，没办法画图
logo.onload = ()=>{
 	context.drawImage(logo,disX,disY,182,83);
 	dealPx(context,disX,disY);//处理水印
	drawChessBoard();
}

var me = true;// me定义false就是电脑
var myWin = [];// 我的赢法
var computerWin = [];//机器人的赢法
var wins = [];// 赢法数组，就是所有的五子棋赢法数组，[[[x,1],[x,2]],[],[]]
var count = 0;// 总共的赢法数量;
var gameOver = false;
var chessBoard = [];
// 判断是否已经有棋子了
for(var i=0;i<15;i++){
	chessBoard[i] = [];
	for(var j=0;j<15;j++){
		chessBoard[i][j] = 0;
	}
}
//初始化赢法数组,结构大概是这样子(3*3为栗子)：[
//					[[true,empty,empty,empty,empty,true],[true,true],[empty,true]],
//					[[empty,empty,true,empty,empty,true,true],[empty,empty,true,true],[empty,empty,empty,true]],
//					[[empty,empty,empty,true],[empty,empty,empty,true,true],[empty,empty,empty,empty,true]]
//				]
for(var i=0;i<15;i++){
	wins[i] = [];
	for(var j=0;j<15;j++){
		wins[i][j] = [];
	}
}


// 横向
for(var i=0;i<15;i++){//纵向数量
	for(var j=0;j<11;j++){//可循环次数（边界）
		for(var k=0;k<5;k++){
			wins[i][j+k][count] = true;
		}
		count++
	}
}
// 纵向
for(var i=0;i<15;i++){//横向数量
	for(var j=0;j<11;j++){//可循环次数（边界）
		for(var k=0;k<5;k++){
			wins[j+k][i][count] = true;
		}
		count++
	}
}
// 正斜向
for(var i=0;i<11;i++){//纵向数量可循环
	for(var j=0;j<11;j++){//横向数量可循环
		for(var k=0;k<5;k++){
			wins[i+k][j+k][count] = true;
		}
		count++
	}
}
// 反斜向
for(var i=0;i<11;i++){//纵向数量可循环
	for(var j=14;j>3;j--){//横向数量可循环
		for(var k=0;k<5;k++){
			wins[i+k][j-k][count] = true;
		}
		count++
	}
}
console.log(count)//总共的赢法


for(var k=0;k<count;k++){
	myWin[k] = 0;
	computerWin[k] = 0;
}
chess.onclick=function(ev){

	if(gameOver || !me) return;
	var ev = ev||event;
	var x = ev.offsetX;
	var y = ev.offsetY;
	var i =  ~~(x/30);
	var j =  ~~(y/30);
	if(chessBoard[i][j] == 0){
		creatPiece(i,j,me);
		chessBoard[i][j] = 1;
		for(var k=0;k<count;k++){
			if(wins[i][j][k]){
				myWin[k]++;
			};
			if(myWin[k]==5){
				alert("you win!");
				gameOver = true;
			}
		}
		if(!gameOver){
			computerAI();
		}
	}else{
		return false;
	}
	
}


// 画一个棋盘~不多提了
var drawChessBoard = function(){
	for(var i=0;i<15;i++){
		context.moveTo(15,i*30+15);
		context.lineTo(435,i*30+15);
		context.stroke();
		context.moveTo(i*30+15,15);
		context.lineTo(i*30+15,435,);
		context.stroke();
	}
}

// 像素级处理，捣腾ImageData,其实它是个数组，四个元素归为一个（rgba）,每个元素在0-255，
// 主要是处理水印的颜色。其实像素级操作就像一个滤镜。想怎么美颜就怎么美颜，前提。你懂视觉工程
var dealPx = function(context,disX,disY){
	var imageData = context.getImageData(disX,disY,182,83);
 	var pxData = imageData.data;
	//canvas区域的长为182，宽为83
	for(var i = 0; i < 182 * 83; i++) {

	  //分别获取rgb的值(a代表透明度，在此处用不上)
	  var r = pxData[4 * i];
	  var g = pxData[4 * i + 1];
	  var b = pxData[4 * i + 2];
	  //运用图像学公式，设置灰度值（这个是公式，任何颜色图片的置灰算法）
	  var grey = r * 0.3 + g * 0.59 + b * 0.21;

	  //将rgb的值替换为灰度值
	  pxData[4 * i] = grey;
	  pxData[4 * i + 1] = grey;
	  pxData[4 * i + 2] = grey;
	}
	//将改变后的数据重新展现在canvas上
	context.putImageData(imageData, disX, disY, 0, 0, 182, 83);
}

// 画棋子
var creatPiece = function(x,y,me){
	var arcX = Number(Math.round(x)*30+15);
	var arcY = Number(Math.round(y)*30+15);
	context.beginPath();
	context.arc(arcX,arcY,10,0,2*Math.PI);
	context.closePath();
	var gradient=context.createRadialGradient(arcX,arcY,10,arcX-2,arcY-2,2);
	if(me){
		gradient.addColorStop(0.4,"#000");
		gradient.addColorStop(1,"#999");
	}else{
		gradient.addColorStop(0.4,"#D1D1D1");
		gradient.addColorStop(1,"#F9F9F9");
	}
	
	context.fillStyle = gradient;
	context.fill();
}

//AI下棋
var computerAI = function(){
	var myScore = [];//准备一个分数容器（玩家）
	var computerScore = [];//准备一个分数容器（电脑）
	var max =0;
	var v = 0;
	var u = 0;
	for(var i=0;i<15;i++){
		myScore[i] = [];
		computerScore[i] = [];
		for(var j=0;j<15;j++){
			myScore[i][j] = 0;
			computerScore[i][j] = 0;
		}
	}
	// 遍历整个棋盘
	for(var i=0;i<15;i++){
		for(var j=0;j<15;j++){
			if(chessBoard[i][j] == 0){ // 同样判断当前位置有没有被落子
				for(var k=0;k<count;k++){ //如果没有落子，开始针对赢法统计搞事情
					if(wins[i][j][k]){
						if(myWin[k] == 1){
							myScore[i][j] += 200;
						}else if(myWin[k] == 2){
							myScore[i][j] += 400;
						}else if(myWin[k] == 3){
								if(computerWin[k]!=0){//死三
									myScore[i][j]+=2000;
								}else{//活三
									myScore[i][j]+=4000;
								}
						}else if(myWin[k] == 4){
							myScore[i][j] += 10000;
						}

						if(computerWin[k] == 1){
							computerScore[i][j] += 220;
						}else if(computerWin[k] == 2){
							computerScore[i][j] += 420;
						}else if(computerWin[k] == 3){
							if(myScore[k]!=0){//死三
								computerScore[i][j]+=2100;
							}else{//活三
								computerScore[i][j]+=4100;
							}
						}else if(computerWin[k] == 4){
							computerScore[i][j] += 20000;
						}
					}
				}
				if(myScore[i][j]+computerScore[i][j] > max){
					max = myScore[i][j]+computerScore[i][j];
					v = i;
					u = j;
				}
			}
		}
	}
	// console.log(v,u)
	// console.log(max)
	creatPiece(v,u,false);
	chessBoard[v][u] = 1;
	for(var k=0;k<count;k++){
		if(wins[v][u][k]){
			computerWin[k]++;
		};
		if(computerWin[k]==5){
			alert("you lose!");
			gameOver = true;
		}
	}
	if(!gameOver){
		me = true;
	}
}

