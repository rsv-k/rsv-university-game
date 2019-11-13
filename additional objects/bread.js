import Object from '../object.js';
import parkMap from '../parkMap.js';

export default class Bread extends Object {
    
    isAnyOneAround() {
        const pigeons = [...parkMap.userPigeons, ...parkMap.computerPigeons];

        for (let i = 0; i < pigeons.length; i++) {
            const pigeon = pigeons[i];
            const tx = pigeon.center.x1 - this.center.x1;
            const ty = pigeon.center.y1 - this.center.y1;
            const dist = Math.sqrt(tx * tx + ty * ty);
            
            if (dist > 20) {
                continue;
            }

            const damagedPigeons = pigeon.gang.filter(p => p.hp !== 100);
            if (!damagedPigeons.length) return;

            const randomPigeonToFeed = Math.floor(Math.random() * damagedPigeons.length);
            damagedPigeons[randomPigeonToFeed].hp = Math.min(100, pigeon.hp + Math.round(Math.random() * 20));
            this._delete();
        }
    }

    _delete() {
        const index = parkMap.breads.indexOf(this);
        parkMap.breads.splice(index, 1);
    }
}