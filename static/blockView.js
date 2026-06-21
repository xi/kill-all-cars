import { TERRAIN } from './constants.js';
import { getColor } from './model.js';

const FACTOR = 0.4;

export class BlockView {
    constructor(block, ctx) {
        this.block = block;
        this.ctx = ctx;

        this.size = Math.min(ctx.canvas.width, ctx.canvas.height / FACTOR) / (block.constructor.size + 2) / 2;
        this.x0 = ctx.canvas.width / 2 - this.size * block.constructor.size;
        this.y0 = ctx.canvas.height / 2;
    }

    toScreenXY(x, y) {
        return [
            this.x0 + (y + x) * this.size,
            this.y0 + (y - x) * this.size * FACTOR,
        ];
    }

    fromScreenXY(x, y) {
        const sum = (x - this.x0) / this.size;
        const dif = (y - this.y0) / this.size / FACTOR;
        return [
            Math.floor((sum - dif) / 2),
            Math.floor((sum + dif) / 2),
        ];
    }

    render(state) {
        this.ctx.fillStyle = 'currentColor';
        this.ctx.font = '16px sans-serif';
        this.ctx.fillText(`residential space: ${this.block.residential}`, (this.ctx.canvas.width - 2 * PADDING) / 4 * 0 + PADDING, PADDING);
        this.ctx.fillText(`commercial served: ${this.block.commercialServed}`, (this.ctx.canvas.width - 2 * PADDING) / 4 * 1 + PADDING, PADDING);
        this.ctx.fillText(`green served: ${this.block.greenServed}`, (this.ctx.canvas.width - 2 * PADDING) / 4 * 2 + PADDING, PADDING);
        this.ctx.fillText(`pollution: ${this.block.pollution}`, (this.ctx.canvas.width - 2 * PADDING) / 4 * 3 + PADDING, PADDING);

        for (let y = 0; y < this.block.constructor.size; y++) {
            for (let x = this.block.constructor.size - 1; x >= 0; x--) {
                this.ctx.beginPath();
                if (x === state.xHighlight || y === state.yHighlight) {
                    this.ctx.fillStyle = getColor(state.terrain, state.terrain);
                } else {
                    this.ctx.fillStyle = this.block.getTileColor(x, y);
                }
                this.ctx.moveTo(...this.toScreenXY(x, y));
                this.ctx.lineTo(...this.toScreenXY(x, y + 1));
                this.ctx.lineTo(...this.toScreenXY(x + 1, y + 1));
                this.ctx.lineTo(...this.toScreenXY(x + 1, y));
                this.ctx.closePath();
                this.ctx.fill();
            }
        }
    }

    handleKey(event, state) {
        if (event.key === 'Escape') {
            state.block = null;
            return true;
        } else if (event.key === '1') {
            state.terrain = TERRAIN.GREENERY;
            return true;
        } else if (event.key === '2') {
            state.terrain = TERRAIN.STREET;
            return true;
        } else if (event.key === '3') {
            state.terrain = TERRAIN.RESIDENTIAL;
            return true;
        } else if (event.key === '4') {
            state.terrain = TERRAIN.COMMERCIAL;
            return true;
        }
    }

    handleClick(event, state) {
        const size = this.block.constructor.size;
        const [x, y] = this.fromScreenXY(event.clientX, event.clientY);
        const yy = size - y - 1;
        if (x < -2 || y < -2 || x >= size + 2 || y >= size + 2) {
            state.block = null;
            return true;
        }
        if (-2 <= yy && yy < 0 && x >= 0 && x < size) {
            this.block.xAxis[x] = state.terrain;
            return true;
        }
        if (-2 <= x && x < 0 && y >= 0 && y < size) {
            this.block.yAxis[y] = state.terrain;
            return true;
        }
    }

    handleMove(event, state) {
        const size = this.block.constructor.size;
        const [x, y] = this.fromScreenXY(event.clientX, event.clientY);
        const yy = size - y - 1;
        if (-2 <= yy && yy < 0 && x >= 0 && x < size) {
            if (state.xHighlight !== x) {
                state.xHighlight = x;
                state.yHighlight = null;
                return true;
            }
        } else if (-2 <= x && x < 0 && y >= 0 && y < size) {
            if (state.yHighlight !== y) {
                state.yHighlight = y;
                state.xHighlight = null;
                return true;
            }
        } else {
            if (state.xHighlight !== null || state.yHighlight !== null) {
                state.xHighlight = null;
                state.yHighlight = null;
                return true;
            }
        }
    }

    handle(event, state) {
        if (event.type === 'keyup') {
            return this.handleKey(event, state);
        } else if (event.type === 'click') {
            return this.handleClick(event, state);
        } else if (event.type === 'mousemove') {
            return this.handleMove(event, state);
        }
    }
}
