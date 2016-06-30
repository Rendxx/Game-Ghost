window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer2D = window.Rendxx.Game.Ghost.Renderer2D || {};

/**
 * Setup map, including light, wall and other stuff
 *     y
 *     |
 *     |
 *     o------x
 *    /
 *   /
 *  z
 */
(function (RENDERER) {
    /**
     * Ray casting scan
     * @param {float} x - viewer relative position x (grid size = 1)
     * @param {float} y - viewer relative position y (grid size = 1)
     * @param {float} rotation - viewer rotation, original direction: [1,0], clockwise rotate (radian)
     * @param {float} fov - field of vision (radian)
     * @param {int[][]} map - map, -1 means empty
     * @param {int} wid - scan count
     * @param {function(block)} onScaned - callback
     */
    var RayCasting = function (x, y, rotation, fov, length, map, wid, onScaned) {
        var cos_rotspeedn = Math.cos(rotation);
        var sin_rotspeedn = Math.sin(rotation);

        var dx = 1.0,
            dy = 0.0,
            cameraX = 0,
            cameraY = 1.0 * Math.tan(fov / 2),
            dx2 = dx,
            cameraX2 = cameraX;

        dx = dx2 * cos_rotspeedn - dy * sin_rotspeedn;
        dy = dx2 * sin_rotspeedn + dy * cos_rotspeedn;

        cameraX = cameraX2 * cos_rotspeedn - cameraY * sin_rotspeedn;
        cameraY = cameraX2 * sin_rotspeedn + cameraY * cos_rotspeedn;

        var col,
            map_w = map[0].length,
            map_h = map.length,
            block = {};

        for (col = 0; col < wid; col++) {
            var camera, ray_x, ray_y, ray_dx, ray_dy, map_x, map_y, delta_x,
            delta_y, step_x, step_y;

            camera = 2 * col / wid - 1;
            ray_x = x;
            ray_y = y;
            ray_dx = dx + cameraX * camera;
            ray_dy = dy + cameraY * camera;
            map_x = Math.floor(ray_x);
            map_y = Math.floor(ray_y);
            delta_x = Math.sqrt(1 + (ray_dy * ray_dy) / (ray_dx * ray_dx));
            delta_y = Math.sqrt(1 + (ray_dx * ray_dx) / (ray_dy * ray_dy));

            // initial step for the ray
            if (ray_dx < 0) {
                step_x = -1;
                dist_x = (ray_x - map_x) * delta_x;
            } else {
                step_x = 1;
                dist_x = ((map_x + 1) - ray_x) * delta_x;
            }
            if (ray_dy < 0) {
                step_y = -1;
                dist_y = (ray_y - map_y) * delta_y;
            } else {
                step_y = 1;
                dist_y = ((map_y + 1) - ray_y) * delta_y;
            }

            //console.log(ray_x, ray_y, step_x, step_y);
            // DDA
            while (dist_x < length && dist_y < length) {
                if (dist_x < dist_y) {
                    dist_x += delta_x;
                    map_x += step_x;
                } else {
                    dist_y += delta_y;
                    map_y += step_y;
                }

                if (map_x >= map_w || map_x < 0 ||
                    map_y >= map_h || map_y < 0)
                    break;

                if (map[map_y][map_x] !== null) {
                    block[map[map_y][map_x]] = true;
                    break;
                }
            }

            onScaned(block);
        }
    };

    RENDERER.RayCasting = RayCasting;
})(window.Rendxx.Game.Ghost.Renderer2D);