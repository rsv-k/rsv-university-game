import Object from '../object.js';
import parkMap from '../parkMap.js';

export default class ComputerPigeon extends Object {
    constructor(width, height, color, name, gangMember = false) {
        super(width, height, color, name);

        this.speed = 5;
        this.gang = [];
        this.hp = 100;

        this.destination = {
            x1: Math.random() * parkMap.w,
            y1: Math.random() * parkMap.h
        };
    }

    move() {
        this.draw();
        this.showHP();

        if (this.hp <= 0) return this.delete();

        // coordinates of destination
        let x = this.gang[0].destination.x1; 
        let y = this.gang[0].destination.y1;

        const tx = x - this.center.x1;
        const ty = y - this.center.y1;
        const dist = Math.sqrt(tx * tx + ty * ty);

        if (dist < 5 * this.gang.length) return this.gang[0]._setNewDestination();
        
        let velX = (tx / dist) * this.speed;
        let velY = (ty / dist) * this.speed;

        // prevent moving out of the park
        if (this.coordinates.x2 + this.speed >= parkMap.w && this.gang[0].destination.x1 - this.coordinates.x1 > 1) {
            this.gang[0]._setNewDestination();
            velX = 0;
        }
        if (this.coordinates.y2 + this.speed >= parkMap.h && this.gang[0].destination.y1 - this.coordinates.y1 > 1) {
            this.gang[0]._setNewDestination();
            velY = 0;
        }
        
        const info = this.isTouching();
        if (info.touching) {

            if (info.touchingX2 || info.touchingX1) {
                velX = 0;
            } 

            if (info.touchingY2 || info.touchingY1) {
                velY = 0;
            }

            if (info.object && info.object.name.includes('Obstacle')) this.gang[0]._setNewDestination(info);
        }
        

        // search for neutral pigeons
        for (let i = 0; i < parkMap.neutralPigeons.length; i++) {
            const pigeon = parkMap.neutralPigeons[i];

            const tx = pigeon.center.x1 - this.center.x1;
            const ty = pigeon.center.y1 - this.center.y1;
            const dist = Math.sqrt(tx * tx + ty * ty);

            if (dist > 100 || (pigeon.takenBy.size > 0  && !pigeon.takenBy.has(this)) || this.gang.length > 4) continue;

            this.gang[0].destination.x1 = pigeon.center.x1;
            this.gang[0].destination.y1 = pigeon.center.y1;
        }

        //search for bread

        for (let i = 0; i < parkMap.breads.length; i++) {
            const bread = parkMap.breads[i];
            const tx = bread.center.x1 - this.center.x1;
            const ty = bread.center.y1 - this.center.y1;
            const dist = Math.sqrt(tx * tx + ty * ty);

            if (dist > 120 || this.gang.every(p => p.hp === 100)) continue


            this.gang[0].destination.x1 = bread.center.x1;
            this.gang[0].destination.y1 = bread.center.y1;
        }

        
        if (dist >= this.speed) {
            this.coordinates.x1 += velX;
            this.coordinates.y1 += velY;
        }
    }

    isTouching() {
        const info = {};
        
        for (let i = 0; i < parkMap.objects.length; i++) {
            const object = parkMap.objects[i];
            if (object === this) continue;

            // no horizontal overlap
            if (this.coordinates.x1 - this.speed >= object.coordinates.x2 || object.coordinates.x1 >= this.coordinates.x2 + this.speed) continue;
            // no vertical overlap
            if (this.coordinates.y1 - this.speed >= object.coordinates.y2 || object.coordinates.y1 >= this.coordinates.y2 + this.speed) continue;

            if (object.name.includes('Obstacle')) info.object = object;
            info.touching = true;

            //left side of object
            if (Math.abs(this.coordinates.x2 - object.coordinates.x1) < this.speed && this.gang[0].destination.x1 - this.coordinates.x1 > 1) {
                info.touchingX2 = true;
            }
            // top side of object
            else if (Math.abs(this.coordinates.y2 - object.coordinates.y1) < this.speed && this.gang[0].destination.y1 - this.coordinates.y1 > 1) {
                info.touchingY2 = true;
            }
            // right side of object
            if (Math.abs(this.coordinates.x1 - object.coordinates.x2) < this.speed && this.gang[0].destination.x1 - this.coordinates.x2 < 1) {
                info.touchingX1 = true;
            }
            // top side of object
            else if (Math.abs(this.coordinates.y1 - object.coordinates.y2) < this.speed && this.gang[0].destination.y1 - this.coordinates.y2 < 1) {
                info.touchingY1 = true;
            }

        }
        
        return info;
    }

    _setNewDestination(obstacle) {
        if (!obstacle) {
            this.gang[0].destination.x1 = Math.random() * parkMap.w;
            this.gang[0].destination.y1 = Math.random() * parkMap.h;
            return;
        }

        if (!obstacle.object.name.includes('Obstacle')) return;

        // when pigeon touches the object, set new reflected destination of relative coordinate
        if (obstacle.touchingX2) {
            this.gang[0].destination.x1 = Math.random() * obstacle.object.coordinates.x1;
        } else if (obstacle.touchingX1) {
            this.gang[0].destination.x1 = obstacle.object.coordinates.x2 + Math.random() * parkMap.w;
        }
        
        if (obstacle.touchingY2) {
            this.gang[0].destination.y1 = Math.random() * obstacle.object.coordinates.y1;
        } else if (obstacle.touchingY1) {
            this.gang[0].destination.y1 = obstacle.object.coordinates.y2 + Math.random() * parkMap.h;
        }
    }

    showHP() {
        parkMap.ctx.fillStyle = 'red';
        parkMap.ctx.fillRect(this.coordinates.x1, this.coordinates.y1 - 15, this.width, this.height / 3);

        parkMap.ctx.fillStyle = 'green';
        parkMap.ctx.fillRect(this.coordinates.x1, this.coordinates.y1 - 15, (this.hp / 100) * this.width, this.height / 3);
    }

    delete() {
        const objectIndex = parkMap.objects.findIndex(pigeon => pigeon === this);
        parkMap.objects.splice(objectIndex, 1);

        const userindex = parkMap.computerPigeons.findIndex(pigeon => pigeon === this);
        parkMap.computerPigeons.splice(userindex, 1);

        const gangIndex = this.gang.findIndex(pigeon => pigeon === this);
        this.gang.splice(gangIndex, 1);
    }
}