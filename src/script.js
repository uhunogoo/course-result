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
        this.aspect = {
            back: new THREE.Vector2(1, 1),
            front: new THREE.Vector2(1, 1)
        }
        // grid
        this.count = { x: 6, y: 6 } // size
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
        // this.animateGrid()
        this.clickEvent()

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
        const backMaterial = this.textureLoader.load('/image-1.jpg', (material) => {
            const img_height = material.image.naturalHeight
            const img_width = material.image.naturalWidth

            const width = this.count.x
            const height = this.count.y

            this.aspect.back = new THREE.Vector2(
                Math.min((width / height) / (img_width / img_height), 1.0),
                Math.min((height / width) / (img_height / img_width), 1.0)
            )
            this.galleryMaterial.uniforms.u_backAspect.value = this.aspect.back
        })
        const frontMaterial = this.textureLoader.load('/image.jpg', (material) => {
            const img_height = material.image.naturalHeight
            const img_width = material.image.naturalWidth
            
            const width = this.count.x
            const height = this.count.y
            
            this.aspect.front = new THREE.Vector2(
                Math.min((width / height) / (img_width / img_height), 1.0),
                Math.min((height / width) / (img_height / img_width), 1.0)
            )
            this.galleryMaterial.uniforms.u_frontAspect.value = this.aspect.front
        })

        this.galleryMaterial = new THREE.ShaderMaterial({
            vertexShader: galleryVertex,
            fragmentShader: galleryFragment,
            side: THREE.DoubleSide,
            uniforms: {
                u_backAspect: { value: this.aspect.back },
                u_frontAspect: { value: this.aspect.front },
                u_count: { value: new THREE.Vector2( this.count.x, this.count.y ) },
                u_texture: { value: frontMaterial },
                u_backTexture: { value: backMaterial },
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

                const squareShape = new THREE.Shape()
                squareShape.moveTo(x, y )        // 1
                squareShape.lineTo(x + 1, y)     // 2
                squareShape.lineTo(x + 1, y + 1) // 3
                squareShape.lineTo(x, y + 1)     // 4
                squareShape.lineTo(x, y)         // 1

                // find center
                const c = new THREE.Vector3(
                    (x + (x + 1)) / 2,
                    (y + (y + 1)) / 2,
                    0
                )

                const extrudeSettings = { depth: 0.1, bevelEnabled: false, steps: 1, bevelSize: 0, bevelThickness: 1 }
                const geometry = new THREE.ExtrudeGeometry( squareShape, extrudeSettings )

                // remove postion
                geometry.translate( -c.x, -c.y, 0 )

                const mesh = new THREE.Mesh( geometry, this.galleryMaterial )
                // move mesh to it place
                mesh.position.copy( c )

                this.positionData.push(mesh.scale)
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
        this.group.children.forEach( (el, i) => {
            const tl = gsap.timeline({
                defaults: {
                    ease: "power2.inOut",
                }
            })
            tl.to(el.scale, {
                x: .9,
                y: .9,
                duration: .3,
            }, 0)
            tl.to(this.rotationData[i], {
                y: this.rotationData[i].y - Math.PI,
                duration: .8,
            }, '<+=30%')
            tl.to(el.scale, {
                x: 1,
                y: 1,
                duration: .4,
            }, '<+=150%')
        })
    }
    clickEvent() {
        document.addEventListener('click', (e) => {
            this.animateGrid()
        })
    }
    tick() {
        const elapsedTime = this.clock.getElapsedTime()
        // Update controls
        this.controls.update()

        // Udsate time
        this.galleryMaterial.uniforms.u_time.value = elapsedTime

        // Render
        this.renderer.render(this.scene, this.camera)

        // Call tick again on the next frame
        window.requestAnimationFrame(this.tick.bind(this))
    }
}

const _app = new app()