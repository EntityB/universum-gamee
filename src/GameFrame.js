/**
 * @class GameFrame
 */
function GameFrame() {
    this.init();
}

GameFrame.prototype = {
    /**
     * 
     */
    init: function () {
        this.canvasHolder = new CanvasHolder(640, 640);
        document.body.appendChild(this.canvasHolder.canvas);
    }
};