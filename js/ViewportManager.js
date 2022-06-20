import {
    WebGLRenderer,
    PerspectiveCamera,
    OrthographicCamera,
    Vector3
} from 'three';

import {
    PCFSoftShadowMap,
    sRGBEncoding
} from 'three';

import { OrbitControls } from '/js/lib/OrbitControls.js';
import { OrbitControlsGizmo } from '/js/lib/OrbitControlsGizmo.js';
import { TransformControls } from '/js/lib/TransformControls.js';

import { SceneManager } from '/js/scene/SceneManager.js';


class ViewportManager{
    static DEFAULT_CAM_POSITION = new Vector3(12,8,12);
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
        let controlsGizmo = buildGuizmo(orbitControls, this);
        this.sceneManager = new SceneManager(buildTransformControl(this));


    /* BUILDERS */

        function buildRenderer()
        {
            const containerElement = document.createElement( 'div' );
            viewportElement.insertBefore(containerElement, viewportElement.firstChild);

            const renderer = new WebGLRenderer( { logarithmicDepthBuffer: true, antialias: true } );
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( viewportWidth, viewportHeight );
            containerElement.appendChild( renderer.domElement );
        
            renderer.shadowMap.enabled = true;
        
            renderer.shadowMap.type = PCFSoftShadowMap;
            renderer.outputEncoding = sRGBEncoding;
        
            renderer.autoClear = false;

            return renderer;
        }


        /* USER'S CAMERAS */
        function buildPerspCamera()
        {
            const perspectiveCamera = new PerspectiveCamera( 70, aspect, 0.2, 10000 );
            perspectiveCamera.position.copy(ViewportManager.DEFAULT_CAM_POSITION);
            return perspectiveCamera;
        }
    
        function buildOrthoCamera(frustumSize, aspect)
        {
            const orthographicCamera = new OrthographicCamera( -frustumSize, frustumSize, frustumSize / aspect, -frustumSize / aspect, 0.2, 10000);
            orthographicCamera.position.set(0,0,10);
            return orthographicCamera;
        }
    

        /* CONTROLS */
        function buildOrbitControls(viewportManager)
        {
            const controls = new OrbitControls( viewportManager.activeCamera, renderer.domElement );
            controls.damping = 0.2;
            controls.enableRotate = viewportManager.activeCamera.isOrthographicCamera ? false : true;

            controls.addEventListener( 'change',() => viewportManager.render());

            return controls;
        }

        function buildGuizmo(controls, viewportManager)
        {
            const gizmo = new OrbitControlsGizmo(controls, { size:  100, padding:  8, fontColor: "#ffffff", colors: { x: ['#bf4747', '#662626'], y: ['#708eb0', '#405063'], z: ['#37a48a', '#1c5446'] } }, viewportManager);
            viewportElement.appendChild(gizmo.domElement);

            return gizmo;
        }

        /**
         * Change the postion of the camera and allow to switch from perspective to orthogaphic.
         * 
         * @param {Vector3} newPos 
         * @param {boolean} changeCameraType 
         */
        this.setupCameraChangement = function (newPos = ViewportManager.DEFAULT_CAM_POSITION, changeCameraType = true)
        {
            if(changeCameraType)
            {
                /* Change vue between perspective and orthographic */
                this.activeCamera = this.activeCamera.isOrthographicCamera ? perspCam : orthoCam;
                this.sceneManager.objects.transformControl.camera = this.activeCamera;
            }
            this.sceneManager.objects.transformControl.detach();

            this.activeCamera.position.set(newPos.x, newPos.y, newPos.z);

            orbitControls.dispose();
            orbitControls = buildOrbitControls(this);

            controlsGizmo.dispose();
            controlsGizmo = buildGuizmo(orbitControls, this)
        }

        /* ALLOW TO TRANSFORM SCENE SUBJECTS IN THE VIEWPORT */
        function buildTransformControl(viewportManager)
        {
            const transformControl = new TransformControls(viewportManager.activeCamera, renderer.domElement );
            transformControl.addEventListener('change', () => viewportManager.render());
            transformControl.addEventListener('dragging-changed', function (event) {
                orbitControls.enabled = ! event.value;
            });

            return transformControl;
        }


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