/**
 * 
 * @class CanvasHolder
 * @param {any} opt_dimensionX
 * @param {any} opt_dimensionY
 */
function CanvasHolder(opt_dimensionX, opt_dimensionY) {
    this.dimension = [
        opt_dimensionX || 300,
        opt_dimensionY || 200
    ];
    this.init();
}

CanvasHolder.prototype = {
    /**
     * 
     */
    init: function () {
        var canvas;
        canvas = document.createElement("canvas");
        canvas.style.width = this.dimension[0];
        canvas.style.height = this.dimension[1];
        this.canvas = canvas;
    },
    /**
     * 
     * 
     * @param {any} detail
     */
    setDetail: function (detail) {
        var c;
        switch (detail) {
            case "high":
                c = 1.0;
                break;
            case "low":
                c = 0.25;
                break;
            default: // medium expected
                c = 0.5;
        }
        this.canvas.width = this.dimension[0] * c;
        this.canvas.height = this.dimension[1] * c;
    },
    /**
     * 
     * 
     * @returns
     */
    getContext: function () {
        return this.canvas.getContext("webgl");
    }
};