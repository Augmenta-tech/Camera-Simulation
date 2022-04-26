import * as THREE from 'three';

import { FontLoader } from 'three-loaders/FontLoader.js';
import { TextGeometry } from 'three-text-geometry';

import { transformControl } from './main.js';

import { currentUnit, units } from './projection-area.js';
import { scene } from './projection-area.js';
import { drawProjection } from './projection-area.js';

import data from './cameras.js';

console.log(data);
export const camerasTypes = data;
camerasTypes.forEach(type => type.aspectRatio = Math.abs(Math.tan((type.HFov/2.0) * Math.PI / 180.0)/Math.tan((type.VFov/2.0) * Math.PI / 180.0)));

const DEFAULT_CAMERA_TYPE_ID = 0;

const DEFAULT_CAMERA_HEIGHT = 4.5
const DEFAULT_CAMERA_PITCH = - Math.PI / 2.0;


export let camMeshes = [];
export let cameras = [];

let font;
const fontLoader = new FontLoader();
const SIZE_TEXT_CAMERA = 0.4

export class Camera{
    constructor(id, construct = false, typeID = DEFAULT_CAMERA_TYPE_ID, x = 0, y = DEFAULT_CAMERA_HEIGHT, z = 0, p = 0, a = 0, r = 0)
    {
        this.id = id;
        this.type = camerasTypes.find(t => t.id === typeID);
        this.XPos = x;
        this.YPos = y;
        this.ZPos = z;
        this.pitch = p;
        this.yaw = a;
        this.roll = r;

        if(!construct)
        {
            for(let i = 0; i < cameras.length; i++)
            {
                console.log(i + '/' + cameras.length);
                console.log(new THREE.Vector3(this.XPos, this.YPos, this.ZPos));
                console.log(cameras[i].mesh.position);
                console.log(new THREE.Vector3(this.XPos, this.YPos, this.ZPos).distanceTo(cameras[i].mesh.position));
                if(new THREE.Vector3(this.XPos, this.YPos, this.ZPos).distanceTo(cameras[i].mesh.position) < 0.5)
                {
                    this.XPos += 0.6 - new THREE.Vector3(this.XPos, this.YPos, this.ZPos).distanceTo(cameras[i].mesh.position);
                    i = 0;
                }
            }
        }

        this.cameraPerspective = new THREE.PerspectiveCamera( this.type.VFov, this.type.aspectRatio, this.type.rangeNear, this.type.rangeFar );
        this.cameraPerspectiveHelper = new THREE.CameraHelper( this.cameraPerspective );
    
        this.color = new THREE.Color(Math.random(), Math.random(), Math.random());
        const material = new THREE.MeshPhongMaterial( { color: this.color, dithering: true } );
        const geometry = new THREE.BoxGeometry( 0.2,0.2,0.2 );
        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.name = 'Camera';

        this.cameraPerspective.position.set(this.XPos, this.YPos, this.ZPos);
        this.mesh.position.set(this.XPos, this.YPos, this.ZPos);

        this.cameraPerspective.rotateX(DEFAULT_CAMERA_PITCH);
        /*this.cameraPerspective.rotateOnWorldAxis(new THREE.Vector3(0,1,0), this.yaw);
        this.xRotationAxis = new THREE.Vector3(1, 0, 0);
        this.xRotationAxis.applyAxisAngle(new THREE.Vector3(0,1,0), this.yaw);
        this.xRotationAxis.normalize();
        this.cameraPerspective.rotateOnWorldAxis(this.xRotationAxis, this.pitch);

        this.xRotationAxis = new THREE.Vector3(1, 0, 0);*/
        //this.cameraPerspective.rotateOnWorldAxis(new THREE.Vector3(0,0,1), this.yaw);
        //this.cameraPerspective.rotateOnWorldAxis(new THREE.Vector3(1,0,0), this.pitch);

        this.cameraPerspective.rotateOnWorldAxis(new THREE.Vector3(1,0,0), this.pitch);

        this.cameraPerspective.rotateOnAxis(new THREE.Vector3(0,1,0), this.yaw);

        let rotationAxis = new THREE.Vector3();
        this.cameraPerspective.getWorldDirection(rotationAxis);
        this.cameraPerspective.rotateOnWorldAxis(rotationAxis, this.roll);

        this.coveredPointsAbove = [];

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

        let textGeometry = new TextGeometry( "Node " + (this.id+1), { font: font, size: SIZE_TEXT_CAMERA, height: 0.01 } );
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
        scene.add(this.cameraPerspective);
        scene.add(this.cameraPerspectiveHelper);
        scene.add(this.mesh);
        camMeshes.push(this.mesh);
        // scene.add(this.areaCoveredFloor);
        // scene.add(this.areaCoveredAbove);
        // scene.add(this.areaCoveredWallX);
        // scene.add(this.areaCoveredWallZ);
        scene.add(this.nameText);
        scene.add(this.areaDisplay);
        this.areaAppear = true;
        /*for(let i = 0; i < this.id; i++)
        {
            scene.add(this.areaOverlaps[i]);
        }*/

    }

    removeCameraFromScene()
    {
        if ( transformControl.object === this.mesh ) transformControl.detach();
        scene.remove(this.cameraPerspective);
        scene.remove(this.cameraPerspectiveHelper);
        scene.remove(this.mesh);
        camMeshes.splice(camMeshes.indexOf(this.mesh), 1);
        // scene.remove(this.areaCoveredFloor);
        // scene.remove(this.areaCoveredAbove);
        // scene.remove(this.areaCoveredWallX);
        // scene.remove(this.areaCoveredWallZ);
        scene.remove(this.nameText);
        scene.remove(this.areaDisplay);
        this.areaAppear = false;
    }

    changeTextPosition(barycentre)
    {
        this.nameText.position.copy(barycentre.add(new THREE.Vector3( - SIZE_TEXT_CAMERA * 2, 0.1, 0)));
        this.areaDisplay.position.copy(barycentre.add(new THREE.Vector3(0, 0, 1.5*SIZE_TEXT_CAMERA )));
        this.areaDisplay.visible = this.areaAppear;
    }

    changeAreaDisplayed()
    {
        let newTextGeometry = new TextGeometry( Math.round(this.areaValue*100)/100 + (currentUnit === units.meters ? 'm²' : 'sqft'), { font: font, size: SIZE_TEXT_CAMERA * 2/3.0, height: 0.01 } );
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

        document.getElementById('x-pos-'+ this.id).getElementsByTagName('strong')[0].innerHTML = Math.round(this.XPos * currentUnit * 10)/10.0;
        document.getElementById('y-pos-'+ this.id).getElementsByTagName('strong')[0].innerHTML = Math.round(- this.ZPos * currentUnit * 10)/10.0;
        document.getElementById('z-pos-'+ this.id).getElementsByTagName('strong')[0].innerHTML = Math.round(this.YPos * currentUnit * 10)/10.0;
        
    }

    render()
    {
        this.cameraPerspective.updateProjectionMatrix();
        this.cameraPerspectiveHelper.update();
        drawProjection(this);
    }

    remove()
    {
        console.log(this);
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

export function addCamera(construct = false, typeID = DEFAULT_CAMERA_TYPE_ID, x = 0, y = DEFAULT_CAMERA_HEIGHT, z = 0, p = 0, a = 0, r = 0)
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
        let newCamera = new Camera(cameras.length, construct, typeID, x, y, z, p, a, r)
        newCamera.addCameraToScene();
        addCameraGUI(newCamera);
        cameras.push(newCamera);
    }
}

function addCameraGUI(cam)
{
    let cameraTypesOptions = ``;
    camerasTypes.filter(c => c.recommanded).forEach(type => {
        let optionElement = `<option value="` + type.name + `" ` + (cam.type.name === type.name ? `selected` : ``) + `>` + type.name;
        cameraTypesOptions += optionElement;
        cameraTypesOptions += "</option>"
    });

    let cameraUIdiv = document.createElement('div');
    cameraUIdiv.dataset.camera = cam.id;
    cameraUIdiv.classList.add("active");
    cameraUIdiv.classList.add("cameraUI");
    
    cameraUIdiv.id = 'cam-' + (cam.id) + '-UI';
    cameraUIdiv.innerHTML = `
        <div id="cam-` + (cam.id) + `-UI-header" class="row s-p">
            <div class="row">
                <div class="camera-color" style="background-color: #`+ cam.color.getHexString() + `;"></div>
                <h1>Camera et Node ` + (cam.id + 1) + `</h1>
            </div>
            <div class="row">
                <div id="cam-` + (cam.id) + `-solo-button"><span class="iconify" data-icon="bx:search-alt-2"></span></div>
                <div id="cam-` + (cam.id) + `-hide-UI"><span class="iconify" data-icon="bx:minus"></span></div> 
                <div id="cam-` + (cam.id) + `-visible"><span class="iconify" data-icon="akar-icons:eye-open"></span></div>
                <!-- <div><span class="iconify" data-icon="fluent:lock-open-16-regular"></span></div> -->
            </div>
        </div>
        <div id="cam-infos-` + (cam.id) + `-UI">
            <div id="select-camera" class="row s-p">
                <div class="column-2 row ">
                    <select id="cam-type-` + (cam.id) + `" class="select camera-type" name="camType">
                    ` + cameraTypesOptions + `
                    </select>
                </div>
                <div class="row s-p column-2">
                    <div>
                        <p id="hfov` + cam.id + `">FOV H: <span>` + cam.type.HFov + `°</p>
                        <p id="near` + cam.id + `">NEAR: <span  data-unit=` + currentUnit + `>` + (Math.round(cam.type.rangeNear*currentUnit * 10) / 10.0) + `</span> <span data-unittext=` + currentUnit + `>` + (currentUnit === units.meters ? `m` : `ft`) + `</span></p>
                    </div>
                    <div>
                        <p id="vfov` + cam.id + `">FOV V: <span>` + cam.type.VFov + `°</p>
                        <p id="far` + cam.id + `">FAR: <span  data-unit=` + currentUnit + `>` + (Math.round(cam.type.rangeFar*currentUnit * 10) / 10.0) + `</span> <span data-unittext=` + currentUnit + `>` + (currentUnit === units.meters ? `m` : `ft`) + `</span></p>
                    </div>
                </div>
            </div>
            <div id = "cam-` + (cam.id) + `-transformations">
                <div class="row s-p">
                    <div class="2-column ">
                        <p>  Position </p>
                    </div>
                    <div class="row s-p column-2">
                        <p id="x-pos-`+ cam.id +`" class="draggable">X <strong data-unit=` + currentUnit + `>` + Math.round(cam.XPos * currentUnit * 10) /10.0 + `</strong><span data-unittext=` + currentUnit + `>` + (currentUnit === units.meters ? `m` : `ft`) +`</span></p>
                        <p id="y-pos-`+ cam.id +`" class="draggable">Y <strong data-unit=` + currentUnit + `>` + Math.round(-cam.ZPos * currentUnit * 10) /10.0 + `</strong><span data-unittext=` + currentUnit + `>` + (currentUnit === units.meters ? `m` : `ft`) +`</span></p>
                        <p id="z-pos-`+ cam.id +`" class="draggable">Z <strong data-unit=` + currentUnit + `>` + Math.round(cam.YPos * currentUnit * 10) /10.0 + `</strong><span data-unittext=` + currentUnit + `>` + (currentUnit === units.meters ? `m` : `ft`) +`</span></p>
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
                </div>
            </div>
        </div>`;

    let inspectorDiv = document.getElementById('inspector');
    inspectorDiv.appendChild(cameraUIdiv);

    document.getElementById('cam-' + (cam.id) + '-solo-button').onclick = soloCamView;
    function soloCamView()
    {
        let iconElem = this.firstChild;
        let solo = iconElem.dataset.icon === "bx:log-out";
        let frustumsButton = document.getElementById('display-frustums-button');

        let display = solo ? "block" : "none";

        let otherCams = cameras.filter(c => c.id !== cam.id);
        otherCams.forEach(c => {
            solo ? c.addCameraToScene() : c.removeCameraFromScene();
            let camUI = document.getElementById('cam-' + (c.id) + '-UI');
            camUI.style.display = display;
        });

        frustumsButton.style.display = display;

        let camTransfoDiv = document.getElementById('cam-' + (cam.id) + '-transformations');
        camTransfoDiv.style.display = display;

        if(!solo)
        {
            let camUI = document.getElementById('cam-' + (cam.id) + '-UI');
            let camHeight = document.createElement("div");
            camHeight.classList.add("row");
            camHeight.classList.add("s-p");
            camHeight.id = "cam-solo-height";
            camHeight.innerHTML = `<p> Camera height: <span data-unit=` + currentUnit + `>` + Math.round(cam.YPos * currentUnit * 10) /10.0 + `</span><span data-unittext=` + currentUnit + `>` + (currentUnit === units.meters ? `m` : `ft`) +`</span></p>`
            camUI.appendChild(camHeight);
        }
        else
        {
            document.getElementById('cam-solo-height').remove();
        }
        iconElem.dataset.icon = solo ? "bx:search-alt-2" : "bx:log-out";
    }

    document.getElementById('cam-' + (cam.id) + '-hide-UI').onclick = hideUICam;
    function hideUICam()
    {
        let camInfosUI = document.getElementById('cam-infos-' + (cam.id) + '-UI');
        let camUIheader = document.getElementById('cam-' + (cam.id) + '-UI-header');
        let hidden = camInfosUI.style.display === "none";
        camInfosUI.style.display = hidden ?  "block" : "none";
        camUIheader.style.marginBottom = hidden ? "0px" : "-100px"
        camUIheader.style.marginTop = hidden ? "0px" : "-10px"
        let iconElem = this.firstChild;
        iconElem.dataset.icon = hidden ? "bx:minus" : "bx:plus";
    }
    
    document.getElementById('cam-' + (cam.id) + '-visible').onclick = changeVisibilityofCam;
    function changeVisibilityofCam()
    {
        cam.changeVisibility();
    }

    document.getElementById('cam-type-' + cam.id).onchange = function()
    {
            cam.type = camerasTypes.find(type => type.name === document.getElementById('cam-type-' + cam.id).value)
            
            document.getElementById('hfov' + cam.id + '').innerHTML = 'FOV H: ' + cam.type.HFov + '°';
            document.getElementById('vfov' + cam.id + '').innerHTML = 'FOV V: ' + cam.type.VFov + '°';
            document.getElementById('near' + cam.id + '').innerHTML = 'NEAR: ' + (Math.round(cam.type.rangeNear*currentUnit * 10) / 10.0) + (currentUnit === units.meters ? 'm' : "ft");
            document.getElementById('far' + cam.id + '').innerHTML = 'FAR: ' + (Math.round(cam.type.rangeFar*currentUnit * 10) / 10.0) + (currentUnit === units.meters ? 'm' : "ft");
         
            
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
                cam.XPos = value / currentUnit;
                cam.cameraPerspective.position.x = cam.XPos;
                cam.mesh.position.set( cam.XPos, cam.YPos, cam.ZPos );
                break;
            case "y":
                cam.ZPos = - value / currentUnit;
                cam.cameraPerspective.position.z = cam.ZPos;
                cam.mesh.position.set( cam.XPos, cam.YPos, cam.ZPos );
                break;
            case "z":
                cam.YPos = value / currentUnit;
                cam.cameraPerspective.position.y = cam.YPos;
                cam.mesh.position.set( cam.XPos, cam.YPos, cam.ZPos );
                break;
            case "pitch":
                /*cam.cameraPerspective.rotateOnWorldAxis(cam.xRotationAxis, value * (Math.PI / 180.0) - cam.pitch);*/
                cam.cameraPerspective.rotateOnWorldAxis(new THREE.Vector3(1,0,0), value * (Math.PI / 180.0) - cam.pitch);
                cam.pitch = value * (Math.PI / 180.0);
                break;
            case "yaw":
                /*cam.cameraPerspective.rotateOnWorldAxis(new THREE.Vector3(0,1,0), value * (Math.PI / 180.0) - cam.yaw);
                cam.xRotationAxis.applyAxisAngle(new THREE.Vector3(0,1,0), value * (Math.PI / 180.0) - cam.yaw);
                cam.xRotationAxis.normalize();
                cam.yaw = value * (Math.PI / 180.0);*/
                let rotateYawAxis = new THREE.Vector3(0,1,0);
                rotateYawAxis.applyAxisAngle(new THREE.Vector3(0,0,- 1), - cam.roll);
                cam.cameraPerspective.rotateOnAxis(rotateYawAxis, value * (Math.PI / 180.0) - cam.yaw);
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
export function resetCams()
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