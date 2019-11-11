import parkMap from '../parkMap.js';
import Object from '../object.js';
import ComputerPigeon from './computerPigeon.js';
import UserPigeon from './userPigeon.js';

export default class NeutralPigeon extends Object {
    constructor(width, height, color, name) {
        super(width, height, color, name);

        this.takenBy = new Set();
        this.timers = new Map();

    }

    isAnyoneAround() {
        const pigeons = [...parkMap.userPigeons, ...parkMap.computerPigeons];

        for (let i = 0; i < pigeons.length; i++) {
            const pigeon = pigeons[i];
            const tx = pigeon.center.x1 - this.center.x1;
            const ty = pigeon.center.y1 - this.center.y1;
            const dist = Math.sqrt(tx * tx + ty * ty);
            
            const timePassed = (new Date() - this.timers.get(pigeon)) / 1000;

            if (dist > 100 || pigeon.gang.length > 4) {
                this.timers.delete(pigeon);
                this.takenBy.delete(pigeon);
                continue;
            }

            if (this.takenBy.size === 0) {
                this.timers.set(pigeon, new Date());
                this.takenBy.add(pigeon);
            }
            this._showProgressBar(timePassed);

            if (timePassed >= 3) {
                this._joinGang(pigeon);
            }
        }
    }

    _showProgressBar(time) {
        const bar = {
            x: this.coordinates.x1 - this.width / 2,
            y: this.coordinates.y1 - this.height / 2,
            w: this.width * 2,
            h: this.height / 2
        }

        parkMap.ctx.strokeStyle = '#fff';
        parkMap.ctx.strokeRect(bar.x, bar.y, bar.w, bar.h);
        parkMap.ctx.fillStyle = 'blue';
        parkMap.ctx.fillRect(bar.x + 1, bar.y + 1, Math.min(time * 20, bar.w - 1), bar.h - 1);
    }

    _joinGang(pigeon) {
        let newPigeon = null;

        if (pigeon.name.includes('Computer')) {
            newPigeon = new ComputerPigeon(30, 30, pigeon.color, pigeon.name);
            parkMap.computerPigeons.push(newPigeon);
            pigeon.gang[0]._setNewDestination();
            newPigeon.coordinates.x1 = this.coordinates.x1;
            newPigeon.coordinates.y1 = this.coordinates.y1;
            pigeon.gang.push(newPigeon);
            newPigeon.gang = pigeon.gang;
            parkMap.objects.push(newPigeon);
        }
        else {
            newPigeon = new UserPigeon(30, 30, pigeon.color, pigeon.name);
            parkMap.userPigeons.push(newPigeon);
            newPigeon.coordinates.x1 = this.coordinates.x1;
            newPigeon.coordinates.y1 = this.coordinates.y1;
            pigeon.gang.push(newPigeon);
            newPigeon.gang = pigeon.gang;
            parkMap.objects.push(newPigeon);
        }
        
        
        
        this._delete();
    }

    _delete() {
        const index = parkMap.neutralPigeons.findIndex(pigeon => pigeon === this);
        if (index === -1) return;
        parkMap.neutralPigeons.splice(index, 1);

        const mapIndex = parkMap.objects.findIndex(object => object === this);
        if (mapIndex === -1) return;
        parkMap.objects.splice(mapIndex, 1);
    }
}