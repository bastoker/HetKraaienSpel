// The main logic for your project goes in this file.

'use strict';

/**
 *
 * The {@link Player} object; an {@link Actor} controlled by user input.
 */
var player;

var background, solid, purpleTree, eggs = [];

/**
 * All flying bullets in our world.
 */
var bullets = new Collection();
var enemies = [];
var timer = new Timer();

var throwing = false;
var castle;
var hud;

/**
 * Keys used for various directions.
 *
 * The property names of this object indicate actions, and the values are lists
 * of keyboard keys or key combinations that will invoke these actions. Valid
 * keys include anything that {@link jQuery.hotkeys} accepts. The up, down,
 * left, and right properties are required if the `keys` variable exists; if
 * you don't want to use them, just set them to an empty array. {@link Actor}s
 * can have their own {@link Actor#keys keys} which will override the global
 * set.
 */
var keys = {
    up: ['up', 'w'],
    down: ['down', 's'],
    left: ['left', 'a'],
    right: ['right', 'd'],
    shoot: ['space']
};

var el = document.getElementsByTagName("canvas")[0];
el.addEventListener("touchstart", touchHandler);
el.addEventListener("touchmove", touchHandler);
el.addEventListener("touchend", touchHandler);

function touchHandler(e) {
    if(e.touches) {
        player.processInput(keys.up);
        e.preventDefault();
    }
}

/**
 * Bind to the "shoot" key(s) and create a new bullet.
 *
 * Change keyup to keydown to be able to hold down the shoot key. Machine gun style :-)
 */
// jQuery(document).keyup(keys.shoot.join(' '), function() {
//     var now = Date.now();
//     // Throttle bullet firing.
//     if (now > (player._lastFired || 0) + Acorn.fireRate && isAnimating()) {
//         player._lastFired = now;
//         // Shoot in the direction the player looked last (default to right).
//         var direction = player.lastLooked.length ? player.lastLooked : keys.right;
//         // Center on the player.
//         var x = player.x + player.width * 0.5,
//             y = player.y + player.height * 0.5;
//         // Add the new bullet to our Collection.
//         bullets.add(new Acorn(direction, x, y));
//         console.log('Set up for Acorns ran');
//     }
// });

/**
 * An array of image file paths to pre-load.
 */
var preloadables = [
    'assets/kraai.png',
    'assets/achtergrond.png',
    'assets/kraai-animated2.png',
    'assets/kraai-animated.png',
    'assets/AnimatedCrows.png',
    'assets/eikel.png',
    'assets/kuikentje.png',
    'assets/logo.png',
    'assets/logo-repeated.png',
    'assets/walnoot.png',
    'assets/paarseboom-small.png',
    'assets/bruineboom-small.png',
    'assets/ei.png',
    'assets/uil.png',
    'assets/uil-staand.png',
    'assets/small8bitowls.png',
    'assets/dpadbutton.png',
    'assets/shootbutton.png',
    'assets/flybutton.png',
];

var crowcall = new Audio('crow-call.mp3');

var Egg = GridAddableActor.extend({
    init: function (x, y, w, h) {
        this._super.apply(this, [1, 1, 80, 80, 'assets/ei.png']);
    },
    stoodOn: function (actor) {
        actor.DAMPING_FACTOR = null;
    },
    src: 'assets/ei.png',
    GRAVITY: true,
    STAY_IN_WORLD: true,
});

//
// (function (x) {
//     // console.log(JSON.stringify(enemy));
//     return function createBullet() {
//         console.log(JSON.stringify(x));
//         createAcorn(keys.left, x.xC(), x.yC());
//         x.src.runOnce(throwAcornRecoil(x)

/**
 * A magic-named function where all updates should occur.
 */
function update() {
    player.update();

    eggs.forEach(function(egg) {
        var result = egg.collideSolid(solid);

        if (result)
        egg.collideSolid(player);
        egg.update();
    });

    pairwise(eggs).forEach(function(p) {
        _.head(p).collideSolid(_.last(p));
        _.last(p).collideSolid(_.head(p));
    });

    bullets.forEach(function(bullet) {
        bullet.update();
        // Returning true removes the bullet from the collection.
        // Destroy the bullet if it hits a solid or goes out of the world.
        return /* bullet.collides(solid) || */ !world.isInWorld(bullet, true);
    });

    // enforce collision
    player.collideSolid(solid);

    if (castle.overlaps(player)) {
        App.gameOver("Je Hebt Gewonnen!");
    }

    function throwAcornRecoil(ene) {
        return function(y) {
            y.src.start('ready');
        }(ene);
    }

    function makeAcornCallback(asdf) {
        return (function abc(h) {
            return function() {
                console.log(h);
                bullets.add(new Acorn(keys.left, h.xC() - 80, h.yC() - 50));
            }
        })(asdf);
    }

    function throwAcorn(s) {
        var abc = s;
        s.src.runOnce(makeAcornCallback(abc), 'throw');
    }

    // Throw the acorn baby
    if (timer.getElapsedTime() > 7 && !throwing) {
        throwing = true;

        for(var i = 0; i < 5; i++) {
            throwAcorn(enemies[i]);
        }
    }
    if (throwing && timer.getElapsedTime() > 9) {
        timer.stop();
        timer = new Timer();
        throwing = false;
    }
}

/**
 * A magic-named function where all drawing should occur.
 */
function draw() {
    background.draw();
    purpleTree.draw();
    solid.draw();
    castle.draw();
    player.draw();
    enemies.forEach(function(enemy) {
        enemy.draw();
    });

    bullets.draw();

    hud.draw();

    // Timer
    hud.context.clearRect(0, 0, canvas.width, 200);
    // hud.context.strokeText('Time: ' + timer.getElapsedTime().toFixed(1), canvas.width - 15, 30);
    hud.context.fillText('Time: ' + timer.getElapsedTime().toFixed(1), canvas.width - 15, 30);
}

/**
 * A magic-named function for one-time setup.
 *
 * @param {Boolean} first
 *   true if the app is being set up for the first time; false if the app has
 *   been reset and is starting over.
 */
function setup(first) {
    // Switch from side view to top-down.
    Actor.prototype.GRAVITY = true;
    Box.prototype.stoodOn = function (actor) {
        actor.DAMPING_FACTOR = undefined;
    };

    var IceBox = Box.extend({
            src: 'assets/ijs.png',
            stoodOn: function (actor) {
                actor.DAMPING_FACTOR = 0.1;
            }
    });

    var defaultBox = function(png) {
        return Box.extend({
            init: function (x, y, w, h) {
                this._super.apply(this, arguments);
            },
            src: png,
            stoodOn: function (actor) {
                actor.DAMPING_FACTOR = null;
            }
        });
    };

    var eggFactory = {
        isGridFactory: true,
        create: function() {
            var newEgg = new Egg();
            eggs.otherEggs = eggs.slice();
            eggs.push(newEgg);
            return newEgg;
        }
    };

    var Owl = Actor.extend({
        init: function (x, y, w, h) {
            this._super.apply(this, [x, y - 40, 140, 120]);
            this.src.use('stand');
        },
        src: new SpriteMap('assets/small8bitowls.png', {
            stand: [0, 0, 0, 0],
            ready: [0, 1, 0, 1],
            throw: [0, 1, 0, 6],
            recoil: [0, 6, 0, 9]
        }, {
            frameW: 192, /* orig: 662 */
            frameH: 200, /* orig: 680 */
            interval: 120,
            useTimer: true,
        }),
        stoodOn: function (actor) {
            actor.DAMPING_FACTOR = null;
        }
    });

    var PurpleTree = Actor.extend({
        init: function (x, y, w, h) {
            this._super.apply(this, [x - 90, y - 490, 300, 576]);
        },
        src: 'assets/paarseboom-small.png',
        stoodOn: function (actor) {
            actor.DAMPING_FACTOR = null;
        }
    });

    // Add terrain.
    var grid =  "                                                              \n" +
                "                        U  U                                  \n" +
                "                        AAAA                                  \n" +
                "                                                              \n" +
                "                  U                                           \n" +
                "                                                              \n" +
                "                   P     AAAA                                 \n" +
                "                   AAA                                        \n" +
                "                AAA                                           \n" +
                "                                                              \n" +
                "     W E  K    AA                                             \n" +
                " AAAAAAAAAA                             U                     \n" +
                "                       U  YYYYYYYYYYYYYYYYYY                  \n" +
                "                                                              \n" +
                "                                                              \n" +
                "                      P                                       \n" +
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    var height = grid.indexOf("\n") * 80;
    var width = grid.substring(0, grid.indexOf("\n")).length * 80;

    // Change the size of the playable area. Do this before placing items!
    world.resize(5000, height);

    castle = new Box(grid.indexOf("\n")*80-250, world.height-320, 240, 240);
    castle.src = 'assets/kasteel.png';

    solid = new TileMap(grid, {
        W: defaultBox('assets/walnoot.png'),
        E: eggFactory,
        I: defaultBox('assets/eikel.png'),
        K: defaultBox('assets/kuikentje.png'),
        A: defaultBox('assets/aarde.png'),
        U: Owl,
        Y: IceBox,
        P: PurpleTree
    });

    // Add enemies and coins.
    // We used the TileMap to initialize them but we want to track them separately.
    enemies = new Collection();
    solid.forEach(function(o, i, j) {
        if (o instanceof Owl) {
            console.info('Owl instances found');
            solid.clearCell(i, j);
            enemies.add(o);
        }
    });

    purpleTree = new PurpleTree(height * 80 - 2170, world.height-660, 300, 600);

    background = new Layer({width: world.width, src: 'assets/achtergrond.png'});

    // Set up the Heads-Up Display layer.
    // This layer will stay in place even while the world scrolls.
    hud = new Layer({relative: 'canvas'});
    hud.context.font = '30px Verdana';
    hud.context.textAlign = 'right';
    hud.context.textBaseline = 'top';
    hud.context.fillStyle = 'black';
    // hud.context.strokeStyle = 'black';
    // hud.context.strokeStyle = 'rgba(211, 211, 211, 0.5)';
    hud.context.lineWidth = 5;

    hud.context.drawImage('assets/flybutton.png', canvas.width - 120, canvas.height - 200, 100, 100); // rechtsonder
    hud.context.drawImage('assets/shootbutton.png', canvas.width - 240, canvas.height - 130, 100, 100); // rechtsonder
    hud.context.drawImage('assets/dpadbutton.png', 20, canvas.height - 260, 240, 240); // linksonder

    // Add controls if touch is enabled (e.g. for iPad)

    // Initialize the player.
    player = new Player(200, 200, 120, 120);
    // player.DAMPING_FACTOR = 10;
    player.MULTI_JUMP = -1;
    player.G_CONST = 10;
    player.src = new SpriteMap('assets/AnimatedCrows.png', {
        stand: [1, 5, 1, 5],
        left: [0, 0, 0, 4],
        right: [1, 0, 1, 4],
        lookLeft: [0, 2, 0, 2],
        lookRight: [1, 2, 1, 2],
        slideLeft: [0, 2, 0, 2],
        slideRight: [1, 2, 1, 2],
        jumpLeft: [0, 6, 0, 8],
        jumpRight: [1, 6, 1, 8],
        fall: [1, 6, 1, 8],
        jump: [1, 6, 1, 8],
    }, {
        frameW: 662,
        frameH: 680,
        interval: 75,
        useTimer: false,
    });
}
