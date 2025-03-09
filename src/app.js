import run from './lib/index.js'

const canvas = document.getElementById('demo')
const image = new Image()
image.src = '/shape.png'
image.onload = () => run({ canvas, image })