import { City } from './model.js';
import { CityView } from './cityView.js';
import { BlockView } from './blockView.js';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const city = City.random();
const state = {
    block: null,
};

const getView = function() {
    if (state.block) {
        return new BlockView(state.block, ctx);
    } else {
        return new CityView(city, ctx);
    }
};

const refresh = function() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    getView().render();
};

window.addEventListener('resize', refresh);
refresh();
