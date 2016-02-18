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
        this.rush = false;
        this.stay = true;      
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
            this.rush = rush;
            this.stay = stay;
            if (!stay) this.requiredRotation.body = directon;
            else this.requiredRotation.body = this.requiredRotation.head;
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
                this.currentRotation.head += d_head;
            }else{
                this.currentRotation.head += ((d_head < 0) ? -1 : 1) * r_speed_head;
                if(this.currentRotation.head<0) this.currentRotation.head += 360;
            }

            var isBack = false;
            // body rotation
            var d_body = this.requiredRotation.body - this.currentRotation.body;
            if (d_body < -180) d_body += 360;
            else if (d_body > 180) d_body -= 360;

            var d_back = Math.abs(this.requiredRotation.body - this.requiredRotation.head);

            if (d_back > 90 && d_back< 270) {
                if (d_body < -90) d_body += 180;
                else if (d_body > 90) d_body -= 180;
                isBack = true;
            }
            if (Math.abs(d_body) < r_speed_body) {
                this.currentRotation.body += d_body;
            } else {
                this.currentRotation.body += ((d_body < 0) ? -1 : 1) * r_speed_body;
                if (this.currentRotation.body < 0) this.currentRotation.body += 360;
            }

            // move
            var d_move = this.currentRotation.head - this.currentRotation.body;
            if (d_move < -180) d_move += 360;
            else if (d_move > 180) d_move -= 360;
            this.currentRotation.headBody = d_move;

            if (this.stay) this.action = Data.action.idle;
            else {                
                if (!isBack) {
                    if (this.rush) this.action = Data.action.run;
                    else this.action = Data.action.walk;
                } else {
                    this.action = Data.action.back;
                }
                
                var speed = Data.moveSpeed[this.action] / 100;
                this.x += speed * Math.sin(this.currentRotation.body/180*Math.PI);
                this.y += speed * Math.cos(this.currentRotation.body / 180 * Math.PI);
            }

            console.log("[" + this.requiredRotation.body + ", " + this.requiredRotation.head  + "]"
                + "  [" + this.currentRotation.body + ", " + this.currentRotation.head + ", " + this.currentRotation.headBody + "]  "
                + d_head + ", " + d_body + ", " + d_move)
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