import {
    WebGLRenderer,
    PerspectiveCamera,
    OrthographicCamera,
    Vector2,
    Vector3,
    Raycaster
} from 'three';

import {
    PCFSoftShadowMap,
    sRGBEncoding
} from 'three';

import { OrbitControls } from './lib/OrbitControls.js';
import { OrbitControlsGizmo } from './lib/OrbitControlsGizmo.js';
import { TransformControls } from './lib/TransformControls.js';

import { SceneManager } from './scene/SceneManager.js';


class ViewportManager{
    static DEFAULT_CAM_POSITION = new Vector3(12,8,12);
    constructor(viewportElement)
    {
        const scope = this;

        let viewportWidth = viewportElement.offsetWidth;
        let viewportHeight = viewportElement.offsetHeight;
        
        const renderer = buildRenderer();

        this.element = renderer.domElement;

        let aspect = viewportWidth / viewportHeight;
        const perspCam = buildPerspCamera(aspect);
        const frustumSize = 20;
        const orthoCam = buildOrthoCamera(frustumSize, aspect);

        this.activeCamera = perspCam;

        let orbitControls = buildOrbitControls();
        let controlsGizmo = buildGuizmo(orbitControls);
        this.sceneManager = new SceneManager(buildTransformControl());

    /* HANDLE VIEWPORT EVENTS */

        this.bindEventListeners = function()
        {
            this.element.addEventListener( 'pointerdown', onPointerDown);
            this.element.addEventListener( 'pointerup', onPointerUp);
            this.element.addEventListener( 'pointermove', onPointerMove);
        
            this.sceneManager.objects.transformControl.addEventListener( 'objectChange', function () {
                scope.element.removeEventListener( 'pointermove', onDrag);
                scope.sceneManager.objects.updateObjectsPosition();
            });

            //DEBUG
            document.addEventListener( 'keydown', onKeyDown);
            //END DEBUG
        }

        /* MOUSE CONTROLS */
        const onDownPosition = new Vector2();
        const onUpPosition = new Vector2();

        function onPointerDown(event) {
            onDownPosition.x = event.clientX;
            onDownPosition.y = event.clientY;

            if(event.button === 0) scope.element.addEventListener( 'pointermove', onDrag);
            scope.element.removeEventListener( 'pointermove', onPointerMove);
        }

        function onDrag()
        {
            if(scope.activeCamera.isOrthographicCamera) scope.setupCameraChangement();
        }

        function onPointerUp(event) {
            onUpPosition.x = event.clientX;
            onUpPosition.y = event.clientY;

            if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) scope.sceneManager.objects.transformControl.detach();

            scope.element.removeEventListener( 'pointermove', onDrag);
            scope.element.addEventListener( 'pointermove', onPointerMove);
        }

        function onPointerMove(event)
        {
            const pointer = new Vector2(
                (event.clientX / viewportElement.offsetWidth) * 2 - 1,
                - ((event.clientY - document.getElementById('header').offsetHeight) / viewportElement.offsetHeight) * 2 + 1
            );
            
            const raycaster = new Raycaster()
            raycaster.setFromCamera( pointer, scope.activeCamera );
            
            const meshes = scope.sceneManager.objects.nodeMeshes.concat(scope.sceneManager.objects.dummiesMeshes).concat(scope.sceneManager.objects.lidarsMeshes);

            const intersect = raycaster.intersectObjects( meshes, false );

            if(intersect.length > 0) {
                const object = intersect[0].object;
                if (object !== scope.sceneManager.objects.transformControl.object)
                {
                    scope.sceneManager.objects.transformControl.attach(object);
                    if(scope.activeCamera.isOrthographicCamera)
                    {
                        let dir = new Vector3();
                        scope.activeCamera.getWorldDirection(dir);
                        scope.sceneManager.objects.transformControl.showX = 1 - Math.abs(dir.dot(new Vector3(1, 0, 0))) < 0.001 ? false : true;
                        scope.sceneManager.objects.transformControl.showZ = (1 - Math.abs(dir.dot(new Vector3(0, 0, 1))) < 0.001) || object.name === 'Lidar' ? false : true;
                        scope.sceneManager.objects.transformControl.showY = (1 - Math.abs(dir.dot(new Vector3(0, 1, 0))) < 0.001) || object.name === 'Dummy' ? false : true;
                    }
                    else
                    {
                        scope.sceneManager.objects.transformControl.showX = true;
                        scope.sceneManager.objects.transformControl.showZ = object.name === 'Lidar' ? false : true;
                        scope.sceneManager.objects.transformControl.showY = object.name === 'Dummy' ? false : true;
                    }
                }
            }
        }

        /* DEBUG */
        function onKeyDown(event) {

            switch ( event.keyCode ) {

                case 80: /*P*/
                    scope.sceneManager.debug();
                    break;

            }
        }

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
        function buildOrbitControls()
        {
            const controls = new OrbitControls( scope.activeCamera, renderer.domElement );
            controls.damping = 0.2;
            controls.enableRotate = scope.activeCamera.isOrthographicCamera ? false : true;

            controls.addEventListener( 'change',() => scope.render());

            return controls;
        }

        function buildGuizmo(controls)
        {
            const gizmo = new OrbitControlsGizmo(controls, { size:  100, padding:  8, fontColor: "#ffffff", colors: { x: ['#bf4747', '#662626'], y: ['#708eb0', '#405063'], z: ['#37a48a', '#1c5446'] } }, scope);
            viewportElement.appendChild(gizmo.domElement);

            return gizmo;
        }

        /**
         * Change the position of the active camera
         * 
         * @param {Vector3} newPos 
         */
        this.placeCamera = function(newPos = ViewportManager.DEFAULT_CAM_POSITION)
        {
            const pos = this.activeCamera.isPerspectiveCamera ? newPos.clone().add(new Vector3(this.sceneManager.sceneWidth, 0, this.sceneManager.sceneHeight)) : newPos;
            this.activeCamera.position.set(pos.x, pos.y, pos.z);
            this.activeCamera.lookAt(0,0,0);
        }

        /**
         * Change the postion of the camera and allow to switch from perspective to orthogaphic.
         * 
         * @param {Vector3} newPos 
         * @param {boolean} changeCameraType 
         */
        this.setupCameraChangement = function (changeCameraType = true, newPos = ViewportManager.DEFAULT_CAM_POSITION)
        {
            if(changeCameraType)
            {
                /* Change vue between perspective and orthographic */
                this.activeCamera = this.activeCamera.isOrthographicCamera ? perspCam : orthoCam;
                this.sceneManager.objects.transformControl.camera = this.activeCamera;
            }
            this.sceneManager.objects.transformControl.detach();

            //this.activeCamera.position.set(newPos.x, newPos.y, newPos.z);
            this.placeCamera(newPos);

            orbitControls.dispose();
            orbitControls = buildOrbitControls(this);

            controlsGizmo.dispose();
            controlsGizmo = buildGuizmo(orbitControls, this)
        }

        /* ALLOW TO TRANSFORM SCENE SUBJECTS IN THE VIEWPORT */
        function buildTransformControl()
        {
            const transformControl = new TransformControls(scope.activeCamera, renderer.domElement );
            transformControl.addEventListener('change', () => scope.render());
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