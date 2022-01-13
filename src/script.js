import './style.css'
import * as dat from 'dat.gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import TweenMax from 'gsap/src/'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')


/**
 * main
 */
class app {
    constructor() {
        // Debug
        this.debugObject = {}
        this.gui = new dat.GUI({
            width: 400
        })

        // Scene
        this.scene = new THREE.Scene()

        // raycaster
        this.raycaster = new THREE.Raycaster()

        // Sizes
        this.sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }
        this.mouse = new THREE.Vector2()
        this.params = {
            v: 0,
            lastCall: 100,
            mouseMove: false
        }
        
        // temp object
        this.intersected = null
        this.gridSize = {}

        // timer
        this.clock = new THREE.Clock()

        // Init scene
        this.cameraInit()
        this.rendererInit()
        this.controlsInit()
        this.lightInit()
        this.mouseMove()

        this.createGeometry()

        this.tick()
    }
    
    
    /**
     * Camera
     */
    cameraInit() {
        // Base camera
        this.camera = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 100)
        this.camera.position.z = 6


        this.scene.add(this.camera)
    }


    /**
     * Light
     */
     lightInit() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5) 

        this.scene.add( ambientLight, directionalLight )
     }
    
    /**
     * Resize
     */
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
    
    
    /**
     * Control
     */
    controlsInit() {
        // Controls
        this.controls = new OrbitControls(this.camera, canvas)
        this.controls.enableDamping = true
    }
    
    
    /**
     * Renderer
     */
    rendererInit() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        })
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.outputEncoding = THREE.sRGBEncoding
        this.renderer.shadowMap.enabled = true
        
        this.debugObject.clearColor = '#020202'
        this.renderer.setClearColor( this.debugObject.clearColor )
    }


    /**
     * Geometry
     */
    createGeometry() {
        // geomerty parameters
        const s = 0.3
        const count = { x: 10, y: 10 }

        this.group = new THREE.Group()
        const geometry = [
            new THREE.TorusBufferGeometry(s /2, s * 0.3, 30, 30),
            new THREE.BoxBufferGeometry(s,s,s),
            new THREE.CylinderBufferGeometry(s / 1.5, s / 1.5, s * 0.3, 20),
            new THREE.ConeBufferGeometry(s / 1.5, s, 20),
        ]
        // const geometry = new THREE.BoxBufferGeometry(s, s, s)
        const material = new THREE.MeshStandardMaterial({color: 0xff0000, metalness: 0.3, roughness: 0.2})
        const step = (s + s * 0.2)
        
        this.gridSize = new THREE.Vector2(
            step * count.x,
            step * count.y
        )

        for ( let i = 0; i < count.x; i++ )
        for ( let j = 0; j < count.y; j++ ) {
            const randomID = Math.round(Math.random() * (geometry.length - 1))
            const geo = geometry[randomID].clone()
            const mat = material.clone()
            const mesh = new THREE.Mesh(geo, mat)

            // rotate
            if (2 === randomID) {
                // cylinder geometry 
                geo.rotateX(Math.PI * 0.5)
            }
            if (3 === randomID) {
                // cone geometry 
                geo.rotateX(Math.PI * 0.5)
            }

            mesh.position.set(
                (i * step) - step * count.x / 2,
                (j * step) - step * count.y / 2,
                0,
            )  

            mesh.scale.set(0.7, 0.7, 0.7)

            mesh.initialRotation = {
                x: mesh.rotation.x,
                y: mesh.rotation.y,
                z: mesh.rotation.z,
            }

            this.group.add( mesh )
        }

        // empty
        this.emptyMesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(step * count.x, step * count.y),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        )
        this.emptyMesh.position.set(-(s + s * 0.2) / 2, -(s + s * 0.2) / 2, 0)

        // add geometry to scene
        this.scene.add(this.group)
        // this.scene.add(this.emptyMesh)
        // this.scene.add(this.group, this.emptyMesh)
    }

    /**
     * Mouse move
     */
    mouseMove() {
        document.addEventListener('mousemove', (e) => {

            this.params.mouseMove = true
            this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1
            this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1
        })
    }
    distance (x1, y1, x2, y2) {
        return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2))
    }
    map (value, start1, stop1, start2, stop2) {
        return (value - start1) / (stop1 - start1) * (stop2 - start2) + start2
    }
    throttle(f, t) {
        const that = this
        if( that.clock.getElapsedTime() ) {
            return function () {
                let previousCall = that.params.lastCall
                that.params.lastCall = that.clock.getElapsedTime()
                if (previousCall === undefined || (that.params.lastCall - previousCall) > t) {
                    f()
                }
            }
        }
    }
    raycasterAnimation() {
        if ( this.params.mouseMove ) {
            const ray = this.raycaster
            ray.setFromCamera(this.mouse, this.camera)
            const intersect = ray.intersectObjects( [this.emptyMesh] )
            
            if (intersect.length) {
                const {x, y} = intersect[0].point
                this.group.children.map((el, i) => {
                    const range = this.distance(x, y, el.position.x + 0, el.position.y + 0)
                    // based on the distance we map the value to our min max Z position
                    // it works similar to a radius range
                    const maxPositionY = 4
                    const minPositionY = 0
                    const startDistance = 2
                    const endDistance = -2

                    let z = this.map(range, startDistance, endDistance, minPositionY, maxPositionY)
                    z = z < 1 ? 0 : (z - 1) * 2

                    const tl = gsap.timeline({
                        defaults: {
                            // ease: 'back.out(2.)',
                            // ease: 'elastic.out(1., 0.5)',
                            ease: 'power3.out',
                            duration: 0.8
                        }
                    })
                    // move objects to camera
                    tl.to(el.position, {
                        z: z,
                        duration: 0.1
                    }, 0)
    
    
                    const z_scale = el.position.z
                    // randomly rotate objects
                    tl.to(el.rotation, {
                        x: this.map(z_scale, -1, 0, (45 * Math.PI) / 180, el.initialRotation.x),
                        y: this.map(z_scale, -1, 0, (-90 * Math.PI) / 180, el.initialRotation.y),
                        z: this.map(z_scale, -1, 0, (90 * Math.PI) / 180, el.initialRotation.z)
                    }, 0)
                    
                    // create a scale factor based on the mesh.position.y
                    const scaleFactor = z_scale / 1.2
                    // clamp scale
                    const scale = scaleFactor < 1 ? 0.7 : scaleFactor
                    
                    // scale objects
                    tl.to(el.scale, {
                        x: scale,
                        y: scale,
                        z: scale,
                    }, 0)
                })
            }

            this.params.mouseMove = false
        }
    }
    
    /**
     * Animate
     */
    tick() {
        const elapsedTime = this.clock.getElapsedTime()
        // Update controls
        this.controls.update()
    
        // Render
        this.renderer.render(this.scene, this.camera)

        // throttle
        // animate scroll
        let animate = () => this.raycasterAnimation()
        let throttled = this.throttle(animate, 0.014)
        throttled()
    
        // Call tick again on the next frame
        window.requestAnimationFrame(this.tick.bind(this))
    }
}
(function () {
    new app()
})()