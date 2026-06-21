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
        this.y0 = (this.ctx.canvas.height - this.blockSize * this.city.constructor.height) / 2;
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
