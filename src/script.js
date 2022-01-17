import './style.css'
import * as dat from 'dat.gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import galleryVertex from './shaders/gallery/vertex.glsl'
import galleryFragment  from './shaders/gallery/fragment.glsl'


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


/**
 * Materials
 */
const image = [
    textureLoader.load('/image.jpg')
]
const galleryMaterial = new THREE.ShaderMaterial({
    vertexShader: galleryVertex,
    fragmentShader: galleryFragment,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
        u_texture: { value: null },
        u_pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        u_time: { value: 0 },
    }
})

galleryMaterial.uniforms.u_texture.value = image[0]


/**
 * Model
 */
const planeGeometry = new THREE.PlaneBufferGeometry(2, 2, 2, 2)
const planeMaterial = new THREE.MeshBasicMaterial({ map: image[0], color: 0xffffff, side: THREE.DoubleSide })
const planeMesh = new THREE.Mesh( planeGeometry, galleryMaterial )
planeMesh.position.y = 1

scene.add(planeMesh)


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

    // Update pixelRatio
    firefliesMaterial.uniforms.value =  Math.min(window.devicePixelRatio, 2)

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 6
camera.position.y = 2
camera.position.z = 6
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


/**
 * Light
 */ 
const ambientLight = new THREE.AmbientLight(0xffffff, 1)

scene.add( ambientLight )

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    
    // Update controls
    controls.update()

    // Udsate time
    galleryMaterial.uniforms.u_time.value = elapsedTime

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()