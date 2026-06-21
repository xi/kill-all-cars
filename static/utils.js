export const choice = function(arr) {
    var i = Math.floor(Math.random() * arr.length);
    return arr[i];
};

export const sum = function(arr) {
    return arr.reduce((s, x) => s + x, 0);
};
