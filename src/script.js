import './style.css'
import * as dat from 'dat.gui'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'


import tvVertex from './shaders/tv/vertex.glsl'
import tvFragment  from './shaders/tv/fragment.glsl'
import pictureVertex from './shaders/picture/vertex.glsl'
import pictureFragment  from './shaders/picture/fragment.glsl'

/**
 * Base
 */
// Debug
const debugObject = {}
const gui = new dat.GUI({
    width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()
const svgTextureLoader = new SVGLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)


/**
 * Textures
 */
const mapTexture = textureLoader.load('wooden.jpg')
mapTexture.encoding = THREE.sRGBEncoding


/**
 * Materials
 */
debugObject.progress = 0
const mapMaterial = new THREE.ShaderMaterial({
    fragmentShader: pictureFragment,
    vertexShader: pictureVertex,
    side: THREE.DoubleSide,
    uniforms: {
        u_time: { value: 0 },
        u_progress: { value: debugObject.progress },
        u_texture: { value: mapTexture }
    }
})
gui.add(mapMaterial.uniforms.u_progress, 'value').min(0).max(1).step(0.001)




/**
 * Model
 */

const plane = new THREE.PlaneBufferGeometry( 2, 2 )

const mapMesh = new THREE.Mesh( plane, mapMaterial )
scene.add( mapMesh )

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)

camera.position.z = 3

camera.lookAt( new THREE.Vector3( 0, 0, 0  ) )
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


/**
 * Light
 */ 
const ambientLight = new THREE.AmbientLight(0xffffff, .5)
// const directionalLight = new THREE.PointLight(0xffffff, .15, 20)
// directionalLight.position.set( 2, 8, 2 )
// directionalLight.castShadow = true

const light = new THREE.PointLight(0xffffff, 0.5)
light.position.x = 2
light.position.y = 3
light.position.z = 4
scene.add(light)

scene.add(ambientLight)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding
renderer.shadowMap.enabled = true

debugObject.clearColor = '#ffffff'
renderer.setClearColor( debugObject.clearColor )

gui
.addColor( debugObject, 'clearColor' )
.onChange(() => {
    renderer.setClearColor( debugObject.clearColor )
})
.name('background color')

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update material
    mapMaterial.uniforms.u_time.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()