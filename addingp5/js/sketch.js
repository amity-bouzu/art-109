
let canvas;
let img;
let xPos = 0;
let yPox = 0;
let easing = .01;


function setup() {
    img = loadImage('../images/bluelink.png');
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.style("z-index");
    // background(225);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    clear();
    xPos = xPos + ((mouseX - xPos) * easing);
    yPos = yPos + ((mouseY - yPos) * easing);
    drawThing(xPos, yPos);
}

function drawThing(_x, _y) {
    //draw a thing
    fill(255);
    ellipse(_x, _y, 30, 30);
    ellipse(_x, - 29, _y + 5, 30, 30);
}

