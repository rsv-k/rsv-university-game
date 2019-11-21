import parkMap from './parkMap.js';
import Object from './object.js';
import UserPigeon from './creatures/userPigeon.js';
import ComputerPigeon from './creatures/computerPigeon.js';
import NeutralPigeon from './creatures/neutralPigeon.js';
import Human from './creatures/human.js';

parkMap.expand();
initObjects();
let stopGame = false;

parkMap.canvas.addEventListener('click', e => {
    parkMap.userPigeons[0].destination.x1 = e.offsetX;
    parkMap.userPigeons[0].destination.y1 = e.offsetY;
});

function animation() {
    if (stopGame) return;
    adjustMap();
    parkMap.ctx.clearRect(0, 0, parkMap.w, parkMap.h);

    parkMap.objects.forEach(object => object.draw());
    parkMap.breads.forEach(bread => {
        bread.draw()
        bread.isAnyOneAround();
    });

    parkMap.userPigeons.forEach(object => object.move());
    parkMap.computerPigeons.forEach(object => object.move());
    parkMap.neutralPigeons.forEach(pigeon => {
        pigeon.isAnyoneAround();
    })
    parkMap.humans.forEach(human => {
        human.move();
    })


    // watch the result (win or lose)
    if (parkMap.userPigeons.length === 0) {
        stopGame = true;
        const result = document.querySelector('.menu__result');
        const play = document.querySelector('.menu__play');
        document.querySelector('.menu').style.display = '';
        result.style.display = 'block';
        result.innerHTML = 'You lost!';
        play.innerHTML = 'Play again';
    }
    else if (parkMap.computerPigeons.length === 0) {
        stopGame = true;
        const result = document.querySelector('.menu__result');
        const play = document.querySelector('.menu__play');
        document.querySelector('.menu').style.display = '';
        result.style.display = 'block';
        result.innerHTML = 'You won!';
        play.innerHTML = 'Play again';
    }
    
    requestAnimationFrame(animation);
}

function initObjects() {
    createTownHall();
    createFountains(25);
    createBenches(25);
    createStreetlight(25);
    createUserPigeon();
    createComputerPigeons(1);
    createNeutralPigeons(5);
    createHumans(8);
}

function createFountains(amount) {
    let i = 0;

    while(i < amount) {
        i++;
        parkMap.add(new Object(200, 200, 'red'));       
    }
}

function createBenches(amount) {
    let i = 0;

    while(i < amount) {
        i++;

        const width = 50 + Math.round((Math.random() * 1)) * 50; 
        parkMap.add(new Object(width, width > 50 ? width / 2 : width * 2, 'red'))
    }
}

function createStreetlight(amount) {
    let i = 0;

    while(i < amount) {
        i++;

        parkMap.add(new Object(50, 50, 'red'));
    }
}

function createTownHall() {
    parkMap.add(new Object(400, 400, 'red'));
}

function createUserPigeon() {
    let pigeon =  new UserPigeon(30, 30, '#fff', 'User pigeon');
    pigeon.gang.push(pigeon);
    parkMap.userPigeons.push(pigeon);
    parkMap.objects.push(pigeon);
}

function createComputerPigeons(amount) {
    let i = 0;
    
    while (i < amount) {
        let pigeon = new ComputerPigeon(30, 30, '#ff0', 'Computer pigeon');
        pigeon.gang.push(pigeon);

        parkMap.computerPigeons.push(pigeon);
        parkMap.objects.push(pigeon);
        i++;
    }
    
}

function createNeutralPigeons(amount) {
    let i = 0;
    
    while (i < amount) {
        let pigeon = new NeutralPigeon(30, 30, '#f15', 'Neutral pigeon');

        parkMap.neutralPigeons.push(pigeon);
        parkMap.objects.push(pigeon);
        i++;
    }
    
}

function adjustMap() {
    const pigeon = parkMap.userPigeons[0];
    const x = pigeon.center.x1;
    const y = pigeon.center.y1;

    const center = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    }

    let adjustX = x - center.x;
    let adjustY = y - center.y;
    
    if (adjustX < 0) adjustX = 0;
    else if (adjustX + window.innerWidth > parkMap.w) adjustX = parkMap.w - window.innerWidth;

    if (adjustY < 0) adjustY = 0;
    else if (adjustY + window.innerHeight > parkMap.h) adjustY = parkMap.h - window.innerHeight;

    parkMap.canvas.style.transform = `translate(-${adjustX}px, -${adjustY}px)`;
}

function createHumans(amount) {
    let i = 0;

    while (i < amount) {
        parkMap.humans.push(new Human(40, 40, '#f55', 'Human'));
        i++;
    }
}

function clearAll() {
    parkMap.objects = [];
    parkMap.userPigeons = [];
    parkMap.computerPigeons = [];
    parkMap.neutralPigeons = [];
    parkMap.humans = [];
    parkMap.breads = [];
}

const buttonPlay = document.querySelector('.menu__play');
buttonPlay.addEventListener('click', e => {
    e.target.parentElement.style.display = 'none';
    if (stopGame) {
        stopGame = false;
        clearAll();
        initObjects();
    }
    

    animation();
});
