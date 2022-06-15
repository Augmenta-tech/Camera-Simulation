import { camerasTypes } from '/js/cameras.js'

class Wizard{
    constructor()
    {
        addCamTypesToForm();

        this.bindEventListeners = function(sceneManager)
        {
            const formModal = document.getElementById("generate-scene-modal");
            document.getElementById("open-scene-form").addEventListener('click', () => {
                initFormValues();
                formModal.style.display = "block"
            });
            document.getElementById("close-form").addEventListener('click', () => formModal.style.display = "none");
            
            window.addEventListener('mousedown', () => {
                if(event.target === formModal) formModal.style.display = "none";
            });

            const camCheckboxes = document.querySelectorAll('[data-checkcam]');
            camCheckboxes.forEach(c => c.addEventListener('change', () => checkFormCoherence(sceneManager)));
            document.getElementById("tracking-mode").addEventListener('change', () => checkFormCoherence(sceneManager));
            document.getElementById('hook-node').addEventListener('change', () => checkFormCoherence(sceneManager));
            function checkFormCoherence(sceneManager)
            {
                if(document.getElementById('hook-node').value / sceneManager.currentUnit > getMaxFarFromCheckedCam(document.getElementById('tracking-mode-inspector').value))
                {
                    document.getElementById('hook-node').style.color = 'red';
                    const warningElem = document.getElementById('warning-hook-height');
                    if(!warningElem)
                    {
                        const newWarningElem = document.createElement('p');
                        newWarningElem.id = 'warning-hook-height';
                        newWarningElem.innerHTML = `The camera(s) you chose cannot see your tracking surface that far`;
                        newWarningElem.style.color = 'red';
                        document.getElementById('hook-height-input').appendChild(newWarningElem);
                    }
                }
                else
                {
                    document.getElementById('hook-node').style.color = 'black';
                    const warningElem = document.getElementById('warning-hook-height');
                    if(warningElem) warningElem.remove();
                }
            }

            document.getElementById('generate-scene').addEventListener('click', () => createSceneFromForm(sceneManager));
        }

        function initFormValues()
        {
            document.getElementById("areaWantedWidth").value = document.getElementById("givenSceneWidth").value;
            document.getElementById("areaWantedHeight").value = document.getElementById("givenSceneHeight").value;
            document.getElementById('hook-node').value = document.getElementById('hook-node').value ? document.getElementById('hook-node').value : 4.5;

            document.getElementById("tracking-mode").value = document.getElementById("tracking-mode-inspector").value;
            document.getElementById("given-height-detection").value = document.getElementById("given-height-detection-inspector").value;

        }

        function addCamTypesToForm(){
            const camTypesForm = document.getElementById("cam-types-checkboxes");
            /*while (camTypesForm.firstChild) {
                camTypesForm.removeChild(camTypesForm.firstChild);
            }
            let title = document.createElement('h1');
            title.innerHTML = "Choose the type.s of camera.s you want to use";
            camTypesForm.appendChild(title);*/
            camerasTypes.filter(c => c.recommended).forEach(c => {
                //const hookHeight = parseFloat(document.getElementById("hook-node").value);
                //if(hookHeight < c.rangeFar && c.suitable.includes(document.getElementById("tracking-mode").value))
                //{
                    const camTypeChoice = document.createElement("div");
                    const camTypeCheckbox = document.createElement("input");
                    camTypeCheckbox.setAttribute("type", "checkbox");
                    if(c.checkedDefault) camTypeCheckbox.setAttribute("checked", "true");
                    camTypeCheckbox.id = "check-" + c.id;
                    camTypeCheckbox.dataset.checkcam = "";
                    const label = document.createElement("label");
                    label.setAttribute("for", "check-" + c.id)
                    label.innerHTML = c.name;

                    const url = document.location.href;
                    if(url.includes('beta')) label.classList.add('dark-mode');

                    camTypeChoice.appendChild(camTypeCheckbox);
                    camTypeChoice.appendChild(label);
                    camTypesForm.appendChild(camTypeChoice);
                //}
            });
        }

        function getMaxFarFromCheckedCam(mode)
        {
            const camCheckboxes = document.querySelectorAll('[data-checkcam]');
            const camElementsChecked = [];
            for(let i = 0; i < camCheckboxes.length; i++)
            {
                if(camCheckboxes[i].checked) camElementsChecked.push(camCheckboxes[i]);
            }
            if(camElementsChecked.length > 0)
            {
                const camTypesChecked = [];
                camElementsChecked.forEach(c => {
                    const id = c.id;
                    const last = id.charAt(id.length - 1);
                    camTypesChecked.push(parseFloat(last));
                });
                const camerasChecked = camerasTypes.filter(c => camTypesChecked.includes(c.id));
    
                switch(mode)
                {
                    case 'hand-tracking':
                        camerasChecked.sort((A,B) => B.handFar - A.handFar)
                        return camerasChecked[0].handFar;
                    case 'human-tracking':
                    default:
                        camerasChecked.sort((A,B) => B.rangeFar - A.rangeFar)
                        return camerasChecked[0].rangeFar;
                }
            }
        }

        function createSceneFromForm(sceneManager)
        {
            const inputWidth = parseFloat(document.getElementById('areaWantedWidth').value);
            const inputHeight = parseFloat(document.getElementById('areaWantedHeight').value);

            const givenWidth = Math.ceil(inputWidth / sceneManager.currentUnit * 100) / 100;
            const givenHeight = Math.ceil(inputHeight / sceneManager.currentUnit * 100) / 100;
            const camsHeight = Math.round(parseFloat(document.getElementById('hook-node').value) / sceneManager.currentUnit * 100) / 100;

            const trackingMode = document.getElementById("tracking-mode").value;

            if(!givenWidth || !givenHeight)
            {
                alert("Merci de renseigner une longueur et une largeur de scene. \nPlease fill your scene horizontal and vertical length");
                return;
            }

            document.getElementById("givenSceneWidth").value = inputWidth;
            document.getElementById("givenSceneHeight").value = inputHeight;

            document.getElementById("tracking-mode-inspector").value = document.getElementById("tracking-mode").value;
            document.getElementById("given-height-detection-inspector").value = document.getElementById("given-height-detection").value;

            //set heightDetected 
            if(document.getElementById("tracking-mode").value === 'human-tracking') sceneManager.heightDetected = parseFloat(document.getElementById('given-height-detection').value);

            let configs = [];

            camerasTypes.filter(c => c.recommended).forEach(type => {
                let augmentaFar = 0;
                switch(trackingMode)
                {
                    case "hand-tracking":
                        augmentaFar = type.handFar;
                        break;
                    case "human-tracking":
                    default:
                        augmentaFar = type.rangeFar;
                        break;
                }
                if(document.getElementById('check-' + type.id).checked && camsHeight <= augmentaFar && camsHeight >= type.rangeNear + sceneManager.heightDetected)
                {
                    const widthAreaCovered = Math.abs(Math.tan((type.HFov/2.0) * Math.PI / 180.0))*(camsHeight - sceneManager.heightDetected) * 2;
                    const heightAreaCovered = Math.abs(Math.tan((type.VFov/2.0) * Math.PI / 180.0))*(camsHeight - sceneManager.heightDetected) * 2;

                    const nbCamsNoRot = Math.ceil(givenWidth / widthAreaCovered) * Math.ceil(givenHeight / heightAreaCovered);
                    const nbCamsRot = Math.ceil(givenWidth / heightAreaCovered) * Math.ceil(givenHeight / widthAreaCovered);

                    nbCamsRot < nbCamsNoRot
                        ?
                        configs.push({ typeID: type.id, w: heightAreaCovered, h:widthAreaCovered, nbW: Math.ceil(givenWidth / heightAreaCovered), nbH: Math.ceil(givenHeight / widthAreaCovered), rot: true })
                        :
                        configs.push({ typeID: type.id, w: widthAreaCovered, h:heightAreaCovered, nbW: Math.ceil(givenWidth / widthAreaCovered), nbH: Math.ceil(givenHeight / heightAreaCovered), rot: false });
                }
            });

            if(configs.length === 0)
            {
                alert("Aucun capteur n'est adapté pour cette configuration. \nNo sensor is adapted to your demand");
                return;
            }
            else
            {
                sceneManager.updateSceneBorder(inputWidth, inputHeight);

                configs.sort((A,B) => A.nbW * A.nbH - B.nbW * B.nbH);
                configs = configs.filter(c => c.nbW * c.nbH === configs[0].nbW * configs[0].nbH);
                configs.sort((A,B) => A.typeID - B.typeID);
                let chosenConfig = configs[0];
                sceneManager.objects.removeNodes();

                let offsetX = chosenConfig.w / 2.0;
                let offsetY = chosenConfig.h / 2.0;
                if(chosenConfig.nbW === 1) offsetX -= (chosenConfig.nbW*chosenConfig.w - givenWidth)/2.0;
                if(chosenConfig.nbH === 1) offsetY -= (chosenConfig.nbH*chosenConfig.h - givenHeight)/2.0;
                const oX = chosenConfig.nbW > 1 ? (chosenConfig.nbW*chosenConfig.w - givenWidth)/(chosenConfig.nbW - 1) : 0;
                const oY = chosenConfig.nbH > 1 ? (chosenConfig.nbH*chosenConfig.h - givenHeight)/(chosenConfig.nbH - 1) : 0;

                for(let i = 0; i < chosenConfig.nbW; i++)
                {
                    for(let j = 0; j < chosenConfig.nbH; j++)
                    {
                        chosenConfig.rot 
                            ?
                            sceneManager.objects.addNode(true, trackingMode, chosenConfig.typeID, offsetX + i*(chosenConfig.w - oX), camsHeight + sceneManager.floorHeight, offsetY + j*(chosenConfig.h - oY), 0, 0, Math.PI/2.0)
                            :
                            sceneManager.objects.addNode(true, trackingMode, chosenConfig.typeID, offsetX + i*(chosenConfig.w - oX), camsHeight + sceneManager.floorHeight, offsetY + j*(chosenConfig.h - oY));

                    }
                }
                //placeCamera(new THREE.Vector3(givenWidth, 6, givenHeight));
                document.getElementById("generate-scene-modal").style.display = "none";
            }
        }
    }
}

export { Wizard }
