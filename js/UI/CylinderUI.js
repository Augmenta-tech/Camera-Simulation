import { getLidarsTypes, units } from '../data.js'

class CylinderUI{
    constructor(cylinder, sceneManager)
    {
        buildUIDiv();
        bindEventListeners();

        function buildUIDiv()
        {
            // let lidarTypesOptions = ``;
            // getLidarsTypes().filter(c => c.recommended).forEach(type => {
            //     const optionElement = `<option value="` + type.name + `" ` + (cylinder.lidarType.name === type.name ? `selected` : ``) + `>` + type.name;
            //     lidarTypesOptions += optionElement;
            //     lidarTypesOptions += "</option>"
            // });
        
            const cylinderUIdiv = document.createElement('div');
            cylinderUIdiv.classList.add("sensorUI");
            
            cylinderUIdiv.id = 'cylinder-' + (cylinder.id) + '-UI';
            cylinderUIdiv.innerHTML = `
                <div id="cylinder-` + (cylinder.id) + `-UI-header" class="row center-x-spaced center-y">
                    <div class="row center-y">
                        <div class="sensor-color" style="background-color: #`+ cylinder.color.getHexString() + `;"></div>
                        <p class="main-text">Cylinder ` + (cylinder.id + 1) + `</p>
                    </div>
                    <div class="row center-y">
                        <div id="cylinder-` + (cylinder.id) + `-hide-UI"><span class="iconify" data-icon="bx:minus"></span></div> 
                        <div id="cylinder-` + (cylinder.id) + `-delete"><span class="iconify" data-icon="fluent:delete-16-filled"></span></div>
                    </div>
                </div>
                <div id="cylinder-infos-` + (cylinder.id) + `-UI" class="column sections-container space-y">
                    <div class="row sensor-transformations">
                        <p class="main-text">Position</p>
                        <div>
                            <p id="cylinder-x-pos-`+ cylinder.id +`" class="draggable">Pos. X <strong data-unit=` + sceneManager.currentUnit.value + `>` + Math.round(cylinder.xPos * sceneManager.currentUnit.value * 100) /100.0 + `</strong><span data-unittext=` + sceneManager.currentUnit.value + `>` + sceneManager.currentUnit.label +`</span></p>
                        </div>
                        <div>
                            <p id="cylinder-y-pos-`+ cylinder.id +`" class="draggable">Pos. Y <strong data-unit=` + sceneManager.currentUnit.value + `>` + Math.round(cylinder.yPos * sceneManager.currentUnit.value * 100) /100.0 + `</strong><span data-unittext=` + sceneManager.currentUnit.value + `>` + sceneManager.currentUnit.label +`</span></p>
                        </div>
                        <div>
                            <p id="cylinder-z-pos-`+ cylinder.id +`" class="draggable">Pos. Z <strong data-unit=` + sceneManager.currentUnit.value + `>` + Math.round(cylinder.zPos * sceneManager.currentUnit.value * 100) /100.0 + `</strong><span data-unittext=` + sceneManager.currentUnit.value + `>` + sceneManager.currentUnit.label +`</span></p>
                        </div>
                    </div>
                    <div class="row sensor-transformations">
                        <p class="main-text">Rotation</p>
                        <div>
                            <p id="cylinder-x-rot-`+ cylinder.id +`" class="draggable">Rot. X <strong>` + Math.round(cylinder.xRot*180/Math.PI) + `</strong>° </p>
                        </div>
                        <div>
                            <p id="cylinder-y-rot-`+ cylinder.id +`" class="draggable">Rot. Y <strong>` + Math.round(cylinder.yRot*180/Math.PI) + `</strong>° </p>
                        </div>
                        <div>
                            <p id="cylinder-z-rot-`+ cylinder.id +`" class="draggable">Rot. Z <strong>` + Math.round(cylinder.zRot*180/Math.PI) + `</strong>° </p>
                        </div>
                    </div>
                    <div class="row sensor-transformations">
                        <p class="main-text">Size</p>
                        <div>
                            <p id="cylinder-radius-`+ cylinder.id +`" class="draggable">Radius <strong data-unit=` + sceneManager.currentUnit.value + `>` + Math.round(cylinder.radius * sceneManager.currentUnit.value * 100) /100.0 + `</strong><span data-unittext=` + sceneManager.currentUnit.value + `>` + sceneManager.currentUnit.label +`</span></p>
                        </div>
                        <div>
                            <p id="cylinder-height-`+ cylinder.id +`" class="draggable">Height <strong data-unit=` + sceneManager.currentUnit.value + `>` + Math.round(cylinder.height * sceneManager.currentUnit.value * 100) /100.0 + `</strong><span data-unittext=` + sceneManager.currentUnit.value + `>` + sceneManager.currentUnit.label +`</span></p>
                        </div>
                    </div>
                </div>`;

            const inpsectorDiv = document.getElementById('cylinder-section');
            inpsectorDiv.appendChild(cylinderUIdiv);
        }

        function bindEventListeners()
        {
            makeElementDraggable(document.getElementById("cylinder-x-pos-" + cylinder.id));
            makeElementDraggable(document.getElementById("cylinder-y-pos-" + cylinder.id));
            makeElementDraggable(document.getElementById("cylinder-z-pos-" + cylinder.id));
            makeElementDraggable(document.getElementById("cylinder-x-rot-" + cylinder.id));
            makeElementDraggable(document.getElementById("cylinder-y-rot-" + cylinder.id));
            makeElementDraggable(document.getElementById("cylinder-z-rot-" + cylinder.id));
            makeElementDraggable(document.getElementById("cylinder-radius-" + cylinder.id));
            makeElementDraggable(document.getElementById("cylinder-height-" + cylinder.id));
    
            document.getElementById('cylinder-' + (cylinder.id) + '-hide-UI').addEventListener('click', () => hideUICylinder());
            document.getElementById('cylinder-' + (cylinder.id) + '-delete').addEventListener('click', () => sceneManager.objects.removeCylinder(cylinder));
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
                switch(element.id.split('-')[1])
                {
                    case "radius" :
                        fac = 1 / 100.0;
                        break;
                    case "height" :
                        fac = 1 / 10.0;
                        break;
                }
                switch(element.id.split('-')[2])
                {
                    case "pos" :
                        fac = 1 / 100.0;
                        break;
                    case "rot":
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
                                cylinder.xPos = value / sceneManager.currentUnit.value;
                                cylinder.mesh.position.set(cylinder.xPos, cylinder.zPos, cylinder.yPos);
                                break;
                            case "rot" :
                                cylinder.xRot = value * (Math.PI / 180.0);
                                cylinder.mesh.rotation.set(cylinder.xRot, cylinder.zRot, cylinder.yRot);
                                break;
                            default:
                                break;
                        }
                        break;
                    case "y":
                        switch(element.id.split('-')[2])
                        {
                            case "pos" :
                                cylinder.yPos = value / sceneManager.currentUnit.value;
                                cylinder.mesh.position.set(cylinder.xPos, cylinder.zPos, cylinder.yPos);
                                break;
                            case "rot":
                                cylinder.yRot = value * (Math.PI / 180.0);
                                cylinder.mesh.rotation.set(cylinder.xRot, cylinder.zRot, cylinder.yRot);
                                break;
                            default:
                                break;
                        }
                        break;
                    case "z":
                        switch(element.id.split('-')[2])
                        {
                            case "pos" :
                                cylinder.zPos = value / sceneManager.currentUnit.value;
                                cylinder.mesh.position.set(cylinder.xPos, cylinder.zPos, cylinder.yPos);
                                break;
                            case "rot":
                                cylinder.zRot = value * (Math.PI / 180.0);
                                cylinder.mesh.rotation.set(cylinder.xRot, cylinder.zRot, cylinder.yRot);
                                break;
                            default:
                                break;
                        }
                        break;
                    case "radius":
                        cylinder.updateSize(value / sceneManager.currentUnit.value, cylinder.height);
                        break;
                    case "height":
                        cylinder.updateSize(cylinder.radius, value / sceneManager.currentUnit.value);
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

                //sceneManager.objects.populateStorage();
        
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

        function hideUICylinder()
        {
            const cylinderInfosUI = document.getElementById('cylinder-infos-' + (cylinder.id) + '-UI');
            const cylinderUIheader = document.getElementById('cylinder-' + (cylinder.id) + '-UI-header');
            const hidden = cylinderInfosUI.classList.contains('hidden');
            hidden ? cylinderInfosUI.classList.remove('hidden') : cylinderInfosUI.classList.add('hidden');
            //Using the hidden UI button to add or remove the cylinder in the scene
            hidden ? cylinder.addToScene(sceneManager.scene) : cylinder.removeFromScene(sceneManager.scene);
            const iconElem = document.getElementById('cylinder-' + (cylinder.id) + '-hide-UI').firstChild;
            iconElem.dataset.icon = hidden ? "bx:minus" : "bx:plus";
        }
        hideUICylinder();

        this.updatePosition = function(x, z, currentUnitValue)
        {
            document.getElementById('cylinder-x-pos-'+ cylinder.id).getElementsByTagName('strong')[0].innerHTML = Math.round(x * currentUnitValue * 100)/100.0;
            document.getElementById('cylinder-y-pos-'+ cylinder.id).getElementsByTagName('strong')[0].innerHTML = Math.round(z * currentUnitValue * 100)/100.0;
        }

        this.dispose = function()
        {
            let cylinderUI = document.getElementById('cylinder-' + cylinder.id + '-UI');
            //Check if wasn't removed singularly yet
            if(cylinderUI) cylinderUI.remove();
        }
    }
}

export { CylinderUI }
