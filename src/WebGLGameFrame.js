/**
 * @class WebGLGameFrame
 * @requires GameFrame
 */
function WebGLGameFrame() {
    GameFrame.call(this);
}

WebGLGameFrame.prototype = Object.create(GameFrame.prototype);

/**
 * 
 */
WebGLGameFrame.prototype.init = function () {
    GameFrame.prototype.init.call(this);
    this.gl = this.canvasHolder.getContext();
    this.initPrograms();
    this.run();
};

/**
 * 
 */
WebGLGameFrame.prototype.initPrograms = function () {
    this.makeGLProgram();
};

/**
 * 
 * 
 * @param {any} source
 * @param {any} shaderType
 * @returns
 */
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

/**
 * 
 * 
 * @param {any} vsSource
 * @param {any} fsSource
 */
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

/**
 * 
 */
WebGLGameFrame.prototype.viewPortAll = function () {
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
};

/**
 * 
 */
WebGLGameFrame.prototype.clear = function () {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
};

/**
 * 
 */
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

    /**
     * 
     */
    this.draw = function () {
        // draw
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    };

    this.draw();
};

/**
 * 
 */
WebGLGameFrame.prototype.run = function () {
    this.viewPortAll();
    this.clear();
    this.draw();
};


/**
 * 
 */
function RenderBuffer() {
}

/**
 * 
 * 
 * @returns
 */
RenderBuffer.prototype.getData = function () {
    return 0;
};