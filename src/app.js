let canvas = document.createElement('canvas')
canvas.width = 800
canvas.height = 600

document.body.appendChild(canvas)
let gl = canvas.getContext('experimental-webgl')
gl.viewport(0, 0, canvas.width, canvas.height)
