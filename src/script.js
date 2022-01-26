import './style.css'
import * as dat from 'dat.gui'
import * as THREE from 'three'
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
// gltfLoader.load(
//     'office-ready.glb',
//     // 'office-2.glb',
//     (model) => {
//         const bakedMesh = model.scene.children.find( child => child.name === 'baked')
//         const tvScreen = model.scene.children.find( child => child.name === 'screen')
//         const picture = model.scene.children.find( child => child.name === 'picture')
//         const floor = model.scene.children.find( child => child.name === 'floor')
//         const tvStand = model.scene.children.find( child => child.name === 'tvStand')
        
        
//         tvStand.material = tvStandMaterial
//         floor.material = floorMaterial
//         bakedMesh.material = bakedMaterial
//         tvScreen.material = tvMaterial
//         picture.material = pictureMaterial

//         bakedMesh.castShadow = true

//         scene.add( model.scene )
//         // scene.add( tvStand )
//     }
// )

const dirPlane = new THREE.PlaneBufferGeometry( 20, 20, 1024, 1024 )
const dirMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load('/9267.jpg'),
})
const customUni = {
    u_time: {value: 0}
}
dirMaterial.onBeforeCompile = (shader) =>
{
    shader.uniforms.u_time = customUni.u_time
    shader.uniforms.u_texture = { value: textureLoader.load('/9267.jpg') }
    
    shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
            #include <common>

            uniform sampler2D u_texture;
            uniform float u_time;

            attribute float a_scale;

            //	Classic Perlin 3D Noise 
            //	by Stefan Gustavson
            //
            vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
            vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
            vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

            float cnoise(vec3 P){
            vec3 Pi0 = floor(P); // Integer part for indexing
            vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
            Pi0 = mod(Pi0, 289.0);
            Pi1 = mod(Pi1, 289.0);
            vec3 Pf0 = fract(P); // Fractional part for interpolation
            vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
            vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
            vec4 iy = vec4(Pi0.yy, Pi1.yy);
            vec4 iz0 = Pi0.zzzz;
            vec4 iz1 = Pi1.zzzz;

            vec4 ixy = permute(permute(ix) + iy);
            vec4 ixy0 = permute(ixy + iz0);
            vec4 ixy1 = permute(ixy + iz1);

            vec4 gx0 = ixy0 / 7.0;
            vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
            gx0 = fract(gx0);
            vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
            vec4 sz0 = step(gz0, vec4(0.0));
            gx0 -= sz0 * (step(0.0, gx0) - 0.5);
            gy0 -= sz0 * (step(0.0, gy0) - 0.5);

            vec4 gx1 = ixy1 / 7.0;
            vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
            gx1 = fract(gx1);
            vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
            vec4 sz1 = step(gz1, vec4(0.0));
            gx1 -= sz1 * (step(0.0, gx1) - 0.5);
            gy1 -= sz1 * (step(0.0, gy1) - 0.5);

            vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
            vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
            vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
            vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
            vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
            vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
            vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
            vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

            vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
            g000 *= norm0.x;
            g010 *= norm0.y;
            g100 *= norm0.z;
            g110 *= norm0.w;
            vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
            g001 *= norm1.x;
            g011 *= norm1.y;
            g101 *= norm1.z;
            g111 *= norm1.w;

            float n000 = dot(g000, Pf0);
            float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
            float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
            float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
            float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
            float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
            float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
            float n111 = dot(g111, Pf1);

            vec3 fade_xyz = fade(Pf0);
            vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
            vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
            float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
            return 2.2 * n_xyz;
            }
        `
    )
    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
            #include <begin_vertex>

            vec4 image = texture2D(u_texture, vUv);
            image.rgb = vec3(1.0 - image.r);
            image = clamp( image, vec4(0.0), vec4(1.0) );
            float opacity = image.r;

            // noise multiplier
            float _noise = cnoise(vec3(uv * 4.0, u_time * 0.5) * 4.0 ) - 1.0;
            float circle = length(uv - 0.5);
            float s = ((sin(u_time) + 1.0) / 2.0) * 0.8;
            circle = smoothstep(s - 0.15, s, circle) * 2.5;
            circle = smoothstep(0.2, 0.8, circle + _noise);

            circle = clamp(circle, 0.0, 1.0);

            transformed.z = image.r * .2 * (1.0 - circle);
        `
    )
    console.log(shader.fragmentShader);
    shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
            #include <map_fragment>
            diffuseColor = vec4(1.0) - diffuseColor;
        `
    )
}
const dirMesh = new THREE.Mesh(dirPlane, dirMaterial)
dirMesh.rotation.x = -Math.PI * 0.5
dirMesh.position.y = -1.99

// SVG map geometry
const material = new THREE.MeshBasicMaterial({color: 0xffffff})
const map = new THREE.Group()

svgTextureLoader.load(
    '9267.svg',
    (image) => {
        const path = image.paths
        const arr = []
        path.forEach( (el, i) => {
            const shape = SVGLoader.createShapes( el )
            const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: false, steps: 1, bevelSize: 0, bevelThickness: 1 })
            geometry.computeVertexNormals()        
            
            const mat = material.clone()
            
            const mesh = new THREE.Mesh( geometry, mat )
            mesh.rotation.x = Math.PI

            map.add(mesh)
        })
    }
)
map.scale.set(0.008, 0.008, 1.0)
scene.add(map)


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
// camera.position.y = 2
camera.position.z = 6
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
// controls.enablePan = false

// horizontal rotation limit
// controls.minAzimuthAngle = -Math.PI * 0.025
// controls.maxAzimuthAngle = Math.PI * 0.5

// // vertical rotation limit
// controls.minPolarAngle = -Math.PI * 0.3
// controls.maxPolarAngle = Math.PI * 0.5

// // distance limit
// controls.minDistance = 5
// controls.maxDistance = 14

/**
 * Light
 */ 
const ambientLight = new THREE.AmbientLight(0xffffff, .5)
const directionalLight = new THREE.PointLight(0xffffff, 0.5, 20)
directionalLight.position.set( 2, 8, 2 )
directionalLight.castShadow = true

scene.add(ambientLight, directionalLight)

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

debugObject.clearColor = '#020202'
renderer.setClearColor( debugObject.clearColor )


/**
 * Create floor
 */
const floorGeometry = new THREE.PlaneBufferGeometry(100, 100, 1, 1)
debugObject.floorColor = '#020409'
const groundMaterial = new THREE.MeshStandardMaterial({color: debugObject.clearColor, side: THREE.DoubleSide })
const floorMesh = new THREE.Mesh(floorGeometry, groundMaterial)
floorMesh.receiveShadow = true

// floor parameters
floorMesh.rotation.set(-Math.PI / 2.0, 0.0, 0.0)
floorMesh.position.set(0, -2, 0.0)

scene.add( floorMesh )

/**
 * Fog
 */
 const fog = new THREE.Fog(debugObject.clearColor, 1, 40)
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

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update material
    // firefliesMaterial.uniforms.u_time.value = elapsedTime
    tvMaterial.uniforms.u_time.value = elapsedTime
    customUni.u_time.value = elapsedTime
    
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()