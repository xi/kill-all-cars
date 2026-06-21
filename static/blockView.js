const FACTOR = 0.4;
const PADDING = 20;

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

    render() {
        this.ctx.fillStyle = 'currentColor';
        this.ctx.font = '16px sans-serif';
        this.ctx.fillText(`residential space: ${this.block.residential}`, (this.ctx.canvas.width - 2 * PADDING) / 4 * 0 + PADDING, PADDING);
        this.ctx.fillText(`commercial served: ${this.block.commercialServed}`, (this.ctx.canvas.width - 2 * PADDING) / 4 * 1 + PADDING, PADDING);
        this.ctx.fillText(`green served: ${this.block.greenServed}`, (this.ctx.canvas.width - 2 * PADDING) / 4 * 2 + PADDING, PADDING);
        this.ctx.fillText(`pollution: ${this.block.pollution}`, (this.ctx.canvas.width - 2 * PADDING) / 4 * 3 + PADDING, PADDING);

        for (let y = 0; y < this.block.constructor.size; y++) {
            for (let x = this.block.constructor.size - 1; x >= 0; x--) {
                this.ctx.beginPath();
                this.ctx.fillStyle = this.block.getTileColor(x, y);
                this.ctx.moveTo(...this.toScreenXY(x, y));
                this.ctx.lineTo(...this.toScreenXY(x, y + 1));
                this.ctx.lineTo(...this.toScreenXY(x + 1, y + 1));
                this.ctx.lineTo(...this.toScreenXY(x + 1, y));
                this.ctx.closePath();
                this.ctx.fill();
            }
        }
    }
}
