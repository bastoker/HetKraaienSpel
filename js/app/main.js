// The main logic for your project goes in this file.

/**
 * The {@link Player} object; an {@link Actor} controlled by user input.
 */
var player;

var background, solid;

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
};

/**
 * An array of image file paths to pre-load.
 */
var preloadables = [
    'assets/kraai.png',
    'assets/kraai-animated2.png',
    'assets/kraai-animated.png',
    'assets/eikel.png',
    'assets/kuikentje.png',
    'assets/logo.png',
    'assets/logo-repeated.png',
    'assets/walnoot.png',
    'assets/ei.png'
];

var crowcall = new Audio('crow-call.mp3');

/**
 * A magic-named function where all updates should occur.
 */
function update() {
    player.update();

    // enforce collision
    player.collideSolid(solid);
}

/**
 * A magic-named function where all drawing should occur.
 */
function draw() {
    // Draw a background. This is just for illustration so we can see scrolling.
    // context.drawCheckered(80, 0, 0, world.width, world.height);
    background.draw();
    solid.draw();
    player.draw();
    hud.draw();
}

/**
 * A magic-named function for one-time setup.
 *
 * @param {Boolean} first
 *   true if the app is being set up for the first time; false if the app has
 *   been reset and is starting over.
 */
function setup(first) {
    // Change the size of the playable area. Do this before placing items!
    world.resize(canvas.width + 3000, canvas.height + 200);

    // Switch from side view to top-down.
    Actor.prototype.GRAVITY = true;

    // Add terrain.
    var grid =  "                AII  AAAA      \n" +
                "              BBBBBK           \n" +
                "      EB    BBBBBBBBBB  IBEEII ";
    solid = new TileMap(grid, {B: 'assets/walnoot.png', E: 'assets/ei.png', I: 'assets/eikel.png', K: 'assets/kuikentje.png', A: 'assets/aarde.png'});

    background = new Layer({width: world.width, height: 800, src: 'assets/logo.png'});

// Set up the Heads-Up Display layer.
// This layer will stay in place even while the world scrolls.
    hud = new Layer({relative: 'canvas'});
    hud.context.font = '30px Arial';
    hud.context.textAlign = 'right';
    hud.context.textBaseline = 'top';
    hud.context.fillStyle = 'black';
    hud.context.strokeStyle = 'rgba(211, 211, 211, 0.5)';
    hud.context.lineWidth = 5;
    hud.context.strokeText('Score: 0', canvas.width - 15, 10);
    hud.context.fillText('Score: 0', canvas.width - 15, 10);

    // Initialize the player.
    player = new Player(200, 200, 120, 120);
    // player.DAMPING_FACTOR = 10;
    player.MULTI_JUMP = -1;
    player.G_CONST = 10;
    player.src = new SpriteMap('assets/kraai-animated.png', {
        stand: [1, 5, 1, 5],
        //fall: [1, 5, 1, 5, true],
        left: [0, 0, 0, 4],
        right: [1, 0, 1, 4],
        lookLeft: [0, 2, 0, 2],
        lookRight: [1, 2, 1, 2],
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
