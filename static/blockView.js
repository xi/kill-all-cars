import { TERRAIN, DIR } from './constants.js';
import { getColor } from './model.js';

const FACTOR = 0.4;
const PADDING = 20;
const HEADER_SIZE = 25;
const FOOTER_SIZE = 50;

function renderLines(ctx, lines, x0, y0, fontSize) {
    ctx.fillStyle = 'currentColor';
    ctx.font = `${fontSize}px sans-serif`;
    lines.forEach((line, i) => {
        ctx.fillText(line, x0, y0 + fontSize * 1.4 * i);
    });
}

export class BlockView {
    constructor(block, ctx) {
        this.block = block;
        this.ctx = ctx;

        const height = ctx.canvas.height - HEADER_SIZE - FOOTER_SIZE;
        this.size = Math.min(ctx.canvas.width, height / FACTOR) / (block.constructor.size + 2) / 2;
        this.x0 = ctx.canvas.width / 2 - this.size * block.constructor.size;
        this.y0 = HEADER_SIZE + height / 2;

        this.buttons = Object.values(TERRAIN).map((terrain, i) => ({
            terrain: terrain,
            x: ctx.canvas.width / 2 + FOOTER_SIZE * 1.1 * (i - 2),
            y: ctx.canvas.height - FOOTER_SIZE,
            width: FOOTER_SIZE,
            height: FOOTER_SIZE,
            handle: (event, state) => {
                state.terrain = terrain;
                return true;
            },
        }));
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

    renderHeader() {
        const w = (this.ctx.canvas.width - 2 * PADDING) / 4;
        this.ctx.fillStyle = 'currentColor';
        this.ctx.font = '16px sans-serif';
        this.ctx.fillText(`Residents: ${Math.round(this.block.residential * 100)}K`, w * 0 + PADDING, PADDING);
        this.ctx.fillText(`Service Access: ${Math.round(this.block.commercialServed * 100)}%`, w * 1 + PADDING, PADDING);
        this.ctx.fillText(`Nature Access: ${Math.round(this.block.greenServed * 100)}%`, w * 2 + PADDING, PADDING);
        this.ctx.fillText(`Air Quality: ${Math.round(100 - this.block.pollution * 100)}%`, w * 3 + PADDING, PADDING);
    }

    renderDebug(dir, x0, y0) {
        const cars = this.block.flowTo.car[dir] + this.block.flowFrom.car[dir];
        const bikes = this.block.flowTo.bike[dir] + this.block.flowFrom.bike[dir];
        renderLines(this.ctx, [
            `flowTo.car: ${this.block.flowTo.car[dir]}`,
            `flowTo.bike: ${this.block.flowTo.bike[dir]}`,
            `flowFrom.car: ${this.block.flowFrom.car[dir]}`,
            `flowFrom.bike: ${this.block.flowFrom.bike[dir]}`,
            `roadCapacity: ${this.block.roadCapacity[dir]}`,
            `bikes %: ${bikes / (bikes + cars)}`,
        ], x0, y0, 12);
    }

    render(state) {
        for (let y = 0; y < this.block.constructor.size; y++) {
            for (let x = this.block.constructor.size - 1; x >= 0; x--) {
                this.ctx.beginPath();
                if (x === state.xHighlight || y === state.yHighlight) {
                    this.ctx.fillStyle = getColor(state.terrain);
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

        if (state.debug) {
            const x0 = PADDING;
            const x1 = (this.ctx.canvas.width - 2 * PADDING) / 4 * 3 + PADDING;
            const y0 = PADDING + 40;
            const y1 = (this.ctx.canvas.height - PADDING - y0) / 3 * 2 + y0;

            this.renderDebug(DIR.NORTH, x0, y0);
            this.renderDebug(DIR.WEST, x0, y1);
            this.renderDebug(DIR.EAST, x1, y0);
            this.renderDebug(DIR.SOUTH, x1, y1);
        }

        this.renderHeader();

        this.buttons.forEach(btn => {
            this.ctx.beginPath();
            this.ctx.roundRect(btn.x, btn.y, btn.width, btn.height, btn.width * 0.1);
            this.ctx.fillStyle = getColor(btn.terrain);
            this.ctx.fill();
            if (state.terrain === btn.terrain) {
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
                // this.ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);
            }
        });
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
        } else if (event.key === 'd') {
            state.debug = !state.debug;
            return true;
        }
    }

    handleClick(event, state) {
        for (const btn of this.buttons) {
            if (
                event.clientX >= btn.x
                && event.clientX < btn.x + btn.width
                && event.clientY >= btn.y
                && event.clientY < btn.y + btn.height
            ) {
                return btn.handle(event, state);
            }
        }

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
