import { mat4 } from 'gl-matrix'

let canvas = document.createElement('canvas')
canvas.width = 800
canvas.height = 600

document.body.appendChild(canvas)
let gl = canvas.getContext('experimental-webgl')
gl.viewport(0, 0, canvas.width, canvas.height)

// Define where we see the model
// In fact, this is done by translating the model in the opposite direction
let modelViewMatrix = mat4.create()
mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -5])

// And how wide we see the model
let projectionMatrix = mat4.create()
mat4.perspective(
	projectionMatrix,
	Math.PI / 4,
	canvas.width / canvas.height,
	1, 1000
)

function createSquare() {
	// Create vertex buffer
	let buffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

	// And pass data to it
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([
			-1, -1, 0,
			+1, -1, 0,
			-1, +1, 0,
			+1, +1, 0,
		]),
		gl.STATIC_DRAW
	)

	return {
		buffer,
		vertSize: 3,
		nVerts: 4,
		primtype: gl.TRIANGLE_STRIP
	}
}

function createShader(type, glsl) {
	// Let there be a shader
	let shader
	switch (type) {
		case 'frag':
			shader = gl.createShader(gl.FRAGMENT_SHADER)
			break
		case 'vert':
			shader = gl.createShader(gl.VERTEX_SHADER)
			break
		default:
			return null
	}

	// And pass the GLSL source to it to compile
	gl.shaderSource(shader, glsl)
	gl.compileShader(shader)

	// No error and we got it
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(shader))
		return null
	}
	return shader
}

function initShader() {
	// So we have vertex and fragment shaders here
	let vertShader = createShader('vert', `
		attribute vec3 vertexPos;
		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;
		void main() {
			gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPos, 1.0);
		}
	`)
	let fragShader = createShader('frag', `
		void main() {
			gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
		}
	`)

	// Link them to a program
	let program = gl.createProgram()
	gl.attachShader(program, vertShader)
	gl.attachShader(program, fragShader)
	gl.linkProgram(program)

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('Link Error')
	} else {
		return program
	}
}

// Start the job!
gl.clearColor(0, 0, 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT)

let obj = createSquare()
let shader = initShader()

// Get memory access to shader params
let attrVetexPos = gl.getAttribLocation(shader, 'vertexPos')
let uniModelViewMatrix = gl.getUniformLocation(shader, 'modelViewMatrix')
let uniProjectionMatrix = gl.getUniformLocation(shader, 'projectionMatrix')
gl.enableVertexAttribArray(attrVetexPos)

gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer)
gl.useProgram(shader)

gl.vertexAttribPointer(attrVetexPos, obj.vertSize, gl.FLOAT, false, 0, 0)
gl.uniformMatrix4fv(uniModelViewMatrix, false, modelViewMatrix)
gl.uniformMatrix4fv(uniProjectionMatrix, false, projectionMatrix)

gl.drawArrays(obj.primtype, 0, obj.nVerts)

