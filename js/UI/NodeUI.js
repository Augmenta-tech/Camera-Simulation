import { Vector3 } from 'three'

import { camerasTypes, units } from '/js/data.js'

class NodeUI{
    constructor(node, currentUnit, sceneObjects)
    {
        buildUIDiv();
        bindEventListeners();

        function buildUIDiv()
        {
            let cameraTypesOptions = ``;
            camerasTypes.filter(c => c.recommended).forEach(type => {
                const optionElement = `<option value="` + type.name + `" ` + (node.cameraType.name === type.name ? `selected` : ``) + `>` + type.name;
                cameraTypesOptions += optionElement;
                cameraTypesOptions += "</option>"
            });
        
            const nodeUIdiv = document.createElement('div');
            nodeUIdiv.classList.add("nodeUI");
            
            nodeUIdiv.id = 'node-' + (node.id) + '-UI';
            nodeUIdiv.innerHTML = `
                <div id="node-` + (node.id) + `-UI-header" class="row center-x-spaced center-y">
                    <div class="row center-y">
                        <div class="node-color" style="background-color: #`+ node.color.getHexString() + `;"></div>
                        <p class="main-text">Node + Sensor ` + (node.id + 1) + `</p>
                    </div>
                    <div class="row center-y">
                        <!-- <div id="node-` + (node.id) + `-solo-button"><span class="iconify" data-icon="bx:search-alt-2"></span></div> -->
                        <div id="node-` + (node.id) + `-hide-UI"><span class="iconify" data-icon="bx:minus"></span></div> 
                        <div id="node-` + (node.id) + `-visible"><span class="iconify" data-icon="akar-icons:eye-open"></span></div>
                        <!-- <div><span class="iconify" data-icon="fluent:lock-open-16-regular"></span></div> -->
                    </div>
                </div>
                <div id="node-infos-` + (node.id) + `-UI">
                    <div id="select-camera" class="row center-y">
                        <select id="cam-type-` + (node.id) + `" class="select-camera-type main-text" name="camType">
                        ` + cameraTypesOptions + `
                        </select>
                    </div>
                    <div id = "node-` + (node.id) + `-transformations">
                        <div class="row node-transformations">
                            <p class="main-text">Position</p>
                            <div>
                                <p id="x-pos-`+ node.id +`" class="draggable">X <strong data-unit=` + currentUnit.value + `>` + Math.round(node.xPos * currentUnit.value * 100) /100.0 + `</strong><span data-unittext=` + currentUnit.value + `>` + currentUnit.label +`</span></p>
                            </div>
                            <div>
                                <p id="y-pos-`+ node.id +`" class="draggable">Y <strong data-unit=` + currentUnit.value + `>` + Math.round(-node.zPos * currentUnit.value * 100) /100.0 + `</strong><span data-unittext=` + currentUnit.value + `>` + currentUnit.label +`</span></p>
                            </div>
                            <div>
                                <p id="z-pos-`+ node.id +`" class="draggable">Z <strong data-unit=` + currentUnit.value + `>` + Math.round(node.yPos * currentUnit.value * 100) /100.0 + `</strong><span data-unittext=` + currentUnit.value + `>` + currentUnit.label +`</span></p>
                            </div>
                        </div>
                        <div class="row node-transformations">
                            <p class="main-text">Rotation</p>
                            <div>
                                <p id="x-rot-`+ node.id +`" class="draggable">X <strong>` + Math.round(node.xRot*180/Math.PI) + `</strong>°</p>
                            </div>
                            <div>
                                <p id="y-rot-`+ node.id +`" class="draggable">Y <strong>` + Math.round(node.yRot*180/Math.PI) + `</strong>°</p>
                            </div>
                            <div>
                                <p id="z-rot-`+ node.id +`" class="draggable">Z <strong>` + Math.round(node.zRot*180/Math.PI) + `</strong>° </p>
                            </div>
                        </div>
                    </div>
                    <div class="cam-specs">
                        <div class="row">
                            <p class="spec-title main-text">FOV</p>
                            <p>H</p><p id="hfov` + node.id + `">` + node.cameraType.HFov + `°</p>
                            <p>V</p><p id="vfov` + node.id + `">` + node.cameraType.VFov + `°</p>
                        </div>
                        <div class="row">
                            <p class="spec-title main-text">Distance</p>
                            <p>Near</p><p><span id="near` + node.id + `" data-unit=` + currentUnit.value + `>` + (Math.round(node.cameraPerspective.near*currentUnit.value * 100) / 100.0) + `</span> <span data-unittext=` + currentUnit.value + `>` + currentUnit.label + `</span></p>
                            <p>Far</p><p><span id="far` + node.id + `" data-unit=` + currentUnit.value + `>` + (Math.round(node.cameraPerspective.far*currentUnit.value * 100) / 100.0) + `</span> <span data-unittext=` + currentUnit.value + `>` + currentUnit.label + `</span></p>
                        </div>
                    </div>
                </div>`;


            const sensorDiv = document.getElementById('sensors-infos');
            sensorDiv.appendChild(nodeUIdiv);

            return nodeUIdiv;
        }

        function bindEventListeners()
        {
            
            makeElementDraggable(document.getElementById("x-pos-" + node.id));
            makeElementDraggable(document.getElementById("y-pos-" + node.id));
            makeElementDraggable(document.getElementById("z-pos-" + node.id));
            makeElementDraggable(document.getElementById("x-rot-" + node.id));
            makeElementDraggable(document.getElementById("y-rot-" + node.id));
            makeElementDraggable(document.getElementById("z-rot-" + node.id));
        
    
            document.getElementById('node-' + (node.id) + '-hide-UI').addEventListener('click', () => hideUICam());
            document.getElementById('node-' + (node.id) + '-visible').addEventListener('click', () => changeVisibilityofCam());
        
            document.getElementById('cam-type-' + node.id).addEventListener('change', () => changeCameraType());
        }

        function makeElementDraggable(element) {
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
                                node.xPos = value / currentUnit.value;
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
                                node.zPos = value / currentUnit.value;
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
                                node.yPos = value / currentUnit.value;
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

        function hideUICam()
        {
            const camInfosUI = document.getElementById('node-infos-' + (node.id) + '-UI');
            const camUIheader = document.getElementById('node-' + (node.id) + '-UI-header');
            const hidden = camInfosUI.classList.contains('hidden');
            hidden ? camInfosUI.classList.remove('hidden') : camInfosUI.classList.add('hidden');
            camUIheader.style.marginBottom = hidden ? "0px" : "-100px"
            camUIheader.style.marginTop = hidden ? "0px" : "-4px"
            const iconElem = document.getElementById('node-' + (node.id) + '-hide-UI').firstChild;
            iconElem.dataset.icon = hidden ? "bx:minus" : "bx:plus";
        }

        function changeVisibilityofCam()
        {
            node.changeVisibility();
            sceneObjects.updateFrustumIcon();
        }

        function changeCameraType()
        {
            node.cameraType = camerasTypes.find(type => type.name === document.getElementById('cam-type-' + node.id).value);

            node.cameraPerspective.fov = node.cameraType.VFov;
            node.cameraPerspective.aspect = node.cameraType.aspectRatio;
            node.cameraPerspective.near = node.cameraType.rangeNear;
            switch(node.trackingMode)
            {
                case 'hand-tracking':
                    node.cameraPerspective.far = node.cameraType.handFar;
                    break;
                case 'human-tracking':
                default:
                    node.cameraPerspective.far = node.cameraType.rangeFar;
                    break;
            }
            document.getElementById('hfov' + node.id).innerHTML = node.cameraType.HFov + '°';
            document.getElementById('vfov' + node.id).innerHTML = node.cameraType.VFov + '°';
            document.getElementById('near' + node.id).innerHTML = (Math.round(node.cameraPerspective.near*document.getElementById('near' + node.id).dataset.unit * 100) / 100.0);
            document.getElementById('far' + node.id).innerHTML = (Math.round(node.cameraPerspective.far*document.getElementById('far' + node.id).dataset.unit * 100) / 100.0);
        }

        this.changeFar = function()
        {
            document.getElementById('far' + node.id).innerHTML = (Math.round(node.cameraPerspective.far*document.getElementById('far' + node.id).dataset.unit * 100) / 100.0);
        }

        this.changeVisibility = function(visible)
        {
            const iconElem = document.getElementById('node-' + (node.id) + '-visible').firstElementChild;
            iconElem.dataset.icon = visible ? "akar-icons:eye-open" : "akar-icons:eye-slashed";
        }

        this.updatePosition = function(x, y, z, currentUnitValue)
        {
            document.getElementById('x-pos-'+ node.id).getElementsByTagName('strong')[0].innerHTML = Math.round(x * currentUnitValue * 100)/100.0;
            document.getElementById('y-pos-'+ node.id).getElementsByTagName('strong')[0].innerHTML = Math.round(z * currentUnitValue * 100)/100.0;
            document.getElementById('z-pos-'+ node.id).getElementsByTagName('strong')[0].innerHTML = Math.round(y * currentUnitValue * 100)/100.0;
        }
    }
}

export { NodeUI }
