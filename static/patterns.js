import { TERRAIN } from './constants.js';

// TODO: deduce height from img aspect ratio
const PATTERNS = [
    {
        x: [[], [TERRAIN.RESIDENTIAL, TERRAIN.RESIDENTIAL], []],
        y: [[], [TERRAIN.RESIDENTIAL, TERRAIN.RESIDENTIAL, TERRAIN.RESIDENTIAL], []],
        img: document.getElementById('building01'),
        height: 3,
    },
    {
        x: [[], [TERRAIN.RESIDENTIAL, TERRAIN.RESIDENTIAL], []],
        y: [[], [TERRAIN.RESIDENTIAL, TERRAIN.RESIDENTIAL], []],
        img: document.getElementById('building01'),
        height: 3,
    },
    {
        x: [[], [TERRAIN.RESIDENTIAL], []],
        y: [[], [TERRAIN.RESIDENTIAL], []],
        img: document.getElementById('building01'),
        height: 3,
    },
    {
        x: [[], [TERRAIN.RESIDENTIAL], []],
        y: [[], [TERRAIN.GREENERY], []],
        img: document.getElementById('building02'),
        height: 2,
    },
    {
        x: [[], [TERRAIN.GREENERY], []],
        y: [[], [TERRAIN.RESIDENTIAL], []],
        img: document.getElementById('building02'),
        height: 2,
    },
];

function getAxisMatches(axis, patternAxis) {
    const offset = patternAxis[0].length;
    const flattened = Array.prototype.concat.apply([], patternAxis);
    return axis.map((_, pos) => (
        pos - offset >= 0
        && pos - offset + flattened.length <= axis.length
        && flattened.every((terrain, i) => axis[pos - offset + i] === terrain)
    ));
}

function settleIfFree(x0, y0, pattern, settled) {
    for (let y = y0; y < y0 + pattern.y[1].length; y++) {
        for (let x = x0; x < x0 + pattern.x[1].length; x++) {
            if (settled[y][x]) {
                return false;
            }
        }
    }
    for (let y = y0; y < y0 + pattern.y[1].length; y++) {
        for (let x = x0; x < x0 + pattern.x[1].length; x++) {
            settled[y][x] = true;
        }
    }
    return true;
}

export function patternFill(block) {
    const settled = block.yAxis.map(() => block.xAxis.map(() => false));
    const result = block.yAxis.map(() => block.xAxis.map(() => null));

    for (const pattern of PATTERNS) {
        const xOk = getAxisMatches(block.xAxis, pattern.x);
        const yOk = getAxisMatches(block.yAxis, pattern.y);

        for (let y = 0; y < yOk.length; y++) {
            if (yOk[y]) {
                for (let x = xOk.length - 1; x >= 0; x--) {
                    if (xOk[x] && settleIfFree(x, y, pattern, settled)) {
                        result[y][x] = pattern;
                    }
                }
            }
        }
    }

    return result;
}
