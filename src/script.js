import './style.css'
import * as dat from 'dat.gui'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import galleryVertex from './shaders/gallery/vertex.glsl'
import galleryFragment  from './shaders/gallery/fragment.glsl'
import backgroundVertex from './shaders/background/vertex.glsl'
import backgroundFragment  from './shaders/background/fragment.glsl'


// Canvas
const canvas = document.querySelector('canvas.webgl')

class app {
    constructor() {
        // Debug
        this.debugObject = {}
        this.gui = new dat.GUI({
            width: 400
        })
        this.animationControlls = {
            rotation: 0,
            progress: 0
        }
        this.mouse = new THREE.Vector2()
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
        this.count = { x: 4, y: 6 } // size
        this.rotationData = []            // rotation array
        this.positionData = []            // position array
        this.scaleData = []               // position array

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
        this.backPlane()
        this.resize()
        // this.animateGrid()
        this.mouseMove()
        this.clickEvent()

        this.tick()
    }
    cameraInit() {
        // Base camera
        this.camera = new THREE.PerspectiveCamera(15, this.sizes.width / this.sizes.height, 0.1, 100)
        // const aspectRatio = this.sizes.width / this.sizes.height
        // this.camera = new THREE.OrthographicCamera( - 1 * aspectRatio, 1 * aspectRatio, 1, - 1, 0.1, 100 )
        
        this.camera.position.z = 30
        this.scene.add(this.camera)
    }
    lightInit() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 1)
        this.scene.add( ambientLight )
    }
    rendererInit() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        })
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }
    /**
     * ORBIT CONTROLL
     */
    OrbitControls() {
        // Controls
        this.controls = new OrbitControls(this.camera, canvas)
        this.controls.enableDamping = true
    }
    loadTextures( target, textures = ['/image.jpg', '/image-1-1.jpg'] ) {
        
        const frontMaterial = this.textureLoader.load(textures[0], (material) => {
            const img_height = material.image.naturalHeight
            const img_width = material.image.naturalWidth
            
            const width = this.count.x
            const height = this.count.y
            
            this.aspect.front = new THREE.Vector2(
                Math.min((width / height) / (img_width / img_height), 1.0),
                Math.min((height / width) / (img_height / img_width), 1.0)
            )
            target.uniforms.u_frontAspect.value = this.aspect.front
        })
        const backMaterial = this.textureLoader.load(textures[1], (material) => {
            const img_height = material.image.naturalHeight
            const img_width = material.image.naturalWidth
    
            const width = this.count.x
            const height = this.count.y
    
            this.aspect.back = new THREE.Vector2(
                Math.min((width / height) / (img_width / img_height), 1.0),
                Math.min((height / width) / (img_height / img_width), 1.0)
            )
            target.uniforms.u_backAspect.value = this.aspect.back
        })

        target.uniforms.u_texture.value = frontMaterial
        target.uniforms.u_backTexture.value = backMaterial

        return target
    }
    geometry() {
        
        this.galleryMaterial = new THREE.ShaderMaterial({
            vertexShader: galleryVertex,
            fragmentShader: galleryFragment,
            side: THREE.DoubleSide,
            uniforms: {
                u_backAspect: { value: this.aspect.back },
                u_frontAspect: { value: this.aspect.front },
                u_count: { value: new THREE.Vector2( this.count.x, this.count.y ) },
                u_texture: { value: null },
                u_backTexture: { value: null },
                u_pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
                u_time: { value: 0 },
            },
        })
        this.loadTextures( this.galleryMaterial )

        this.group = new THREE.Group()
        for (let i = 0; i < this.count.x; i++) {
            for (let j = 0; j < this.count.y; j++) {
                const scale = 1.
                const halfStep = {
                    x: ((this.count.x)) / 2,
                    y: ((this.count.y)) / 2,
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

                const extrudeSettings = { depth: 0.2, bevelEnabled: false, steps: 1, bevelSize: 0, bevelThickness: 1 }
                const geometry = new THREE.ExtrudeGeometry( squareShape, extrudeSettings )

                // remove postion
                geometry.translate( -c.x, -c.y, 0 )

                const mesh = new THREE.Mesh( geometry, this.galleryMaterial )
                // move mesh to it place
                mesh.position.copy( c )

                this.positionData.push(mesh.position)
                this.scaleData.push(mesh.scale)
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
        const { x, y } = this.count
        const tl = gsap.timeline({
            defaults: {
                duration: 0.4,
                ease: "back.out(1.7)",
                stagger: {
                    grid: [x, y],
                    from: 'end',
                    amount: x * y * 0.02,
                },
            },
            onComplete: () => {
                this.animationControlls.rotation -= Math.PI 
            },
        })
        tl.to(this.positionData, {
            z: function() {
                return (Math.random() - 0.5) * 3.0
            },
        }, 0)
        tl.to(this.scaleData, {
            y: 0.9,
            x: 0.9,
        }, '<+=10%')
        tl.to(this.rotationData, {
            y: this.animationControlls.rotation - Math.PI,
            duration: 0.7,
        }, '>-=40%')
        tl.to(this.scaleData, {
            y: 1,
            x: 1,
        }, '<+=30%')
        tl.to(this.positionData, {
            z: 0,
        }, '>-=80%')
    }

    backPlane() {
        
        this.backgroundMaterial = new THREE.ShaderMaterial({
            vertexShader: backgroundVertex,
            fragmentShader: backgroundFragment,
            side: THREE.DoubleSide,
            uniforms: {
                u_backAspect: { value: this.aspect.back },
                u_frontAspect: { value: this.aspect.front },
                u_texture: { value: null },
                u_backTexture: { value: null },
                u_screen: { value: new THREE.Vector2( this.sizes.width, this.sizes.height ) },
                u_pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
                u_time: { value: 0 },
                u_progress: { value: this.animationControlls.progress }
            }
        })
        this.loadTextures( this.backgroundMaterial, ['/blur-front.jpg', '/blur-back.jpg'] )
        


        const plane = new THREE.PlaneBufferGeometry( 25, 25 )
        const planeMaterial = this.backgroundMaterial

        const mesh = new THREE.Mesh( plane, planeMaterial )
        mesh.position.z = -5
        this.scene.add( mesh )
    }

    mouseMove() {
        window.addEventListener('mousemove', (e) => {
            gsap.to(this.mouse, {
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: -(e.clientY / window.innerHeight) * 2 + 1
            })
    
            gsap.to(this.camera.position, {
                duration: 2.9,
                y: -this.mouse.y * 0.3 * 40,
                x: this.mouse.x * 0.3 * 40 / (this.sizes.width / this.sizes.height)
            }, 0)
        })
    } 

    clickEvent() {
        document.addEventListener('click', (e) => {
            this.animateGrid()
            const targetProgress = (this.animationControlls.progress !== 1) ? 1 : 0
            gsap.to( this.animationControlls, {
                progress: targetProgress,
                duration: 0.8,
                onUpdate: () => {
                    this.backgroundMaterial.uniforms.u_progress.value = this.animationControlls.progress
                }
            })
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