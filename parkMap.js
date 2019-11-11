export default class parkMap {
    static canvas = document.querySelector('canvas');
    static ctx = parkMap.canvas.getContext('2d');
    static w = window.innerWidth;
    static h = window.innerHeight;

    static objects = [];
    static userPigeons = [];
    static computerPigeons = [];

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
}
