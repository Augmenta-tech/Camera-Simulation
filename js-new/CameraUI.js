import { Vector3 } from 'three'

import { camerasTypes, units } from './cameras.js'

class CameraUI{
    constructor(_camera, currentUnit)
    {
        this.camera = _camera;

        this.element = buildUIDiv(this.camera)

        bindEventListeners(this);

        function buildUIDiv(cam)
        {
            let cameraTypesOptions = ``;
            camerasTypes.filter(c => c.recommanded).forEach(type => {
                let optionElement = `<option value="` + type.name + `" ` + (cam.type.name === type.name ? `selected` : ``) + `>` + type.name;
                cameraTypesOptions += optionElement;
                cameraTypesOptions += "</option>"
            });
        
            const cameraUIdiv = document.createElement('div');
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
                        <!-- <div id="cam-` + (cam.id) + `-solo-button"><span class="iconify" data-icon="bx:search-alt-2"></span></div> -->
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


            const inspectorDiv = document.getElementById('inspector');
            inspectorDiv.appendChild(cameraUIdiv);

            return cameraUIdiv;
        }

        function bindEventListeners(cameraUI)
        {
            console.log(cameraUI);
            //Make elements draggable:
            dragElement(document.getElementById("x-pos-" + cameraUI.camera.id), cameraUI.camera);
            dragElement(document.getElementById("y-pos-" + cameraUI.camera.id), cameraUI.camera);
            dragElement(document.getElementById("z-pos-" + cameraUI.camera.id), cameraUI.camera);
            dragElement(document.getElementById("pitch-rot-" + cameraUI.camera.id), cameraUI.camera);
            dragElement(document.getElementById("yaw-rot-" + cameraUI.camera.id), cameraUI.camera);
            dragElement(document.getElementById("roll-rot-" + cameraUI.camera.id), cameraUI.camera);
        
        
            document.getElementById('cam-' + (cameraUI.camera.id) + '-hide-UI').addEventListener('click', () => hideUICam(cameraUI.camera));
            document.getElementById('cam-' + (cameraUI.camera.id) + '-visible').addEventListener('click', () => changeVisibilityofCam(cameraUI.camera));
        
            document.getElementById('cam-type-' + cameraUI.camera.id).addEventListener('click', () => changeCameraType(cameraUI.camera));
        }

        /**
         * Make an UI element draggable
         * @param {Element} element the element you want to be draggable
         */
        function dragElement(element, cam) {
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
                        cam.cameraPerspective.rotateOnWorldAxis(new Vector3(1,0,0), value * (Math.PI / 180.0) - cam.pitch);
                        cam.pitch = value * (Math.PI / 180.0);
                        break;
                    case "yaw":
                        /*cam.cameraPerspective.rotateOnWorldAxis(new Vector3(0,1,0), value * (Math.PI / 180.0) - cam.yaw);
                        cam.xRotationAxis.applyAxisAngle(new Vector3(0,1,0), value * (Math.PI / 180.0) - cam.yaw);
                        cam.xRotationAxis.normalize();
                        cam.yaw = value * (Math.PI / 180.0);*/
                        const rotateYawAxis = new Vector3(0,1,0);
                        rotateYawAxis.applyAxisAngle(new Vector3(0,0,- 1), - cam.roll);
                        cam.cameraPerspective.rotateOnAxis(rotateYawAxis, value * (Math.PI / 180.0) - cam.yaw);
                        cam.yaw = value * (Math.PI / 180.0);
                        break;
                    case "roll":
                        const rotationAxis = new Vector3();
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

        function hideUICam(cam)
        {
            const camInfosUI = document.getElementById('cam-infos-' + (cam.id) + '-UI');
            const camUIheader = document.getElementById('cam-' + (cam.id) + '-UI-header');
            const hidden = camInfosUI.style.display === "none";
            camInfosUI.style.display = hidden ?  "block" : "none";
            camUIheader.style.marginBottom = hidden ? "0px" : "-100px"
            camUIheader.style.marginTop = hidden ? "0px" : "-10px"
            const iconElem = document.getElementById('cam-' + (cam.id) + '-hide-UI').firstChild;
            iconElem.dataset.icon = hidden ? "bx:minus" : "bx:plus";
        }

        function changeVisibilityofCam(cam)
        {
            cam.changeVisibility();
        }

        function changeCameraType(cam)
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
    }
}

export { CameraUI }

/*
function addCameraGUI(cam)
{
    
    document.getElementById('cam-' + (cam.id) + '-solo-button').onclick = soloCamView;
    function soloCamView()
    {
        const iconElem = this.firstChild;
        const solo = iconElem.dataset.icon === "bx:log-out";
        const frustumsButton = document.getElementById('display-frustums-button');

        const display = solo ? "block" : "none";

        const otherCams = cameras.filter(c => c.id !== cam.id);
        otherCams.forEach(c => {
            solo ? c.addCameraToScene() : c.removeCameraFromScene();
            const camUI = document.getElementById('cam-' + (c.id) + '-UI');
            camUI.style.display = display;
        });

        frustumsButton.style.display = display;

        const camTransfoDiv = document.getElementById('cam-' + (cam.id) + '-transformations');
        camTransfoDiv.style.display = display;

        if(!solo)
        {
            const camUI = document.getElementById('cam-' + (cam.id) + '-UI');
            const camHeight = document.createElement("div");
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
}
*/
