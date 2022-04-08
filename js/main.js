
import * as THREE from 'three';

import Stats from 'three-libs/stats.module.js';

import { GUI } from 'three-libs/lil-gui.module.min.js';

import { MTLLoader } from 'three-loaders/MTLLoader.js';
import { OBJLoader } from 'three-loaders/OBJLoader.js';

import { FontLoader } from 'three-loaders/FontLoader.js';
import { TextGeometry } from 'three-text-geometry';

import { OrbitControls } from 'three-controls/OrbitControls.js';
import { TransformControls } from 'three-controls/TransformControls.js';
import { Color, MeshStandardMaterial, Vector3 } from 'three';



let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

let container, stats;
let scene = new THREE.Scene();
let renderer;

let camera;

let transformControl;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const onUpPosition = new THREE.Vector2();
const onDownPosition = new THREE.Vector2();

let camMeshes = [];

const camerasTypes = {
    OrbbecAstraPlus: {HFov:55, VFov:45, aspectRatio: 1920.0/1080.0, rangeNear: 0.6,rangeFar: 8},
    OrbbecAstraPro: {HFov:60, VFov:49.5, aspectRatio: 1920.0/1080.0, rangeNear: 0.6,rangeFar: 8}
}

const DEFAULT_CAMERA_TYPE = camerasTypes.OrbbecAstraPlus

const DEFAULT_CAMERA_HEIGHT = 7
const DEFAULT_CAMERA_PITCH = - Math.PI / 2.0;

let font;
const fontLoader = new FontLoader();
const SIZE_TEXT_CAMERA = 0.4

class Camera{
    constructor(id, scene)
    {
        this.id = id;
        this.type = DEFAULT_CAMERA_TYPE;
        this.XPos = 0;
        this.YPos = DEFAULT_CAMERA_HEIGHT;
        this.ZPos = 0;
        this.pitch = DEFAULT_CAMERA_PITCH;
        this.yaw = 0;
        this.roll = 0;

        this.xRotationAxis = new THREE.Vector3(1, 0, 0);

        this.cameraPerspective = new THREE.PerspectiveCamera( DEFAULT_CAMERA_TYPE.VFov, DEFAULT_CAMERA_TYPE.aspectRatio, DEFAULT_CAMERA_TYPE.rangeNear, DEFAULT_CAMERA_TYPE.rangeFar );
        this.cameraPerspectiveHelper = new THREE.CameraHelper( this.cameraPerspective );
    
        this.color = new THREE.Color(Math.random(), Math.random(), Math.random());
        const material = new THREE.MeshPhongMaterial( { color: this.color, dithering: true } );
        const geometry = new THREE.BoxGeometry( 0.2,0.2,0.2 );
        this.mesh = new THREE.Mesh( geometry, material );
        camMeshes.push(this.mesh);

        this.cameraPerspective.position.y = this.YPos;
        this.mesh.position.y = this.YPos;
        this.cameraPerspective.rotateX(this.pitch);
        
        this.areaCoveredFloor = new THREE.Mesh();
        this.areaCoveredWallX = new THREE.Mesh();
        this.areaCoveredWallZ = new THREE.Mesh();

        this.areaAppear = true;
        this.areaValue = 0;

        this.raysFloor = [];
        this.raysWallX = [];
        this.raysWallZ = [];

        this.overlaps = {}

        let textGeometry = new TextGeometry( "Cam " + (this.id+1), { font: font, size: SIZE_TEXT_CAMERA, height: 0.05 } );
        this.nameText = new THREE.Mesh(textGeometry, new THREE.MeshPhongMaterial( { color: 0xffffff } ))
        this.nameText.position.set(this.XPos - SIZE_TEXT_CAMERA * 2, this.YPos - (this.type.rangeFar - 1), this.ZPos + SIZE_TEXT_CAMERA/2.0);
        this.nameText.rotation.x = -Math.PI / 2.0;

        let areaDisplayGeometry = new TextGeometry( "AREA VALUE", { font: font, size: SIZE_TEXT_CAMERA * 2/3.0, height: 0.05 } );
        this.areaDisplay = new THREE.Mesh(areaDisplayGeometry, new THREE.MeshPhongMaterial( { color: 0xffffff } ))
        this.areaDisplay.position.set(this.XPos - SIZE_TEXT_CAMERA * 4/3.0, this.YPos - (this.type.rangeFar - 1), this.ZPos + 3*SIZE_TEXT_CAMERA/2.0);
        this.areaDisplay.rotation.x = -Math.PI / 2.0;

        this.areaOverlaps = {};
        for(let i = 0; i < this.id; i++)
        {
            let areaOverlapGeometry = new TextGeometry( "OVERLAP AREA", { font: font, size: SIZE_TEXT_CAMERA * 2/3.0, height: 0.05 } );
            let areaOverlap = new THREE.Mesh(areaOverlapGeometry, new THREE.MeshPhongMaterial( { color: 0xffffff } ))
            this.areaOverlaps[i] = areaOverlap;
            this.areaOverlaps[i].rotation.x = -Math.PI / 2.0;
            this.areaOverlaps[i].visible = false;
        }
    }

    addCameraToScene()
    {
        scene.add( this.cameraPerspective );
        scene.add( this.cameraPerspectiveHelper );
        scene.add( this.mesh );
        scene.add( this.nameText );
        scene.add( this.areaDisplay );
        for(let i = 0; i < this.id; i++)
        {
            scene.add(this.areaOverlaps[i]);
        }

        addCameraGUI(this);
    }

    displayOverlaps()
    {
        let overlapsDisplay = '';
        for(let j = 0; j < cameras.length; j++)
        {
            if(this.id != j)
            {
                let overlap = this.overlaps[j] ? Math.round(this.overlaps[j] * 100)/100.0 : 0;
                overlapsDisplay += '<p>Overlap with Camera ' + (j+1) + ': ' + overlap + 'm²</p>'; 
            }
        }
        document.getElementById('overlaps' + this.id).innerHTML = overlapsDisplay;
    }

    changeVisibility(display = !this.areaAppear)
    {
        let value = display;
        this.areaAppear = value;
        this.cameraPerspective.visible = value;
        this.cameraPerspectiveHelper.visible = value;
        this.nameText.visible = value;
        let iconElem = document.getElementById('cam-' + (this.id) + '-visible').firstChild;
        iconElem.dataset.icon = value ? "akar-icons:eye-open" : "akar-icons:eye-slashed";
        this.areaDisplay.visible = value;
        for(let i = 0; i < this.id; i++)
        {
            this.areaOverlaps[i].visible = value;
        }
    }

    render()
    {
        this.XPos = this.mesh.position.x;
        this.YPos = this.mesh.position.y;
        this.ZPos = this.mesh.position.z;
        this.cameraPerspective.position.set(this.XPos, this.YPos, this.ZPos);

        document.getElementById('x-pos-'+ this.id).getElementsByTagName('strong')[0].innerHTML = Math.round(this.XPos*10)/10.0;
        document.getElementById('y-pos-'+ this.id).getElementsByTagName('strong')[0].innerHTML = Math.round(- this.ZPos*10)/10.0;
        document.getElementById('z-pos-'+ this.id).getElementsByTagName('strong')[0].innerHTML = Math.round(this.YPos*10)/10.0;
        
        this.cameraPerspective.updateProjectionMatrix();
        this.cameraPerspectiveHelper.update();
        drawProjection(this);
    }

    remove()
    {
        scene.remove(this.cameraPerspectiveHelper);
        scene.remove(this.cameraPerspective);
        if ( transformControl.object === this.mesh ) transformControl.detach();
        scene.remove(this.mesh);
        scene.remove(this.areaCoveredFloor);
        scene.remove(this.areaCoveredWallX);
        scene.remove(this.areaCoveredWallZ);
        this.raysFloor = [];
        this.raysWallX = [];
        this.raysWallZ = [];
        scene.remove(this.nameText);
        scene.remove(this.areaDisplay);
        for(let i = 0; i < this.id; i++)
        {
            scene.remove(this.areaOverlaps[i]);
        }
    }
}

class Dummy {
    constructor(id)
    {
        this.id = id;

        this.xPos = 0;
        this.yPos = floorHeight;
        this.zPos = 0;

        this.model = new THREE.Object3D();
    }

    /*addDummyToScene()
    {
        loadDummy(this)
        addDummyGUI(this);
    }*/

    remove()
    {
        scene.remove(this.model);
    }
}

let cameras = [];
let dummies = [];

let camerasGUI = new GUI();
let camerasGUIdiv = document.getElementsByClassName("lil-gui")[0];
camerasGUIdiv.classList.add("cameras-gui");

let floor, wallX, wallZ;
const floorNormal = new THREE.Vector3(0,1,0);
const DEFAULT_FLOOR_HEIGHT = 0;
let floorHeight = DEFAULT_FLOOR_HEIGHT;
const wallXNormal = new THREE.Vector3(1,0,0);
const DEFAULT_WALLX_DEPTH = -10;
let wallXDepth = DEFAULT_WALLX_DEPTH;
const wallZNormal = new THREE.Vector3(0,0,1);
const DEFAULT_WALLZ_DEPTH = -10;
let wallZDepth = DEFAULT_WALLZ_DEPTH;

const camerasSettings = {
    //addCamera: addCamera,
    floorHeight: DEFAULT_FLOOR_HEIGHT,
    wallXDepth: DEFAULT_WALLX_DEPTH,
    wallZDepth: DEFAULT_WALLZ_DEPTH//,
    //resetAll: resetAll
}

//DEBUG

let spheres = [];
let rays = [];

//END DEBUG


init();
animate();

/* SCENE INITIALIZATION */

function init() {

    let container = document.createElement( 'div' );
    let viewport = document.getElementById('viewport');
    viewport.insertBefore(container, viewport.firstChild);

    // Lighting
    const ambient = new THREE.AmbientLight( 0xffffff, 0.5 );
    scene.add(ambient);

    // Floor
    let materialFloor = new THREE.MeshPhongMaterial( { color: 0x8DAA9D, dithering: true } ); // green-blue

    let geometryFloor = new THREE.PlaneGeometry( 2000, 2000 );

    floor = new THREE.Mesh(geometryFloor, materialFloor);
    floor.position.set( 0, DEFAULT_FLOOR_HEIGHT - 0.01, 0 ); //to avoid noise with area covered by cam (y = 0 for area covered)
    floor.rotation.x = - Math.PI / 2.0;
    scene.add(floor);

    // Grid
    const size = 50;
    const divisions = 50

    const gridHelper = new THREE.GridHelper( size, divisions, { color: 0x444444 }, { color: 0x444444 } );
    gridHelper.position.y = floorHeight - 0.005;
    scene.add( gridHelper );

    // WallX
    let materialWallX = new THREE.MeshPhongMaterial( { color: 0x522B47, dithering: true } ); // violet

    let geometryWallX = new THREE.PlaneGeometry( 2000, 2000 );

    wallX = new THREE.Mesh(geometryWallX, materialWallX);
    wallX.position.set( DEFAULT_WALLX_DEPTH - 0.01, 0, 0 ); //to avoid noise with area covered by cam (y = 0 for area covered)
    wallX.rotation.y = Math.PI / 2.0;
    scene.add(wallX);

    // WallZ
    let materialWallZ = new THREE.MeshPhongMaterial( { color: 0x7B0828, dithering: true } ); // magenta

    let geometryWallZ = new THREE.PlaneGeometry( 2000, 2000 );

    wallZ = new THREE.Mesh(geometryWallZ, materialWallZ);
    wallZ.position.set( 0, 0, DEFAULT_WALLZ_DEPTH - 0.01 ); //to avoid noise with area covered by cam (y = 0 for area covered)
    scene.add(wallZ);

    // GUI
    //camerasGUI.add(camerasSettings, 'addCamera');
    camerasGUI.add(camerasSettings, 'floorHeight', -10, 10).step(0.1).onChange(function ( value ) {
        floorHeight = value;
        floor.position.y = floorHeight - 0.01;
        gridHelper.position.y = floorHeight - 0.005
        dummies.forEach(d => {
            d.yPos = floorHeight;
            d.model.position.y = floorHeight;
        });
    });
    camerasGUI.add(camerasSettings, 'wallXDepth', -30, 10).step(0.1).onChange(function ( value ) {
        wallXDepth = value;
        wallX.position.x = wallXDepth - 0.01;
    });
    camerasGUI.add(camerasSettings, 'wallZDepth', -30, 10).step(0.1).onChange(function ( value ) {
        wallZDepth = value;
        wallZ.position.z = wallZDepth - 0.01;
    });
    //camerasGUI.add(camerasSettings, 'resetAll');

    camerasGUI.open();

    // Performance stats
    stats = new Stats();
    container.appendChild( stats.dom );
    
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
    camera.position.set(12,10,12); //height and retreat

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

    transformControl.addEventListener( 'objectChange', function () {

        //updateSplineOutline();  ///UPDATE VALUES ?

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

    const intersects = raycaster.intersectObjects( camMeshes, false );


    if(intersects.length > 0) {
        const object = intersects[ 0 ].object;
        if (object !== transformControl.object) {
            transformControl.attach( object );
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

/* ADDING  CAMERA */
//document.getElementById('new-camera').addEventListener("click", addCamera);
fontLoader.load( 'fonts/helvetiker_regular.typeface.json', function ( response ) {
    font = response;
    document.getElementById('new-camera').onclick = addCamera;
} );

function addCamera()
{
    let newCamera = new Camera(cameras.length)
    newCamera.addCameraToScene();
    cameras.push(newCamera);
}

function addCameraGUI(cam)
{
    const CamPresets = { "Orbbec Astra +" : camerasTypes.OrbbecAstraPlus, "Orbbec Astra Pro" : camerasTypes.OrbbecAstraPro };
    let cameraUIdiv = document.createElement( 'div');
    cameraUIdiv.dataset.camera = cam.id;
    cameraUIdiv.classList.add("active");
    cameraUIdiv.classList.add("cameraUI");
    cameraUIdiv.innerHTML = `
        <div class="row s-p">
            <div class="row">
                <div class="camera-color" style="background-color: #`+ cam.color.getHexString() + `;"></div>
                <h1>Camera ` + (cam.id + 1) + `</h1>
            </div>
            <div class="row">
                <div id="cam-` + (cam.id) + `-visible"><span class="iconify" data-icon="akar-icons:eye-open"></span></div>
                <!-- <div><span class="iconify" data-icon="gg:border-style-solid"></span></div> -->
                <!-- <div><span class="iconify" data-icon="fluent:lock-open-16-regular"></span></div> -->
            </div>
        </div>
        <div id="select-camera" class="row s-p">
            <div class="column-2 row ">
                <select id="cam-type-` + (cam.id) + `" class="select" name="camType">
                    <option value="plus" selected">Orbbec Astra +</option>
                    <option value="pro">Orbbec Astra Pro</option>
                </select>
                <!-- <p class="select">  Astra plus </p> <span class="iconify" data-icon="gg:chevron-down"></span> -->
            </div>
            <div class="row s-p column-2">
                <div>
                    <p id="hfov` + cam.id + `">FOV H: ` + cam.type.HFov + `°</p>
                    <p id="near` + cam.id + `">NEAR: ` + cam.type.rangeNear + `m</p>
                </div>
                <div>
                    <p id="vfov` + cam.id + `">FOV V: ` + cam.type.VFov + `°</p>
                    <p id="far` + cam.id + `">FAR: ` + cam.type.rangeFar + `m</p>
                </div>
            </div>
        </div>
        <div class="row s-p">
            <div class="2-column ">
                <p>  Position </p>
            </div>
            <div class="row s-p column-2">
                <p id="x-pos-`+ cam.id +`" class="draggable">X <strong>0</strong>m</p>
                <p id="y-pos-`+ cam.id +`" class="draggable">Y <strong>0</strong>m</p>
                <p id="z-pos-`+ cam.id +`" class="draggable">Z <strong>7</strong>m</p>
            </div>
        </div>
        <div  class="row s-p">
            <div class="2-column ">
                <p>  Rotation </p>
            </div>
            <div class="row s-p column-2">
                <p id="pitch-rot-`+ cam.id +`" class="draggable">PITCH <strong>0</strong>°</p>
                <p id="yaw-rot-`+ cam.id +`" class="draggable">YAW <strong>0</strong>°</p>
                <p id="roll-rot-`+ cam.id +`" class="draggable">ROLL <strong>0</strong>° </p>
            </div>
        </div>`;

    let inspectorDiv = document.getElementById('inspector');
    inspectorDiv.appendChild(cameraUIdiv);

    document.getElementById('cam-' + (cam.id) + '-visible').onclick = changeVisibilityofCam;
    function changeVisibilityofCam()
    {
        cameras[parseInt(this.id.split('-')[1])].changeVisibility();
    }

    document.getElementById('cam-type-' + cam.id).onchange = function(){
            switch(document.getElementById('cam-type-' + cam.id).value)
            {
                case "plus":
                    cam.type = camerasTypes.OrbbecAstraPlus;
                    break;
                case "pro":
                    cam.type = camerasTypes.OrbbecAstraPro;
                    break;
                default:
                    cam.type = camerasTypes.OrbbecAstraPlus;
            }
            
            document.getElementById('hfov' + cam.id + '').innerHTML = 'FOV H: ' + cam.type.HFov + '°';
            document.getElementById('vfov' + cam.id + '').innerHTML = 'FOV V: ' + cam.type.VFov + '°';
            document.getElementById('near' + cam.id + '').innerHTML = 'NEAR: ' + cam.type.rangeNear + 'm';
            document.getElementById('far' + cam.id + '').innerHTML = 'FAR: ' + cam.type.rangeFar + 'm';
         
            
            cam.cameraPerspective.fov = cam.type.VFov;
            cam.cameraPerspective.aspect = cam.type.aspectRatio;
            cam.cameraPerspective.near = cam.type.rangeNear;
            cam.cameraPerspective.far = cam.type.rangeFar;
        }

    //Make elements draggable:
    dragElement(document.getElementById("x-pos-" + cam.id));
    dragElement(document.getElementById("y-pos-" + cam.id));
    dragElement(document.getElementById("z-pos-" + cam.id));
    dragElement(document.getElementById("pitch-rot-" + cam.id));
    dragElement(document.getElementById("yaw-rot-" + cam.id));
    dragElement(document.getElementById("roll-rot-" + cam.id));
}

function dragElement(element) {
    let valueElement = element.getElementsByTagName('strong')[0];
    let value = parseFloat(valueElement.innerHTML);
    let mousePosX = 0;
    let diffX = 0;
    element.onmousedown = dragMouseDown;


    function dragMouseDown(e) {
        valueElement = element.getElementsByTagName('strong')[0];
        value = parseFloat(valueElement.innerHTML);
        valueElement.style.textDecoration = "underline";
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        mousePosX = e.clientX;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        diffX = e.clientX - mousePosX;
        mousePosX = e.clientX;

        let fac = 1;
        switch(element.id.split('-')[1])
        {
            case "pos" :
                fac = 1 / 10.0;
                break;
            case "rot":
                fac = 1;
                break;
            default:
                fac = 1;
                break;
        }

        value += diffX * fac;
        valueElement.innerHTML = Math.round(value*100)/100.0;

        let cam = cameras[element.id.split('-')[2]];
        switch(element.id.split('-')[0])
        {
            case "x":
                cam.XPos = value;
                cam.cameraPerspective.position.x = cam.XPos;
                cam.mesh.position.set( cam.XPos, cam.YPos, cam.ZPos );
                break;
            case "y":
                cam.ZPos = - value;
                cam.cameraPerspective.position.z = cam.ZPos;
                cam.mesh.position.set( cam.XPos, cam.YPos, cam.ZPos );
                break;
            case "z":
                cam.YPos = value;
                cam.cameraPerspective.position.y = cam.YPos;
                cam.mesh.position.set( cam.XPos, cam.YPos, cam.ZPos );
                break;
            case "pitch":
                cam.cameraPerspective.rotateOnWorldAxis(cam.xRotationAxis, (value-90) * (Math.PI / 180.0) - cam.pitch);
                cam.pitch = (value-90) * (Math.PI / 180.0);
                break;
            case "yaw":
                cam.cameraPerspective.rotateOnWorldAxis(new THREE.Vector3(0,1,0), value * (Math.PI / 180.0) - cam.yaw);
                cam.xRotationAxis.applyAxisAngle(new THREE.Vector3(0,1,0), value * (Math.PI / 180.0) - cam.yaw);
                cam.xRotationAxis.normalize();
                cam.yaw = value * (Math.PI / 180.0);
                break;
            case "roll":
                let rotationAxis = new THREE.Vector3();
                cam.cameraPerspective.getWorldDirection(rotationAxis);
                cam.cameraPerspective.rotateOnWorldAxis(rotationAxis, value * (Math.PI / 180.0) - cam.roll);
                cam.roll = value * (Math.PI / 180.0);
                break;
            default:
                break;
        }
    }

    function closeDragElement() {
        valueElement.style.textDecoration = "none";
        /* stop changing when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }

}

function addCameraUI(camera) //rename addCameraGUI to make it work
{
    //const CamPresets = { "Orbbec Astra +" : camerasTypes.OrbbecAstraPlus, "Orbbec Astra Pro" : camerasTypes.OrbbecAstraPro };

    /*const settingsCamera = {
        CamPreset: DEFAULT_CAMERA_TYPE,
        OffsetX: 0,
        OffsetY: 0,
        Hauteur: DEFAULT_CAMERA_HEIGHT,
        Pitch: 0,
        Roll: 0,
        Yaw: 0
    }*/

    /*const surfaceSettings = {
        DrawFrustum: true
    }*/
    
    //camera.guiInfos.innerHTML = '<p id="fov' + camera.id + '" class="controller">HFov: ' + DEFAULT_CAMERA_TYPE.HFov + '° - VFov: ' + DEFAULT_CAMERA_TYPE.VFov + '°</p>';
    //camera.guiInfos.innerHTML += '<p id="near' + camera.id + '" class="controller">Min distance: ' + DEFAULT_CAMERA_TYPE.rangeNear + 'm</p>';
    //camera.guiInfos.innerHTML += '<p id="far' + camera.id + '" class="controller">Max distance: ' + DEFAULT_CAMERA_TYPE.rangeFar + 'm</p>';

    //const cameraFolder = camerasGUI.addFolder("Camera " + (camera.id + 1) + " control");

    //cameraFolder.add(settingsCamera, 'CamPreset', CamPresets).onChange(function ( value ) {

        //document.getElementById('fov' + camera.id + '').innerHTML = 'HFov: ' + value.HFov + '° - VFov: ' + value.VFov + '°';
        //document.getElementById('near' + camera.id + '').innerHTML = 'Min distance: ' + value.rangeNear + 'm';
        //document.getElementById('far' + camera.id + '').innerHTML = 'Max distance: ' + value.rangeFar + 'm';
        
        /*camera.cameraPerspective.fov = value.VFov;
        camera.cameraPerspective.aspect = value.aspectRatio;
        camera.cameraPerspective.near = value.rangeNear;
        camera.cameraPerspective.far = value.rangeFar;*/
        //camera.cameraPerspective.updateProjectionMatrix();
        //camera.cameraPerspectiveHelper.update();
        
    //});

    /*
    cameraFolder.add(settingsCamera, 'Hauteur', 0,14).step(0.1).onChange(function ( value ) {

        camera.YPos = value;
        camera.cameraPerspective.position.y = camera.YPos;
        camera.mesh.position.set( camera.XPos, camera.YPos, camera.ZPos );
    });

    cameraFolder.add(settingsCamera, 'Pitch', - 90, 90).step(0.1).onChange(function ( value ) {
        camera.cameraPerspective.rotateOnWorldAxis(camera.xRotationAxis, (value-90) * (Math.PI / 180.0) - camera.pitch);
        camera.pitch = (value-90) * (Math.PI / 180.0);

    });
    cameraFolder.add(settingsCamera, 'Yaw', - 90, 90).step(0.1).onChange(function ( value ) {
        camera.cameraPerspective.rotateOnWorldAxis(new THREE.Vector3(0,1,0), value * (Math.PI / 180.0) - camera.yaw);
        camera.xRotationAxis.applyAxisAngle(new THREE.Vector3(0,1,0), value * (Math.PI / 180.0) - camera.yaw);
        camera.xRotationAxis.normalize();
        camera.yaw = value * (Math.PI / 180.0);
    });
    cameraFolder.add(settingsCamera, 'Roll', - 180, 180).step(0.1).onChange(function ( value ) {
        let rotationAxis = new THREE.Vector3();
        camera.cameraPerspective.getWorldDirection(rotationAxis);
        camera.cameraPerspective.rotateOnWorldAxis(rotationAxis, value * (Math.PI / 180.0) - camera.roll);
        camera.roll = value * (Math.PI / 180.0);
    });

    cameraFolder.add(settingsCamera, 'OffsetX', -10,10).step(0.1).onChange(function ( value ) {

        camera.XPos = value;
        camera.cameraPerspective.position.x = camera.XPos;
        camera.mesh.position.set( camera.XPos, camera.YPos, camera.ZPos );
    });
    cameraFolder.add(settingsCamera, 'OffsetY', -10,10).step(0.1).onChange(function ( value ) {

        camera.ZPos = value;
        camera.cameraPerspective.position.z = camera.ZPos;
        camera.mesh.position.set( camera.XPos, camera.YPos, camera.ZPos );
    });
    */

    //camera.guiInfos.innerHTML += '<p id="area' + camera.id + '" class="controller">Area covered: </p>';
    camera.guiInfos.innerHTML += '<p id="overlaps' + camera.id + '" class="controller"></p>';

    const infosFolder = cameraFolder.addFolder("Infos Camera " + (camera.id + 1));
    infosFolder.$children.appendChild( camera.guiInfos );
    infosFolder.close()

    //camera.guiInfos.setAttribute("data-index", camera.id);

    //console.log(camera.guiInfos.dataset.index);
/*
    const surfaceFolder = cameraFolder.addFolder("Options Camera " + (camera.id + 1));
    surfaceFolder.add(surfaceSettings, "DrawFrustum" ).onChange(function ( value ) {
        camera.areaAppear = value;
        camera.cameraPerspective.visible = value;
        camera.cameraPerspectiveHelper.visible = value;
    });
    surfaceFolder.close();*/

    /*cameraFolder.close();*/

    /*camera.gui = cameraFolder;*/
}

/* RESET SCENE */
document.getElementById('delete-cameras').onclick = resetAll;
function resetAll()
{
    let camerasUIdivs = document.getElementsByClassName("cameraUI");
    for(let i = camerasUIdivs.length - 1; i >= 0; i--)
    {
        camerasUIdivs[i].remove();
    }
    cameras.forEach(c => c.remove());
    cameras = [];
    camMeshes = [];
}

/* ADDING DUMMY */
document.getElementById('add-dummy').onclick = addDummy;
function addDummy()
{
    let newDummy = new Dummy(dummies.length);
    //newDummy.addDummyToScene();
    loadDummy(newDummy);
    dummies.push(newDummy);
}

function loadDummy(dummy)
{
    let genre = (Math.random() < 0.5) ? "male" : "female";
    let scaling = 0.01;

    const onProgress = function ( xhr ) {

        if ( xhr.lengthComputable ) {

            const percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

        }

    };

    new MTLLoader()
    .setPath( 'models/'+ genre +'02/' )
    .load( genre +'02.mtl', function ( materials ) {

        materials.preload();

        new OBJLoader()
            .setMaterials( materials )
            .setPath( 'models/'+ genre +'02/' )
            .load( genre +'02.obj', function ( object ) {

                dummy.model = object;
                dummy.model.scale.set(scaling, scaling, scaling);
                dummy.model.position.set(dummy.xPos, dummy.yPos, dummy.zPos);

                scene.add( dummy.model );

            }, onProgress );

    } );
}

/*
function addDummyGUI(dummy)
{
    const settingsDummy = {
        XPosition: 0,
        YPosition: 0
    }

    const dummyFolder = dummiesGUI.addFolder("Dummy " + (dummy.id + 1) + " moves");


    dummyFolder.add(settingsDummy, 'XPosition', -10, 10).step(0.1).onChange(function ( value ) {
        dummy.xPos = value;
        dummy.model.position.x = value;
    });
    dummyFolder.add(settingsDummy, 'YPosition', -10, 10).step(0.1).onChange(function ( value ) {
        dummy.zPos = value;
        dummy.model.position.z = value;
    });
}
*/

/* REMOVE DUMMIES */
document.getElementById('remove-dummies').onclick = removeDummies;
function removeDummies()
{
    dummies.forEach(d => d.remove());
    dummies = [];
}

/* DISPLAY FRUSTUMS */
document.getElementById('display-frustums').onclick = displayFrustums;
function displayFrustums()
{
    let visibles = cameras.filter(c => c.areaAppear);
    cameras.forEach(c => c.changeVisibility(visibles.length != cameras.length));
}

//DEBUG
function onKeyDown( event ) {

    switch ( event.keyCode ) {

        case 80: /*P*/
            
            cameras.forEach(c => console.log(c.areaOverlaps));
            break;

    }

}

/* Calculate area covered by the camera cam to draw it and display it*/ 
function drawProjection(cam)
{
    scene.remove(cam.areaCoveredFloor);
    scene.remove(cam.areaCoveredWallX);
    scene.remove(cam.areaCoveredWallZ);
    let raysIntersect = [];

    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(cam.cameraPerspective.projectionMatrix);
    //calculate the rays representing the intersection between frustum's planes and the floor or the walls
    for(let i = 0; i < 6; i++) 
    {
        let plane = frustum.planes[i].applyMatrix4(cam.cameraPerspective.matrixWorld);

        //crossing the floor
        let floorN = new THREE.Vector3();
        floorN.copy(floorNormal);
        floorN.cross(plane.normal);
        if(floorN.length() > 0.01)
        {
            if(Math.abs(plane.normal.x) > 0.01)
            {
                const point = new THREE.Vector3((- floorHeight*plane.normal.y - plane.constant)/plane.normal.x, floorHeight, 0);
                const direction = new THREE.Vector3((- plane.normal.z)/plane.normal.x , 0, 1).normalize();
                const ray = new THREE.Ray(point, direction);
                raysIntersect.push(ray);
            }
            else if(Math.abs(plane.normal.z) > 0.01)
            {
                const point = new THREE.Vector3(0, floorHeight, (- floorHeight*plane.normal.y - plane.constant)/plane.normal.z);
                const direction = new THREE.Vector3(1, 0, (- plane.normal.x)/plane.normal.z).normalize();
                const ray = new THREE.Ray(point, direction);
                raysIntersect.push(ray);
            }
        }

        //crossing the left wall
        let wallXN = new THREE.Vector3();
        wallXN.copy(wallXNormal);
        wallXN.cross(plane.normal);
        if(wallXN.length() > 0.01)
        {
            if(Math.abs(plane.normal.y) > 0.01)
            {
                const point = new THREE.Vector3(wallXDepth, (- wallXDepth*plane.normal.x - plane.constant)/plane.normal.y, 0);
                const direction = new THREE.Vector3(0, (- plane.normal.z)/plane.normal.y, 1).normalize();
                const ray = new THREE.Ray(point, direction);
                raysIntersect.push(ray);
            }
            else if(Math.abs(plane.normal.z) > 0.01)
            {
                const point = new THREE.Vector3(wallXDepth, 0, (- wallXDepth*plane.normal.x - plane.constant)/plane.normal.z);
                const direction = new THREE.Vector3(0, 1, (- plane.normal.y)/plane.normal.z).normalize();
                const ray = new THREE.Ray(point, direction);
                raysIntersect.push(ray);
            }
        }

        //crossing the far wall
        let wallZN = new THREE.Vector3();
        wallZN.copy(wallZNormal);
        wallZN.cross(plane.normal);
        if(wallZN.length() > 0.01)
        {
            if(Math.abs(plane.normal.x) > 0.01)
            {
                const point = new THREE.Vector3((- wallZDepth*plane.normal.z - plane.constant)/plane.normal.x, 0, wallZDepth);
                const direction = new THREE.Vector3((- plane.normal.y)/plane.normal.x, 1, 0).normalize();
                const ray = new THREE.Ray(point, direction);
                raysIntersect.push(ray);
            }
            else if(Math.abs(plane.normal.y) > 0.01)
            {
                const point = new THREE.Vector3(0, (- wallZDepth*plane.normal.z - plane.constant)/plane.normal.y, wallZDepth);
                const direction = new THREE.Vector3(1, (- plane.normal.x)/plane.normal.y, 0).normalize();
                const ray = new THREE.Ray(point, direction);
                raysIntersect.push(ray);
            }
        }
    }

    //adding rays for walls intersections
    let origin = new THREE.Vector3(wallXDepth, floorHeight, wallZDepth);
    raysIntersect.push(new THREE.Ray(origin, wallXNormal));
    raysIntersect.push(new THREE.Ray(origin, floorNormal));
    raysIntersect.push(new THREE.Ray(origin, wallZNormal));
    
    
    //floor points
    let floorRays = raysIntersect.filter(r => Math.abs(r.origin.y - floorHeight) < 0.01 && Math.abs(r.direction.y) < 0.01);
    let intersectionPointsFloor = getIntersectionPoints(floorRays);

    //wallX points
    let wallXRays = raysIntersect.filter(r => Math.abs(r.origin.x - wallXDepth) < 0.01  && Math.abs(r.direction.x) < 0.01);
    let intersectionPointsWallX = getIntersectionPoints(wallXRays);

    //wallZ points
    let wallZRays = raysIntersect.filter(r => Math.abs(r.origin.z - wallZDepth) < 0.01 && Math.abs(r.direction.z) < 0.01);
    let intersectionPointsWallZ = getIntersectionPoints(wallZRays);

    cam.raysFloor = floorRays;
    cam.raysWallX = wallXRays;
    cam.raysWallZ = wallZRays;

    //DEBUG RAYS
    
    /*for(let i = 0; i < rays.length; i++)
    {
        scene.remove(rays[i]);
    }
    for(let i = 0; i < floorRays.length; i++)
    {
        for(let t = -2; t < 5; t++)
        {
            const geometry = new THREE.BoxGeometry( 0.6, 0.6, 0.6 );
            const material = new THREE.MeshBasicMaterial(t < 3.9 ? { color: 0xffffff } : { color: 0xffff00 } );
            const cube = new THREE.Mesh( geometry, material );
            scene.add( cube );
            let translation = new THREE.Vector3();
            floorRays[i].at(t, translation);
            cube.translateOnAxis(translation, 1);
            rays.push(cube);
        }
    }*/
    
    //FIN DEBUG

    const frustumScaled = new THREE.Frustum();
    frustumScaled.setFromProjectionMatrix(cam.cameraPerspective.projectionMatrix);

    for(let i = 0; i < 6; i++) 
    {
        frustumScaled.planes[i].applyMatrix4(cam.cameraPerspective.matrixWorld);
        frustumScaled.planes[i].constant += 0.01;
    }

    const coveredPointsFloor = intersectionPointsFloor.filter(p => frustumScaled.containsPoint(p) && p.x > wallXDepth - 0.01 && p.y > floorHeight - 0.01 && p.z > wallZDepth - 0.01);
    const coveredPointsWallX = intersectionPointsWallX.filter(p => frustumScaled.containsPoint(p) && p.x > wallXDepth - 0.01 && p.y > floorHeight - 0.01 && p.z > wallZDepth - 0.01);
    const coveredPointsWallZ = intersectionPointsWallZ.filter(p => frustumScaled.containsPoint(p) && p.x > wallXDepth - 0.01 && p.y > floorHeight - 0.01 && p.z > wallZDepth - 0.01);


    coveredPointsFloor.sort((A, B) => sortByAngle(A, B, coveredPointsFloor));
    coveredPointsWallX.sort((A, B) => sortByAngle(A, B, coveredPointsWallX));
    coveredPointsWallZ.sort((A, B) => sortByAngle(A, B, coveredPointsWallZ));

    coveredPointsFloor.forEach((p) => p.y += 0.01*cam.id);
    coveredPointsWallX.forEach((p) => p.y += 0.01*cam.id);
    coveredPointsWallZ.forEach((p) => p.y += 0.01*cam.id);

    //Place text 
    if(coveredPointsFloor.length > 2)
    {
        let barycentre = getBarycentre(coveredPointsFloor);
        cam.nameText.position.copy(barycentre.add(new THREE.Vector3( - SIZE_TEXT_CAMERA * 2, 0.1, 0)));
        cam.areaDisplay.position.copy(barycentre.add(new THREE.Vector3(0, 0, 1.5*SIZE_TEXT_CAMERA )));
        cam.areaDisplay.visible = cam.areaAppear;
    }
    else
    {
        cam.nameText.position.copy(cam.cameraPerspective.position);
        cam.areaDisplay.visible = false;
    }


    //DEBUG SPHERES
    /*
    for(let i = 0; i < spheres.length; i++)
    {
        scene.remove(spheres[i]);
    }
    for(let i = 0; i < intersectionPointsFloor.length; i++)
    {
        const geometry = new THREE.SphereGeometry( 0.7, 32, 16 );
        const material = new THREE.MeshBasicMaterial(frustumScaled.containsPoint(intersectionPointsFloor[i]) ? { color: 0x00ffff } : { color: 0xff0000 } );
        const sphere = new THREE.Mesh( geometry, material );
        scene.add( sphere );
        sphere.translateOnAxis(intersectionPointsFloor[i],1);
        spheres.push(sphere);
    }
    */
    //FIN DEBUG

    //display area value 
    let previousValue = cam.areaValue;
    cam.areaValue = calculateArea(coveredPointsFloor);
    if(previousValue != cam.areaValue)
    {
        let newTextGeometry = new TextGeometry( Math.round(cam.areaValue*100)/100 + 'm²', { font: font, size: SIZE_TEXT_CAMERA * 2/3.0, height: 0.05 } );
        cam.areaDisplay.geometry = newTextGeometry;
    }

    //draw area
    cam.areaCoveredFloor = drawAreaWithPoints(coveredPointsFloor);
    cam.areaCoveredWallX = drawAreaWithPoints(coveredPointsWallX);
    cam.areaCoveredWallZ = drawAreaWithPoints(coveredPointsWallZ);

    cam.areaAppear ? scene.add(cam.areaCoveredFloor) : scene.remove(cam.areaCoveredFloor);
    cam.areaAppear ? scene.add(cam.areaCoveredWallX) : scene.remove(cam.areaCoveredWallX);
    cam.areaAppear ? scene.add(cam.areaCoveredWallZ) : scene.remove(cam.areaCoveredWallZ);

    if(cam.areaValue > 0.01)
    {
        for(let i = 0; i < cam.id; i++)
        {
            if(cameras[i].areaValue > 0.01)
            {
                let raysCamsFloor = floorRays.concat(cameras[i].raysFloor);
                let pointsSuperposition = getIntersectionPoints(raysCamsFloor);

                //only keep points in both the frustums
                const frustumOtherCamScaled = new THREE.Frustum();
                frustumOtherCamScaled.setFromProjectionMatrix(cameras[i].cameraPerspective.projectionMatrix);

                for(let j = 0; j < 6; j++) 
                {
                    frustumOtherCamScaled.planes[j].applyMatrix4(cameras[i].cameraPerspective.matrixWorld);
                    frustumOtherCamScaled.planes[j].constant += 0.01;
                }
                pointsSuperposition = pointsSuperposition.filter(p => frustumScaled.containsPoint(p) && frustumOtherCamScaled.containsPoint(p));

                //delete identical points
                pointsSuperposition.sort((A,B) => A.length() < B.length());
                for(let j = 0; j < pointsSuperposition.length - 1; j++)
                {
                    if(pointsSuperposition[j].distanceTo(pointsSuperposition[j + 1]) < 0.01)
                    {
                        pointsSuperposition.splice(j,1);
                        j--;
                    }
                }

                pointsSuperposition.sort((A,B) => sortByAngle(A,B,pointsSuperposition));
                let superpositionArea = calculateArea(pointsSuperposition);
                //cameras[i].overlaps[cam.id] = superpositionArea; // / cameras[i].areaValue * 100;
                if(cam.overlaps[i] != superpositionArea)
                {
                    cam.overlaps[i] = superpositionArea; // / cam.areaValue * 100;
                    let barycentreSuperposition = getBarycentre(pointsSuperposition);
                    let areaOverlapsGeometry = new TextGeometry(  Math.round(superpositionArea*100)/100 + "m²", { font: font, size: SIZE_TEXT_CAMERA * 2/3.0, height: 0.05 } );
                    cam.areaOverlaps[i].geometry = areaOverlapsGeometry;
                    cam.areaOverlaps[i].position.copy(barycentreSuperposition.add(new Vector3( - SIZE_TEXT_CAMERA*2, 0.1, SIZE_TEXT_CAMERA/2.0 )));
                }
                if(pointsSuperposition.length > 2)
                {
                    cam.areaOverlaps[i].visible = cam.areaAppear && cameras[i].areaAppear;
                }
                else
                {
                    cam.areaOverlaps[i].visible = false;
                }
            }
        }
    }
}

function sortByAngle(A, B, coveredPoints){
    let center = new THREE.Vector3();
    center.addVectors(coveredPoints[0], coveredPoints[1]).divideScalar(2.0);

    let vector = new THREE.Vector3();
    vector.subVectors(coveredPoints[0], center);

    let vectorA = new THREE.Vector3();
    vectorA.subVectors(A, center);

    let vectorB = new THREE.Vector3();
    vectorB.subVectors(B, center);
    
    return vector.angleTo(vectorA) - vector.angleTo(vectorB);
}

function getIntersectionPoints(raysCrossing)
{

    let intersectionPoints = [];
    for(let i = 0; i < raysCrossing.length - 1; i++)
    {
        let ray1 = raysCrossing[i];
        for(let j = i+1; j < raysCrossing.length; j++)
        {
            let ray2 = raysCrossing[j]

            //intersection point
            let A = ray1.origin;
            let u = ray1.direction;
            let B = ray2.origin;
            let v = ray2.direction;
            
            let normal = new THREE.Vector3();
            normal.copy(u);
            normal.cross(v);

            let dirX = new THREE.Vector3(1, 0, 0);
            let dirY = new THREE.Vector3(0, 1, 0);
            let dirZ = new THREE.Vector3(0, 0, 1);

            let qy = 0;
            let sy = 0;
            if(dirY.cross(normal).length() < 0.01)
            {
                qy = (A.z - B.z) * u.x + (B.x - A.x) * u.z ;
                sy = u.x * v.z - v.x * u.z;
            }
            else if(dirX.cross(normal).length() < 0.01)
            {
                qy = (A.z - B.z) * u.y + (B.y - A.y) * u.z ;
                sy = u.y * v.z - v.y * u.z;
            }
            else if(dirZ.cross(normal).length() < 0.01)
            {
                qy = (A.x - B.x) * u.y + (B.y - A.y) * u.x ;
                sy = u.y * v.x - v.y * u.x;
            }

            // if lines are identical or do not cross
            if (Math.abs(sy) > 0.01)
            {
                let param = qy/ sy;

                let point = new THREE.Vector3();
                ray2.at(param, point);
                intersectionPoints.push(point);
            }
        }
    }

    return intersectionPoints;
}

function calculateArea(borderPoints)
{
    let areaValue = 0;
    
    for(let i = 1; i < borderPoints.length - 1; i++)
    {
        let vectorAB = new THREE.Vector3();
        vectorAB.subVectors(borderPoints[i], borderPoints[0]);

        let vectorAC = new THREE.Vector3();
        vectorAC.subVectors(borderPoints[i + 1], borderPoints[0]);

        let areaOfThisTriangle = 0.5 * vectorAB.cross(vectorAC).length();
        areaValue += areaOfThisTriangle;
    }

    return areaValue;
}

function getBarycentre(points)
{
    let barycentre = new THREE.Vector3();
    points.forEach(p => barycentre.add(p));
    barycentre.divideScalar(points.length);
    return barycentre;
}

function drawAreaWithPoints(coveredPoints)
{
    const geometryArea = new THREE.BufferGeometry();
    let verticesArray = [];
    
    for(let i = 1; i < coveredPoints.length - 1; i++)
    {
        verticesArray.push(coveredPoints[i + 1].x);
        verticesArray.push(coveredPoints[i + 1].y);
        verticesArray.push(coveredPoints[i + 1].z);

        verticesArray.push(coveredPoints[i].x);
        verticesArray.push(coveredPoints[i].y);
        verticesArray.push(coveredPoints[i].z);

        verticesArray.push(coveredPoints[0].x);
        verticesArray.push(coveredPoints[0].y);
        verticesArray.push(coveredPoints[0].z);


        verticesArray.push(coveredPoints[0].x);
        verticesArray.push(coveredPoints[0].y);
        verticesArray.push(coveredPoints[0].z);

        verticesArray.push(coveredPoints[i].x);
        verticesArray.push(coveredPoints[i].y);
        verticesArray.push(coveredPoints[i].z);

        verticesArray.push(coveredPoints[i + 1].x);
        verticesArray.push(coveredPoints[i + 1].y);
        verticesArray.push(coveredPoints[i + 1].z);
    }

    const vertices = new Float32Array( verticesArray );

    geometryArea.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    const materialArea = new THREE.MeshBasicMaterial( { color: 0x008888 } );
    
    materialArea.transparent = true;
    materialArea.opacity = 0.7;
    
    const areaCovered = new THREE.Mesh( geometryArea, materialArea );

    return(areaCovered);
}


/* RENDER */

function animate() {

    requestAnimationFrame( animate );

    render();
    stats.update();

}

function render() {
    cameras.forEach(c => c.render());
    //cameras.forEach(c => c.displayOverlaps());

    renderer.clear();

    renderer.setViewport( 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT );
    renderer.render( scene, camera )
}

