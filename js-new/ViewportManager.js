import * as THREE from 'three';

import { OrbitControls } from './lib/OrbitControls.js';
import { OrbitControlsGizmo } from './lib/OrbitControlsGizmo.js';
import { TransformControls } from 'three-controls/TransformControls.js';

import { SceneManager } from './SceneManager.js';


class ViewportManager{
    constructor(viewportElement)
    {
        let viewportWidth = viewportElement.offsetWidth;
        let viewportHeight = viewportElement.offsetHeight;
        
        const renderer = buildRenderer();

        this.element = renderer.domElement;

        let aspect = viewportWidth / viewportHeight;
        const perspCam = buildPerspCamera(aspect);
        const frustumSize = 20;
        const orthoCam = buildOrthoCamera(frustumSize, aspect);

        this.activeCamera = perspCam;

        let orbitControls = buildOrbitControls(this);
        let controlsGizmo = buildGuizmo(orbitControls);
        this.sceneManager = new SceneManager(buildTransformControl(this));


        function buildRenderer()
        {
            const containerElement = document.createElement( 'div' );
            viewportElement.insertBefore(containerElement, viewportElement.firstChild);

            const renderer = new THREE.WebGLRenderer( { logarithmicDepthBuffer: true, antialias: true } );
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( viewportWidth, viewportHeight );
            containerElement.appendChild( renderer.domElement );
        
            renderer.shadowMap.enabled = true;
        
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.outputEncoding = THREE.sRGBEncoding;
        
            renderer.autoClear = false;

            return renderer;
        }


        /* CREATION OF USER'S CAMERAS */
        function buildPerspCamera()
        {
            const perspectiveCamera = new THREE.PerspectiveCamera( 70, aspect, 0.2, 10000 );
            perspectiveCamera.position.set(6,6,6); //height and retreat
            return perspectiveCamera;
        }
    
        function buildOrthoCamera(frustumSize, aspect)
        {
            const orthographicCamera = new THREE.OrthographicCamera( -frustumSize, frustumSize, frustumSize / aspect, -frustumSize / aspect, 0.2, 10000);
            orthographicCamera.position.set(0,0,10);
            return orthographicCamera;
        }
    

        /* USER'S CONTROLS */
        function buildOrbitControls(viewportManager)
        {
            const controls = new OrbitControls( viewportManager.activeCamera, renderer.domElement );
            controls.damping = 0.2;
            controls.enableRotate = viewportManager.activeCamera.isOrthographicCamera ? false : true;

            controls.addEventListener( 'change',() => viewportManager.render());

            return controls;
        }

        function buildGuizmo(controls)
        {
            const gizmo = new OrbitControlsGizmo(controls, { size:  100, padding:  8, fontColor: "#ffffff" });
            viewportElement.appendChild(gizmo.domElement);

            return gizmo;
        }

        /**
         * Change the postion of the camera and allow to switch from perspective to orthogaphic.
         * 
         * @param {THREE.Vector3} newPos 
         * @param {boolean} changeCameraType 
         */
        this.setupCameraChangement = function (newPos, changeCameraType = true)
        {
            if(changeCameraType)
            {
                /* Change vue between perspective and orthographic */
                this.activeCamera = this.activeCamera.isOrthographicCamera ? perspCam : orthoCam;
                this.sceneManager.transformControl.camera = this.activeCamera;
            }
            this.sceneManager.transformControl.detach();

            this.activeCamera.position.set(newPos.x, newPos.y, newPos.z);

            orbitControls.dispose();
            orbitControls = buildOrbitControls(this);

            controlsGizmo.dispose();
            controlsGizmo = buildGuizmo(orbitControls)
        }

        function buildTransformControl(viewportManager)
        {
            const transformControl = new TransformControls(viewportManager.activeCamera, renderer.domElement );
            transformControl.addEventListener('change', () => viewportManager.render());
            transformControl.addEventListener('dragging-changed', function (event) {
                orbitControls.enabled = ! event.value;
            });

            return transformControl;
        }

        this.isTransformControlObject = (object) => sceneManager.transformControl.object === object;
        this.detachTransformControl = () => sceneManager.transformControl.detach();


        /* USER'S ACTIONS */

        this.onWindowResize = function() {

            viewportWidth = viewportElement.offsetWidth;
            viewportHeight = viewportElement.offsetHeight;
            aspect = viewportWidth / viewportHeight;
        
            renderer.setSize( viewportWidth, viewportHeight );
        
            perspCam.aspect = aspect;
            perspCam.updateProjectionMatrix();
        
            orthoCam.left = - frustumSize/ 2.0;
            orthoCam.right = frustumSize / 2.0;
            orthoCam.top = frustumSize / (2.0 * aspect);
            orthoCam.bottom = - frustumSize / (2.0 * aspect);
            orthoCam.updateProjectionMatrix();
        }


        /* RENDER */
        this.render = function()
        {
            this.sceneManager.update(renderer);

            renderer.clear();
            renderer.setViewport( 0, 0, viewportWidth, viewportHeight );
            renderer.render( this.sceneManager.scene, this.activeCamera )
        }
    }
}

export { ViewportManager }