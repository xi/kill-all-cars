export const DIR = {
    NORTH: 0,
    SOUTH: 1,
    WEST: 2,
    EAST: 3,
};

export const dirToAxis = function(dir) {
    return (dir === DIR.NORTH || dir === DIR.SOUTH) ? 0 : 1;
};

export const TERRAIN = {
    GREENERY: 1,
    STREET: 2,
    RESIDENTIAL: 3,
    COMMERCIAL: 4,
};
