import './style.css'
import * as dat from 'dat.gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

import firefliesVertex from './shaders/fireflies/vertex.glsl'
import firefliesFragment  from './shaders/fireflies/fragment.glsl'

import portalVertex from './shaders/portal/vertex.glsl'
import portalFragment  from './shaders/portal/fragment.glsl'

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

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)


/**
 * Textures
 */
const bakedTexture = textureLoader.load('baked.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding
/**
 * Materials
 */
// Baked material 
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

// Pole light material
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 })

// Portal light material
// debugObject.portaColorStart = '#a13cd9'
// debugObject.portaColorEnd = '#ca9ef0'
// debugObject.portaColorStart = '#a555e3'
// debugObject.portaColorEnd = '#c998d7'
debugObject.portaColorStart = '#9868eb'
debugObject.portaColorEnd = '#ede4f5'

const portalLightMaterial = new THREE.ShaderMaterial({
    vertexShader: portalVertex,
    fragmentShader: portalFragment,
    uniforms: {
        u_pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        u_time: { value: 0 },
        u_colorStart: { value: new THREE.Color(debugObject.portaColorStart) },
        u_colorEnd: { value: new THREE.Color(debugObject.portaColorEnd) },
    }
})
gui
    .addColor( debugObject, 'portaColorStart')
    .onChange(() => {
        portalLightMaterial.uniforms.u_colorStart.value = new THREE.Color(debugObject.portaColorStart)
    })
gui
    .addColor( debugObject, 'portaColorEnd')
    .onChange(() => {
        portalLightMaterial.uniforms.u_colorEnd.value = new THREE.Color(debugObject.portaColorEnd)
    })

/**
 * Model
 */
gltfLoader.load(
    'portal.glb',
    (model) => {
        const bakedMesh = model.scene.children.find( child => child.name === 'baked')
        const poleLightAMesh = model.scene.children.find( child => child.name === 'poleLightA')
        const poleLightBMesh = model.scene.children.find( child => child.name === 'poleLightB')
        const portalLightMesh = model.scene.children.find( child => child.name === 'portalLight')
        
        bakedMesh.material = bakedMaterial
        poleLightAMesh.material = poleLightMaterial
        poleLightBMesh.material = poleLightMaterial
        portalLightMesh.material = portalLightMaterial

        scene.add( model.scene )
    }
)

/**
 * Fireflies
 */
const firefliesGeometry = new THREE.BufferGeometry()
const fireFliesCount = 30
const positionArray = new Float32Array(fireFliesCount * 3)
const scale = new Float32Array(fireFliesCount)

for( let i = 0; i < fireFliesCount; i++ ) {
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4
    positionArray[i * 3 + 1] = Math.random() * 2
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4

    scale[i] = Math.random()
}

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
firefliesGeometry.setAttribute('a_scale', new THREE.BufferAttribute(scale, 1))

// Material 
const firefliesMaterial = new THREE.ShaderMaterial({
    vertexShader: firefliesVertex,
    fragmentShader: firefliesFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
        u_pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        u_pointSize: { value: 100 },
        u_time: { value: 0 }
    }
})

gui.add( firefliesMaterial.uniforms.u_pointSize, 'value' ).min(0).max(500).name('fireflies size')

// Points
const fireflies = new THREE.Points( firefliesGeometry, firefliesMaterial )
scene.add(fireflies)

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
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

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

debugObject.clearColor = '#17192d'
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
    firefliesMaterial.uniforms.u_time.value = elapsedTime
    portalLightMaterial.uniforms.u_time.value = elapsedTime
    
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()