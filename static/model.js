import { choice } from './utils.js';
import { DIR, TERRAIN } from './constants.js';

const COLORS = {
    [TERRAIN.GREENERY]: [10, 130, 10],
    [TERRAIN.STREET]: [90, 90, 90],
    [TERRAIN.RESIDENTIAL]: [110, 60, 60],
    [TERRAIN.COMMERCIAL]: [240, 250, 10],
};
const NON_STREET = [
    TERRAIN.GREENERY,
    TERRAIN.RESIDENTIAL,
    TERRAIN.COMMERCIAL,
];

export const getColor = function(tx, ty) {
    let [r, g, b] = COLORS[TERRAIN.STREET];
    if (!ty) {
        [r, g, b] = COLORS[tx];
    } else if (tx !== TERRAIN.STREET && ty !== TERRAIN.STREET) {
        [r, g, b] = COLORS[tx].map((c, i) => (c + COLORS[ty][i]) / 2);
    }
    return `rgb(${r} ${g} ${b})`;
};

class Block {
    static size = 11;

    constructor() {
        this.xAxis = Array(Block.size);
        this.yAxis = Array(Block.size);
    }

    static random() {
        const block = new Block();

        const streetX = Math.random() * (this.size / 2 - 3) + 2;
        for (let x = 0; x < Block.size; x++) {
            if (streetX <= x && x <= (this.size - streetX - 1)) {
                block.xAxis[x] = TERRAIN.STREET;
            } else {
                block.xAxis[x] = choice(Object.values(NON_STREET));
            }
        }

        const streetY = Math.random() * (this.size / 2 - 2) + 1;
        for (let y = 0; y < Block.size; y++) {
            if (streetY <= y && y <= (this.size - streetY - 1)) {
                block.yAxis[y] = TERRAIN.STREET;
            } else {
                block.yAxis[y] = choice(Object.values(NON_STREET));
            }
        }

        return block;
    }

    getTileColor(x, y) {
        return getColor(this.xAxis[x], this.yAxis[y]);
    }
}

export class City {
    static width = 5;
    static height = 4;

    constructor() {
        this.boundaryDemand = Array(Object.values(DIR).length);
        this.boundaryDemand[DIR.NORTH] = Array(City.width);
        this.boundaryDemand[DIR.SOUTH] = Array(City.width);
        this.boundaryDemand[DIR.WEST] = Array(City.height);
        this.boundaryDemand[DIR.EAST] = Array(City.height);

        this.boundarySupply = Array(Object.values(DIR).length);
        this.boundarySupply[DIR.NORTH] = Array(City.width);
        this.boundarySupply[DIR.SOUTH] = Array(City.width);
        this.boundarySupply[DIR.WEST] = Array(City.height);
        this.boundarySupply[DIR.EAST] = Array(City.height);

        this.blocks = Array(City.height);
        for (let y = 0; y < City.height; y++) {
            this.blocks[y] = Array(City.width);
        }
    }

    static random() {
        const city = new City();

        for (let x = 0; x < City.width; x++) {
            city.boundaryDemand[DIR.NORTH][x] = Math.random();
            city.boundarySupply[DIR.NORTH][x] = Math.random();
            city.boundaryDemand[DIR.SOUTH][x] = Math.random();
            city.boundarySupply[DIR.SOUTH][x] = Math.random();
        }
        for (let y = 0; y < City.height; y++) {
            city.boundaryDemand[DIR.WEST][y] = Math.random();
            city.boundarySupply[DIR.WEST][y] = Math.random();
            city.boundaryDemand[DIR.EAST][y] = Math.random();
            city.boundarySupply[DIR.EAST][y] = Math.random();
        }

        for (let y = 0; y < City.height; y++) {
            for (let x = 0; x < City.width; x++) {
                city.blocks[y][x] = Block.random();
            }
        }

        return city;
    }
}
