import Object from '../object.js';
import parkMap from '../parkMap.js';

export default class UserPigeon extends Object{
    constructor(...args) {
        super(...args);

        this.speed = 5;
        this.gang = [];

        if (!this.gang.length) {
            this.destination = {
                x1: this.coordinates.x1,
                y1: this.coordinates.xy
            }
        }
    }

    move() {
        this.draw();
        // coordinates of destination
        let x = this.gang[0].destination.x1; 
        let y = this.gang[0].destination.y1;
        
        const tx = x - this.coordinates.x1;
        const ty = y - this.coordinates.y1;
        const dist = Math.sqrt(tx * tx + ty * ty);

        let velX = (tx / dist) * this.speed;
        let velY = (ty / dist) * this.speed;
        
        const info = this.isTouching();
        if (info.touching) {
            if (info.touchingX2 || info.touchingX1) {
                velX = 0;
            } 

            if (info.touchingY2 || info.touchingY1) {
                velY = 0;
            }
        }
        
        if (dist >= this.speed) {
            this.coordinates.x1 += velX;
            this.coordinates.y1 += velY;
        }
    }

    isTouching() {
        const info = {
        }
        const extraSpace = 2;
        for (let i = 0; i < parkMap.objects.length; i++) {
            const object = parkMap.objects[i];
            if (object === this) continue;

            // no horizontal overlap
            if (this.coordinates.x1 - this.speed >= object.coordinates.x2 || object.coordinates.x1 >= this.coordinates.x2 + this.speed) continue;
            // no vertical overlap
            if (this.coordinates.y1 - this.speed >= object.coordinates.y2 || object.coordinates.y1 >= this.coordinates.y2 + this.speed) continue;

            info.object = object;
            info.touching = true;

            //left side of object
            if (Math.abs(this.coordinates.x2 - object.coordinates.x1) < this.speed && this.gang[0].destination.x1 - this.coordinates.x1 > 1) {
                info.touchingX2 = true;
                this.coordinates.x1 = info.object.coordinates.x1 - this.width - extraSpace;
            }
            // top side of object
            if (Math.abs(this.coordinates.y2 - object.coordinates.y1) < this.speed && this.gang[0].destination.y1 - this.coordinates.y1 > 1) {
                info.touchingY2 = true;
                this.coordinates.y1 = info.object.coordinates.y1 - this.height - extraSpace;
            }
            // right side of object
            if (Math.abs(this.coordinates.x1 - object.coordinates.x2) < this.speed && this.gang[0].destination.x1 - this.coordinates.x2 < 1) {
                info.touchingX1 = true;
                this.coordinates.x1 = info.object.coordinates.x2 + extraSpace;
            }
            // top side of object
            if (Math.abs(this.coordinates.y1 - object.coordinates.y2) < this.speed && this.gang[0].destination.y1 - this.coordinates.y2 < 1) {
                info.touchingY1 = true;
                this.coordinates.y1 = info.object.coordinates.y2 + extraSpace;
            }
            
        }

        return info;
    }
}