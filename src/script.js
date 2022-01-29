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
const models = []
const matcap = new THREE.MeshMatcapMaterial({
    matcap: textureLoader.load('/4.png')
})
gltfLoader.load(
    'map-1.glb',
    (model) => {
        const map_1 = model.scene.children[0]
        const map_2 = model.scene.children[1]
        map_1.geometry.translate(
            - map_2.geometry.boundingBox.max.x * 0.5,
            - map_1.geometry.boundingBox.max.y * 0.5,
            - map_1.geometry.boundingBox.max.z * 0.5
        )
        map_1.scale.set( 40, 0, 40 )
        
        map_2.geometry.translate(
            - map_2.geometry.boundingBox.max.x * 0.5,
            - map_2.geometry.boundingBox.max.y * 0.5,
            - map_2.geometry.boundingBox.max.z * 0.5 - map_1.geometry.boundingBox.max.z 
        )
        map_2.scale.set( 40, 0, 40 )


        map_1.position.y = -map_2.geometry.boundingBox.max.y * 40
        map_2.position.y = -map_2.geometry.boundingBox.max.y * 40
        map_1.castShadow = true
        map_2.castShadow = true
        map_1.geometry.computeVertexNormals()
        map_2.geometry.computeVertexNormals()
        map_1.material = matcap.clone()
        map_2.material = matcap.clone()
        

        models.push( ...model.scene.children )
        scene.add( map_1, map_2 )

        inAnimation()
    }
)

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
    // firefliesMaterial.uniforms.value =  Math.min(window.devicePixelRatio, 2)

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
// camera.position.x = 4
camera.position.y = 1
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


/**
 * Create floor
 */
const floorGeometry = new THREE.PlaneBufferGeometry(100, 100, 1, 1)
debugObject.floorColor = '#ffffff'
const groundMaterial = new THREE.MeshStandardMaterial({color: debugObject.clearColor, side: THREE.DoubleSide })
const floorMesh = new THREE.Mesh(floorGeometry, groundMaterial)
floorMesh.receiveShadow = true

// floor parameters
floorMesh.rotation.set(-Math.PI / 2.0, 0.0, 0.0)
floorMesh.position.set(0, -0.025, 0.0)

scene.add( floorMesh )

/**
 * Fog
 */
 const fog = new THREE.Fog(debugObject.clearColor, 1, 60)
 scene.fog = fog

 gui
 .addColor( debugObject, 'clearColor' )
 .onChange(() => {
     renderer.setClearColor( debugObject.clearColor )
     groundMaterial.color.set( debugObject.clearColor )
     fog.color.set( debugObject.clearColor )
 })
 .name('background color')

/**
 * Animate
 */
const clock = new THREE.Clock()

const inAnimation = () => {
    const modelScale = []
    const modelPosition = []
    models.forEach( el => {
        modelScale.push( el.scale )
        modelPosition.push( el.position )
    })

    gsap.to( modelScale, {
        y: 20,
        // yoyo: true,
        // repeat: -1,
        stagger: 0.3,
        duration: 0.8
    })
    gsap.to( modelPosition, {
        y: models[0].geometry.boundingBox.max.y * 40,
        // yoyo: true,
        // repeat: -1,
        stagger: 0.3,
        duration: 0.8
    })
}

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update material
    // firefliesMaterial.uniforms.u_time.value = elapsedTime
    tvMaterial.uniforms.u_time.value = elapsedTime
    
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()