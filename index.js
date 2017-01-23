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


function RenderBuffer() {
}

RenderBuffer.prototype.getData = function () {
    return 0;
};


function ShaderToyGameFrame() {
    WebGLGameFrame.call(this);
};

ShaderToyGameFrame.prototype = Object.create(WebGLGameFrame.prototype);

ShaderToyGameFrame.prototype.run = function () {
    this.initChannels();
    this.initUniforms();
    this.initShaderToyUniforms();
    this.setStaticUniforms();
    this.viewPortAll();
    this.tick();
};

ShaderToyGameFrame.prototype.tick = function () {
    this.setDynamicUniforms();
    this.clear();
    this.draw();
    setTimeout(this.tick.bind(this), 0);
};

ShaderToyGameFrame.prototype.initChannels = function () {
    // TODO
    // this should work with render buffer object or another type of buffer
    // also shadertoygameframe content should be "instance" of rendner buffer object
    var i;

    this.channels = [];
    for (i = 0; i < 4; i++) {
        this.channels.push(new RenderBuffer());
    }
};


ShaderToyGameFrame.prototype.initUniforms = function () {
    this.uniforms = {};
    this.uniforms["static"] = {};
    this.uniforms["dynamic"] = {};
};

ShaderToyGameFrame.prototype.initShaderToyUniforms = function () {
    var shaderToyUniforms, key;

    // List of all accessible shadertoy uniforms
    /*    
    uniform vec3      iResolution;           // viewport resolution (in pixels)
    uniform float     iGlobalTime;           // shader playback time (in seconds)
    uniform float     iTimeDelta;            // render time (in seconds)
    uniform int       iFrame;                // shader playback frame
    uniform float     iChannelTime[4];       // channel playback time (in seconds)
    uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
    uniform vec4      iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
    uniform samplerXX iChannel0..3;          // input channel. XX = 2D/Cube
    uniform vec4      iDate;                 // (year, month, day, time in seconds)
    uniform float     iSampleRate;           // sound sample rate (i.e., 44100)
    */

    shaderToyUniforms = {
        iResolution: {
            type: "uniform3f",
            value: [this.gl.canvas.width, this.gl.canvas.height, 1.0]
        }, // static
        iGlobalTime: {
            type: "uniform1f",
            value: function () {
                return this.getGameTime();
            }.bind(this)
        }, // dynamic
        iTimeDelta: {
            type: "uniform1f",
            value: function () {
                return this.getGameTime();
            }.bind(this)
        }, // d
        iFrame: {
            type: "uniform1i",
            value: 1
        }, // s
        iChannelTime: {
            type: "uniform1fv",
            value: [[0.5], [0], [0], [0]]
        }, // s
        iChannelResolution: {
            type: "uniform3fv",
            value: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]]
        }, // s
        iMouse: {
            type: "uniform4f",
            value: function () {
                return this.getMousePosition();
            }.bind(this)
        }, // d
        iChannel0: {
            type: "uniform1i",
            value: function () {
                return this.channels[0].getData();
            }.bind(this)
        }, // d
        iChannel1: {
            type: "uniform1i",
            value: function () {
                return this.channels[0].getData();
            }.bind(this)
        }, // d
        iChannel2: {
            type: "uniform1i",
            value: function () {
                return this.channels[0].getData();
            }.bind(this)
        }, // d
        iChannel3: {
            type: "uniform1i",
            value: function () {
                return this.channels[0].getData();
            }.bind(this)
        }, // d
        iDate: {
            type: "uniform4f",
            value: function () {
                return [0, 0, 0, 0];
            }.bind(this)
        }, // d
        iSampleRate: {
            type: "uniform1f",
            value: 44100
        } // s
    };

    for (key in shaderToyUniforms) {
        this.configureUniform(key, shaderToyUniforms[key].type, shaderToyUniforms[key].value);
    }
};

ShaderToyGameFrame.prototype.configureUniform = function (name, uniformType, value) {
    var mutability = "static";
    var valueGetter;

    if (typeof value === "function") {
        mutability = "dynamic";
        valueGetter = value;
    } else {
        valueGetter = function () {
            return value;
        }
    }

    this.uniforms[mutability][name] = {
        getValue: valueGetter,
        uniformType: uniformType
    }

};

ShaderToyGameFrame.prototype.setStaticUniforms = function () {
    var key;
    for (key in this.uniforms["static"]) {
        this._setUniform(key, "static");
    }
};

ShaderToyGameFrame.prototype.setDynamicUniforms = function () {
    var key;
    for (key in this.uniforms["dynamic"]) {
        this._setUniform(key, "dynamic");
    }
};

ShaderToyGameFrame.prototype._setUniform = function (name, mutability) {
    var uniformLocation = this.gl.getUniformLocation(this.shaderProgram, name);
    var value = this.uniforms[mutability][name].getValue();
    var uniformType = this.uniforms[mutability][name].uniformType;
    var input;

    if (Array.isArray(value)) {
        value.unshift(uniformLocation);
        input = value;
    } else {
        input = [uniformLocation, value];
    }

    this.gl[uniformType].apply(this.gl, input);
};

ShaderToyGameFrame.prototype.initPrograms = function (body) {
    body = body ||
        `void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
	fragColor = vec4(uv,0.5+0.5*sin(iGlobalTime),1.0);
}`;

    var fsSource =
        `#extension GL_OES_standard_derivatives : enable
#ifdef GL_ES
precision highp float;
#endif
uniform vec3 iResolution;
uniform float iGlobalTime;
uniform float iChannelTime[4];
uniform vec4 iMouse;
uniform vec4 iDate;
uniform float iSampleRate;
uniform vec3 iChannelResolution[4];
uniform int iFrame;
uniform float iTimeDelta;
uniform float iFrameRate;
struct Channel
{
vec3 resolution;
float time;
};
uniform Channel iChannel[4];
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;
vec4 texture2DGrad( sampler2D s, in vec2 uv, vec2 gx, vec2 gy ) { return texture2D( s, uv ); }
vec4 texture2DLod( sampler2D s, in vec2 uv, in float lod ) { return texture2D( s, uv ); }
void mainImage( out vec4 c, in vec2 f );

${body}

void main( void ){
    vec4 color = vec4(0.0,0.0,0.0,1.0);
    mainImage( color, gl_FragCoord.xy );
    color.w = 1.0;
    gl_FragColor = color;
}`;

    this.makeGLProgram(undefined, fsSource);
};

ShaderToyGameFrame.prototype.getGameTime = function () {
    var time = (new Date()).getTime();
    this.getGameTime = function () {
        return ((new Date()).getTime() - time) * 0.001;
    }
    return 0;
};

ShaderToyGameFrame.prototype.getMousePosition = function () {
    return [0, 0, 0, 0];
};



window.addEventListener("load", function windowLoaded() {
    new ShaderToyGameFrame();
});