import { City } from './model.js';
import { CityView } from './cityView.js';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const city = City.random();

const getView = function() {
    return new CityView(city, ctx);
};

const refresh = function() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    getView().render();
};

window.addEventListener('resize', refresh);
refresh();
