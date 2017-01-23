function GameFrame() {
    this.init();
}

GameFrame.prototype = {
    init: function () {
        this.canvasHolder = new CanvasHolder(640, 640);
        document.body.appendChild(this.canvasHolder.canvas);
    }
};


function CanvasHolder(opt_dimensionX, opt_dimensionY) {
    this.dimension = [
        opt_dimensionX || 300,
        opt_dimensionY || 200
    ];
    this.init();
}

CanvasHolder.prototype = {
    init: function () {
        var canvas;
        canvas = document.createElement("canvas");
        canvas.style.width = this.dimension[0];
        canvas.style.height = this.dimension[1];
        this.canvas = canvas;
    },
    setDetail: function (detail) {
        var c;
        switch (detail) {
            case "high":
                c = 1.0;
                break;
            case "low":
                c = 0.25;
            default: // medium expected
                c = 0.5;
        }
        this.canvas.width = this.dimension[0] * c;
        this.canvas.height = this.dimension[1] * c;
    },
    getContext: function () {
        return this.canvas.getContext("webgl");
    }
};


function WebGLGameFrame() {
    GameFrame.call(this);
}

WebGLGameFrame.prototype = Object.create(GameFrame.prototype);

WebGLGameFrame.prototype.init = function () {
    GameFrame.prototype.init.call(this);
    this.gl = this.canvasHolder.getContext();
    this.initPrograms();
    this.run();
};

WebGLGameFrame.prototype.initPrograms = function () {
    this.makeGLProgram();
};

WebGLGameFrame.prototype._getShader = function (source, shaderType) {
    var shader = this.gl.createShader(shaderType);

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.error(this.gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
};

WebGLGameFrame.prototype.makeGLProgram = function (vsSource, fsSource) {
    vsSource = vsSource ||
        `attribute vec2 a_pos;

void main(void) {
    gl_Position = vec4(a_pos, 1.0, 1.0);
}`;

    fsSource = fsSource ||
        `precision mediump float;

void main(void) {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;

    var vertexShader = this._getShader(vsSource, this.gl.VERTEX_SHADER);
    var fragmentShader = this._getShader(fsSource, this.gl.FRAGMENT_SHADER);

    var shaderProgram = this.gl.createProgram();
    this.gl.attachShader(shaderProgram, vertexShader);
    this.gl.attachShader(shaderProgram, fragmentShader);
    this.gl.linkProgram(shaderProgram);

    if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
        console.error("Could not initialise shaders");
    }

    this.gl.useProgram(shaderProgram);
    this.shaderProgram = shaderProgram;
};

WebGLGameFrame.prototype.viewPortAll = function () {
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
};

WebGLGameFrame.prototype.clear = function () {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
};

WebGLGameFrame.prototype.draw = function () {
    // set buffer
    var positionLocation = this.gl.getAttribLocation(this.shaderProgram, "a_pos");
    var positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        -1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        1.0, 1.0,
    ]), this.gl.STATIC_DRAW);

    // draw
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
};

WebGLGameFrame.prototype.run = function () {
    this.viewPortAll();
    this.clear();
    this.draw();
};


window.addEventListener("load", function windowLoaded() {
    new WebGLGameFrame();
});