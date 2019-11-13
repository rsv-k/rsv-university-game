import Object from '../object.js';
import parkMap from '../parkMap.js';
import Bread from '../additional objects/bread.js';

export default class Human extends Object {
    constructor(...args) {
        super(...args);

        this.speed = 7;
        this.isDropped = false;
        this.destination = {
            x1: Math.random() * parkMap.w,
            y1: Math.random() * parkMap.h
        };
        this.damagedPigeons = new Map();
    }

    move() {
        this.draw();
        if (!this.isDropped) {
            this.dropTheBread();
        }

        // coordinates of destination
        let x = this.destination.x1; 
        let y = this.destination.y1;

        const tx = x - this.center.x1;
        const ty = y - this.center.y1;
        const dist = Math.sqrt(tx * tx + ty * ty);

        if (dist < 25) return this._setNewDestination();
        
        let velX = (tx / dist) * this.speed;
        let velY = (ty / dist) * this.speed;

        // prevent moving out of the park
        if (this.coordinates.x2 + this.speed >= parkMap.w && this.destination.x1 - this.coordinates.x1 > 1) {
            this._setNewDestination();
            velX = 0;
        }
        if (this.coordinates.y2 + this.speed >= parkMap.h && this.destination.y1 - this.coordinates.y1 > 1) {
            this._setNewDestination();
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

            if (info.object && info.object.name.includes('Obstacle')) this._setNewDestination(info);
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
            if (this.damagedPigeons.has(object) || object.name.includes('Neutral')) continue;

            // no horizontal overlap
            if (this.coordinates.x1 - this.speed >= object.coordinates.x2 || object.coordinates.x1 >= this.coordinates.x2 + this.speed) continue;
            // no vertical overlap
            if (this.coordinates.y1 - this.speed >= object.coordinates.y2 || object.coordinates.y1 >= this.coordinates.y2 + this.speed) continue;

            if (object.name.includes('pigeon')) {
                object.hp -= 5 + Math.round(Math.random() * 15);
                this.damagedPigeons.set(object, 'touched');

                continue;
            }


            if (object.name.includes('Obstacle')) info.object = object;
            info.touching = true;

            //left side of object
            if (Math.abs(this.coordinates.x2 - object.coordinates.x1) < this.speed && this.destination.x1 - this.coordinates.x1 > 1) {
                info.touchingX2 = true;
            }
            // top side of object
            else if (Math.abs(this.coordinates.y2 - object.coordinates.y1) < this.speed && this.destination.y1 - this.coordinates.y1 > 1) {
                info.touchingY2 = true;
            }
            // right side of object
            if (Math.abs(this.coordinates.x1 - object.coordinates.x2) < this.speed && this.destination.x1 - this.coordinates.x2 < 1) {
                info.touchingX1 = true;
            }
            // top side of object
            else if (Math.abs(this.coordinates.y1 - object.coordinates.y2) < this.speed && this.destination.y1 - this.coordinates.y2 < 1) {
                info.touchingY1 = true;
            }

        }
        
        return info;
    }

    _setNewDestination(obstacle) {
        this.damagedPigeons.clear();
        if (!obstacle) {
            this.destination.x1 = Math.random() * parkMap.w;
            this.destination.y1 = Math.random() * parkMap.h;
            return;
        }

        if (!obstacle.object.name.includes('Obstacle')) return;

        // when pigeon touches the object, set new reflected destination of relative coordinate
        if (obstacle.touchingX2) {
            this.destination.x1 = Math.random() * obstacle.object.coordinates.x1;
        } else if (obstacle.touchingX1) {
            this.destination.x1 = obstacle.object.coordinates.x2 + Math.random() * parkMap.w;
        }
        
        if (obstacle.touchingY2) {
            this.destination.y1 = Math.random() * obstacle.object.coordinates.y1;
        } else if (obstacle.touchingY1) {
            this.destination.y1 = obstacle.object.coordinates.y2 + Math.random() * parkMap.h;
        }
    }

    dropTheBread() {
        const bread = new Bread(15, 15, 'Bread', '#0f15');
        bread.coordinates.x1 = this.coordinates.x1;
        bread.coordinates.y1 = this.coordinates.y1;
        parkMap.breads.push(bread);
        this.isDropped = true;

        setTimeout(() => {
            this.isDropped = false;
        }, 1.5 * 60 * 1000);
    }
}