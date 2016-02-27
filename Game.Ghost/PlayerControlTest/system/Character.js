window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Character
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data.character;
    var Character = function (id, name, para) {
        // data ----------------------------------------------------------
        this.id = id;
        this.x = 0;
        this.y = 0;
        this.name = name;
        this.para = para;
        this.live = true;       // false if this character die, and no action will be taken
        this.rush = false;
        this.stay = true;
        this.headFollow = true;
        this.action = Data.action.idle;
        this.currentRotation = {
            head: 0,
            body: 0,
            headBody: 0
        };
        this.requiredRotation = {
            head: 0,
            body: 0
        };

        // cache ---------------------------------------------------------
        var r_speed_head = Data.rotateSpeed.head;
        var r_speed_body = Data.rotateSpeed.body;        

        // public method -------------------------------------------------
        this.move = function (directon, rush, stay) {
            if (!this.live) return;
            this.rush = rush;
            this.stay = stay;
            if (!stay) this.requiredRotation.body = directon;
        };

        this.headMove = function (directon, headFollow) {
            if (!this.live) return;
            if (!headFollow) this.requiredRotation.head = directon;
            this.headFollow = headFollow;
        };

        this.die = function () {
            if (!this.live) return;
            this.currentRotation = {
                head: 0,
                body: 0,
                headBody: 0
            };
            this.requiredRotation = {
                head: 0,
                body: 0
            };
            this.live = false;
            this.action = Data.action.die;
        };

        /**
         * Fired every animation frame
         * Rotate body / head, move body, if necessary
         */
        this.animation = function () {
            if (!this.live) return;
            // is back?
            var isBack = false;
            if (!this.stay && !this.headFollow && !this.rush) {
                var d_back = Math.abs(this.requiredRotation.body - this.requiredRotation.head);
                if (d_back > 90 && d_back < 270) isBack = true;
            }

            // body rotation
            var realDirection_body = this.stay ? this.currentRotation.head : (isBack ? (this.requiredRotation.body + 180) % 360 : this.requiredRotation.body);
            var d_body = realDirection_body - this.currentRotation.body;
            if (d_body < -180) d_body += 360;
            else if (d_body > 180) d_body -= 360;
            if (d_body != 0) {
                if (Math.abs(d_body) < r_speed_body) {
                    this.currentRotation.body += d_body;
                } else {
                    this.currentRotation.body += ((d_body < 0) ? -1 : 1) * r_speed_body;
                }
                if (this.currentRotation.body < 0) this.currentRotation.body += 360;
                this.currentRotation.body = this.currentRotation.body % 360;
            }
            
            // head rotation
            var realDirection_head = (!this.stay && (this.headFollow || (this.rush && !isBack))) ? this.currentRotation.body : (this.headFollow ? this.currentRotation.head : this.requiredRotation.head);
            var d_head = realDirection_head - this.currentRotation.head;
            if (d_head<-180) d_head += 360;
            else if (d_head>180) d_head -= 360;
            if (d_head != 0) {
                if (Math.abs(d_head) < r_speed_head) {
                    this.currentRotation.head += d_head;
                } else {
                    this.currentRotation.head += ((d_head < 0) ? -1 : 1) * r_speed_head;
                }
                if (this.currentRotation.head < 0) this.currentRotation.head += 360;
                this.currentRotation.head = this.currentRotation.head % 360;
            }
            // head-body rotation
            var d_headBody = this.currentRotation.head - this.currentRotation.body;
            if (d_headBody < -180) d_headBody += 360;
            else if (d_headBody > 180) d_headBody -= 360;
            this.currentRotation.headBody = d_headBody;

            // move
            if (this.stay) this.action = Data.action.idle;
            else {                
                if (!isBack) {
                    if (this.rush) this.action = Data.action.run;
                    else this.action = Data.action.walk;
                } else {
                    this.action = Data.action.back;
                }
                
                if (Math.abs(d_body) <= 90) {
                    var speed = Data.moveSpeed[this.action] / 100;
                    this.x += speed * Math.sin(this.currentRotation.body / 180 * Math.PI);
                    this.y += speed * Math.cos(this.currentRotation.body / 180 * Math.PI);
                }
            }

            //console.log("[" + this.requiredRotation.body + ", " + this.requiredRotation.head  + "]"
            //    + "  [" + this.currentRotation.body + ", " + this.currentRotation.head + ", " + this.currentRotation.headBody + "]  "
            //    + d_head + ", " + d_body + ", " + d_headBody)
        };

        // private method ------------------------------------------------
        var _init = function () {
        };
        _init();
    };

    /**
     * Game map
     * @param {number} id - player id
     * @param {string} name - player name
     * @param {object} para - character parameters
     */
    SYSTEM.Character = Character
})(window.Rendxx.Game.Ghost.System);