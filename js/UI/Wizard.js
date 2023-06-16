import { Vector2 } from 'three'
import { getCamerasTypes, getLidarsTypes, units } from '/js/data.js';

import { SceneManager } from '/js/scene/SceneManager.js'
import { Node } from '/js/scene/objects/sensors/Node.js';
import { Lidar } from '/js/scene/objects/sensors/Lidar.js'

class Wizard{
    constructor()
    {
        addSensorsTypesToForm();

        this.bindEventListeners = function(viewportManager, uiManager)
        {
            const sceneManager = viewportManager.sceneManager;
            const formModal = document.getElementById('wizard-modal');
            //OPEN WIZARD
            document.getElementById('open-wizard-button').addEventListener('click', () => {
                if(sceneManager.augmentaSceneLoaded)
                {
                    initWizardValues(sceneManager);
                    formModal.classList.remove('hidden');
                }
            });
            //CLOSE WIZARD CHEN CLICKING THE CROSS
            document.getElementById('close-wizard').addEventListener('click', () => formModal.classList.add('hidden'));
            //CLOSE WIZARD WHEN CLICKING OUTSIDE MODAL
            window.addEventListener('mousedown', () => {
                if(event.target === formModal) formModal.classList.add('hidden');
            });

            //CHANGE TRACKING MODE
            document.getElementById('tracking-mode-selection-wizard').addEventListener('change', () => changeTrackingMode(sceneManager, document.getElementById('tracking-mode-selection-wizard').value));

            //CHECKS COHERENCE BETWEEN CAMERAS SPECS AND USER INPUTS
            const camCheckboxes = document.getElementsByClassName('checkbox-camera-type');
            for(let i = 0; i < camCheckboxes.length; i++)
            {
                camCheckboxes[i].addEventListener('change', () => checkFormCoherence(sceneManager));
            }
            document.getElementById('input-hook-height-wizard').addEventListener('change', () => checkFormCoherence(sceneManager));
            
            //CHECKS COHERENCE BETWEEN LIDARS SPECS AND USER INPUTS
            const lidarCheckboxes = document.getElementsByClassName('checkbox-lidar-type');
            for(let i = 0; i < lidarCheckboxes.length; i++)
            {
                lidarCheckboxes[i].addEventListener('change', () => checkFormCoherence(sceneManager));
            }
            document.getElementById('input-wall-y-scene-width-wizard').addEventListener('change', () => checkFormCoherence(sceneManager));
            document.getElementById('input-wall-y-scene-height-wizard').addEventListener('change', () => checkFormCoherence(sceneManager));

            //CHECKS COHERENCE WHEN MODIFYING ANY FIELD
            document.getElementById('tracking-mode-selection-wizard').addEventListener('change', () => checkFormCoherence(sceneManager));

            function checkFormCoherence(sceneManager)
            {
                const trackingMode = document.getElementById('tracking-mode-selection-wizard').value;
                const checkedSensors = getCheckedSensor(trackingMode)
                const maxFar = getMaxFarFromSensors(checkedSensors, trackingMode);
                const minNear = getMinNearFromSensors(checkedSensors);
                switch(trackingMode)
                {
                    case 'wall-tracking':
                    {
                        const givenWidth = document.getElementById('input-wall-y-scene-width-wizard').value / sceneManager.currentUnit.value;
                        const givenHeight = document.getElementById('input-wall-y-scene-height-wizard').value / sceneManager.currentUnit.value;
                        if(!checkLidarCoherence(givenWidth, givenHeight, maxFar))
                        {
                            document.getElementById('input-wall-y-scene-width-wizard').style.color = "red";
                            document.getElementById('input-wall-y-scene-height-wizard').style.color = "red";
                            const warningElem = document.getElementById('warning-scene-dimensions-lidar');
                            if(!warningElem)
                            {
                                const newWarningElem = document.createElement("p");
                                newWarningElem.id = 'warning-scene-dimensions-lidar';
                                newWarningElem.innerHTML = `None of the lidars you chose can cover this surface.`;
                                newWarningElem.classList.add('warning-message');
                                document.getElementById('wall-y-scene-size-wizard').appendChild(newWarningElem);
                            }
                        }
                        else
                        {
                            document.getElementById('input-wall-y-scene-width-wizard').style.color = "black";
                            document.getElementById('input-wall-y-scene-height-wizard').style.color = "black";
                            const warningElem = document.getElementById('warning-scene-dimensions-lidar');
                            if(warningElem) warningElem.remove();
                        }
                        break;
                    }
                    case 'human-tracking':
                    case 'hand-tracking':
                    default:
                    {
                        const givenHookHeight = document.getElementById('input-hook-height-wizard').value / sceneManager.currentUnit.value;
                        //TO DO DIFFERENCE BETWEN HAND AND HUMAN TRACKING
                        const overlapHeightDetection = parseFloat(document.getElementById('overlap-height-selection-wizard').value);
                        if(!checkCameraCoherence(givenHookHeight, overlapHeightDetection, maxFar, minNear))
                        {
                            document.getElementById('input-hook-height-wizard').style.color = "red";
                            const warningElem = document.getElementById('warning-hook-height');
                            if(!warningElem)
                            {
                                const newWarningElem = document.createElement("p");
                                newWarningElem.id = 'warning-hook-height';
                                newWarningElem.innerHTML = `The camera(s) you chose cannot see your tracking surface at this distance (min = <span data-unit=` + sceneManager.currentUnit.value + `>` + (Math.round(((minNear + overlapHeightDetection) * sceneManager.currentUnit.value) * 100) / 100.0) + `</span> <span data-unittext=` + sceneManager.currentUnit.label + `>` + sceneManager.currentUnit.label + `</span>, max = <span data-unit=` + sceneManager.currentUnit.value + `>` + (Math.round((maxFar * sceneManager.currentUnit.value) * 100) / 100.0) + `</span> <span data-unittext=` + sceneManager.currentUnit.label + `>` + sceneManager.currentUnit.label + `</span>)`;
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
                        break;
                    }
                }
            }
            

            //GENERATE SCENE BUTTON
            document.getElementById('generate-scene-wizard-button').addEventListener('click', () => {
                const trackingMode = document.getElementById('tracking-mode-selection-wizard').value;
                if(createSceneFromWizard(viewportManager, trackingMode))
                {
                    uiManager.changeTrackingMode(trackingMode);
                    uiManager.displayWarning(sceneManager);
                }
            });
        }

        function changeTrackingMode(sceneManager, mode)
        {
            switch(mode)
            {
                case 'hand-tracking':
                    document.getElementById('overlap-height-wizard').classList.add('hidden');

                    document.getElementById('floor-scene-size-wizard').classList.remove('hidden');
                    document.getElementById('floor-scene-size-title-wizard').innerHTML = "Table scene size";
                    document.getElementById('wall-y-scene-size-wizard').classList.add('hidden');

                    document.getElementById('cam-types-selection').classList.remove('hidden');
                    document.getElementById('lidar-types-selection').classList.add('hidden');
                    break;
                case 'wall-tracking':
                    document.getElementById('overlap-height-wizard').classList.add('hidden');

                    document.getElementById('wall-y-scene-size-wizard').classList.remove('hidden');
                    document.getElementById('floor-scene-size-wizard').classList.add('hidden');

                    document.getElementById('lidar-types-selection').classList.remove('hidden');
                    document.getElementById('cam-types-selection').classList.add('hidden');
                    break;
                case 'human-tracking':
                default:
                    document.getElementById('overlap-height-wizard').classList.remove('hidden');
                    document.getElementById('overlap-height-selection-wizard').value = document.getElementById('default-height-detected').value;

                    document.getElementById('floor-scene-size-wizard').classList.remove('hidden');
                    document.getElementById('floor-scene-size-title-wizard').innerHTML = "Floor scene size";
                    document.getElementById('wall-y-scene-size-wizard').classList.add('hidden');

                    document.getElementById('cam-types-selection').classList.remove('hidden');
                    document.getElementById('lidar-types-selection').classList.add('hidden');
                    break;
            }

            if(mode === 'hand-tracking')
            {
                const infoTableElem = document.getElementById('info-table-height');
                if(!infoTableElem)
                {
                    const newInfoTableElem = document.createElement("p");
                    newInfoTableElem.id = 'info-table-height';
                    newInfoTableElem.innerHTML = `The table is <span data-unit=` + sceneManager.currentUnit.value + `>` + (Math.round(SceneManager.TABLE_ELEVATION*sceneManager.currentUnit.value * 100) / 100) + `</span><span data-unittext=` + sceneManager.currentUnit.value + `>` + sceneManager.currentUnit.label + `</span> high`;
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
            document.getElementById('input-scene-width-wizard').value = Math.round(sceneManager.sceneWidth * sceneManager.currentUnit.value * 100) / 100.0;
            document.getElementById('input-scene-length-wizard').value = Math.round(sceneManager.sceneLength * sceneManager.currentUnit.value * 100) / 100.0;
            document.getElementById('input-hook-height-wizard').value = parseFloat(document.getElementById('input-hook-height-wizard').value) > 0 ? document.getElementById('input-hook-height-wizard').value : Math.round(Node.DEFAULT_NODE_HEIGHT * sceneManager.currentUnit.value * 100) / 100.0;
            document.getElementById('input-wall-y-scene-width-wizard').value = document.getElementById('input-wall-y-scene-width-inspector').value;
            document.getElementById('input-wall-y-scene-height-wizard').value = document.getElementById('input-wall-y-scene-height-inspector').value;

            document.getElementById('tracking-mode-selection-wizard').value = sceneManager.trackingMode;

            changeTrackingMode(sceneManager, sceneManager.trackingMode);
            if(sceneManager.trackingMode === 'human-tracking') document.getElementById('overlap-height-selection-wizard').value = sceneManager.heightDetected;

        }

        function addSensorsTypesToForm(){
            const sensorTypesForm = document.getElementById('cam-types-checkboxes-wizard');
            /*while (sensorTypesForm.firstChild) {
                sensorTypesForm.removeChild(sensorTypesForm.firstChild);
            }
            let title = document.createElement("h3");
            title.innerHTML = "Choose the type.s of camera.s you want to use";
            sensorTypesForm.appendChild(title);*/
            
            const camTypesForm = document.createElement("div");
            camTypesForm.id = "cam-types-selection";
            getCamerasTypes().filter(c => c.recommended).forEach(c => {
                //const hookHeight = parseFloat(document.getElementById('input-hook-height-wizard').value);
                //if(hookHeight < c.rangeFar && c.suitable.includes(document.getElementById('tracking-mode-selection-wizard').value))
                //{
                    const camTypeChoice = document.createElement("div");
                    const camTypeCheckbox = document.createElement("input");
                    camTypeCheckbox.setAttribute("type", "checkbox");
                    if(c.checkedDefault) camTypeCheckbox.setAttribute("checked", "true");
                    camTypeCheckbox.id = "check-cam-" + c.id;
                    camTypeCheckbox.classList.add('checkbox-camera-type');
                    const label = document.createElement("label");

                    label.setAttribute("for", "check-cam-" + c.id)
                    label.innerHTML = c.niceName;

                    const url = document.location.href;
                    if(url.includes('beta')) label.classList.add('dark-mode');

                    camTypeChoice.appendChild(camTypeCheckbox);
                    camTypeChoice.appendChild(label);
                    camTypesForm.appendChild(camTypeChoice);
                //}
            });
            
            const lidarTypesForm = document.createElement("div");
            lidarTypesForm.id = "lidar-types-selection";
            getLidarsTypes().filter(t => t.recommended).forEach(l => {
                    const lidarTypeChoice = document.createElement("div");
                    const lidarTypeCheckbox = document.createElement("input");
                    lidarTypeCheckbox.setAttribute("type", "checkbox");
                    if(l.checkedDefault) lidarTypeCheckbox.setAttribute("checked", "true");
                    lidarTypeCheckbox.id = "check-lidar-" + l.id;
                    lidarTypeCheckbox.classList.add('checkbox-lidar-type');
                    const label = document.createElement("label");
                    label.setAttribute("for", "check-lidar-" + l.id)
                    label.innerHTML = l.name;

                    const url = document.location.href;
                    if(url.includes('beta')) label.classList.add('dark-mode');

                    lidarTypeChoice.appendChild(lidarTypeCheckbox);
                    lidarTypeChoice.appendChild(label);
                    lidarTypesForm.appendChild(lidarTypeChoice);
                //}
            });

            sensorTypesForm.appendChild(camTypesForm);
            sensorTypesForm.appendChild(lidarTypesForm);
        }

        function getCheckedSensor(mode)
        {
            switch(mode)
            {
                case 'wall-tracking':
                {
                    const lidarCheckboxes = document.getElementsByClassName('checkbox-lidar-type');
                    const lidarElementsChecked = [];
                    for(let i = 0; i < lidarCheckboxes.length; i++)
                    {
                        if(lidarCheckboxes[i].checked) lidarElementsChecked.push(lidarCheckboxes[i]);
                    }
                    if(lidarElementsChecked.length > 0)
                    {
                        const lidarTypesChecked = [];
                        lidarElementsChecked.forEach(l => {
                            const id = l.id;
                            const idSplit = id.split('-');
                            const last = idSplit[idSplit.length - 1];
                            lidarTypesChecked.push(parseFloat(last));
                        });
                        const lidarsChecked = getLidarsTypes().filter(c => lidarTypesChecked.includes(c.id));
                        return lidarsChecked;
                    }
                    else return [];
                }
                case 'human-tracking':
                case 'hand-tracking':
                default:
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
                            const idSplit = id.split('-');
                            const last = idSplit[idSplit.length - 1];
                            camTypesChecked.push(parseFloat(last));
                        });
                        const camerasChecked = getCamerasTypes().filter(c => camTypesChecked.includes(c.id));
                        return camerasChecked;
                    }
                    else return [];
                }
            }
        }

        function createSceneFromWizard(viewportManager, trackingMode)
        {
            const sceneManager = viewportManager.sceneManager;

            switch(trackingMode)
            {
                case 'wall-tracking':
                {
                    const inputWidth = parseFloat(document.getElementById('input-wall-y-scene-width-wizard').value);
                    const inputHeight = parseFloat(document.getElementById('input-wall-y-scene-height-wizard').value);

                    if(!inputWidth || !inputHeight)
                    {
                        alert("Please fill your scene horizontal and vertical length");
                        return false;
                    }

                    const givenWidth = Math.ceil(inputWidth / sceneManager.currentUnit.value * 100) / 100;
                    const givenHeight = Math.ceil(inputHeight / sceneManager.currentUnit.value * 100) / 100;

                    let configs = []; 

                    lidarsTypes.filter(l => l.recommended).filter(l => document.getElementById('check-lidar-' + l.id).checked).forEach(l => {
                        const config = calculateLidarConfig(l, givenWidth, givenHeight);
                        if(config) configs.push(config);
                    });

                    if(configs.length === 0)
                    {
                        alert("No sensor is adapted to your demand");
                        return false;
                    }
                    else
                    {
                        sceneManager.updateWallYAugmentaSceneBorder(inputWidth, inputHeight);

                        configs.sort((A,B) => A.positions.length - B.positions.length);
                        configs = configs.filter(c => c.positions.length === configs[0].positions.length);
                        configs.sort((A,B) => A.typeID - B.typeID); // lowest sensor id is priorised
                        let chosenConfig = configs[0];
                        sceneManager.objects.removeSensors();

                        createSceneFromLidarConfig(chosenConfig, sceneManager);

                        // update inspector infos
                        document.getElementById('input-wall-y-scene-width-inspector').value = inputWidth;
                        document.getElementById('input-wall-y-scene-height-inspector').value = inputHeight;
                    }
                    break;
                }
                case 'human-tracking':
                case 'hand-tracking':
                default:
                {
                    const inputWidth = parseFloat(document.getElementById('input-scene-width-wizard').value);
                    const inputLength = parseFloat(document.getElementById('input-scene-length-wizard').value);
                    //const camsHeight = Math.round(parseFloat(document.getElementById('input-hook-height-wizard').value) / sceneManager.currentUnit.value * 100) / 100;
                    const inputCamsHeight = parseFloat(document.getElementById('input-hook-height-wizard').value);
                    
                    let sceneElevation, overlapHeightDetection;
                    switch(trackingMode)
                    {
                        case 'hand-tracking':
                            sceneElevation = SceneManager.TABLE_ELEVATION;
                            overlapHeightDetection = SceneManager.HAND_TRACKING_OVERLAP_HEIGHT;
                            break;
                        case 'human-tracking':
                        default:
                            sceneElevation = 0;
                            overlapHeightDetection = parseFloat(document.getElementById('overlap-height-selection-wizard').value);
                            break;
                    }

                    if(!inputWidth || !inputLength)
                    {
                        alert("Please fill your scene horizontal and vertical length");
                        return false;
                    }
                    if(!inputCamsHeight)
                    {
                        alert("Please fill the hook height from your scene");
                        return false;
                    }

                    const givenWidth = Math.ceil(inputWidth / sceneManager.currentUnit.value * 100) / 100;
                    const givenLength = Math.ceil(inputLength / sceneManager.currentUnit.value * 100) / 100;
                    const camsHeight = Math.round(inputCamsHeight / sceneManager.currentUnit.value * 100) / 100;

                    let configs = [];

                    getCamerasTypes().filter(c => c.recommended).filter(c => document.getElementById('check-cam-' + c.id).checked).forEach(type => {
                        const config = calculateCameraConfig(trackingMode, type, givenWidth, givenLength, camsHeight, overlapHeightDetection);
                        if(config) configs.push(config);
                    });

                    if(configs.length === 0)
                    {
                        alert("No sensor is adapted to your demand");
                        return false;
                    }
                    else
                    {
                        sceneManager.updateFloorAugmentaSceneBorder(inputWidth, inputLength);

                        configs.sort((A,B) => A.nbW * A.nbH - B.nbW * B.nbH);
                        configs = configs.filter(c => c.nbW * c.nbH === configs[0].nbW * configs[0].nbH);
                        configs.sort((A,B) => A.typeID - B.typeID); // lowest sensor id is priorised
                        let chosenConfig = configs[0];
                        sceneManager.objects.removeSensors();

                        createSceneFromCameraConfig(chosenConfig, trackingMode, givenWidth, givenLength, camsHeight + sceneElevation, sceneManager);

                        // update inspector infos
                        document.getElementById('input-scene-width-inspector').value = inputWidth;
                        document.getElementById('input-scene-length-inspector').value = inputLength;
                        document.getElementById('input-scene-sensor-height-inspector').value = inputCamsHeight;
                        sceneManager.sceneSensorHeight = camsHeight; // ?? coming from master branch ! 

            
                        // // SWTICH BLOCK comming from master branch, should we keep it ? -> looks like it is already done in uiManager.changeTrackingMode()
                        // switch(trackingMode)
                        // {
                        //     case 'hand-tracking':
                        //         document.getElementById('overlap-height-inspector').classList.add('hidden');
                        //         break;
                        //     case 'human-tracking':
                        //     default:
                        //         document.getElementById('overlap-height-inspector').classList.remove('hidden');
                        //         document.getElementById('overlap-height-selection-inspector').value = document.getElementById('overlap-height-selection-wizard').value
                        //         break;
                        // }
                        // END SWITCH BLOCK

                        if(trackingMode === 'human-tracking') sceneManager.heightDetected = overlapHeightDetection;
                    }
                    break;
                }
            }

            document.getElementById('tracking-mode-selection-inspector').value = trackingMode;
            sceneManager.changeTrackingMode(trackingMode);

            //viewportManager.placeCamera();
            viewportManager.setupCameraChangement(!!viewportManager.activeCamera.isOrthographicCamera);

            document.getElementById('wizard-modal').classList.add('hidden');

            return true;
        }
    }
}

function checkCameraCoherence(givenHookHeight, overlapHeightDetection, maxFar, minNear)
{
    return givenHookHeight <= maxFar && givenHookHeight >= overlapHeightDetection + minNear;            
}

function checkLidarCoherence(givenSceneWidth, givenSceneHeight, maxFar)
{
    /** 
     * Min dist between lidar  = rangeFar / RATIO (arbitrary, RATIO = rangeFar / minDist : minDist = rangeFar / RATIO) //Modify arbitrary RATIO in Lidar class
     * lidarMaxHeight = sqrt(rangeFar * rangeFar - (minDist/2) * (minDist/2))
     * lidarMaxHeight = sqrt(rangeFar * rangeFar - (rangeFar/(2*RATIO)) * (rangeFar/(2*RATIO)))
     * lidarMaxHeight = sqrt(1 - 1/(4*RATIO*RATIO)) * rangeFar
     */

    const sqRatio = Lidar.DEFAULT_RATIO_FAR_MINDIST * Lidar.DEFAULT_RATIO_FAR_MINDIST;
    return (givenSceneHeight <= Math.sqrt(1 - 1 / (4 * sqRatio)) * maxFar /* above */ ||
            givenSceneWidth <= 2 * maxFar * Math.abs(Math.sin(Lidar.DEFAULT_MIN_ANGLE_TO_AVOID_OBSTRUCTION) /* on sides */ ))
            
}

function getMaxFarFromSensors(sensors, trackingMode)
{
    if(sensors.length > 0)
    {
        const sensorsCopy = [...sensors];
        if(trackingMode === "hand-tracking")
        {
            sensorsCopy.sort((A,B) => B.handFar - A.handFar)
            return sensorsCopy[0].handFar;
        }
        else
        {
            sensorsCopy.sort((A,B) => B.rangeFar - A.rangeFar)
            return sensorsCopy[0].rangeFar;
        }
    }
    return 0;
}

function getMinNearFromSensors(sensors)
{
    if(sensors.length > 0)
    {
        const sensorsCopy = [...sensors];
        sensorsCopy.sort((A,B) => A.rangeNear - B.rangeNear)
        return sensorsCopy[0].rangeNear;
    }
    return 0;
}

function calculateLidarConfig(lidarType, givenWidth, givenHeight){
    /** 
     * Min dist between lidar  = rangeFar / RATIO (arbitrary, RATIO = rangeFar / minDist : minDist = rangeFar / RATIO) //Modify arbitrary RATIO in Lidar class
     * lidarMaxHeight = sqrt(rangeFar * rangeFar - (minDist/2) * (minDist/2))
     * lidarMaxHeight = sqrt(rangeFar * rangeFar - (rangeFar/(2*RATIO)) * (rangeFar/(2*RATIO)))
     * lidarMaxHeight = sqrt(1 - 1/(4*RATIO*RATIO)) * rangeFar
     */

    const sqRatio = Lidar.DEFAULT_RATIO_FAR_MINDIST * Lidar.DEFAULT_RATIO_FAR_MINDIST;
    //if possible, put above
    if(givenHeight <= Math.sqrt(1 - 1 / (4 * sqRatio)) * lidarType.rangeFar)
    {
        const widthCoveredByOneLidar = 2 * Math.sqrt(lidarType.rangeFar * lidarType.rangeFar - givenHeight*givenHeight);
        const nbLidars = Math.ceil(givenWidth / widthCoveredByOneLidar);
        const pos = [];
        const distBetweenLidars = Math.max(givenWidth / nbLidars, lidarType.rangeFar / Lidar.DEFAULT_RATIO_FAR_MINDIST);
        const offsetX = (givenWidth - distBetweenLidars * (nbLidars - 1)) / 2.0;
        for(let i = 0; i < nbLidars; i++)
        {
            pos.push(new Vector2(offsetX + i* distBetweenLidars, givenHeight));
        }
        return { typeID: lidarType.id, positions: pos };
    }
    // else, if possible put on sides
    else if (givenWidth <= 2 * lidarType.rangeFar * Math.abs(Math.sin(Lidar.DEFAULT_MIN_ANGLE_TO_AVOID_OBSTRUCTION)))
    {
        const maxRayAngle = Lidar.DEFAULT_MIN_ANGLE_TO_AVOID_OBSTRUCTION;
        if(Math.abs(maxRayAngle % Math.PI) < 0.001)
        {
            return { typeID: lidarType.id, positions: [new Vector2(0, 1), new Vector2(givenWidth, 1)]};
        }
        else if(Math.abs(maxRayAngle % (Math.PI / 2.0)) > 0.001)
        {
            // Highest possible
            // const height = Math.sqrt(l.rangeFar * l.rangeFar - (givenWidth/2) * (givenWidth/2));
            
            // Bottommost possible
            // const height = Lidar.DEFAULT_MIN_ANGLE_TO_AVOID_OBSTRUCTION % Math.PI / 2.0 !== 0 ?
            //                 givenWidth / (2 * Math.tan(Lidar.DEFAULT_MIN_ANGLE_TO_AVOID_OBSTRUCTION)) :
            //                 0;

            //Average between two 
            const heighest = Math.sqrt(lidarType.rangeFar * lidarType.rangeFar - (givenWidth/2) * (givenWidth/2));
            const bottommost = Lidar.DEFAULT_MIN_ANGLE_TO_AVOID_OBSTRUCTION % Math.PI / 2.0 !== 0 ?
                            givenWidth / (2 * Math.tan(Lidar.DEFAULT_MIN_ANGLE_TO_AVOID_OBSTRUCTION)) :
                            0;
            const height = (heighest + bottommost) / 2.0;

            return { typeID: lidarType.id, positions: [new Vector2(0, height), new Vector2(givenWidth, height)] };
        }
    }

    return false;
}

function calculateCameraConfig(trackingMode, cameraType, givenWidth, givenLength, camsHeight, overlapHeightDetection)
{
    let augmentaFar = 0;
    switch(trackingMode)
    {
        case 'hand-tracking':
            augmentaFar = cameraType.handFar;
            break;
        case 'human-tracking':
        default:
            augmentaFar = cameraType.rangeFar;
            break;
    }
    if(camsHeight <= augmentaFar && camsHeight >= cameraType.rangeNear + overlapHeightDetection)
    {
        const widthAreaCovered = Math.abs(Math.tan((cameraType.HFov/2.0) * Math.PI / 180.0))*(camsHeight - overlapHeightDetection) * 2;
        const heightAreaCovered = Math.abs(Math.tan((cameraType.VFov/2.0) * Math.PI / 180.0))*(camsHeight - overlapHeightDetection) * 2;

        const nbCamsNoRot = Math.ceil(givenWidth / widthAreaCovered) * Math.ceil(givenLength / heightAreaCovered);
        const nbCamsRot = Math.ceil(givenWidth / heightAreaCovered) * Math.ceil(givenLength / widthAreaCovered);

        return nbCamsRot < nbCamsNoRot
            ?
            { typeID: cameraType.id, w: heightAreaCovered, h:widthAreaCovered, nbW: Math.ceil(givenWidth / heightAreaCovered), nbH: Math.ceil(givenLength / widthAreaCovered), rot: true }
            :
            { typeID: cameraType.id, w: widthAreaCovered, h:heightAreaCovered, nbW: Math.ceil(givenWidth / widthAreaCovered), nbH: Math.ceil(givenLength / heightAreaCovered), rot: false };
    }

    return false;
}

function createSceneFromCameraConfig(config, trackingMode, givenWidth, givenLength, camsZPosition, sceneManager)
{
    let offsetX = config.w / 2.0;
    let offsetY = config.h / 2.0;
    if(config.nbW === 1) offsetX -= (config.nbW*config.w - givenWidth)/2.0;
    if(config.nbH === 1) offsetY -= (config.nbH*config.h - givenLength)/2.0;
    const oX = config.nbW > 1 ? (config.nbW*config.w - givenWidth)/(config.nbW - 1) : 0;
    const oY = config.nbH > 1 ? (config.nbH*config.h - givenLength)/(config.nbH - 1) : 0;

    for(let i = 0; i < config.nbW; i++)
    {
        for(let j = 0; j < config.nbH; j++)
        {
            config.rot 
                ?
                sceneManager.objects.addNode(true, trackingMode, config.typeID, offsetX + i*(config.w - oX), offsetY + j*(config.h - oY), camsZPosition, 0, 0, Math.PI/2.0)
                :
                sceneManager.objects.addNode(true, trackingMode, config.typeID, offsetX + i*(config.w - oX), offsetY + j*(config.h - oY), camsZPosition);

        }
    }
}

function createSceneFromLidarConfig(config, sceneManager)
{
    for(let i = 0; i < config.positions.length; i++)
    {
        sceneManager.objects.addLidar(true, config.typeID, config.positions[i].x, config.positions[i].y);
    }
}


export { Wizard }

export { checkCameraCoherence, checkLidarCoherence, getMinNearFromSensors, getMaxFarFromSensors, calculateLidarConfig, calculateCameraConfig, createSceneFromLidarConfig, createSceneFromCameraConfig }
