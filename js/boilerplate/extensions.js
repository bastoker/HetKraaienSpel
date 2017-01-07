/**
 * Defines useful extensions in order to add concrete Actors to a grid.
 *
 * Use a subclass of GridAddableActor in order to be addable to the grid.
 *
 * @see e.g. Egg or Owl
 * @ignore
 */

/**
 * A GridAddableActor, e.g. a Actor with special behaviour.
 *
 * @constructor
 *   Creates a new GridAddableBox instance.
 *
 * @param {Number} [x]
 *   The x-coordinate of the top-left corner of the Box. Defaults to the center
 *   of the world.
 * @param {Number} [y]
 *   The y-coordinate of the top-left corner of the Box. Defaults to the center
 *   of the world.
 * @param {Number} [w]
 *   The width of the Box. Defaults to
 *   {@link Box#DEFAULT_WIDTH Box.prototype.DEFAULT_WIDTH}.
 * @param {Number} [h]
 *   The height of the Box. Defaults to
 *   {@link Box#DEFAULT_HEIGHT Box.prototype.DEFAULT_HEIGHT}.
 * @param {Mixed} [fillStyle="black"]
 *   A default fillStyle to use when drawing the Box. Defaults to black.
 */
var GridAddableActor = Actor.extend({
    init: function (x, y, w, h, fillStyle) {
        this._super.apply(this, arguments);
    },
    setLocation: function (x, y) {
        this.x = x;
        this.y = y;

        console.log('New location set: ' + x + ', ' + y);

        // Copied from Actor constructor:
        this.lastX = this.x;
        this.lastY = this.y;
        this.lastDirection = [];
        this.lastLooked = [];
        this.jumpDirection = {right: false, left: false};
        this.dropTargets = [];
    },
    // Not needed anymore, since we remove these actors from the TileMap and manage the list seperately.
    // excludeFromDefaultCollision: true
});

/**
 * The Acorn 'Bullets from e.g. an Owl' class.
 */
var Acorn = Actor.extend({
    // Override Actor default properties.
    MOVEAMOUNT: 650, // Bullet velocity in pixels per second
    GRAVITY: false, // Just keep going rather than falling down
    CONTINUOUS_MOVEMENT: true, // Keep going in the last specified direction
    STAY_IN_WORLD: false, // Let our bullets leave the world (we'll destroy them when they do)
    DEFAULT_WIDTH: 80,
    DEFAULT_HEIGHT: 45,
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

//
// Util functions (mostly lodash) below
//

function pairwise(list) {
    if (list.length < 2) { return []; }
    var first = _.first(list),
        rest  = _.tail(list),
        pairs = _.map(rest, function (x) { return [first, x]; });
    return _.flatten([pairs, pairwise(rest)], true);
}
