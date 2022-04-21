import * as THREE from 'three';

import { OrbitControls } from './lib/OrbitControls.js';
import { OrbitControlsGizmo } from './lib/OrbitControlsGizmo.js';
import { TransformControls } from 'three-controls/TransformControls.js';

import { camerasTypes } from './Camera.js';
import { cameras, camMeshes } from './Camera.js';
import { dummies, dummiesMeshes } from './Dummy.js';

import { scene } from './projection-area.js'
import { initScene } from './projection-area.js';
import { addCamera } from './Camera.js';

import { doesCoverArea } from './projection-area.js';

let SCREEN_WIDTH = document.getElementById('viewport').offsetWidth;
let SCREEN_HEIGHT = document.getElementById('viewport').offsetHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

let container;
let renderer;

let activeCamera, perspCam, orthoCam;
let controls, controlsGizmo;

const frustumSize = 20;

export let transformControl;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const onUpPosition = new THREE.Vector2();
const onDownPosition = new THREE.Vector2();

init();
animate();

/* SCENE INITIALIZATION */

function init() {

    container = document.createElement( 'div' );
    let viewport = document.getElementById('viewport');
    viewport.insertBefore(container, viewport.firstChild);

    initScene();
    createSceneFromURL();

    /*
    //CHANGE HEIGHT DETECTED
        heightDetected = value;
    //MOVE WALL X
        wallXDepth = value;
        wallX.position.x = wallXDepth - 0.01;
    
    //MOVE WALL Z
        wallZDepth = value;
        wallZ.position.z = wallZDepth - 0.01;
    */
   
    // Renderer
    renderer = new THREE.WebGLRenderer( { logarithmicDepthBuffer: true, antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    container.appendChild( renderer.domElement );

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.autoClear = false;


    // Creation of user's camera
    perspCam = new THREE.PerspectiveCamera( 70, aspect, 1, 10000 );
    perspCam.position.set(6,6,6); //height and retreat

    orthoCam = new THREE.OrthographicCamera( -frustumSize, frustumSize, frustumSize / aspect, -frustumSize / aspect, 1, 10000);
    orthoCam.position.set(0,0,10);

    activeCamera = perspCam;

    // Controls
    controls = new OrbitControls( activeCamera, renderer.domElement );
    controls.damping = 0.2;
    // Add the Orbit Controls Gizmo
    controlsGizmo = new  OrbitControlsGizmo(controls, { size:  100, padding:  8, fontColor: "#ffffff" });
    // Add the Gizmo domElement to the dom 
    viewport.appendChild(controlsGizmo.domElement);
    //controls.enableRotate = false;
    controls.addEventListener( 'change', render );

    transformControl = new TransformControls( activeCamera, renderer.domElement );
    transformControl.addEventListener( 'change', render );
    transformControl.addEventListener( 'dragging-changed', function ( event ) {
        controls.enabled = ! event.value;

    } );
    scene.add( transformControl );

    transformControl.addEventListener( 'objectChange', function (obj) {
        renderer.domElement.removeEventListener( 'pointermove', onDrag);

        cameras.forEach(c => c.updatePosition());
        dummies.forEach(d => d.updatePosition());

    } );

    renderer.domElement.addEventListener( 'pointerdown', onPointerDown );
    renderer.domElement.addEventListener( 'pointerup', onPointerUp );
    renderer.domElement.addEventListener( 'pointermove', onPointerMove );
    
    window.addEventListener( 'resize', onWindowResize );

    //DEBUG
    document.addEventListener( 'keydown', onKeyDown );
}

/* USER'S ACTIONS */

function onPointerDown( event ) {
    onDownPosition.x = event.clientX;
    onDownPosition.y = event.clientY;

    if(event.button === 0) controls.domElement.addEventListener( 'pointermove', onDrag);
    renderer.domElement.removeEventListener( 'pointermove', onPointerMove);
}

function onDrag()
{
    if(activeCamera.isOrthographicCamera)
    {
        //const camPos = activeCamera.position;
        const camPos = new THREE.Vector3(6,6,6);
        changeCamera();
        placeCamera(camPos);
    }
}

function onPointerUp() {
    onUpPosition.x = event.clientX;
    onUpPosition.y = event.clientY;

    if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) transformControl.detach();

    renderer.domElement.removeEventListener( 'pointermove', onDrag);
    renderer.domElement.addEventListener( 'pointermove', onPointerMove);
}


function onPointerMove( event ) {

    pointer.x = (event.clientX / document.getElementById('viewport').offsetWidth) * 2 - 1;
    pointer.y = - ((event.clientY - document.getElementById('header').offsetHeight) / document.getElementById('viewport').offsetHeight) * 2 + 1;
    raycaster.setFromCamera( pointer, activeCamera );

    const meshes = camMeshes.concat(dummiesMeshes);

    const intersects = raycaster.intersectObjects( meshes, false );

    if(intersects.length > 0) {
        const object = intersects[ 0 ].object;
        if (object !== transformControl.object) {
            transformControl.attach( object );
            if(activeCamera.isOrthographicCamera)
            {
                let dir = new THREE.Vector3();
                activeCamera.getWorldDirection(dir);
                transformControl.showX = 1 - Math.abs(dir.dot(new THREE.Vector3(1, 0, 0))) < 0.001 ? false : true
                transformControl.showZ = 1 - Math.abs(dir.dot(new THREE.Vector3(0, 0, 1))) < 0.001 ? false : true
                transformControl.showY = (1 - Math.abs(dir.dot(new THREE.Vector3(0, 1, 0))) < 0.001) || object.name === 'Dummy' ? false : true
            }
            else
            {
                transformControl.showX = true;
                transformControl.showZ = true;
                transformControl.showY = object.name === 'Dummy' ? false : true
            }
        }
    }
}

function onWindowResize() {

    SCREEN_WIDTH = document.getElementById('viewport').offsetWidth;;
    SCREEN_HEIGHT = document.getElementById('viewport').offsetHeight;
    aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

    perspCam.aspect = aspect;
    perspCam.updateProjectionMatrix();

    orthoCam.left = - frustumSize/ 2.0;
    orthoCam.right = frustumSize / 2.0;
    orthoCam.top = frustumSize / (2.0 * aspect);
    orthoCam.bottom = - frustumSize / (2.0 * aspect);
    orthoCam.updateProjectionMatrix();
}

/* Change vue from perspective to orthographic */
export function changeCamera()
{
    activeCamera = activeCamera.isOrthographicCamera ? perspCam : orthoCam;
    transformControl.camera = activeCamera;
}

export function placeCamera(newPos)
{
    transformControl.detach();

    activeCamera.position.set(newPos.x, newPos.y, newPos.z);

    controls.dispose();
    controls = new OrbitControls( activeCamera, renderer.domElement );
    controls.damping = 0.2;
    controls.object = activeCamera;
    controls.enableRotate = activeCamera.isOrthographicCamera ? false : true;

    // Add the Orbit Controls Gizmo
    controlsGizmo.dispose();
    controlsGizmo = new OrbitControlsGizmo(controls, { size:  100, padding:  8, fontColor: "#ffffff" });
    viewport.appendChild(controlsGizmo.domElement);

    activeCamera.isPerspectiveCamera ? activeCamera.lookAt(0,-1,0) : activeCamera.lookAt(0,0,0);
}

/* Manage URLs */
document.getElementById("generate-link").onclick = generateLink;
function generateLink()
{
    let url = document.location.href
    let index = url.indexOf('?')
    if(index !== -1) url = url.substring(0, index);
    if(url[url.length-1] != '/') url += '/';
    url += '?';
    cameras.forEach(c => {
        url += "id=";
        url += c.id;
        url += ",typeID=";
        url += c.type.id;
        url += ",x=";
        url += Math.round(c.XPos*100)/100.0;
        url += ",y=";
        url += Math.round(c.YPos*100)/100.0;
        url += ",z=";
        url += Math.round(c.ZPos*100)/100.0;
        url += ",p=";
        url += c.pitch;
        url += ",a=";
        url += c.yaw;
        url += ",r=";
        url += c.roll;
        url += '&';
    });
    url = url.slice(0, -1);

    return url;
}

function createSceneFromURL()
{
    let url = document.location.href
    let index = url.indexOf('?')
    if(index === -1)
    {
        addCamera();
    }
    else
    {
        url = url.substring(index + 1);
        let cams = url.split('&');
        
        cams.forEach(c => {
            let props = c.split(',');
            let id, typeID;
            let x, y, z, p, a, r;
            props.forEach(prop => {
                let keyVal = prop.split('=');
                let key = keyVal[0];
                let val = parseFloat(keyVal[1]);
                switch(key)
                {
                    case "id":
                        id = val
                        break;
                    case "typeID":
                        typeID = val;
                        break;
                    case "x":
                        x = val;
                        break;
                    case "y":
                        y = val;
                        break;
                    case "z":
                        z = val;
                        break;
                    case "p":
                        p = val;
                        break;
                    case "a":
                        a = val;
                        break;
                    case "r":
                        r = val;
                        break;
                    default:
                        break;
                }
            });
            addCamera(true, typeID, x, y, z, p, a, r)
        })
    }
}

// COPY URL 
var copyUrlModal = document.getElementById("link-modal");
var shareButton = document.getElementById("generate-link");
var closeElem = document.getElementById("close-link");
shareButton.onclick = function() {
    copyUrlModal.style.display = "block";
}
closeElem.onclick = function() {
    copyUrlModal.style.display = "none";
}
window.onclick = function(event) {
    if (event.target == copyUrlModal) {
        copyUrlModal.style.display = "none";
    }
}

document.getElementById('copy-link').onclick = copyLink;
function copyLink() {
    navigator.clipboard.writeText(generateLink());
}

/* COMPLETE SCENE FORM WITH CAMERAS TYPES */
document.getElementById("hook-cam").onchange = createCamTypeForm;
document.getElementById("tracking-mode").onchange = createCamTypeForm;
createCamTypeForm()
function createCamTypeForm(){
    const camTypesForm = document.getElementById("cam-types-checkboxes");
    while (camTypesForm.firstChild) {
        camTypesForm.removeChild(camTypesForm.firstChild);
    }
    let title = document.createElement('h1');
    title.innerHTML = "Choose the type.s of camera.s you want to use";
    camTypesForm.appendChild(title);
    camerasTypes.filter(c => c.recommanded).forEach(c => {
        const hookHeight = parseFloat(document.getElementById("hook-cam").value);
        if(hookHeight < c.rangeFar && c.suitable.includes(document.getElementById("tracking-mode").value))
        {
            const camTypeChoice = document.createElement("div");
            const camTypeCheckbox = document.createElement("input");
            camTypeCheckbox.setAttribute("type", "checkbox");
            camTypeCheckbox.setAttribute("checked","true");
            camTypeCheckbox.id = "check-" + c.id;
            const label = document.createElement("label");
            label.setAttribute("for", "check-" + c.id)
            label.innerHTML = c.name;
            camTypeChoice.appendChild(camTypeCheckbox);
            camTypeChoice.appendChild(label);
            camTypesForm.appendChild(camTypeChoice);
        }
    });
}


/* DEBUG */
function onKeyDown( event ) {

    switch ( event.keyCode ) {

        case 80: /*P*/
            break;

    }
}

/* RENDER */
function animate() {

    requestAnimationFrame( animate );

    render();

}


function render() {
    cameras.forEach(c => c.render());
    //cameras.forEach(c => c.displayOverlaps());
    doesCoverArea();

    renderer.clear();

    renderer.setViewport( 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT );
    renderer.render( scene, activeCamera )
}



