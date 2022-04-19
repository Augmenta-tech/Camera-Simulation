import * as THREE from 'three';

import { OrbitControls } from 'three-controls/OrbitControls.js';
import { TransformControls } from 'three-controls/TransformControls.js';

import { camerasTypes } from './Camera.js';
import { cameras, camMeshes } from './Camera.js';
import { dummies, dummiesMeshes } from './Dummy.js';

import { scene } from './projection-area.js'
import { initScene } from './projection-area.js';
import { addCamera } from './Camera.js';

import { doesCoverArea } from './projection-area.js';

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

let container;
let renderer;

let camera;

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
    camera = new THREE.PerspectiveCamera( 70, aspect, 1, 10000 );
    camera.position.set(6,6,6); //height and retreat

    // Controls
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.damping = 0.2;
    controls.addEventListener( 'change', render );

    transformControl = new TransformControls( camera, renderer.domElement );
    transformControl.addEventListener( 'change', render );
    transformControl.addEventListener( 'dragging-changed', function ( event ) {

        controls.enabled = ! event.value;

    } );
    scene.add( transformControl );

    transformControl.addEventListener( 'objectChange', function (obj) {

        cameras.forEach(c => c.updatePosition());
        dummies.forEach(d => d.updatePosition());

    } );

    document.addEventListener( 'pointerdown', onPointerDown );
    document.addEventListener( 'pointerup', onPointerUp );
    document.addEventListener( 'pointermove', onPointerMove );
    
    window.addEventListener( 'resize', onWindowResize );

    //DEBUG
    document.addEventListener( 'keydown', onKeyDown );
}

/* USER'S ACTIONS */

function onPointerDown( event ) {
    onDownPosition.x = event.clientX;
    onDownPosition.y = event.clientY;

}

function onPointerUp() {
    onUpPosition.x = event.clientX;
    onUpPosition.y = event.clientY;

    if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) transformControl.detach();
}

function onPointerMove( event ) {

    pointer.x = (event.clientX / document.getElementById('viewport').offsetWidth) * 2 - 1;
    pointer.y = - ((event.clientY - document.getElementById('header').offsetHeight) / document.getElementById('viewport').offsetHeight) * 2 + 1;
    
    raycaster.setFromCamera( pointer, camera );

    const meshes = camMeshes.concat(dummiesMeshes);

    const intersects = raycaster.intersectObjects( meshes, false );

    if(intersects.length > 0) {
        const object = intersects[ 0 ].object;
        if (object !== transformControl.object) {
            transformControl.attach( object );
            if(object.name === 'Dummy') transformControl.showY = false;
            if(object.name === 'Camera') transformControl.showY = true;
        }
    }
}

function onWindowResize() {

    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

    camera.aspect = aspect;
    camera.updateProjectionMatrix();
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
            addCamera(typeID, x, y, z, p, a, r)
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

/* COMPLETE SCENE FORM WITH CAMRAS TYPES */
const camTypesForm = document.getElementById("cam-types-checkboxes");
camerasTypes.forEach(c => {
    const camTypeChoice = document.createElement("div");
    const camTypeCheckbox = document.createElement("input");
    camTypeCheckbox.setAttribute("type", "checkbox");
    camTypeCheckbox.id = "check-" + c.id;
    const label = document.createElement("label");
    label.setAttribute("for", "check-" + c.id)
    label.innerHTML = c.name;
    camTypeChoice.appendChild(camTypeCheckbox);
    camTypeChoice.appendChild(label);
    camTypesForm.appendChild(camTypeChoice);
});


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
    renderer.render( scene, camera )
}



