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
        this.scaleZ = []            // z position array

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
                u_pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
                u_time: { value: 0 },
            }
        })

        this.group = new THREE.Group()
        for (let i = 0; i < this.count.x; i++) {
            for (let j = 0; j < this.count.y; j++) {
                const scale = 1.
                const halfStep = {
                    x: (scale * (this.count.x - 1)) / 2,
                    y: (scale * (this.count.y - 1)) / 2,
                }
                const x = i - halfStep.x
                const y = j - halfStep.y
                const heartShape = new THREE.Shape()
                heartShape.moveTo(x, y ) // 1
                heartShape.lineTo(x + 1, y)    // 2
                heartShape.lineTo(x + 1, y + 1)   // 3
                heartShape.lineTo(x, y + 1)  // 4
                heartShape.lineTo(x, y)   // 1

                const extrudeSettings = { depth: 0.3, bevelEnabled: false, steps: 1, bevelSize: 0, bevelThickness: 1 }

                const geometry = new THREE.ExtrudeGeometry( heartShape, extrudeSettings )

                const mesh = new THREE.Mesh( geometry, this.galleryMaterial )
                this.scaleZ.push(mesh.position)

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
        console.log(this.scaleZ);
        // gsap.to(this.scaleZ, {
        //     z: Math.PI * 0.4,
        //     ease: "power1.inOut",
        //     repeat: -1,
        //     yoyo: true,
        //     duration: 0.8,
        //     stagger: {
        //         grid: [4,8],
        //         from: "center",
        //         amount: 1.5
        //     }
        // });
        this.group.children.forEach( (el, i) => {
            // el.position.z = Math.random() * 1
            if (i === 0) {
                el.position.z = Math.random() * 1
            }
            // gsap.fromTo( el.position, { z: this.scaleZ[i] }, {
            //     z: 1
            // })
        })
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