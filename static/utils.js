export function choice(arr) {
    var i = Math.floor(Math.random() * arr.length);
    return arr[i];
}

export function sum(arr) {
    return arr.reduce((s, x) => s + x, 0);
}
