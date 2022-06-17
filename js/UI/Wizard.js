import { camerasTypes, units } from '/js/data.js'

import { SceneManager } from '/js/scene/SceneManager.js'

class Wizard{
    constructor()
    {
        addCamTypesToForm();

        this.bindEventListeners = function(sceneManager, uiManager)
        {
            const formModal = document.getElementById('wizard-modal');
            document.getElementById('open-wizard-button').addEventListener('click', () => {
                if(sceneManager.augmentaSceneLoaded)
                {
                    initWizardValues(sceneManager);
                    formModal.classList.remove('hidden');
                }
            });
            document.getElementById('close-wizard').addEventListener('click', () => formModal.classList.add('hidden'));
            
            window.addEventListener('mousedown', () => {
                if(event.target === formModal) formModal.classList.add('hidden');
            });

            document.getElementById('tracking-mode-selection-wizard').addEventListener('change', () => changeTrackingMode(sceneManager, document.getElementById('tracking-mode-selection-wizard').value));

            const camCheckboxes = document.getElementsByClassName('checkbox-camera-type');
            for(let i = 0; i < camCheckboxes.length; i++)
            {
                camCheckboxes[i].addEventListener('change', () => checkFormCoherence(sceneManager));
            }
            document.getElementById('tracking-mode-selection-wizard').addEventListener('change', () => checkFormCoherence(sceneManager));
            document.getElementById('input-hook-height-wizard').addEventListener('change', () => checkFormCoherence(sceneManager));

            function checkFormCoherence(sceneManager)
            {
                if(document.getElementById('input-hook-height-wizard').value / sceneManager.currentUnit.value > getMaxFarFromCheckedCam(document.getElementById('tracking-mode-selection-wizard').value))
                {
                    document.getElementById('input-hook-height-wizard').style.color = "red";
                    const warningElem = document.getElementById('warning-hook-height');
                    if(!warningElem)
                    {
                        const newWarningElem = document.createElement("p");
                        newWarningElem.id = 'warning-hook-height';
                        newWarningElem.innerHTML = `The camera(s) you chose cannot see your tracking surface that far`;
                        newWarningElem.style.color = "red";
                        document.getElementById('hook-height-input').appendChild(newWarningElem);
                    }
                }
                else
                {
                    document.getElementById('input-hook-height-wizard').style.color = "black";
                    const warningElem = document.getElementById('warning-hook-height');
                    if(warningElem) warningElem.remove();
                }
            }

            document.getElementById('generate-scene-wizard-button').addEventListener('click', () => {
                createSceneFromWizard(sceneManager);
                uiManager.displayWarning(sceneManager);
            });
        }

        function changeTrackingMode(sceneManager, mode)
        {
            switch(mode)
            {
                case 'hand-tracking':
                    document.getElementById('overlap-height-wizard').classList.add('hidden');
                    break;
                case 'human-tracking':
                default:
                    document.getElementById('overlap-height-wizard').classList.remove('hidden');
                    document.getElementById('overlap-height-selection-wizard').value = "1";
                    break;
            }

            if(mode === 'hand-tracking')
            {
                const infoTableElem = document.getElementById('info-table-height');
                if(!infoTableElem)
                {
                    const newInfoTableElem = document.createElement("p");
                    newInfoTableElem.id = 'info-table-height';
                    newInfoTableElem.innerHTML = `The table is <span data-unit=` + sceneManager.currentUnit.value + `>` + (SceneManager.TABLE_ELEVATION*sceneManager.currentUnit.value) + `</span><span data-unittext=` + sceneManager.currentUnit.value + `>` + sceneManager.currentUnit.label + `</span> high`;
                    newInfoTableElem.style.color = "orange";
                    document.getElementById('tracking-section-wizard').appendChild(newInfoTableElem);
                }
            }
            else
            {
                const infoTableElem = document.getElementById('info-table-height');
                if(infoTableElem) infoTableElem.remove();
            }
        }

        function initWizardValues(sceneManager)
        {
            document.getElementById('input-scene-width-wizard').value = sceneManager.sceneWidth;
            document.getElementById('input-scene-height-wizard').value = sceneManager.sceneHeight;
            document.getElementById('input-hook-height-wizard').value = document.getElementById('input-hook-height-wizard').value ? document.getElementById('input-hook-height-wizard').value : 4.5;

            document.getElementById('tracking-mode-selection-wizard').value = sceneManager.trackingMode;

            changeTrackingMode(sceneManager, sceneManager.trackingMode);
            if(sceneManager.trackingMode === 'human-tracking') document.getElementById('overlap-height-selection-wizard').value = sceneManager.heightDetected;

        }

        function addCamTypesToForm(){
            const camTypesForm = document.getElementById('cam-types-checkboxes-wizard');
            /*while (camTypesForm.firstChild) {
                camTypesForm.removeChild(camTypesForm.firstChild);
            }
            let title = document.createElement("h3");
            title.innerHTML = "Choose the type.s of camera.s you want to use";
            camTypesForm.appendChild(title);*/
            camerasTypes.filter(c => c.recommended).forEach(c => {
                //const hookHeight = parseFloat(document.getElementById('input-hook-height-wizard').value);
                //if(hookHeight < c.rangeFar && c.suitable.includes(document.getElementById('tracking-mode-selection-wizard').value))
                //{
                    const camTypeChoice = document.createElement("div");
                    const camTypeCheckbox = document.createElement("input");
                    camTypeCheckbox.setAttribute("type", "checkbox");
                    if(c.checkedDefault) camTypeCheckbox.setAttribute("checked", "true");
                    camTypeCheckbox.id = "check-" + c.id;
                    camTypeCheckbox.classList.add('checkbox-camera-type');
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
            const camCheckboxes = document.getElementsByClassName('checkbox-camera-type');
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

        function createSceneFromWizard(sceneManager)
        {
            const inputWidth = parseFloat(document.getElementById('input-scene-width-wizard').value);
            const inputHeight = parseFloat(document.getElementById('input-scene-height-wizard').value);
            const camsHeight = Math.round(parseFloat(document.getElementById('input-hook-height-wizard').value) / sceneManager.currentUnit.value * 100) / 100;
            
            const trackingMode = document.getElementById('tracking-mode-selection-wizard').value;
            let sceneElevation, overlapHeightDetection;
            switch(trackingMode)
            {
                case 'hand-tracking':
                    sceneElevation = SceneManager.TABLE_ELEVATION;
                    overlapHeightDetection = SceneManager.HAND_TRACKING_OVERLAP_HEIGHT;
                    break;
                case 'human-tracking':
                default:
                    sceneElevation = sceneManager.sceneElevation;
                    overlapHeightDetection = parseFloat(document.getElementById('overlap-height-selection-wizard').value);
                    break;
            }

            if(!inputWidth || !inputHeight)
            {
                alert("Please fill your scene horizontal and vertical length");
                return;
            }
            if(!camsHeight)
            {
                alert("Please fill the hook height from your scene");
                return;
            }

            const givenWidth = Math.ceil(inputWidth / sceneManager.currentUnit.value * 100) / 100;
            const givenHeight = Math.ceil(inputHeight / sceneManager.currentUnit.value * 100) / 100;

            let configs = [];

            camerasTypes.filter(c => c.recommended).forEach(type => {
                let augmentaFar = 0;
                switch(trackingMode)
                {
                    case 'hand-tracking':
                        augmentaFar = type.handFar;
                        break;
                    case 'human-tracking':
                    default:
                        augmentaFar = type.rangeFar;
                        break;
                }
                if(document.getElementById('check-' + type.id).checked && camsHeight <= augmentaFar && camsHeight >= type.rangeNear + overlapHeightDetection)
                {
                    const widthAreaCovered = Math.abs(Math.tan((type.HFov/2.0) * Math.PI / 180.0))*(camsHeight - overlapHeightDetection) * 2;
                    const heightAreaCovered = Math.abs(Math.tan((type.VFov/2.0) * Math.PI / 180.0))*(camsHeight - overlapHeightDetection) * 2;

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
                alert("No sensor is adapted to your demand");
                return;
            }
            else
            {
                sceneManager.updateAugmentaSceneBorder(inputWidth, inputHeight);

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
                            sceneManager.objects.addNode(true, trackingMode, chosenConfig.typeID, offsetX + i*(chosenConfig.w - oX), camsHeight + sceneElevation, offsetY + j*(chosenConfig.h - oY), 0, 0, Math.PI/2.0)
                            :
                            sceneManager.objects.addNode(true, trackingMode, chosenConfig.typeID, offsetX + i*(chosenConfig.w - oX), camsHeight + sceneElevation, offsetY + j*(chosenConfig.h - oY));

                    }
                }

                // update inspector infos
                document.getElementById('input-scene-width-inspector').value = inputWidth;
                document.getElementById('input-scene-height-inspector').value = inputHeight;
    
                document.getElementById('tracking-mode-selection-inspector').value = trackingMode;
                switch(trackingMode)
                {
                    case 'hand-tracking':
                        document.getElementById('overlap-height-inspector').classList.add('hidden');
                        break;
                    case 'human-tracking':
                    default:
                        document.getElementById('overlap-height-inspector').classList.remove('hidden');
                        document.getElementById('overlap-height-selection-inspector').value = document.getElementById('overlap-height-selection-wizard').value
                        break;
                }
    
                //set scene attributes
                sceneManager.changeTrackingMode(trackingMode);
                if(trackingMode === 'human-tracking') sceneManager.heightDetected = overlapHeightDetection;
    
                //placeCamera(new THREE.Vector3(givenWidth, 6, givenHeight));
                document.getElementById('wizard-modal').classList.add('hidden');
            }
        }
    }
}

export { Wizard }
