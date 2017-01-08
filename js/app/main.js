// The main logic for your project goes in this file.

'use strict';

/**
 *
 * The {@link Player} object; an {@link Actor} controlled by user input.
 */
var player;

var background, solid, purpleTrees = new Collection();

/**
 * All flying bullets in our world.
 */
var bullets = new Collection();
var chestnuts = new Collection();
var enemies = new Collection();
var eggs = new Collection();
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
    'assets/small8bitowls.png',
    'assets/small8bitowlsWithDeadOwls.png',
    'assets/small8bitcrows.png',
    'assets/small8bitchestnut.png',
    'assets/achtergrond.png',
    'assets/eikel.png',
    'assets/acorn.png',
    'assets/kuikentje.png',
    'assets/walnoot.png',
    'assets/paarseboom-small.png',
    'assets/bruineboom-small.png',
    'assets/ei.png',
    'assets/dpadbutton.png',
    'assets/shootbutton.png',
    'assets/flybutton.png',
];

var crowcall = new Audio('crow-call.mp3');

/**
 * The Acorn 'Bullets from e.g. an Owl' class.
 */
var Acorn = Actor.extend({
    // Override Actor default properties.
    MOVEAMOUNT: 520, // Bullet velocity in pixels per second
    GRAVITY: false, // Just keep going rather than falling down
    CONTINUOUS_MOVEMENT: true, // Keep going in the last specified direction
    STAY_IN_WORLD: false, // Let our bullets leave the world (we'll destroy them when they do)
    DEFAULT_WIDTH: 60,
    DEFAULT_HEIGHT: 34,
    src: 'assets/acorn.png',
    /**
     * Initialize a thrown Acorn.
     *
     * @param direction
     *   An array of keys representing the Bullet's initial direction.
     * @param x
     *   The x-coordinate of the top-left corner of the Bullet.
     * @param y
     *   The y-coordinate of the top-left corner of the Bullet.
     */
    init: function(direction, x, y) {
        // Invoke the parent's init() function, Actor.prototype.init().
        this._super(x, y);
        // Store the direction we want the bullet to go. The CONTINUOUS_MOVEMENT
        // setting uses this property to keep going in the specified direction.
        this.lastLooked = direction;
    },
    /**
     * Override drawDefault() to draw a bullet when there isn't an image associated with it (src === null).
     */
    drawDefault: function(ctx, x, y, w, h) {
        // This draws a circle onto the graphics context (i.e. the canvas).
        // Parameters are x-coordinate of center, y-coordinate of center, radius, fill color, border color
        ctx.circle(x + w/2, y + w/2, (w + h) / 4, 'orange', 'black');
    },
});
/**
 * The Chestnut 'bullets' from the crow.
 */
var Chestnut = Actor.extend({
    // Override Actor default properties.
    MOVEAMOUNT: 20, // Bullet velocity in pixels per second
    GRAVITY: true, // Just keep going rather than falling down
    CONTINUOUS_MOVEMENT: false, // Keep going in the last specified direction
    STAY_IN_WORLD: false, // Let our bullets leave the world (we'll destroy them when they do)
    DEFAULT_WIDTH: 45,
    DEFAULT_HEIGHT: 45,

    src: new SpriteMap('assets/small8bitchestnut.png', {
        stand: [0, 0, 0, 8],
    }, {
        frameW: 192, /* orig: 662 */
        frameH: 200, /* orig: 680 */
        interval: 75,
        useTimer: false,
    }),

    /**
     * Initialize a thrown Chestnut.
     *
     * @param direction
     *   An array of keys representing the Bullet's initial direction.
     * @param x
     *   The x-coordinate of the top-left corner of the Bullet.
     * @param y
     *   The y-coordinate of the top-left corner of the Bullet.
     */
    init: function(direction, x, y) {
        // Invoke the parent's init() function, Actor.prototype.init().
        this._super(x, y);
        // Store the direction we want the bullet to go. The CONTINUOUS_MOVEMENT
        // setting uses this property to keep going in the specified direction.
        this.lastLooked = direction;
    },
    /**
     * Override drawDefault() to draw a bullet when there isn't an image associated with it (src === null).
     */
    drawDefault: function(ctx, x, y, w, h) {
        // This draws a circle onto the graphics context (i.e. the canvas).
        // Parameters are x-coordinate of center, y-coordinate of center, radius, fill color, border color
        ctx.circle(x + w/2, y + w/2, (w + h) / 4, 'orange', 'black');
    },
});

/**
 * Bind to the "shoot" key(s) and create a new chestnut.
 *
 * Change keyup to keydown to be able to hold down the shoot key.
 */
jQuery(document).keyup(keys.shoot.join(' '), function () {
        console.log('Chestnut firing');
        var now = Date.now();
        // Throttle Chestnut firing.
        if (now > (player._lastFired || 0) + 170 && isAnimating()) {
            player._lastFired = now;
            // Drop the chestnut
            var animationName =
                player.lastLooked.length ? (player.lastLooked === keys.left ? 'throwLeft' : 'throwRight') : ('throwRight');
            // Center on the player.
            var x = player.x + player.width * 0.5,
                y = player.y + player.height * 0.5;

            player.status = 'throwing';
            setTimeout(function () {
                chestnuts.add(new Chestnut(keys.down, x, y));
            }, 100);
            setTimeout(function () {player.status = 'moving'}, 400);
        }
    }
);

function pairwise(list) {
    if (list.length < 2) { return []; }
    var first = _.first(list),
        rest  = _.tail(list),
        pairs = _.map(rest, function (x) { return [first, x]; });
    return _.flatten([pairs, pairwise(rest)], true);
}

var Egg = Actor.extend({
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

    chestnuts.forEach(function (chestnut){chestnut.update();});

    bullets.forEach(function(bullet) {
        bullet.update();
        if (bullet.overlaps(player)) {
            App.gameOver('Je hebt verloren van de gemene uilen :-(');
        }
        // Returning true removes the bullet from the collection.
        // Destroy the bullet if it hits a solid or goes out of the world.
        return bullet.collides(solid) || !world.isInWorld(bullet, true);
    });

    chestnuts.forEach(
        function (chestnut) {
            // Check if we hit an evil owl:
            enemies.forEach(
                function (owl) {
                    if (chestnut.overlaps(owl)) {
                        owl.status = 'dead';
                        owl.src.runOnce((function (owl) {
                            return function fn(spr) {
                                spr.spriteMap.start('deadLeft');
                            };
                        })(owl), 'dyingLeft');
                    }
                }
            );

            // Returning true removes the bullet from the collection.
            // Destroy the bullet if it hits a solid or goes out of the world.
            return chestnut.collides(solid) || !world.isInWorld(chestnut, true);
        });

    // enforce collision
    player.collideSolid(solid);

    function createClosure(owl) {
        (function IFFE() {
            owl.src.runOnce((function (owl) {
                return function fn(spr) {
                    var acorn = new Acorn(keys.left, owl.xC() - 60, owl.yC() - 37);
                    bullets.add(acorn);
                    spr.spriteMap.runOnce(function (spr2) {
                        if (owl.xC() !== undefined) {
                            spr2.spriteMap.start('stand'); // Stand
                        }
                    }, 'recoil'); // Recoil
                };
            })(owl), 'throw');
        })();
    }

    // Throw the acorn baby
    if (timer.getElapsedTime() > 5 && !throwing) {
        throwing = true;

        enemies.forEach(function (owl) {
            if (owl.status === 'alive') {
                createClosure(owl);
            }
        });
    }
    if (throwing && timer.getElapsedTime() > 6) {
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
    purpleTrees.draw();
    solid.draw();
    castle.draw();
    player.draw();
    enemies.draw();
    bullets.draw();
    chestnuts.draw();
    hud.draw();

    // Timer
    hud.context.clearRect(0, 0, canvas.width, 200);
    // hud.context.strokeText('Time: ' + timer.getElapsedTime().toFixed(1), canvas.width - 15, 30);
    hud.context.fillText('Time: ' + timer.getElapsedTime().toFixed(1), canvas.width - 15, 30);
}

/**
 * A magic-named function for one-time setup.
 *
 * @param {Boolean}
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

    var Owl = Actor.extend({
        init: function (x, y, w, h) {
            this._super.apply(this, [x, y - 17, 97, 97]);
            this.src = new SpriteMap('assets/small8bitowlsWithDeadOwls.png', {
                stand: [0, 0, 0, 0],
                ready: [0, 1, 0, 1],
                throw: [0, 1, 0, 5],
                recoil: [0, 6, 0, 9],
                dyingLeft: [0, 10, 0, 11],
                dyingRight: [1, 10, 1, 11],
                deadLeft: [0, 11, 0, 11],
                deadRight: [1, 11, 1, 11],
            }, {
                frameW: 192, /* orig: 662 */
                frameH: 200, /* orig: 680 */
                interval: 75,
                useTimer: false,
            });
        },
        status: 'alive'
    });

    var PurpleTree = Actor.extend({
        init: function (x, y, w, h) {
            this._super.apply(this, [x - 67, y - 349, 225, 432]);
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
                "                    U                                         \n" +
                "                                                              \n" +
                "                         U  U                                 \n" +
                "                   P     AAAA                                 \n" +
                "                   AAA                                        \n" +
                "                AAA                                           \n" +
                "                                                              \n" +
                "     W E  K    AA                                             \n" +
                " AAAAAAAAAA                             U                     \n" +
                "                        U YYYYYYYYYYYYYYYYYY                  \n" +
                "                                                              \n" +
                "             E                                                \n" +
                "           E E         P          E                  U        \n" +
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

    var height = grid.indexOf("\n") * 60;
    var width = grid.substring(0, grid.indexOf("\n")).length * 60;

    // Change the size of the playable area. Do this before placing items!
    world.resize(5000, height);

    castle = new Box(grid.indexOf("\n")*60-150, world.height-220, 180, 180);
    castle.src = 'assets/kasteel.png';

    solid = new TileMap(grid, {
        W: defaultBox('assets/walnoot.png'),
        E: Egg,
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
        if (o instanceof PurpleTree) {
            solid.clearCell(i, j);
            purpleTrees.add(o);
        }

    });

    var background_old = new Layer({width: world.width, src: 'assets/achtergrond.png'});

    background = new Layer({
        src: 'assets/achtergrond.png',
        x: 0,
        y: 0,
        width: world.width,
        height: world.height,
    });
    var ca = document.createElement('canvas');
    background.context.drawPattern(ca, 0, 0, background.width, background.height, 'repeat-x');

    // zoiets nog doen:
    //
    // var canvas = document.getElementById("canvas"),
    //     context = canvas.getContext("2d"),
    //     img = new Image();
    //
    // img.src = 'https://www.google.nl/images/srpr/logo3w.png';
    //
    // img.onload = function(){
    //     // create pattern
    //     var ptrn = context.createPattern(img, 'repeat'); // Create a pattern with this image, and set it to "repeat".
    //     context.fillStyle = ptrn;
    //     context.fillRect(0, 0, canvas.width, canvas.height); // context.fillRect(x, y, width, height);
    // }




    // Set up the Heads-Up Display layer.
    // This layer will stay in place even while the world scrolls.
    hud = new Layer({relative: 'canvas'});
    hud.context.font = '20px Verdana';
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
    player = new Player(150, 150, 90, 90);
    player.MULTI_JUMP = -1;
    player.G_CONST = 10;
    player.src = new SpriteMap('assets/small8bitcrows.png', {
        stand: [1, 5, 1, 5],
        left: [0, 0, 0, 4],
        right: [1, 0, 1, 4],
        lookLeft: [0, 2, 0, 2],
        lookRight: [1, 2, 1, 2],
        slideLeft: [0, 2, 0, 2],
        slideRight: [1, 2, 1, 2],
        jumpLeft: [0, 6, 0, 8],
        jumpRight: [1, 6, 1, 8],
        throwLeft: [0, 11, 0, 11],
        throwRight: [1, 11, 1, 11],
        fall: [1, 6, 1, 8],
        jump: [1, 6, 1, 8],
    }, {
        frameW: 192, /* orig: 662 */
        frameH: 200, /* orig: 680 */
        interval: 75,
        useTimer: false,
    });
}
