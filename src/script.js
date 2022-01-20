import './style.css'
import * as dat from 'dat.gui'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import galleryVertex from './shaders/gallery/vertex.glsl'
import galleryFragment  from './shaders/gallery/fragment.glsl'

// Canvas
const canvas = document.querySelector('canvas.webgl')

class app {
    constructor() {
        // Debug
        this.debugObject = {}
        this.gui = new dat.GUI({
            width: 400
        })

        // options
        this.sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }
        // grid
        this.count = { x: 3, y: 4 } // size
        this.rotationData = []            // rotation array
        this.positionData = []            // position array

        // clock
        this.clock = new THREE.Clock()

        // Scene
        this.scene = new THREE.Scene()
        // Texture loader
        this.textureLoader = new THREE.TextureLoader()

        this.cameraInit()
        this.lightInit()
        this.OrbitControls()
        this.rendererInit()

        this.geometry()
        this.resize()
        this.animateGrid()

        this.tick()
    }
    cameraInit() {
        // Base camera
        this.camera = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 100)
        this.camera.position.z = 6
        this.scene.add(this.camera)
    }
    lightInit() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 1)
        this.scene.add( ambientLight )
    }
    rendererInit() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        })
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }
    OrbitControls() {
        // Controls
        this.controls = new OrbitControls(this.camera, canvas)
        this.controls.enableDamping = true
    }
    geometry() {
        this.galleryMaterial = new THREE.ShaderMaterial({
            vertexShader: galleryVertex,
            fragmentShader: galleryFragment,
            side: THREE.DoubleSide,
            uniforms: {
                u_texture: { value: this.textureLoader.load('/image.jpg') },
                u_backTexture: { value: this.textureLoader.load('/image-1.jpg') },
                u_pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
                u_time: { value: 0 },
            }
        })

        this.group = new THREE.Group()
        for (let i = 0; i < this.count.x; i++) {
            for (let j = 0; j < this.count.y; j++) {
                const scale = 1.
                const halfStep = {
                    x: (scale * (this.count.x)) / 2,
                    y: (scale * (this.count.y)) / 2,
                }
                const x = i - halfStep.x
                const y = j - halfStep.y
                const heartShape = new THREE.Shape()
                heartShape.moveTo(x, y ) // 1
                heartShape.lineTo(x + 1, y)    // 2
                heartShape.lineTo(x + 1, y + 1)   // 3
                heartShape.lineTo(x, y + 1)  // 4
                heartShape.lineTo(x, y)   // 1

                // find center
                const c = new THREE.Vector3(
                    (x + (x + 1)) / 2,
                    (y + (y + 1)) / 2,
                    0.05
                )

                const extrudeSettings = { depth: 0.3, bevelEnabled: false, steps: 1, bevelSize: 0, bevelThickness: 1 }

                const geometry = new THREE.ExtrudeGeometry( heartShape, extrudeSettings )

                // remove postion
                geometry.translate( -c.x, -c.y, 0 )

                const mesh = new THREE.Mesh( geometry, this.galleryMaterial )
                // move mesh to it place
                mesh.position.copy( c )

                this.positionData.push(mesh.position)
                this.rotationData.push(mesh.rotation)

                this.group.add(mesh)
            }
        }

        this.scene.add( this.group )
    }
    resize() {
        window.addEventListener('resize', () =>
        {
            // Update sizes
            this.sizes.width = window.innerWidth
            this.sizes.height = window.innerHeight

            // Update camera
            this.camera.aspect = this.sizes.width / this.sizes.height
            this.camera.updateProjectionMatrix()

            // Update renderer
            this.renderer.setSize(this.sizes.width, this.sizes.height)
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        })
    }
    animateGrid() {
        gsap.to(this.rotationData, {
            y: -Math.PI,
            ease: "power1.inOut",
            repeat: -1,
            yoyo: true,
            duration: 1.8,
            stagger: {
                grid: [4,8],
                from: "center",
                amount: .5
            }
        })
        // gsap.to(this.positionData, {
        //     x: 1,
        //     y: 1,
        //     ease: "power1.inOut",
        //     repeat: -1,
        //     yoyo: true,
        //     duration: 0.9,
        //     stagger: {
        //         grid: [4,8],
        //         from: "center",
        //         amount: .5
        //     }
        // })
    }
    tick() {
        const elapsedTime = this.clock.getElapsedTime()
        // Update controls
        this.controls.update()

        // Udsate time
        // this.galleryMaterial.uniforms.u_time.value = elapsedTime

        // Render
        this.renderer.render(this.scene, this.camera)

        // Call tick again on the next frame
        window.requestAnimationFrame(this.tick.bind(this))
    }
}

const _app = new app()