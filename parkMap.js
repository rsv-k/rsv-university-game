export default class parkMap {
    static canvas = document.querySelector('canvas');
    static ctx = parkMap.canvas.getContext('2d');
    static w = 3000;
    static h = 3000;

    static objects = [];
    static userPigeons = [];
    static computerPigeons = [];
    static neutralPigeons = [];
    static humans = [];
    static breads = [];

    static expand() {
        parkMap.canvas.width = parkMap.w;
        parkMap.canvas.height = parkMap.h;
    }

    static add(obj) {
        parkMap.objects.push(obj);
    }

    static isPlaceTaken(a) {
        const extraSpace = 50;
        return parkMap.objects.some(o => {
            const b = o.coordinates;
            // no horizontal overlap
            if (a.x1 - extraSpace >= b.x2 || b.x1 >= a.x2 + extraSpace) return false;

            // no vertical overlap
            if (a.y1 - extraSpace >= b.y2 || b.y1 >= a.y2 + extraSpace) return false;

            return true;
        });
    }

    static isReservedTaken(a) {
        return a.gang.some(b => {
            if (a === b) return false;

            // no horizontal overlap
            if (a.currentCoordinates.x1 >= b.coordinates.x2 || b.coordinates.x1 >= a.currentCoordinates.x1 + a.width ) return false;

            // no vertical overlap
            if (a.currentCoordinates.y1 >= b.coordinates.x1 || b.coordinates.y1 >= a.currentCoordinates.y1 + a.height) return false;

            return true;
        });
    }
}
