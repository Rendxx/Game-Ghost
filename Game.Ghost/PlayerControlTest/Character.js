window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Player
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var Character = function (id, name, para) {
        // data ----------------------------------------------------------
        this.id = id;
        this.name = name;
        this.para = para;
        this.rush = false;
        this.currentRotation = {
            head: 0,
            body: 0
        };
        this.requiredRotation = {
            head: 0,
            body: 0
        };

        // cache ---------------------------------------------------------
        var r_speed_head = Data.character.rotateSpeed.head;

        // public method -------------------------------------------------
        this.move = function (directon, rush) {
            this.rush = rush;
            this.requiredRotation.body = directon;
        };

        this.headMove = function (directon) {
            this.requiredRotation.head = directon;
        };

        /**
         * Fired every animation frame
         * Rotate body / head, move body, if necessary
         */
        this.animation = function () {
            // head rotation
            var d_head = this.requiredRotation.head - this.currentRotation.head;
            if (d_head<-180) d_head += 360;
            else if (d_head>180) d_head -= 360;
            if (Math.abs(d_head)<r_speed_head){
                this.currentRotation.head = this.requiredRotation.head;
            }else{
                this.currentRotation.head += d_head/d_head*r_speed_head;
                if(this.currentRotation.head<0) this.currentRotation.head += 360;
            }

            // body rotation
            var d_body = this.requiredRotation.body - this.currentRotation.body;
            if (d_body < -180) d_body += 360;
            else if (d_body > 180) d_body -= 360;
            if (Math.abs(d_body) < r_speed_body) {
                this.currentRotation.body = this.requiredRotation.body;
            } else {
                this.currentRotation.body += d_body / d_body * r_speed_body;
                if (this.currentRotation.body < 0) this.currentRotation.body += 360;
            }

            // move
            var d_move = this.currentRotation.head - this.currentRotation.body;
            if (d_move < -180) d_body += 360;
            else if (d_move > 180) d_body -= 360;
            if (Math.abs(d_move) < 90) {
                this.currentRotation.body = this.requiredRotation.body;
            } else {
                this.currentRotation.body += d_body / d_body * r_speed_body;
                if (this.currentRotation.body < 0) this.currentRotation.body += 360;
            }
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