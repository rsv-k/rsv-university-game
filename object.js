import parkMap from './parkMap.js';

export default class Object {
    constructor(width, height, color, name = 'Obstacle') {
        this.width = width;
        this.height = height;
        this.color = color;
        this.name = name;
        this.coordinates = this._setNewCoordinates();

        this.center = {
            x1: this.coordinates.x1 + (this.width / 2),
            y1: this.coordinates.y1 + (this.height / 2)
        }
    }

    _setNewCoordinates() {
        const x1 = Math.max(50, Math.random() * (parkMap.w - this.width - 50));
        const y1 = Math.max(50, Math.random() * (parkMap.h - this.height - 50));
        const x2 = x1 + this.width;
        const y2 = y1 + this.height;
        const coordinates = {x1, y1, x2, y2};

        if (parkMap.isPlaceTaken(coordinates)) return this._setNewCoordinates();

        return coordinates;
    }

    _updateEndCoordinates() {
        this.coordinates.x2 = this.coordinates.x1 + this.width;
        this.coordinates.y2 = this.coordinates.y1 + this.height;
    }
    _updateCenter() {
        this.center = {
            x1: this.coordinates.x1 + (this.width / 2),
            y1: this.coordinates.y1 + (this.height / 2)
        }
    }

    draw() {
        this._updateEndCoordinates();
        this._updateCenter();

        parkMap.ctx.fillStyle = this.color;
        parkMap.ctx.fillRect(this.coordinates.x1, this.coordinates.y1, this.width, this.height);
    }
}