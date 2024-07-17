"use strict";


// игровые объекты

let player;
let sword;
let level1Ground;
let level2Ground;
let level3Ground;
let background;

let spike1;
let spike2;
let spike3;
let spike4;
let spike5;

let pearl;
let seashell;


// UI
let mainMenuCanvas;
let levelCompleteCanvas;
let gameCompleteCanvas;
let gameOverCanvas;


// игровые условия
let level = 1;
let gameComplete;

let changeLevel = false;
let startPressed = false;
let showLoseScreen = false;

let seashellDeath = false;


// движение персонажа
let moveR = false;
let moveL = false;
let moveSpeed = 10;

let jumping = false;
let jumphight = 120;
let jumpspeed = 12;
let currentY = 440;
let time = 1;
let onGroundHight = true;
let grounded = true;
let falling = false;

// жемчужены
let pearlSpeed = 10;
let pearlActive = false;
let pearlInterval;

// ямы
let xMaxCollision;
let xMinCollision;
let inPit = false;

// атака мечом
let swordAttackActive = false;

// спрайты
let playerSprite = "images/PlayerMovement/PlayerMovement.0003.png";

// анимационные спрайты
let PlayerMovementSprite = [];
let playerJumpSprite = new Image();
let playerFallSprite = new Image();
let PlayerAttackSprite = new Image();







// игровое пространство

let gameArea = {
    canvas: document.createElement("canvas"),
    start: function(){
        // настройки игрового пространства
        this.canvas.width = 1280;
        this.canvas.height = 720;
        this.context = this.canvas.getContext("2d");
        if (this.interval) {
            clearInterval(this.interval); 
        }
        this.interval = setInterval(updateGameArea, 20);
        this.canvas.id = "GameWindow";

        // вставка игрового пространства после заголовка
        let h1Element = document.querySelector("h1.GameTitle");
        h1Element.insertAdjacentElement("afterend", this.canvas);
    },
    clear: function(){
        this.context.clearRect( 0 , 0 , this.canvas.width , this.canvas.height );
    }
}






// конструктор игровых компонентов

function Component( width , height , source , x , y , type ){

    this.type = type;
    if(type === "image"){
        this.image = new Image();
        this.image.src = source;
    }
    else if(type === "player"){
        this.image = new Image();
        this.image.src = playerSprite;
    }

    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;

    this.scaleX = 1;

    this.update = function(){
        
        let ctx = gameArea.context;
        ctx.save();

        if( this.scaleX === -1 ){
            ctx.translate( this.x + this.width + player.x, 0 );
            ctx.scale( -1,1 );
        }

        if( type === "image" ){
            ctx.drawImage( this.image, this.x, this.y, this.width, this.height );
        }
        else if( type === "player" ){
            this.image.src = playerSprite;
            ctx.drawImage( this.image, this.x, this.y, this.width, this.height );
        }

        // заполнение фона
        else{
            ctx.fillStyle = source;
            ctx.fillRect( this.x, this.y, this.width, this.height );
        }

        ctx.restore();

    }
}





// функция старта игры 

function startGame(){

    // объявление анимаций
    PlayerMovementSprite.length = 6;
    for ( let i = 0 ; i < PlayerMovementSprite.length ; i++ ){
        PlayerMovementSprite[i] = new Image();
        PlayerMovementSprite[i].src = "images/PlayerMovement/PlayerMovement.000"+`${i+1}`+".png";
    }

    PlayerAttackSprite.src = "images/PlayerAttack/PlayerAttack.0002.png";
    playerJumpSprite.src = "images/PlayerMovement/PlayerJump.png";
    playerFallSprite.src = "images/PlayerMovement/PlayerFall.png";

    

    // объявление игровых компонентов
    player = new Component( 240, 170, playerSprite, 400, 410, "player" );

    level1Ground = new Component( 4667, 720, "images/Level1Ground2.png", 0, 30, "image" );
    level2Ground = new Component( 4667, 720, "images/Level2Ground2.png", 0, 30, "image" );
    level3Ground = new Component( 6000, 720, "images/Level3Ground2.png", 0, 30, "image" );

    gameCompleteCanvas = new Component( 1280 , 720 , "images/Game Complete.png" , 0 , 0 , "image" );
    levelCompleteCanvas = new Component( 1280 , 720 , "images/Level Complete.png" , 0 , 0 , "image" );
    gameOverCanvas = new Component( 1280 , 720 , "images/Game Over.png" , 0 , 0 , "image" );
    mainMenuCanvas = new Component( 1280 , 720 , "images/Main Menu.png" , 0 , 0 , "image" );

    background = new Component( 1280 , 720, "SkyBlue", 0, 0);


    if ( level === 1 || level === 2 ){
        seashell = new Component( 350, 350, "images/Seashell.png", 640+3365+150, 193, "image" );
    }
    else if ( level === 3 ){
        seashell = new Component( 350, 350, "images/Seashell.png", 640+4698+150, 193, "image" );
    }

    // инициализация летящих жемчужин
    initializePearl();
    pearl = new Component ( 55 , 55 , "images/pearl.png", 1280, 450, "image" );
    spawnPearl();
    pearlInterval = setInterval( spawnPearl, getRandomInterval());

    // инициализация переменных 
    moveL = false;
    moveR = false;
    falling = false;
    grounded = true;
    inPit = false;
    showLoseScreen = false;
    r = 0;

    // Загрузка игры
    window.addEventListener( 'keydown' , handleKeyStartGame );
    gameArea.start();

}





// функция обновления игрового пространства

function updateGameArea(){

    gameArea.clear();

    let gravity = 2;

    // обновление игровых компонентов
    background.update();
    if ( level === 1 ){
        level1Ground.update();
    }
    else if ( level === 2 ){
        level2Ground.update();
    }
    else if ( level === 3 ){
        level3Ground.update();
    }

    seashell.update();
    pearl.update();

    player.update();

    // UI
    if ( showLoseScreen ){
        gameOverCanvas.update();
    }
    if ( changeLevel ){
        levelCompleteCanvas.update();
    }
    if ( gameComplete ){
        gameCompleteCanvas.update();
    }
    if ( startPressed === false ){
        mainMenuCanvas.update();
    }

    // движение персонажа
    if( !swordAttackActive ){

        if( moveR ){
            player.scaleX = 1;
            if ( player.x !== 1230 ){

                if ( level === 1 ){
                    if ( level1Ground.x > -1000 ){
                        if ( player.x < 640 ){
                            player.x += moveSpeed;
                        }
                        else{
                            moveGroundR();
                        }
                    }
                    else{
                        if ( level1Ground.x < -3360 ){
                            player.x += moveSpeed;
                        }
                        else{
                            moveGroundR();
                        }
                    }
                }
                else if ( level === 2 ){
                    if ( level2Ground.x > -1000 ){
                        if ( player.x < 640 ){
                            player.x += moveSpeed;
                        }
                        else{
                            moveGroundR();
                        }
                    }
                    else{
                        if ( level2Ground.x < -3360 ){
                            player.x += moveSpeed;
                        }
                        else{
                            moveGroundR();
                        }
                    }
                }
                else if ( level === 3 ){
                    if ( level3Ground.x > -1000 ){
                        if ( player.x < 640 ){
                            player.x += moveSpeed;
                        }
                        else{
                            moveGroundR();
                        }
                    }
                    else{
                        if ( level3Ground.x < -4705 ){
                            player.x += moveSpeed;
                        }
                        else{
                            moveGroundR();
                        }
                    }
                }

            }

        }

        if( moveL ){
            player.scaleX = -1;
            if ( player.x !== -15 ){

                if ( level === 1 ){
                    if ( level1Ground.x < -1000 ){
                        if ( player.x < 640 ){
                            moveGroundL();
                        }
                        else{
                            player.x -= moveSpeed;
                        }
                    }
                    else{
                        if ( level1Ground.x === 0 ){
                            player.x -= moveSpeed;
                        }
                        else{
                            moveGroundL();
                        }
                    }
                }

                else if ( level === 2 ){
                    if ( level2Ground.x < -1000 ){
                        if ( player.x < 640 ){
                            moveGroundL();
                        }
                        else{
                            player.x -= moveSpeed;
                        }
                    }
                    else{
                        if ( level2Ground.x === 0 ){
                            player.x -= moveSpeed;
                        }
                        else{
                            moveGroundL();
                        }
                    }
                }

                else if ( level === 3 ){
                    if ( level3Ground.x < -1000 ){
                        if ( player.x < 640 ){
                            moveGroundL();
                        }
                        else{
                            player.x -= moveSpeed;
                        }
                    }
                    else{
                        if ( level3Ground.x === 0 ){
                            player.x -= moveSpeed;
                        }
                        else{
                            moveGroundL();
                        }
                    }
                }
            }
        }
    }

    // прыжок
    if ( player.y < currentY - jumphight && onGroundHight === false ){
        jumping = false;
    }

    if ( onGroundHight === false || grounded === false ){
        if ( showLoseScreen === false ){
            player.y += gravity*time;
            time += .1;
        }

        if ( player.y > 920 ){
            showLoseScreen = true;
            time = 0;
            player.y = 440;
        }

        if ( player.y >= currentY && grounded && inPit === false ){
            player.y = currentY;
            onGroundHight = true;
            time = 1;
        }
    }

    if ( jumping === true ){
        player.y -= jumpspeed;
        onGroundHight = false;
    }

    // проверка, стоит ли игрок на полу
    if ( player.y - 3 < currentY ){
        inPit = false;
    }
    else{
        falling = true;
        inPit = true;
    }


    // x координаты для пропастей
    if ( level === 1 ){
        if ( level1Ground.x <= -800 && level1Ground.x >= -950){
            grounded = false;
            xMaxCollision = -805;
            xMinCollision = -945;
        }
        else if ( level1Ground.x <= -1400 && level1Ground.x >= -1520){
            grounded = false;
            xMaxCollision = -1405;
            xMinCollision = -1515;
        }
        else if ( level1Ground.x <= -1640 && level1Ground.x >= -1770){
            grounded = false;
            xMaxCollision = -1645;
            xMinCollision = -1765;
        }
        else if ( level1Ground.x <= -2030 && level1Ground.x >= -2140){
            grounded = false;
            xMaxCollision = -2035;
            xMinCollision = -2135;
        }
        else if ( level1Ground.x <= -2790 && level1Ground.x >= -2930){
            grounded = false;
            xMaxCollision = -2795;
            xMinCollision = -2925;
        }
        else{
            grounded = true;
        }
    }

    if ( level === 2 ){
        if ( level2Ground.x <= -800 && level2Ground.x >= -940){
            grounded = false;
            xMaxCollision = -805;
            xMinCollision = -935;
        }
        else if ( level2Ground.x <= -1300 && level2Ground.x >= -1360){
            grounded = false;
            xMaxCollision = -1305;
            xMinCollision = -1355;
        }
        else if ( level2Ground.x <= -1620 && level2Ground.x >= -1760){
            grounded = false;
            xMaxCollision = -1625;
            xMinCollision = -1755;
        }
        else if ( level2Ground.x <= -2020 && level2Ground.x >= -2160){
            grounded = false;
            xMaxCollision = -2025;
            xMinCollision = -2155;
        }
        else if ( level2Ground.x <= -2290 && level2Ground.x >= -2430){
            grounded = false;
            xMaxCollision = -2295;
            xMinCollision = -2425;
        }
        else if ( level2Ground.x <= -2690 && level2Ground.x >= -2770){
            grounded = false;
            xMaxCollision = -2695;
            xMinCollision = -2765;
        }
        else{
            grounded = true;
        }

        // x координаты для шипов
        if ( level2Ground.x <= -490 && level2Ground.x >= -640 && player.y >= 360 ){
            showLoseScreen = true;
        }
        else if ( level2Ground.x <= -1040 && level2Ground.x >= -1200 && player.y >= 360 ){
            showLoseScreen = true;
        }
        else if ( level2Ground.x <= -2880 && level2Ground.x >= -3030 && player.y >= 360 ){
            showLoseScreen = true;
        }

    }

    if ( level === 3 ){
        if ( level3Ground.x <= -800 && level3Ground.x >= -960){
            grounded = false;
            xMaxCollision = -805;
            xMinCollision = -955;
        }
        else if ( level3Ground.x <= -1220 && level3Ground.x >= -1320){
            grounded = false;
            xMaxCollision = -1225;
            xMinCollision = -1315;
        }
        else if ( level3Ground.x <= -1510 && level3Ground.x >= -1540){
            grounded = false;
            xMaxCollision = -1515;
            xMinCollision = -1535;
        }
        else if ( level3Ground.x <= -1970 && level3Ground.x >= -1990){
            grounded = false;
            xMaxCollision = -1975;
            xMinCollision = -1985;
        }
        else if ( level3Ground.x <= -800 && level3Ground.x >= -940){
            grounded = false;
            xMaxCollision = -805;
            xMinCollision = -935;
        }
        else if ( level3Ground.x <= -2250 && level3Ground.x >= -2290){
            grounded = false;
            xMaxCollision = -2255;
            xMinCollision = -2285;
        }
        else if ( level3Ground.x <= -2480 && level3Ground.x >= -2540){
            grounded = false;
            xMaxCollision = -2485;
            xMinCollision = -2535;
        }
        else if ( level3Ground.x <= -2940 && level3Ground.x >= -2990){
            grounded = false;
            xMaxCollision = -2945;
            xMinCollision = -2985;
        }
        else if ( level3Ground.x <= -3250 && level3Ground.x >= -3300){
            grounded = false;
            xMaxCollision = -3255;
            xMinCollision = -3295;
        }
        else if ( level3Ground.x <= -3860 && level3Ground.x >= -3950){
            grounded = false;
            xMaxCollision = -3865;
            xMinCollision = -3945;
        }        
        else{
            grounded = true;
        }

        // x координаты для шипов
        if ( level3Ground.x <= -360 && level3Ground.x >= -570 && player.y >= 380 ){
            showLoseScreen = true;
        }
        else if ( level3Ground.x <= -1840 && level3Ground.x >= -1980 && player.y >= 360 ){
            showLoseScreen = true;
        }
        else if ( level3Ground.x <= -2050 && level3Ground.x >= -2190 && player.y >= 360 ){
            showLoseScreen = true;
        }
        else if ( level3Ground.x <= -2640 && level3Ground.x >= -2850 && player.y >= 380 ){
            showLoseScreen = true;
        }
        else if ( level3Ground.x <= -3030 && level3Ground.x >= -3120 && player.y >= 360 ){
            showLoseScreen = true;
        }
        else if ( level3Ground.x <= -3470 && level3Ground.x >= -3680 && player.y >= 380 ){
            showLoseScreen = true;
        }
        else if ( level3Ground.x <= -4090 && level3Ground.x >= -4260 && player.y >= 360 ){
            showLoseScreen = true;
        }
    }

    // устранение бесконечного падения игрока
    if ( grounded && (player.y - 3 > currentY) ){
        player.y = currentY;
        falling = false;
        onGroundHight = true;
        time = 1;
    }

    // активация удара мечом
    if ( level === 1){
        if ( level1Ground.x === -3370 ){
            swordAttackActive = true;
        }
        else {
            swordAttackActive = false;
        }    
    }
    else if ( level === 2){
        if ( level2Ground.x === -3370 ){
            swordAttackActive = true;
        }
        else {
            swordAttackActive = false;
        }    
    }
    else if ( level === 3){
        if ( level3Ground.x === -4710 ){
            swordAttackActive = true;
        }
        else {
            swordAttackActive = false;
        }
    }

    if ( !swordAttackActive ){
        animateMovement();
    }
    else{
        animateAttack();
    }


    // движение жемчужены
    if ( pearlActive ){
        pearl.x -= pearlSpeed;
        let pearlCollisionMax = player.x+30;
        let pearlCollisionMin = player.x-70;

        if ( player.y > 389.2 && pearl.x > pearlCollisionMin && pearl.x < pearlCollisionMax && inPit === false ){
            showLoseScreen= true;
            pearlActive = false;
            pearl.x = 1280;
        }
    }

    // анимация смерти ракушки
    if ( seashellDeath ){
        seashell.y += 10;
        if ( seashell.y === 203 ){
            nextLevel();
            seashell.y = 193; 
            seashellDeath = false;
        }
    }

    let ctx = gameArea.context;

}




// движение заднего фона
function moveGroundL(){
    if ( grounded === false && player.y-3 > currentY ){
        if ( level === 1 ){
            if ( level1Ground.x <= xMaxCollision ){
                level1Ground.x += moveSpeed;
                seashell.x += moveSpeed;
                pearl.x += moveSpeed;
            }
        }
        else if ( level === 2 ){
            if ( level2Ground.x <= xMaxCollision ){
                level2Ground.x += moveSpeed;
                seashell.x += moveSpeed;
                pearl.x += moveSpeed;
            }
        }
        else if ( level === 3 ){
            if ( level3Ground.x <= xMaxCollision ){
                level3Ground.x += moveSpeed;
                seashell.x += moveSpeed;
                pearl.x += moveSpeed;
            }
        }
    }
    else{
        if ( level === 1 ){
            level1Ground.x += moveSpeed;
            seashell.x += moveSpeed;
            pearl.x += moveSpeed;
        }
        else if ( level === 2 ){
            level2Ground.x += moveSpeed;
            seashell.x += moveSpeed;
            pearl.x += moveSpeed;
        }
        else if ( level === 3 ){
            level3Ground.x += moveSpeed;
            seashell.x += moveSpeed;
            pearl.x += moveSpeed;
        }
    }
}
function moveGroundR(){
    if ( grounded === false && player.y-3 > currentY ){
        if ( level === 1 ){
            if ( level1Ground.x >= xMinCollision ){
                level1Ground.x -= moveSpeed;
                seashell.x -= moveSpeed;
                pearl.x -= moveSpeed;
            }
        }
        else if ( level === 2 ){
            if ( level2Ground.x >= xMinCollision ){
                level2Ground.x -= moveSpeed;
                seashell.x -= moveSpeed;
                pearl.x -= moveSpeed;
            }
        }
        else if ( level === 3 ){
            if ( level3Ground.x >= xMinCollision ){
                level3Ground.x -= moveSpeed;
                seashell.x -= moveSpeed;
                pearl.x -= moveSpeed;
            }
        }
    }
    else{
        if ( level === 1 ){
            level1Ground.x -= moveSpeed;
            seashell.x -= moveSpeed;
            pearl.x -= moveSpeed;
        }
        else if ( level === 2 ){
            level2Ground.x -= moveSpeed;
            seashell.x -= moveSpeed;
            pearl.x -= moveSpeed;
        }
        else if ( level === 3 ){
            level3Ground.x -= moveSpeed;
            seashell.x -= moveSpeed;
            pearl.x -= moveSpeed;
        }
    }
    
}


// функция перехода на следующий уровень
function nextLevel(){
    if ( level === 1 || level === 2 ){
        player.x = 640;
        level++;
        startGame();
        changeLevel = true;
    }
    else{
        gameComplete = true;
    }
}



// движение персонажа, использования кнопок
function handleKeyMoveOn( event ){

    let key = event.keyCode;

    if( !changeLevel ){
        if( key === 37 ){
            moveL = true;
        }
        else if( key === 39 ){
            moveR = true;
        }
    }
}

function handleKeyMoveOff( event ){

    let key = event.keyCode;

    if( !changeLevel ){
        if( key === 37 ){
            moveL = false;
        }
        else if( key === 39 ){
            moveR = false;
        }
    }
}

// функция прыжка
function handleKeyJumping( event ){
    let key = event.keyCode;
    if ( !changeLevel ){
        if ( key === 32 && !jumping && onGroundHight && grounded ){
            currentY = player.y;
            jumping = true;
        }
    }
    else {
        changeLevel = false;
    }
}

// функция начала игры
function handleKeyStartGame( event ){

    let key = event.keyCode;
    
    if( key === 83 ){
        if( startPressed === false ){

            startPressed = true;
            window.addEventListener( 'keydown' , handleKeyMoveOn );
            window.addEventListener( 'keydown' , handleRestartGame );
            window.addEventListener( 'keyup' , handleKeyMoveOff );
            window.addEventListener( 'keydown', handleKeyJumping );

        }
    }
}

// функция рестарта игры
function handleRestartGame( event ){
    let key = event.keyCode;
    if ( key === 82 && showLoseScreen ){
        startGame();
    }
}



// функции анимирования персонажа
let i = 0;
let r = 0;
let waitTime = 2;

function animateMovement(){

    if ( jumping ){
        playerSprite = playerJumpSprite.src;
    }

    else if ( falling ){
        playerSprite = playerFallSprite.src;
    }

    else if ( moveL || moveR ){
        playerSprite = PlayerMovementSprite[i].src;
        if ( waitTime === 0 ){
            playerSprite = PlayerMovementSprite[i % PlayerMovementSprite.length].src;
            i = ( i + 1 ) % PlayerMovementSprite.length;
            waitTime = 2;
        }
        else {
            waitTime --;
        }
    }

    else {
        playerSprite = "images/PlayerMovement/PlayerMovement.0003.png";
    }
}

function animateAttack(){

    if ( level === 1 ){
        level1Ground.x = -3370;
        playerSprite = PlayerAttackSprite.src;
        seashellDeath = true;
    }

    else if ( level === 2 ){
        level2Ground.x = -3370;
        playerSprite = PlayerAttackSprite.src;
        seashellDeath = true;
    }

    else if ( level === 3 ){
        level3Ground.x = -4710;
        playerSprite = PlayerAttackSprite.src;
        seashellDeath = true;
    }
}


// функция движения жемчужен
function spawnPearl(){
    if ( pearl.x < 0 || pearlActive === false ){
        if ( seashell.x > 1270 ){
            pearl.x = player.x+700;
        }
        else{
            pearl.x = seashell.x;
        }
    }
}

// инициализация жемчужен
function initializePearl(){
    pearlActive = true;
    if ( level === 1 ){
        pearlSpeed = 10;
    }
    else if ( level === 2 ){
        pearlSpeed = 11;
    }
    else if ( level === 3 ){
        pearlSpeed = 12;
    }
    clearInterval( pearlInterval );
}

// случайный интервал от 5 до 6 для жемчужен
function getRandomInterval(){
    return Math.floor( Math.random() * ( 6000 - 5000 + 1 ) + 5000 );
}

