import { City } from './model.js';
import { CityView } from './cityView.js';
import { BlockView } from './blockView.js';
import { solve } from './simulation.js';
import { TERRAIN } from './constants.js';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const city = City.random();
const state = {
    block: null,
    terrain: TERRAIN.GREENERY,
    xHighlight: null,
    yHighlight: null,
    debug: false,
};

function getView() {
    if (state.block) {
        return new BlockView(state.block, ctx);
    } else {
        return new CityView(city, ctx);
    }
}

function refresh() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    solve(city);
    getView().render(state);
}

function handle(event) {
    if (getView().handle(event, state)) {
        refresh();
    }
}

window.addEventListener('keyup', handle);
canvas.addEventListener('click', handle);
canvas.addEventListener('mousemove', handle);

window.addEventListener('resize', refresh);
refresh();
