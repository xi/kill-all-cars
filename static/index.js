const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const refresh = function() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
};

window.addEventListener('resize', refresh);
refresh();
