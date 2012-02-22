var world = [
    0,0,0,0,0,0,1,1,1,1,
    0,0,0,0,0,1,1,1,1,0,
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,1,1,1,1,0,0,
    0,0,0,0,0,0,0,0,0,0
];

// Belief distribution.
var p = [];
for(i=0;i<world.length;i++) {
    p.push(1.0/world.length);
}

var pHit = 0.6;
var pMiss = 0.2;

var pExact = 0.8;
var pUndershoot = 0.1;
var pOvershoot = 0.1;

// The actual position of the robot.
var robotPosition = 0;
var chunkWidth = 12;
var KEY_LEFT = 37, KEY_RIGHT = 39;

// The sense and move functions are unchanged from the versions
// presented in class.

sense = function(p, Z) {
    q = [];
    for(i=0;i<p.length;i++) {
        hit = (Z == world[i]);
        q.push(p[i] * (hit * pHit + (1-hit) * pMiss));
    }
    var s = sum(q);
    for(i=0;i<p.length;i++) {
        q[i] = q[i]/s;
    }
    return q;
};

move = function(p, U) {
    var q = [];
    for(i=0;i<p.length;i++) {
        s = pExact * p[mod(i-U, p.length)];
        s += pOvershoot * p[mod(i-U-1, p.length)];
        s += pUndershoot * p[mod(i-U+1, p.length)];
        q.push(s);
    }
    return q;
};

init = function() {
    drawWorld(); 
    plot(p);

    var robot = $("#robot");

    $(window).keydown(function(event) {
        console.log(event.keyCode);
        if(event.keyCode == KEY_LEFT || event.keyCode == KEY_RIGHT) {
            U = (event.keyCode == KEY_LEFT) ? -1 : 1;
            moveRobot(robot, U);
            p = move(p, U);
            p = sense(p, readSensor());
            plot(p);
        }
    });
};
 
$(document).ready(init);

readSensor = function() {
    // Simulate a noisy sensor.
    // Note that pHit/pMiss don't exactly match the randomness in the
    // sensor.
    var actual = world[robotPosition];
    var s = sample([0.85, 0.15], [actual, 1-actual]);
    $("#sensor").html(s);
    $("#sensor-actual").html(actual);
    return s;
};

sample = function(p, values) {
    // e.g. Simulate a fair coin flip with:
    // sample([0.5, 0.5], ['H', 'T'])
    // Assumes p sums to 1.
    var r = Math.random();
    var c = 0;
    for(i=0;i<p.length;i++) {
        c += p[i];
        if(r<c) return values[i];
    }
    throw("unreachable");
};        

sum = function(items) {
    var s = 0;
    for(i=0;i<items.length;i++) {
        s += items[i];
    }
    return s;
};

mod = function(x, y) {
    // The JS % operator doens't handle -ve numbers in the same way as
    // Python does, this is a work-around.
    return (x+y) % y;
};

drawWorld = function() {
    var $world = $("#world");
    for(i=0;i<world.length;i++) {
        cssClass = ["wall","door"][world[i]];
        $world.append("<div class='"+cssClass+" world-chunk'></div>");
    }
};

plot = function(p) {
    var $plot = $("#plot");
    $plot.empty();
    for(i=0;i<p.length;i++) {
        var b = $("<div class='bar'></div>");
        b.css("height", p[i]*100+'%');
        b.css("left", i*chunkWidth);
        $plot.append(b);
    }
};

moveRobot = function(robot, U) {
    // The robot doesn't always make the requested move.
    var actual = U + sample([0.8, 0.1, 0.1], [0, 1, -1]);
    $("#move").html(U);
    $("#move-actual").html(actual);
    robotPosition += actual;
    robotPosition = mod(robotPosition, world.length);
    robot.css("left", robotPosition*chunkWidth);
}
