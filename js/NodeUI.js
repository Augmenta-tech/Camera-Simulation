import { Vector3 } from 'three'

import { camerasTypes, units } from './cameras.js'

class NodeUI{
    constructor(_node, sceneManager)
    {
        buildUIDiv(_node);
        bindEventListeners(_node);

        function buildUIDiv(node)
        {
            let cameraTypesOptions = ``;
            camerasTypes.filter(c => c.recommended).forEach(type => {
                const optionElement = `<option value="` + type.name + `" ` + (node.cameraType.name === type.name ? `selected` : ``) + `>` + type.name;
                cameraTypesOptions += optionElement;
                cameraTypesOptions += "</option>"
            });
        
            const nodeUIdiv = document.createElement('div');
            nodeUIdiv.dataset.camera = node.id;
            nodeUIdiv.classList.add("active");
            nodeUIdiv.classList.add("nodeUI");
            
            nodeUIdiv.id = 'node-' + (node.id) + '-UI';
            nodeUIdiv.innerHTML = `
                <div id="node-` + (node.id) + `-UI-header" class="row s-p">
                    <div class="row">
                        <div class="node-color" style="background-color: #`+ node.color.getHexString() + `;"></div>
                        <h1>Node + Sensor ` + (node.id + 1) + `</h1>
                    </div>
                    <div class="row">
                        <!-- <div id="node-` + (node.id) + `-solo-button"><span class="iconify" data-icon="bx:search-alt-2"></span></div> -->
                        <div id="node-` + (node.id) + `-hide-UI"><span class="iconify" data-icon="bx:minus"></span></div> 
                        <div id="node-` + (node.id) + `-visible"><span class="iconify" data-icon="akar-icons:eye-open"></span></div>
                        <!-- <div><span class="iconify" data-icon="fluent:lock-open-16-regular"></span></div> -->
                    </div>
                </div>
                <div id="node-infos-` + (node.id) + `-UI">
                    <div id="select-camera" class="row s-p">
                        <div class="column-2 row ">
                            <select id="cam-type-` + (node.id) + `" class="select camera-type" name="camType">
                            ` + cameraTypesOptions + `
                            </select>
                        </div>
                        <div class="row s-p column-2">
                            <div>
                                <p id="hfov` + node.id + `">FOV H: ` + node.cameraType.HFov + `°</p>
                                <p id="near` + node.id + `">NEAR: <span  data-unit=` + sceneManager.currentUnit + `>` + (Math.round(node.cameraType.rangeNear*sceneManager.currentUnit * 100) / 100.0) + `</span> <span data-unittext=` + sceneManager.currentUnit + `>` + (sceneManager.currentUnit === units.meters ? `m` : `ft`) + `</span></p>
                            </div>
                            <div>
                                <p id="vfov` + node.id + `">FOV V: ` + node.cameraType.VFov + `°</p>
                                <p id="far` + node.id + `">FAR: <span  data-unit=` + sceneManager.currentUnit + `>` + (Math.round(node.cameraType.rangeFar*sceneManager.currentUnit * 100) / 100.0) + `</span> <span data-unittext=` + sceneManager.currentUnit + `>` + (sceneManager.currentUnit === units.meters ? `m` : `ft`) + `</span></p>
                            </div>
                        </div>
                    </div>
                    <div id = "node-` + (node.id) + `-transformations">
                        <div class="row s-p">
                            <div class="2-column ">
                                <p>  Position </p>
                            </div>
                            <div class="row s-p column-2">
                                <p id="x-pos-`+ node.id +`" class="draggable">X <strong data-unit=` + sceneManager.currentUnit + `>` + Math.round(node.xPos * sceneManager.currentUnit * 100) /100.0 + `</strong><span data-unittext=` + sceneManager.currentUnit + `>` + (sceneManager.currentUnit === units.meters ? `m` : `ft`) +`</span></p>
                                <p id="y-pos-`+ node.id +`" class="draggable">Y <strong data-unit=` + sceneManager.currentUnit + `>` + Math.round(-node.zPos * sceneManager.currentUnit * 100) /100.0 + `</strong><span data-unittext=` + sceneManager.currentUnit + `>` + (sceneManager.currentUnit === units.meters ? `m` : `ft`) +`</span></p>
                                <p id="z-pos-`+ node.id +`" class="draggable">Z <strong data-unit=` + sceneManager.currentUnit + `>` + Math.round(node.yPos * sceneManager.currentUnit * 100) /100.0 + `</strong><span data-unittext=` + sceneManager.currentUnit + `>` + (sceneManager.currentUnit === units.meters ? `m` : `ft`) +`</span></p>
                            </div>
                        </div>
                        <div  class="row s-p">
                            <div class="2-column ">
                                <p>  Rotation </p>
                            </div>
                            <div class="row s-p column-2">
                                <p id="x-rot-`+ node.id +`" class="draggable">X <strong>` + Math.round(node.xRot*180/Math.PI) + `</strong>°</p>
                                <p id="y-rot-`+ node.id +`" class="draggable">Y <strong>` + Math.round(node.yRot*180/Math.PI) + `</strong>°</p>
                                <p id="z-rot-`+ node.id +`" class="draggable">Z <strong>` + Math.round(node.zRot*180/Math.PI) + `</strong>° </p>
                            </div>
                        </div>
                    </div>
                </div>`;


            const sensorDiv = document.getElementById('sensors');
            sensorDiv.appendChild(nodeUIdiv);

            return nodeUIdiv;
        }

        function bindEventListeners(node)
        {
            
            makeElementDraggable(document.getElementById("x-pos-" + node.id), node);
            makeElementDraggable(document.getElementById("y-pos-" + node.id), node);
            makeElementDraggable(document.getElementById("z-pos-" + node.id), node);
            makeElementDraggable(document.getElementById("x-rot-" + node.id), node);
            makeElementDraggable(document.getElementById("y-rot-" + node.id), node);
            makeElementDraggable(document.getElementById("z-rot-" + node.id), node);
        
    
            document.getElementById('node-' + (node.id) + '-hide-UI').addEventListener('click', () => hideUICam(node));
            document.getElementById('node-' + (node.id) + '-visible').addEventListener('click', () => changeVisibilityofCam(node));
        
            document.getElementById('cam-type-' + node.id).addEventListener('change', () => changeCameraType(node));
        }

        function makeElementDraggable(element, node) {
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
                        fac = 1 / 100.0;
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
                        switch(element.id.split('-')[1])
                        {
                            case "pos" :
                                node.xPos = value / sceneManager.currentUnit;
                                node.cameraPerspective.position.x = node.xPos;
                                node.mesh.position.set( node.xPos, node.yPos, node.zPos );
                                break;
                            case "rot":
                                /*node.cameraPerspective.rotateOnWorldAxis(node.xRotationAxis, value * (Math.PI / 180.0) - node.pitch);*/
                                node.cameraPerspective.rotateOnWorldAxis(new Vector3(1,0,0), value * (Math.PI / 180.0) - node.xRot);
                                node.xRot = value * (Math.PI / 180.0);
                                break;
                            default:
                                break;
                        }
                        break;
                    case "y":
                        switch(element.id.split('-')[1])
                        {
                            case "pos" :
                                node.zPos = value / sceneManager.currentUnit;
                                node.cameraPerspective.position.z = node.zPos;
                                node.mesh.position.set( node.xPos, node.yPos, node.zPos );
                                break;
                            case "rot":
                                /*node.cameraPerspective.rotateOnWorldAxis(new Vector3(0,1,0), value * (Math.PI / 180.0) - node.yaw);
                                node.xRotationAxis.applyAxisAngle(new Vector3(0,1,0), value * (Math.PI / 180.0) - node.yaw);
                                node.xRotationAxis.normalize();
                                node.yaw = value * (Math.PI / 180.0);*/
                                const rotateYAxis = new Vector3(0,1,0);
                                rotateYAxis.applyAxisAngle(new Vector3(0,0,- 1), - node.zRot);
                                node.cameraPerspective.rotateOnAxis(rotateYAxis, -(value * (Math.PI / 180.0) - node.yRot));
                                node.yRot = value * (Math.PI / 180.0);
                                break;
                            default:
                                break;
                        }
                        break;
                    case "z":
                        switch(element.id.split('-')[1])
                        {
                            case "pos" :
                                node.yPos = value / sceneManager.currentUnit;
                                node.cameraPerspective.position.y = node.yPos;
                                node.mesh.position.set( node.xPos, node.yPos, node.zPos );
                                break;
                            case "rot":
                                const rotateZAxis = new Vector3();
                                node.cameraPerspective.getWorldDirection(rotateZAxis);
                                node.cameraPerspective.rotateOnWorldAxis(rotateZAxis,-(value * (Math.PI / 180.0) - node.zRot));
                                node.zRot = value * (Math.PI / 180.0);
                                break;
                            default:
                                break;
                        }
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

        function hideUICam(node)
        {
            const camInfosUI = document.getElementById('node-infos-' + (node.id) + '-UI');
            const camUIheader = document.getElementById('node-' + (node.id) + '-UI-header');
            const hidden = camInfosUI.style.display === "none";
            camInfosUI.style.display = hidden ?  "block" : "none";
            camUIheader.style.marginBottom = hidden ? "0px" : "-100px"
            camUIheader.style.marginTop = hidden ? "0px" : "-4px"
            const iconElem = document.getElementById('node-' + (node.id) + '-hide-UI').firstChild;
            iconElem.dataset.icon = hidden ? "bx:minus" : "bx:plus";
        }

        function changeVisibilityofCam(node)
        {
            node.changeVisibility();
            sceneManager.updateFrustumIcon();
        }

        function changeCameraType(node)
        {
            node.cameraType = camerasTypes.find(type => type.name === document.getElementById('cam-type-' + node.id).value)
            
            document.getElementById('hfov' + node.id + '').innerHTML = 'FOV H: ' + node.cameraType.HFov + '°';
            document.getElementById('vfov' + node.id + '').innerHTML = 'FOV V: ' + node.cameraType.VFov + '°';
            document.getElementById('near' + node.id + '').innerHTML = 'NEAR: <span data-unit=' + sceneManager.currentUnit + '>' + (Math.round(node.cameraType.rangeNear*sceneManager.currentUnit * 100) / 100.0) + '</span> <span data-unittext=' + sceneManager.currentUnit + '>' + (sceneManager.currentUnit === units.meters ? 'm' : "ft") + '</span>';
            document.getElementById('far' + node.id + '').innerHTML = 'FAR: <span data-unit=' + sceneManager.currentUnit + '>' + (Math.round(node.cameraType.rangeFar*sceneManager.currentUnit * 100) / 100.0) + '</span> <span data-unittext=' + sceneManager.currentUnit + '>' + (sceneManager.currentUnit === units.meters ? 'm' : "ft") + '</span>';
            
            node.cameraPerspective.fov = node.cameraType.VFov;
            node.cameraPerspective.aspect = node.cameraType.aspectRatio;
            node.cameraPerspective.near = node.cameraType.rangeNear;
            switch(document.getElementById('tracking-mode-inspector').value)
            {
                case 'hand-tracking':
                    node.cameraPerspective.far = node.cameraType.handFar;
                    break;
                case 'human-tracking':
                default:
                    node.cameraPerspective.far = node.cameraType.rangeFar;
                    break;
            }
        }
    }
}

export { NodeUI }

/*
function addCameraGUI(node)
{
    
    document.getElementById('node-' + (node.id) + '-solo-button').onclick = soloCamView;
    function soloCamView()
    {
        const iconElem = this.firstChild;
        const solo = iconElem.dataset.icon === "bx:log-out";
        const frustumsButton = document.getElementById('display-frustums-button');

        const display = solo ? "block" : "none";

        const otherCams = cameras.filter(c => c.id !== node.id);
        otherCams.forEach(c => {
            solo ? c.addCameraToScene() : c.removeCameraFromScene();
            const camUI = document.getElementById('node-' + (c.id) + '-UI');
            camUI.style.display = display;
        });

        frustumsButton.style.display = display;

        const camTransfoDiv = document.getElementById('node-' + (node.id) + '-transformations');
        camTransfoDiv.style.display = display;

        if(!solo)
        {
            const camUI = document.getElementById('node-' + (node.id) + '-UI');
            const camHeight = document.createElement("div");
            camHeight.classList.add("row");
            camHeight.classList.add("s-p");
            camHeight.id = "node-solo-height";
            camHeight.innerHTML = `<p> Camera height: <span data-unit=` + sceneManager.currentUnit + `>` + Math.round(node.YPos * sceneManager.currentUnit * 100) /100.0 + `</span><span data-unittext=` + sceneManager.currentUnit + `>` + (sceneManager.currentUnit === units.meters ? `m` : `ft`) +`</span></p>`
            camUI.appendChild(camHeight);
        }
        else
        {
            document.getElementById('node-solo-height').remove();
        }
        iconElem.dataset.icon = solo ? "bx:search-alt-2" : "bx:log-out";
    }
}
*/
