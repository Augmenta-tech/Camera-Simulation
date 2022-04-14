import * as THREE from 'three';

import { FontLoader } from 'three-loaders/FontLoader.js';
import { TextGeometry } from 'three-text-geometry';

import { transformControl } from './main.js';

import { scene } from './projection-area.js'
import { drawProjection } from './projection-area.js';

export const camerasTypes = [
    {id:0, name:"OrbbecAstraPlus", HFov:55, VFov:45, aspectRatio: 1920.0/1080.0, rangeNear: 0.6,rangeFar: 8},
    {id:1, name:"OrbbecAstraPro", HFov:60, VFov:49.5, aspectRatio: 1920.0/1080.0, rangeNear: 0.6,rangeFar: 8}
]

const DEFAULT_CAMERA_TYPE_ID = 0;

const DEFAULT_CAMERA_HEIGHT = 4.5
const DEFAULT_CAMERA_PITCH = - Math.PI / 2.0;


export let camMeshes = [];
export let cameras = [];

let font;
const fontLoader = new FontLoader();
const SIZE_TEXT_CAMERA = 0.4

export class Camera{
    constructor(id, typeID = DEFAULT_CAMERA_TYPE_ID, x = 0, y = DEFAULT_CAMERA_HEIGHT, z = 0, p = 0, a = 0, r = 0)
    {
        this.id = id;
        this.type = camerasTypes.find(t => t.id === typeID);
        this.XPos = x;
        this.YPos = y;
        this.ZPos = z;
        this.pitch = p;
        this.yaw = a;
        this.roll = r;

        this.cameraPerspective = new THREE.PerspectiveCamera( this.type.VFov, this.type.aspectRatio, this.type.rangeNear, this.type.rangeFar );
        this.cameraPerspectiveHelper = new THREE.CameraHelper( this.cameraPerspective );
    
        this.color = new THREE.Color(Math.random(), Math.random(), Math.random());
        const material = new THREE.MeshPhongMaterial( { color: this.color, dithering: true } );
        const geometry = new THREE.BoxGeometry( 0.2,0.2,0.2 );
        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.name = 'Camera';
        camMeshes.push(this.mesh);

        this.cameraPerspective.position.set(this.XPos, this.YPos, this.ZPos);
        this.mesh.position.set(this.XPos, this.YPos, this.ZPos);

        this.cameraPerspective.rotateX(DEFAULT_CAMERA_PITCH);
        this.cameraPerspective.rotateOnWorldAxis(new THREE.Vector3(0,1,0), this.yaw);
        this.xRotationAxis = new THREE.Vector3(1, 0, 0);
        this.xRotationAxis.applyAxisAngle(new THREE.Vector3(0,1,0), this.yaw);
        this.xRotationAxis.normalize();
        this.cameraPerspective.rotateOnWorldAxis(this.xRotationAxis, this.pitch);
        let rotationAxis = new THREE.Vector3();
        this.cameraPerspective.getWorldDirection(rotationAxis);
        this.cameraPerspective.rotateOnWorldAxis(rotationAxis, this.roll);

        this.areaCoveredFloor = new THREE.Mesh();
        this.areaCoveredAbove = new THREE.Mesh();
        this.areaCoveredWallX = new THREE.Mesh();
        this.areaCoveredWallZ = new THREE.Mesh();

        this.areaAppear = true;
        this.areaValue = 0;

        /*this.raysFloor = [];
        this.raysAbove = [];
        this.raysWallX = [];
        this.raysWallZ = [];

        this.overlaps = {}*/
        let textGeometry = new TextGeometry( "Cam " + (this.id+1), { font: font, size: SIZE_TEXT_CAMERA, height: 0.01 } );
        this.nameText = new THREE.Mesh(textGeometry, new THREE.MeshPhongMaterial( { color: 0xffffff } ))
        this.nameText.position.set(this.XPos - SIZE_TEXT_CAMERA * 2, this.YPos - (this.type.rangeFar - 1), this.ZPos + SIZE_TEXT_CAMERA/2.0);
        this.nameText.rotation.x = -Math.PI / 2.0;

        let areaDisplayGeometry = new TextGeometry( "AREA VALUE", { font: font, size: SIZE_TEXT_CAMERA * 2/3.0, height: 0.01 } );
        this.areaDisplay = new THREE.Mesh(areaDisplayGeometry, new THREE.MeshPhongMaterial( { color: 0xffffff } ))
        this.areaDisplay.position.set(this.XPos - SIZE_TEXT_CAMERA * 4/3.0, this.YPos - (this.type.rangeFar - 1), this.ZPos + 3*SIZE_TEXT_CAMERA/2.0);
        this.areaDisplay.rotation.x = -Math.PI / 2.0;

        /*this.areaOverlaps = {};
        for(let i = 0; i < this.id; i++)
        {
            let areaOverlapGeometry = new TextGeometry( "OVERLAP AREA", { font: font, size: SIZE_TEXT_CAMERA * 2/3.0, height: 0.05 } );
            let areaOverlap = new THREE.Mesh(areaOverlapGeometry, new THREE.MeshPhongMaterial( { color: 0xffffff } ))
            this.areaOverlaps[i] = areaOverlap;
            this.areaOverlaps[i].rotation.x = -Math.PI / 2.0;
            this.areaOverlaps[i].visible = false;
        }*/
    }

    addCameraToScene()
    {
        scene.add( this.cameraPerspective );
        scene.add( this.cameraPerspectiveHelper );
        scene.add( this.mesh );
        scene.add( this.nameText );
        scene.add( this.areaDisplay );
        /*for(let i = 0; i < this.id; i++)
        {
            scene.add(this.areaOverlaps[i]);
        }*/

        addCameraGUI(this);
    }

    changeTextPosition(barycentre)
    {
        this.nameText.position.copy(barycentre.add(new THREE.Vector3( - SIZE_TEXT_CAMERA * 2, 0.1, 0)));
        this.areaDisplay.position.copy(barycentre.add(new THREE.Vector3(0, 0, 1.5*SIZE_TEXT_CAMERA )));
        this.areaDisplay.visible = this.areaAppear;
    }

    changeAreaDisplayed()
    {
        let newTextGeometry = new TextGeometry( Math.round(this.areaValue*100)/100 + 'm²', { font: font, size: SIZE_TEXT_CAMERA * 2/3.0, height: 0.01 } );
        this.areaDisplay.geometry = newTextGeometry;
    }

    /*displayOverlaps()
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
    }*/

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
        /*for(let i = 0; i < this.id; i++)
        {
            this.areaOverlaps[i].visible = value;
        }*/
    }

    updatePosition()
    {
        this.XPos = this.mesh.position.x;
        this.YPos = this.mesh.position.y;
        this.ZPos = this.mesh.position.z;
        this.cameraPerspective.position.set(this.XPos, this.YPos, this.ZPos);

        document.getElementById('x-pos-'+ this.id).getElementsByTagName('strong')[0].innerHTML = Math.round(this.XPos*10)/10.0;
        document.getElementById('y-pos-'+ this.id).getElementsByTagName('strong')[0].innerHTML = Math.round(- this.ZPos*10)/10.0;
        document.getElementById('z-pos-'+ this.id).getElementsByTagName('strong')[0].innerHTML = Math.round(this.YPos*10)/10.0;
        
    }

    render()
    {
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
        scene.remove(this.areaCoveredAbove);
        scene.remove(this.areaCoveredWallX);
        scene.remove(this.areaCoveredWallZ);
        this.raysFloor = [];
        this.raysWallX = [];
        this.raysWallZ = [];
        scene.remove(this.nameText);
        scene.remove(this.areaDisplay);
        /*for(let i = 0; i < this.id; i++)
        {
            scene.remove(this.areaOverlaps[i]);
        }*/
    }
}


/* ADDING  CAMERA */
document.getElementById('new-camera').onclick = addCameraButton;

function addCameraButton()
{
    addCamera();
}

export function addCamera(typeID = DEFAULT_CAMERA_TYPE_ID, x = 0, y = DEFAULT_CAMERA_HEIGHT, z = 0, p = 0, a = 0, r = 0)
{
    if(font === undefined)
    {
        fontLoader.load( 'fonts/helvetiker_regular.typeface.json', function ( response ) {
            font = response;
            addCam();
        });
    }
    else{
        addCam();
    }

    function addCam()
    {
        let newCamera = new Camera(cameras.length, typeID, x, y, z, p, a, r)
        newCamera.addCameraToScene();
        cameras.push(newCamera);
    }
}

function addCameraGUI(cam)
{
    let cameraUIdiv = document.createElement('div');
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
                    <option value="plus"` + (cam.type.name === "OrbbecAstraPlus" ? "selected" : "") +`>Orbbec Astra +</option>
                    <option value="pro"` + (cam.type.name === "OrbbecAstraPro" ? "selected" : "") +`>Orbbec Astra Pro</option>
                </select>
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
                <p id="x-pos-`+ cam.id +`" class="draggable">X <strong>` + Math.round(cam.XPos*10) /10.0 + `</strong>m</p>
                <p id="y-pos-`+ cam.id +`" class="draggable">Y <strong>` + Math.round(cam.ZPos*10) /10.0 + `</strong>m</p>
                <p id="z-pos-`+ cam.id +`" class="draggable">Z <strong>` + Math.round(cam.YPos*10) /10.0 + `</strong>m</p>
            </div>
        </div>
        <div  class="row s-p">
            <div class="2-column ">
                <p>  Rotation </p>
            </div>
            <div class="row s-p column-2">
                <p id="pitch-rot-`+ cam.id +`" class="draggable">PITCH <strong>` + Math.round(cam.pitch*180/Math.PI) + `</strong>°</p>
                <p id="yaw-rot-`+ cam.id +`" class="draggable">YAW <strong>` + Math.round(cam.yaw*180/Math.PI) + `</strong>°</p>
                <p id="roll-rot-`+ cam.id +`" class="draggable">ROLL <strong>` + Math.round(cam.roll*180/Math.PI) + `</strong>° </p>
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
                    cam.type = camerasTypes.find(t => t.name === "OrbbecAstraPlus");
                    break;
                case "pro":
                    cam.type = camerasTypes.find(t => t.name === "OrbbecAstraPro");
                    break;
                default:
                    cam.type = camerasTypes.find(t => t.name === "OrbbecAstraPlus");
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
    let dragged = false;


    function dragMouseDown(e) {
        valueElement = element.getElementsByTagName('strong')[0];
        value = parseFloat(valueElement.innerHTML);
        valueElement.style.textDecoration = "underline";
        dragged = false;
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        mousePosX = e.clientX;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        dragged = true;
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
                cam.cameraPerspective.rotateOnWorldAxis(cam.xRotationAxis, value * (Math.PI / 180.0) - cam.pitch);
                cam.pitch = value * (Math.PI / 180.0);
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

        /*on clic, change the value with an input*/
        /* WIP
        if(!dragged)
        {
            let inputElem = document.createElement('input');
            inputElem.type = "text";
            inputElem.setAttribute("autofocus", true);
            inputElem.name = element.id;
            inputElem.value = valueElement.innerHTML;
            inputElem.style = `
                width: 50px;
                position: fixed;
            `;
            element.insertBefore(inputElem, element.firstChild);
        }*/
    }

}

/* DISPLAY FRUSTUMS */
document.getElementById('display-frustums').onclick = displayFrustums;
function displayFrustums()
{
    let visibles = cameras.filter(c => c.areaAppear);
    cameras.forEach(c => c.changeVisibility(visibles.length != cameras.length));
}

/* RESET CAMERAS */
document.getElementById('delete-cameras').onclick = resetCams;
function resetCams()
{
    let camerasUIdivs = document.getElementsByClassName("cameraUI");
    for(let i = camerasUIdivs.length - 1; i >= 0; i--)
    {
        camerasUIdivs[i].remove();
    }
    cameras.forEach(c => c.remove());
    cameras.splice(0, cameras.length);
    camMeshes.splice(0, camMeshes.length);
}