// Set date
let countdownDate = new Date("January 1, 2024 00:00:00").getTime();

// Update the count down every 1 second
let x = setInterval(function () {
    // Get today's date and time
    let now = new Date().getTime();

    // Find the distance between now and the countdown date
    let distance = countdownDate- now;

    // Time calculations for days, hours, minutes and seconds
    let days = Math.floor(distance / (1000 * 60 * 60 * 24)); 
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the element
    document.querySelector("#d").innerText = addZero(days);
    document.querySelector("#h").innerText = addZero(hours);
    document.querySelector("#m").innerText = addZero(minutes);
    document.querySelector("#s").innerText = addZero(seconds);

    // if the count down is finished, write some text
    if(distance < 0) {
        clearInterval(x);
        document.getElementById("countdown-box").innerHTML = "<span class='cdi'>Frohes Neue Jahr</span>";
        document.querySelector(".title").innerText = "";
    }
}, 1000);



function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function isMobile() {
    if(window.innerWidth < 775) {
        return true;
    } else {
        return false;
    }
}

/***************
 Animation Frame 
*****************/

window.requestAnimationFrame = (function () {
    return (
        // window.webkitRequestAnimationFrame ||
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        }
    );
})();


let canvas = document.getElementById("canvas"),
ctx = canvas.getContext("2d"),
cw = window.innerWidth,
ch = window.innerHeight,
fireworks = [],
particles = [],
hue = 120, // starting hue
limiterTotal = 5, // limit 5 when click trigger
limiterTick = 0,
timerTotal = 80,
timerTick = 0,
mousedown = false,
mx, // mouse x co0rdinate
my; // mouse y coordinate

// Set canvas dimentions
canvas.width = cw;
canvas.hight = ch;


/****************
 Helper Function
 ****************/ 

 function random(min, max) {
    return Math.random() * (max - min) + min;
 }

 function calculateDistance(p1x, p1y, p2x, p2y) {
    let xDistance = p1x - p2x,
      yDistance = p1y - p2y;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
 }

 /************
  Fireworks
  ************/

  function Firework(sx, sy, tx, ty) {
    // actual coordinates
    this.x = sx;
    this.y = sy;
    // starting coordinates
    this.sx = sx;
    this.sy = sy;
    // target coordinates
    this.tx = tx;
    this.ty = ty;
    // distance fro starting point to target
    this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
    this.distanceTraveled = 0;


    // track the past coodinates of each firework to create a trail effect, increase prominent trails
    this.coordinates = [];
    this.coordinateCount = 3;
    // populate initial coordinate collection with the current coordinates
    while(this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
    }

    this.angle = Math.atan2(ty - sy, tx - sx);
    this.speed = 2;
    this.acceleration = 1.05;
    this.brightness = random(50, 70);
    // circle target indicator radius
    this.targetRadius = 1
  }

  // update firework
  Firework.prototype.update = function (index) {
    // remove last item in coordinates array
    this.coordinates.pop();
    // add current coordinates to the start of the array
    this.coordinates.unshift([this.x, this.y]);
    // cycle the cirle target indicator radius 
    if(this.targetRadius < 8) {
        this.targetRadius += 0.3;
    } else {
        this.targetRadius = 1
    }
    // speed up the firework
    this.speed *= this.acceleration;
    // get the current velocities based on angle and speed
    let vx = Math.cos(this.angle) * this.speed,
        vy = Math.sin(this.angle) * this.speed;
    // how far will the firework have traveled with velocities applied?
    this.distanceTraveled = calculateDistance(
        this.sx,
        this.sy,
        this.x + vx,
        this.y + vy
    );
   /* if the distance traveled, including velocities is greater than the initial distance to target 
   then the target has been reached */
   if(this.distanceTraveled >= this.distanceToTarget) {
    createParticles(tis.tx, this.ty);
    fireworks.splice(index, 1) // remove the firework, use the index passed into the update function to detemine which to remove
   } else {
    // target not reached keep travelling
    this.x += vx;
    this.y += vy;
   }
  };

// draw firework
Firework.prototype.draw = function () {
    ctx.beginPath();
    ctx.moveTo(
        this.coordinates[this.coordinates.length - 1][0],
        this.coordinates[this.coordinates.length - 1][1]
    );
    // move to the last tracked coordinate in the set, then draw a line to the current x and y
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = "hsl(" + hue + ", 100%, " + this.brightness + "%)";
    ctx.stroke(); 
};



/*************
 Particles Prototype
 **************/

 function Particles(x, y) {
    this.x = x;
    this.y = y;
    // track the past coordinates of each particle to create a trail effect, increase the coordinate count to create more prominent trails
    this.coordinates = [];
    this.coordinateCount = 5;
    while(this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
    }
    // set a random angle in all possible directions, in radians
    this.angle = random(0, Math.PI * 2);
    this.speed = random(1, 10);
    // friction will slow the particle down
    this.friction = 0.95;
    // gravity will be applied and pull the particle down
    this.gravity = 1;
    // set the hue to a random number +-50 of the overall hue variable
    this.hue = random(hue - 50, hue + 50);
    this.brightness = random(50, 80);
    this.alpha = 1;
    // set how fast the particle fades out
    this.decay = random(0.015, 0.03);
 }

 Particle.prototype.update = function (index) {
    // remove last item in coordinates array
    this.coordinates.pop();
    // add current coordinates to the start of the array
    this.coordinates.unshift([this.x, this.y]);
    // slow down the particle
    this.speed *= this.friction;
    // apply velocity
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    // fade out the particle
    this.alpha -= this.decay;

    // remove the particle once the alpha is low enough, based on the passed in index
    if(this.alpha <= this.decay) {
        particles.splice(index, 1);
    }
 };

 // draw particle
 Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.moveTo(
        this.coordinates[this.coordinates.length - 1][0],
        this.coordinates[this.coordinates.length - 1][1]
    );
    // move to the last tracked coordinates in the set, then draw a line to the current x and y
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = "hsla(" + this.hue + ", 100%, " + this.brightness + "%, " + this.alpha + ")"; 
    ctx.stroke(); 
 };

 // create particle group & explosion
 function createParticles(x, y) {
    let particleCount = 30;
    // increase the particle count for a bigger explosion
    while(particleCount--) {
        particles.push(new Particle(x, y));
    }
 }

 /************
  Update
  *************/

  function update() {
    requestAnimationFrame(update);


    // create random color
    hue = random(0, 360);

    // clearRect() with opacity
    ctx.globalCompositeOperation = "destination-out";

    // decrease the alpha property to create more prominent trails
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, cw, ch);
    // change the composite operation back to our main mode
    // lighter create bright highlight points as the fireworks and particles overlap each other
    ctx.globalCompositeOperation = "lighter";

    // loop over each firework, draw it, update it
    let i = fireworks.length;
    while(i--) {
        fireworks[i].draw();
        fireworks[i].update(i)
    }

    // launch fireworks automatically to random coordinates, when the mouse isn't down
    if(timerTick >= timerLocal) {
        // start the firework at the bottom middle of the screen, them set the random target coordinates, the rando y coordinates wil be set within the range of the top half screen
        fireworks.push(new Firework(cw / 2, ch, random(0, cw), random(0, ch / 2)));
        timerTick = 0
    } else {
        timerTick++;
    }
  }

  // limit the rate at which fireworks get launched when the mouse is down
  if(limiterTick >= limiterTotal) {
    if(mousedown) {
        // start the firework at the bottom middle of the screen, then set the current mouse coordinates as the target
        fireworks.push(new Firework(cw / 2, ch, mx, ny));
        limiterTick = 0
    } else {
        limiterTick++;
    }
  }

  function onResize() {
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = cw;
    canvas.height = ch;
  }

/****************
 Event Listeners
******************/ 

canvas.addEventListener("mousemove", (e) => {
    mx = e.pageX - canvas.offsetLeft;
    my = e.pageY - canvas.offsetTop;
});

canvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    mousedown = true;
});

canvas.addEventListener("mouseup", (e) => {
    e.preventDefault();
    mousedown = false;
});

window.addEventListener("resize", onResize);

window.onload = update;