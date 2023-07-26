import { getLidarsTypes, units } from '../data.js'

class LidarUI{
    constructor(lidar, sceneManager)
    {
        buildUIDiv();
        bindEventListeners();

        function buildUIDiv()
        {
            let lidarTypesOptions = ``;
            getLidarsTypes().filter(c => c.recommended).forEach(type => {
                const optionElement = `<option value="` + type.name + `" ` + (lidar.lidarType.name === type.name ? `selected` : ``) + `>` + type.name;
                lidarTypesOptions += optionElement;
                lidarTypesOptions += "</option>"
            });
        
            const lidarUIdiv = document.createElement('div');
            lidarUIdiv.classList.add("sensorUI");
            
            lidarUIdiv.id = 'lidar-' + (lidar.id) + '-UI';
            lidarUIdiv.innerHTML = `
                <div id="lidar-` + (lidar.id) + `-UI-header" class="row center-x-spaced center-y">
                    <div class="row center-y">
                        <div class="sensor-color" style="background-color: #`+ lidar.color.getHexString() + `;"></div>
                        <p class="main-text">Lidar ` + (lidar.id + 1) + `</p>
                    </div>
                    <div class="row center-y">
                        <!-- <div id="lidar-` + (lidar.id) + `-solo-button"><span class="iconify" data-icon="bx:search-alt-2"></span></div> -->
                        <div id="lidar-` + (lidar.id) + `-hide-UI"><span class="iconify" data-icon="bx:minus"></span></div> 
                        <div id="lidar-` + (lidar.id) + `-visible"><span class="iconify" data-icon="akar-icons:eye-open"></span></div>
                        <!-- <div><span class="iconify" data-icon="fluent:lock-open-16-regular"></span></div> -->
                        <div id="lidar-` + (lidar.id) + `-delete"><span class="iconify" data-icon="fluent:delete-16-filled"></span></div>
                    </div>
                </div>
                <div id="lidar-infos-` + (lidar.id) + `-UI" class="column sections-container space-y">
                    <div id="select-lidar-type" class="row center-y">
                        <select title="lidarType-` + (lidar.id) + `" name="lidarType-` + (lidar.id) + `" id="lidar-type-` + (lidar.id) + `">
                        ` + lidarTypesOptions + `
                        </select>
                    </div>
                    <div class="row sensor-transformations">
                        <p class="main-text">Transf.</p>
                        <div>
                            <p id="lidar-x-pos-`+ lidar.id +`" class="draggable">Pos. X <strong data-unit=` + sceneManager.currentUnit.value + `>` + Math.round(lidar.xPos * sceneManager.currentUnit.value * 100) /100.0 + `</strong><span data-unittext=` + sceneManager.currentUnit.value + `>` + sceneManager.currentUnit.label +`</span></p>
                        </div>
                        <div>
                            <p id="lidar-z-pos-`+ lidar.id +`" class="draggable">Pos. Z <strong data-unit=` + sceneManager.currentUnit.value + `>` + Math.round(lidar.zPos * sceneManager.currentUnit.value * 100) /100.0 + `</strong><span data-unittext=` + sceneManager.currentUnit.value + `>` + sceneManager.currentUnit.label +`</span></p>
                        </div>
                        <div>
                            <p id="lidar-y-rot-`+ lidar.id +`" class="draggable">Rot. Y <strong>` + Math.round(lidar.yRot*180/Math.PI) + `</strong>° </p>
                        </div>
                    </div>
                    <div class="row cam-spec">
                        <p class="spec-title main-text">Angular</p>
                        <p>FOV</p><p id="lidar-fov` + lidar.id + `">` + lidar.lidarType.fov + `°</p>
                        <p>Res</p><p id="lidar-res` + lidar.id + `">` + lidar.lidarType.angularResolution + `°</p>
                    </div>
                    <div class="row cam-spec">
                        <p class="spec-title main-text">Distance</p>
                        <p>Near</p><p><span id="lidar-near` + lidar.id + `" data-unit=` + sceneManager.currentUnit.value + `>` + (Math.round(lidar.lidarType.rangeNear*sceneManager.currentUnit.value * 100) / 100.0) + `</span> <span data-unittext=` + sceneManager.currentUnit.value + `>` + sceneManager.currentUnit.label + `</span></p>
                        <p>Far</p><p><span id="lidar-far` + lidar.id + `" data-unit=` + sceneManager.currentUnit.value + `>` + (Math.round(lidar.lidarType.rangeFar*sceneManager.currentUnit.value * 100) / 100.0) + `</span> <span data-unittext=` + sceneManager.currentUnit.value + `>` + sceneManager.currentUnit.label + `</span></p>
                    </div>
                </div>`;

            /*
            const sensorDiv = document.getElementById('sensors-infos');
            sensorDiv.appendChild(lidarUIdiv);
            */
            const inpsectorDiv = document.getElementById('inspector');
            inpsectorDiv.appendChild(lidarUIdiv);
        }

        function bindEventListeners()
        {
            makeElementDraggable(document.getElementById("lidar-x-pos-" + lidar.id));
            makeElementDraggable(document.getElementById("lidar-z-pos-" + lidar.id));
            makeElementDraggable(document.getElementById("lidar-y-rot-" + lidar.id));
        
    
            document.getElementById('lidar-' + (lidar.id) + '-hide-UI').addEventListener('click', () => hideUILidar());
            document.getElementById('lidar-' + (lidar.id) + '-visible').addEventListener('click', () => lidar.changeVisibility());
            document.getElementById('lidar-' + (lidar.id) + '-delete').addEventListener('click', () => sceneManager.objects.removeLidar(lidar));
        
            document.getElementById('lidar-type-' + lidar.id).addEventListener('change', () => changeLidarType());
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
                                lidar.xPos = value / sceneManager.currentUnit.value;
                                lidar.mesh.position.set(lidar.xPos, lidar.zPos, lidar.yPos);
                                lidar.rays.position.set(lidar.xPos, lidar.zPos, lidar.yPos);
                                break;
                            default:
                                break;
                        }
                        break;
                    case "z":
                        switch(element.id.split('-')[2])
                        {
                            case "pos" :
                                lidar.zPos = value / sceneManager.currentUnit.value;
                                lidar.mesh.position.set(lidar.xPos, lidar.zPos, lidar.yPos);
                                lidar.rays.position.set(lidar.xPos, lidar.zPos, lidar.yPos);
                                break;
                            default:
                                break;
                        }
                        break;
                    case "y":
                        switch(element.id.split('-')[2])
                        {
                            case "rot":
                                lidar.yRot = value * (Math.PI / 180.0);
                                lidar.rays.rotation.z = lidar.yRot;
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

                sceneManager.objects.populateStorage();
        
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

        function hideUILidar()
        {
            const lidarInfosUI = document.getElementById('lidar-infos-' + (lidar.id) + '-UI');
            const lidarUIheader = document.getElementById('lidar-' + (lidar.id) + '-UI-header');
            const hidden = lidarInfosUI.classList.contains('hidden');
            hidden ? lidarInfosUI.classList.remove('hidden') : lidarInfosUI.classList.add('hidden');
            const iconElem = document.getElementById('lidar-' + (lidar.id) + '-hide-UI').firstChild;
            iconElem.dataset.icon = hidden ? "bx:minus" : "bx:plus";
        }

        function changeLidarType()
        {
            lidar.lidarType = getLidarsTypes().find(type => type.name === document.getElementById('lidar-type-' + lidar.id).value);

            sceneManager.scene.remove(lidar.rays);
            lidar.rays.children.forEach(r => {
                if(r.isLineSegments)
                {
                    r.geometry.dispose();
                    r.material.dispose();
                }
            });
            lidar.rays.clear();
            lidar.buildRays();
            sceneManager.scene.add(lidar.rays);

            document.getElementById('lidar-fov' + lidar.id).innerHTML = lidar.lidarType.fov + '°';
            document.getElementById('lidar-res' + lidar.id).innerHTML = lidar.lidarType.angularResolution + '°';
            document.getElementById('lidar-near' + lidar.id).innerHTML = (Math.round(lidar.lidarType.rangeNear*document.getElementById('lidar-near' + lidar.id).dataset.unit * 100) / 100.0);
            document.getElementById('lidar-far' + lidar.id).innerHTML = (Math.round(lidar.lidarType.rangeFar*document.getElementById('lidar-far' + lidar.id).dataset.unit * 100) / 100.0);

            sceneManager.objects.populateStorage();
        }

        this.changeVisibility = function(visible)
        {
            const iconElem = document.getElementById('lidar-' + (lidar.id) + '-visible').firstElementChild;
            iconElem.dataset.icon = visible ? "akar-icons:eye-open" : "akar-icons:eye-slashed";
            sceneManager.objects.updateRaysIcon();
        }

        this.updatePosition = function(x, z, currentUnitValue)
        {
            document.getElementById('lidar-x-pos-'+ lidar.id).getElementsByTagName('strong')[0].innerHTML = Math.round(x * currentUnitValue * 100)/100.0;
            document.getElementById('lidar-z-pos-'+ lidar.id).getElementsByTagName('strong')[0].innerHTML = Math.round(z * currentUnitValue * 100)/100.0;
        }

        this.dispose = function()
        {
            let lidarUI = document.getElementById('lidar-' + lidar.id + '-UI');
            //Check if wasn't removed singularly yet
            if(lidarUI) lidarUI.remove();
        }
    }
}

export { LidarUI }
