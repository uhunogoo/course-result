import './style.css'
import * as dat from 'dat.gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

import firefliesVertex from './shaders/fireflies/vertex.glsl'
import firefliesFragment  from './shaders/fireflies/fragment.glsl'

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

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)


/**
 * Textures
 */
const tvTexture = textureLoader.load('tv.jpg')
const floorTexture = textureLoader.load('floor.jpg')
const bakedTexture = textureLoader.load('baked-texture.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding
floorTexture.flipY = false
floorTexture.encoding = THREE.sRGBEncoding
tvTexture.flipY = false
tvTexture.encoding = THREE.sRGBEncoding
/**
 * Materials
 */
// Baked material 
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture, side: THREE.DoubleSide })
const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide })
const tvStandMaterial = new THREE.MeshBasicMaterial({ map: tvTexture, side: THREE.DoubleSide })

// tv material
const tvMaterial = new THREE.ShaderMaterial({
    uniforms: {
        u_time: { value: 0 }
    },
    fragmentShader: tvFragment,
    vertexShader: tvVertex,
    side: THREE.DoubleSide,
    defines: {
        PR: Math.min(2, window.devicePixelRatio).toFixed(1)
    }
})

// picture material
const pictureMaterial = new THREE.ShaderMaterial({
    uniforms: {
        u_time: { value: 0 }
    },
    fragmentShader: pictureFragment,
    vertexShader: pictureVertex,
    defines: {
        PR: Math.min(2, window.devicePixelRatio).toFixed(1)
    }
})

// Portal light material
debugObject.portaColorStart = '#9868eb'
debugObject.portaColorEnd = '#ede4f5'


/**
 * Model
 */
gltfLoader.load(
    'office-ready.glb',
    // 'office-2.glb',
    (model) => {
        const bakedMesh = model.scene.children.find( child => child.name === 'baked')
        const tvScreen = model.scene.children.find( child => child.name === 'screen')
        const picture = model.scene.children.find( child => child.name === 'picture')
        const floor = model.scene.children.find( child => child.name === 'floor')
        const tvStand = model.scene.children.find( child => child.name === 'tvStand')
        
        
        tvStand.material = tvStandMaterial
        floor.material = floorMaterial
        bakedMesh.material = bakedMaterial
        tvScreen.material = tvMaterial
        picture.material = pictureMaterial

        scene.add( model.scene )
        // scene.add( tvStand )
    }
)

/**
 * Fireflies
 */
const firefliesGeometry = new THREE.BufferGeometry()
const fireFliesCount = 10
const positionArray = new Float32Array(fireFliesCount * 3)
const scale = new Float32Array(fireFliesCount)

for( let i = 0; i < fireFliesCount; i++ ) {
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 1.5
    positionArray[i * 3 + 1] = Math.random() * 1.2
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 1.3

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
fireflies.position.z = -1
fireflies.position.x = 0.3
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
camera.position.x = 6
camera.position.y = 2
camera.position.z = 6
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false

// horizontal rotation limit
controls.minAzimuthAngle = -Math.PI * 0.05
controls.maxAzimuthAngle = Math.PI * 0.5

// vertical rotation limit
controls.minPolarAngle = Math.PI * 0.3
controls.maxPolarAngle = Math.PI * 0.4

// distance limit
controls.minDistance = 5
controls.maxDistance = 10

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
 * Create floor
 */
const floorGeometry = new THREE.PlaneBufferGeometry(100, 100, 1, 1)
const groundMaterial = new THREE.MeshBasicMaterial({color: 0xffffff})

const floorMesh = new THREE.Mesh(floorGeometry, groundMaterial)

// floor parameters
floorMesh.rotation.set(-Math.PI / 2.0, 0.0, 0.0)


// scene.add( floorMesh )

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update material
    firefliesMaterial.uniforms.u_time.value = elapsedTime
    tvMaterial.uniforms.u_time.value = elapsedTime
    
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()