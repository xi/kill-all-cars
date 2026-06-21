import { sum } from './utils.js';

const PADDING = 20;
const HEADER_SIZE = 45;

export class CityView {
    constructor(city, ctx) {
        this.city = city;
        this.ctx = ctx;

        this.blockSize = Math.min(
            ctx.canvas.width / city.constructor.width,
            ctx.canvas.height / city.constructor.height,
        );
        this.border = 0.05 * this.blockSize;
        this.x0 = (this.ctx.canvas.width - this.blockSize * this.city.constructor.width) / 2;
        this.y0 = HEADER_SIZE + (this.ctx.canvas.height - HEADER_SIZE - this.blockSize * this.city.constructor.height) / 2;
    }

    renderHeader() {
        const n = this.city.constructor.width * this.city.constructor.height;
        const residential = sum(this.city.blocks.map(row => sum(row.map(block => block.residential))));
        const commercialServed = sum(this.city.blocks.map(row => sum(row.map(block => block.commercialServed)))) / n;
        const greenServed = sum(this.city.blocks.map(row => sum(row.map(block => block.greenServed)))) / n;
        const pollution = sum(this.city.blocks.map(row => sum(row.map(block => block.pollution)))) / n;

        const w = (this.ctx.canvas.width - 2 * PADDING) / 4;
        this.ctx.fillStyle = 'currentColor';
        this.ctx.font = '16px sans-serif';
        this.ctx.fillText(`Residents: ${Math.round(residential * 100)}K`, w * 0 + PADDING, PADDING);
        this.ctx.fillText(`Services Access: ${Math.round(commercialServed * 100)}%`, w * 1 + PADDING, PADDING);
        this.ctx.fillText(`Nature Access: ${Math.round(greenServed * 100)}%`, w * 2 + PADDING, PADDING);
        this.ctx.fillText(`Air Quality: ${Math.round(100 - pollution * 100)}%`, w * 3 + PADDING, PADDING);
    }

    renderBlock(block, x0, y0, width, height) {
        const w = width / block.constructor.size;
        const h = height / block.constructor.size;

        for (let y = 0; y < block.constructor.size; y++) {
            for (let x = 0; x < block.constructor.size; x++) {
                this.ctx.fillStyle = block.getTileColor(x, y);
                this.ctx.fillRect(x0 + x * w, y0 + y * h, w, h);
            }
        }
    }

    render() {
        this.renderHeader();

        for (let y = 0; y < this.city.constructor.height; y++) {
            for (let x = 0; x < this.city.constructor.width; x++) {
                this.renderBlock(
                    this.city.blocks[y][x],
                    this.x0 + x * this.blockSize + this.border,
                    this.y0 + y * this.blockSize + this.border,
                    this.blockSize - 2 * this.border,
                    this.blockSize - 2 * this.border,
                );
            }
        }
    }

    handle(event, state) {
        if (event.type === 'click') {
            const x = Math.floor((event.clientX - this.x0) / this.blockSize);
            const y = Math.floor((event.clientY - this.y0) / this.blockSize);
            if (0 <= x && x < this.city.constructor.width) {
                if (0 <= y && y < this.city.constructor.height) {
                    state.block = this.city.blocks[y][x];
                    state.xHighlight = null;
                    state.yHighlight = null;
                    return true;
                }
            }
        }
    }
}
