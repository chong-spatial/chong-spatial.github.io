function jaccard(a, b) {
    // 1. get the union set
    var union = a.slice(0);
    for (var i = 0; i < b.length; i++) {
        if (!~union.indexOf(b[i])) {
            union.push(b[i]);
        }
    }

    // 2. count the intersects from the union
    var intersects = 0;
    union.forEach(function(s) {
        if (a.indexOf(s) != -1 && b.indexOf(s) != -1) {
            intersects++;
        }
    })

    return intersects / union.length;
}

function intersects(a, b) {
    var tmp = {};
    for (var i = 0; i < a.length; i++) {
        if (tmp.hasOwnProperty(a[i])) {
            tmp[a[i]]++;
        } else {
            tmp[a[i]] = 0;
        }
    }

    for (var i = 0; i < b.length; i++) {
        if (tmp.hasOwnProperty(b[i])) {
            tmp[b[i]]++;
        } else {
            tmp[b[i]] = 0;
        }
    }

    var res = [];
    for (var i in tmp) {
        if (tmp[i] > 0) {
            res.push(i)
        }
    }

    return res;


}


function concatUnique(a, b) {
    var r = a.slice(0);
    for (var i = 0; i < b.length; i++) {
        if (!~r.indexOf(b[i])) {
            r.push(b[i]);
        }
    }

    return r;

}

function randomSubset(arr, size) {
    var shuffled = arr.slice(0),
        i = arr.length,
        min = i - size,
        temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}

function rotate(cx, cy, x, y, angle) {

    var
        cos = Math.cos(angle),
        sin = Math.sin(angle),
        nx = (cos * (x - cx)) - (sin * (y - cy)) + cx,
        ny = (sin * (x - cx)) + (cos * (y - cy)) + cy;

    return [nx, ny];
}