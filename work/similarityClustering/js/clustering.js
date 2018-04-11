function clusterer() {
    this.clusters = [];
}

clusterer.prototype.getClusters = function() {
    return this.clusters;
};

clusterer.prototype.addToClosestCluster = function(pt) {
    var distance = 10;
    var clusterToAddTo = null;

    for (var i = 0, cltr; cltr = this.clusters[i]; i++) {
        var c = cltr.getCenter();
        if (c) {
            var d = Math.sqrt((c.x - pt.x) * (c.x - pt.x) + (c.y - pt.y) * (c.y - pt.y));
            if (d < distance) {
                distance = d;
                clusterToAddTo = cltr;
            }
        }
    }

    if (clusterToAddTo) {
        clusterToAddTo.addPoint(pt);
    } else {
        var clr = new cluster();
        clr.addPoint(pt);
        this.clusters.push(clr);
    }

};


function cluster() {
    this.center = null;
    this.points = [];
    this.bounds = null;

}


cluster.prototype.isPointAlreadyAdded = function(point) {
    if (this.points.indexOf) {
        return this.points.indexOf(point) != -1;
    } else {
        for (var i = 0, m; m = this.points[i]; i++) {
            if (m.index == point.index) {
                return true;
            }
        }
    }
    return false;
};
cluster.prototype.addPoint = function(point) {
    if (this.isPointAlreadyAdded(point)) {
        return false;
    }

    point.isAdded = true;
    this.points.push(point);

    if (!this.center) {
        this.center = {
            x: point.x,
            y: point.y
        };
        this.calculateBounds();
    } else {
        var l = this.points.length + 1;
        var x = (this.center.x * (l - 1) + point.x) / l,
            y = (this.center.y * (l - 1) + point.y) / l;
        this.center = {
            x: x,
            y: y
        };
        this.calculateBounds();
    }



    return true;
};

cluster.prototype.calculateBounds = function() {
    var xcoords = this.points.map(function(p) {
            return p.x;
        }),
        ycoords = this.points.map(function(p) {
            return p.y;
        });

    var xmin = Math.min.apply(null, xcoords),
        xmax = Math.max.apply(null, xcoords),
        ymin = Math.min.apply(null, ycoords),
        ymax = Math.max.apply(null, ycoords);

    this.bounds = [
        [xmin, xmax],
        [ymin, ymax]
    ];
}

cluster.prototype.isPointInClusterBounds = function(point) {
    return this.bounds[0][0] <= point.x && point.x <= this.bounds[0][1] &&
        this.bounds[1][0] <= point.y && point.y <= this.bounds[1][1];
};

cluster.prototype.getCenter = function() {
    return this.center;
}