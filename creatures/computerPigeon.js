import Object from '../object.js';
import parkMap from '../parkMap.js';

export default class ComputerPigeon extends Object {
    constructor(width, height, color, name) {
        super(width, height, color, name);

        this.speed = 5;
        this.gang = [];
        this.hp = 100;

        this.attacking = {
            who: null,
            action: false,
            back: false,
            timer: null
        };

        this.currentCoordinates = {
            x1: null,
            y1: null
        }

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

        if (dist < 20) return this.gang[0]._setNewDestination();
        
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

        //search for enemies and establish aim to atack
        if (!this.attacking.who) {
            const enemies = shuffled([...parkMap.computerPigeons, ...parkMap.userPigeons]);
            for (let i = 0; i < enemies.length; i++) {
                const pigeon = enemies[i];
                if (this.gang.includes(pigeon)) continue;

                const tx = pigeon.center.x1 - this.center.x1;
                const ty = pigeon.center.y1 - this.center.y1;
                const dist = Math.sqrt(tx * tx + ty * ty);

                if (dist > 100) continue;

                this.attacking.who = pigeon;
                this.attacking.action = this.attacking.timer ? false : true;

                // coordinates of position when attack was launched
                this.currentCoordinates.x1 = this.coordinates.x1;
                this.currentCoordinates.y1 = this.coordinates.y1;
                break;
            }
        }
        else {
            const tx = this.attacking.who.center.x1 - this.center.x1;
            const ty = this.attacking.who.center.y1 - this.center.y1;
            const dist = Math.sqrt(tx * tx + ty * ty);
            
            if (dist > 100) {
                this.attacking.action = false;
                this.attacking.who = null;
                return;
            }
            
            if (this.attacking.action) return this.attack();
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
        
        if (dist >= this.speed && !this.gang.some(p => p.attacking.who)) {
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

        delete this;
    }

    attack() {
        parkMap.ctx.clearRect(this.coordinates.x1, this.coordinates.y1, this.width, this.height);
        this.draw();
        this.showHP();

        //coordinates of enemy
        let tx = this.attacking.who.center.x1 - this.center.x1;
        let ty = this.attacking.who.center.y1 - this.center.y1;

        // move to coordinates from which attack was launched
        if (this.attacking.back) {
            if (parkMap.isReservedTaken(this)) {
                const signs = [1, -1];
                this.currentCoordinates.x1 += 30 * signs[Math.round(Math.random())];
                this.currentCoordinates.y1 += 30 * signs[Math.round(Math.random())];
                return;
            }

            tx = this.currentCoordinates.x1 - this.coordinates.x1;
            ty = this.currentCoordinates.y1 - this.coordinates.y1;
        }

        const dist = Math.sqrt(tx * tx + ty * ty);

        let velX = (tx / dist) * (this.speed * 2);
        let velY = (ty / dist) * (this.speed * 2);

        if (dist >= this.speed) {
            this.coordinates.x1 += velX;
            this.coordinates.y1 += velY;
        }
        
        if (this.attacking.back && dist <= this.speed * 2) {
            this.attacking.back = false;
            this.attacking.action = false;
            this.attacking.timer = true;

            //set the coordinates exactly where previous were
            this.coordinates.x1 = this.currentCoordinates.x1;
            this.coordinates.y1 = this.currentCoordinates.y1;

            setTimeout(() => {
                this.attacking.action = true;
                this.attacking.timer = false;

                if (this.attacking.who && this.attacking.who.hp <= 0) this.attacking.who = null;
            }, 1500);
            return;
        }

        if (dist < 30 && !this.attacking.back) {
            this.attacking.back = true;
            this.attacking.who.hp -= Math.round(5 + Math.random() * (10 - 5));
        }
    }
}

function shuffled(array) {
    const copy = [...array];
    copy.sort(() => Math.random() - 0.5);

    return copy;
}