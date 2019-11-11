import parkMap from './parkMap.js';
import Object from './object.js';
import UserPigeon from './creatures/userPigeon.js';
import ComputerPigeon from './creatures/computerPigeon.js';

parkMap.expand();
initObjects();
parkMap.canvas.addEventListener('click', e => {
    parkMap.userPigeons[0].destination.x1 = e.offsetX;
    parkMap.userPigeons[0].destination.y1 = e.offsetY;
});


function animation() {
    parkMap.ctx.clearRect(0, 0, parkMap.w, parkMap.h);
    
    parkMap.objects.forEach(object => object.draw());
    parkMap.userPigeons.forEach(object => object.move());
    parkMap.computerPigeons.forEach(object => object.move());

    requestAnimationFrame(animation);
}
animation();


function initObjects() {
    createFountains(3);
    createBenches(3);
    createStreetlight(3);
    createUserPigeon();
    createComputerPigeon();
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

function createUserPigeon() {
    let pigeon =  new UserPigeon(30, 30, '#fff', 'User pigeon');
    pigeon.gang.push(pigeon);
    parkMap.userPigeons.push(pigeon);
    parkMap.objects.push(pigeon);
}

function createComputerPigeon() {
    let pigeon = new ComputerPigeon(30, 30, 'ff0', 'Computer pigeon');
    pigeon.gang.push(pigeon);
    parkMap.computerPigeons.push(pigeon);
    parkMap.objects.push(pigeon);
}