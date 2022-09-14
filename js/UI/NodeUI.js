import { Vector3 } from 'three'

import { camerasTypes, units } from '/js/data.js'
import { Node } from '/js/scene/objects/sensors/Node.js'

class NodeUI{
    constructor(node, sceneManager)
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
            nodeUIdiv.classList.add("sensorUI");
            
            nodeUIdiv.id = 'node-' + (node.id) + '-UI';
            nodeUIdiv.innerHTML = `
                <div id="node-` + (node.id) + `-UI-header" class="row center-x-spaced center-y">
                    <div class="row center-y">
                        <div class="sensor-color" style="background-color: #`+ node.color.getHexString() + `;"></div>
                        <p class="main-text">Node + Sensor ` + (node.id + 1) + `</p>
                    </div>
                    <div class="row center-y">
                        <!-- <div id="node-` + (node.id) + `-solo-button"><span class="iconify" data-icon="bx:search-alt-2"></span></div> -->
                        <div id="node-` + (node.id) + `-hide-UI"><span class="iconify" data-icon="bx:minus"></span></div> 
                        <div id="node-` + (node.id) + `-visible"><span class="iconify" data-icon="akar-icons:eye-open"></span></div>
                        <!-- <div><span class="iconify" data-icon="fluent:lock-open-16-regular"></span></div> -->
                    </div>
                </div>
                <div id="node-infos-` + (node.id) + `-UI" class="column sections-container space-y">
                    <div id="select-camera" class="row center-y">
                        <select title="camType-` + (node.id) + `" name="camType-` + (node.id) + `" id="cam-type-` + (node.id) + `">
                        ` + cameraTypesOptions + `
                        </select>
                    </div>
                    <div class="row sensor-transformations">
                        <p class="main-text">Position</p>
                        <div>
                            <p id="node-x-pos-`+ node.id +`" class="draggable">X <strong data-unit=` + sceneManager.currentUnit.value + `>` + Math.round(node.xPos * sceneManager.currentUnit.value * 100) /100.0 + `</strong><span data-unittext=` + sceneManager.currentUnit.value + `>` + sceneManager.currentUnit.label +`</span></p>
                        </div>
                        <div>
                            <p id="node-y-pos-`+ node.id +`" class="draggable">Y <strong data-unit=` + sceneManager.currentUnit.value + `>` + Math.round(node.yPos * sceneManager.currentUnit.value * 100) /100.0 + `</strong><span data-unittext=` + sceneManager.currentUnit.value + `>` + sceneManager.currentUnit.label +`</span></p>
                        </div>
                        <div>
                            <p id="node-z-pos-`+ node.id +`" class="draggable">Z <strong data-unit=` + sceneManager.currentUnit.value + `>` + Math.round(node.zPos * sceneManager.currentUnit.value * 100) /100.0 + `</strong><span data-unittext=` + sceneManager.currentUnit.value + `>` + sceneManager.currentUnit.label +`</span></p>
                        </div>
                    </div>
                    <div class="row sensor-transformations">
                        <p class="main-text">Rotation</p>
                        <div>
                            <p id="node-x-rot-`+ node.id +`" class="draggable">X <strong>` + Math.round(node.xRot*180/Math.PI) + `</strong>°</p>
                        </div>
                        <div>
                            <p id="node-y-rot-`+ node.id +`" class="draggable">Y <strong>` + Math.round(node.yRot*180/Math.PI) + `</strong>°</p>
                        </div>
                        <div>
                            <p id="node-z-rot-`+ node.id +`" class="draggable">Z <strong>` + Math.round(node.zRot*180/Math.PI) + `</strong>° </p>
                        </div>
                    </div>
                    <div class="row cam-spec">
                        <p class="spec-title main-text">FOV</p>
                        <p>H</p><p id="hfov` + node.id + `">` + node.cameraType.HFov + `°</p>
                        <p>V</p><p id="vfov` + node.id + `">` + node.cameraType.VFov + `°</p>
                    </div>
                    <div class="row cam-spec">
                        <p class="spec-title main-text">Distance</p>
                        <p>Near</p><p><span id="node-near` + node.id + `" data-unit=` + sceneManager.currentUnit.value + `>` + (Math.round(node.cameraPerspective.near*sceneManager.currentUnit.value * 100) / 100.0) + `</span> <span data-unittext=` + sceneManager.currentUnit.value + `>` + sceneManager.currentUnit.label + `</span></p>
                        <p>Far</p><p><span id="node-far` + node.id + `" data-unit=` + sceneManager.currentUnit.value + `>` + (Math.round(node.cameraPerspective.far*sceneManager.currentUnit.value * 100) / 100.0) + `</span> <span data-unittext=` + sceneManager.currentUnit.value + `>` + sceneManager.currentUnit.label + `</span></p>
                    </div>
                </div>`;

            /*
            const sensorDiv = document.getElementById('sensors-infos');
            sensorDiv.appendChild(nodeUIdiv);
            */
            const inpsectorDiv = document.getElementById('inspector');
            inpsectorDiv.appendChild(nodeUIdiv);
        }

        function bindEventListeners()
        {
            
            makeElementDraggable(document.getElementById("node-x-pos-" + node.id));
            makeElementDraggable(document.getElementById("node-y-pos-" + node.id));
            makeElementDraggable(document.getElementById("node-z-pos-" + node.id));
            makeElementDraggable(document.getElementById("node-x-rot-" + node.id));
            makeElementDraggable(document.getElementById("node-y-rot-" + node.id));
            makeElementDraggable(document.getElementById("node-z-rot-" + node.id));
        
    
            document.getElementById('node-' + (node.id) + '-hide-UI').addEventListener('click', () => hideUICam());
            document.getElementById('node-' + (node.id) + '-visible').addEventListener('click', () => node.changeVisibility());
        
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
                valueElement.classList.add('underlined');
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
                switch(element.id.split('-')[2])
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
        
                switch(element.id.split('-')[1])
                {
                    case "x":
                        switch(element.id.split('-')[2])
                        {
                            case "pos" :
                                node.xPos = value / sceneManager.currentUnit.value;
                                node.cameraPerspective.position.x = node.xPos;
                                node.mesh.position.set( node.xPos, node.zPos, node.yPos );
                                break;
                            case "rot":
                                node.xRot = value * (Math.PI / 180.0);
                                node.cameraPerspective.rotation.x = node.xRot + Node.DEFAULT_NODE_ROTATION_X;
                                break;
                            default:
                                break;
                        }
                        break;
                    case "y":
                        switch(element.id.split('-')[2])
                        {
                            case "pos" :
                                node.yPos = value / sceneManager.currentUnit.value;
                                node.cameraPerspective.position.z = node.yPos;
                                node.mesh.position.set(node.xPos, node.zPos, node.yPos);
                                break;
                            case "rot":
                                node.yRot = value * (Math.PI / 180.0);
                                node.cameraPerspective.rotation.y = - node.yRot; // -90° applied on X axis by default. Locally, the coordinate system is z up and y toward depth. Our y is forward, so rotation.y = - ourRotY
                                break;
                            default:
                                break;
                        }
                        break;
                    case "z":
                        switch(element.id.split('-')[2])
                        {
                            case "pos" :
                                node.zPos = value / sceneManager.currentUnit.value;
                                node.cameraPerspective.position.y = node.zPos;
                                node.mesh.position.set( node.xPos, node.zPos, node.yPos );
                                break;
                            case "rot":
                                node.zRot = value * (Math.PI / 180.0);
                                node.cameraPerspective.rotation.z = node.zRot; // -90° applied on X axis by default. Locally, the coordinate system is z up and y toward depth. So rotation.z = ourRotZ
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
                if(valueElement.classList.contains('underlined')) valueElement.classList.remove('underlined');
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
            const iconElem = document.getElementById('node-' + (node.id) + '-hide-UI').firstChild;
            iconElem.dataset.icon = hidden ? "bx:minus" : "bx:plus";
        }

        function changeCameraType()
        {
            node.cameraType = camerasTypes.find(type => type.name === document.getElementById('cam-type-' + node.id).value);

            node.cameraPerspective.fov = node.cameraType.VFov;
            node.cameraPerspective.aspect = node.cameraType.aspectRatio;
            node.cameraPerspective.near = node.cameraType.rangeNear;
            switch(sceneManager.trackingMode)
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
            document.getElementById('node-near' + node.id).innerHTML = (Math.round(node.cameraPerspective.near*document.getElementById('node-near' + node.id).dataset.unit * 100) / 100.0);
            document.getElementById('node-far' + node.id).innerHTML = (Math.round(node.cameraPerspective.far*document.getElementById('node-far' + node.id).dataset.unit * 100) / 100.0);
        }

        this.changeFar = function()
        {
            document.getElementById('node-far' + node.id).innerHTML = (Math.round(node.cameraPerspective.far*document.getElementById('node-far' + node.id).dataset.unit * 100) / 100.0);
        }

        this.changeVisibility = function(visible)
        {
            const iconElem = document.getElementById('node-' + (node.id) + '-visible').firstElementChild;
            iconElem.dataset.icon = visible ? "akar-icons:eye-open" : "akar-icons:eye-slashed";
            sceneManager.objects.updateFrustumIcon();
        }

        this.updatePosition = function(x, y, z, currentUnitValue)
        {
            document.getElementById('node-x-pos-'+ node.id).getElementsByTagName('strong')[0].innerHTML = Math.round(x * currentUnitValue * 100)/100.0;
            document.getElementById('node-y-pos-'+ node.id).getElementsByTagName('strong')[0].innerHTML = Math.round(y * currentUnitValue * 100)/100.0;
            document.getElementById('node-z-pos-'+ node.id).getElementsByTagName('strong')[0].innerHTML = Math.round(z * currentUnitValue * 100)/100.0;
        }

        this.dispose = function()
        {
            document.getElementById('node-' + node.id + '-UI').remove();
        }
    }
}

export { NodeUI }
