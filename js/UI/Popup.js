import { getCamerasTypes, getLidarsTypes } from '../data.js';
import { main } from '../main.js';
import { SceneManager } from '../scene/SceneManager.js';
import { calculateCameraConfig, calculateLidarConfig, checkCameraCoherence, checkLidarCoherence, createSceneFromCameraConfig, createSceneFromLidarConfig, getMinNearFromSensors, getMaxFarFromSensors } from '../UI/Wizard.js';

class Popup{
    constructor(sceneManager){
        /** VALUES FILLED THROUGH FROM */
        this.trackingMode = "human-tracking";
        let trackingMode = this.trackingMode;
        this.givenWidth = 0;
        let givenWidth = this.givenWidth;
        this.givenLength = 0;
        let givenLength = this.givenLength;
        this.givenHeight = 0;
        let givenHeight = this.givenHeight;
        this.sensorsCompatible = [];
        let sensorsCompatible = this.sensorsCompatible;
        this.usedSensor = undefined;
        let usedSensor = this.usedSensor;

        /** UI */
        window.addEventListener('resize', onWindowResize);
        function onWindowResize() {

            document.getElementById('popup').classList.add('column');
            document.getElementById('tracking-mode-selection-builder').classList.add('row');
            document.getElementById('hardware-sensors-selection').classList.add('row');
            document.getElementById('my-system-section-builder').classList.add('row');
        }

        /** RESTORE SESSION */
        onWindowResize();
        restoreSession();

        function restoreSession()
        {
            const builderStep = sessionStorage.getItem('builderStep');
            // TODO: Refaire avec un switch case sans les break
            if(builderStep)
            {
                //initialization if session data is present
                initSetupSection();
                document.getElementById('popup').classList.remove('is-visible');
                if(builderStep <= 0) return;
                else
                {
                    initDimensionsSection();
                }
                if(builderStep <= 1) 
                {
                    document.getElementById('setup-content').classList.add('hidden');
                    document.getElementById('dimensions-content').classList.remove('hidden');
                    document.getElementById('dimensions-tab').classList.add('passed-tab');
                    return;
                }
                else 
                {
                    getDimensions();
                    initHardwareSection();
                    selectUsedSensor();
                }
                if(builderStep <= 2)
                {
                    document.getElementById('setup-content').classList.add('hidden');
                    document.getElementById('hardware-content').classList.remove('hidden');

                    document.getElementById('dimensions-tab').classList.add('passed-tab');
                    document.getElementById('hardware-tab').classList.add('passed-tab');
                    return;
                }
                else
                {
                    getHardware();
                    initMySystemSection();
                }
                if(builderStep <= 3)
                {
                    document.getElementById('setup-content').classList.add('hidden');
                    document.getElementById('my-system-content').classList.remove('hidden');

                    document.getElementById('dimensions-tab').classList.add('passed-tab');
                    document.getElementById('hardware-tab').classList.add('passed-tab');
                    document.getElementById('my-system-tab').classList.add('passed-tab');
                    return;
                }
            }
            else{
                //no session data previously stored
                sessionStorage.setItem('builderStep', 0);
            }
        }

        /** PARAMETERS FUNCTIONS */
        this.setTrackingMode = function(mode){
            console.log('Setting tracking mode popup to', mode);
            trackingMode = mode;

            switch(trackingMode)
            {
                case 'wall-tracking':
                case 'hand-tracking':
                    document.getElementById("setup-target-overlap").classList.add("hidden")
                    break;
                case 'human-tracking':
                    document.getElementById("setup-target-overlap").classList.remove("hidden");
                    break;
                default:
                    break;
            }
        }

        /** SETUP SECTION */
        function initSetupSection()
        {
            //Get previous stored information
            const sceneInfos = sessionStorage.getItem('sceneInfos');
            if(sceneInfos) trackingMode = JSON.parse(sceneInfos).trackingMode;

            //Highlight the previous stored option or "human-tracking" by default
            const trackingModeRadios = document.getElementsByName("tracking-mode-selection-builder");
            for(let i = 0; i < trackingModeRadios.length; i++)
            {
                trackingModeRadios[i].checked = (trackingModeRadios[i].value === (trackingMode ? trackingMode : "human-tracking"));
            }
        }
                
        //EVENT LISTENERS
        const trackingModeRadios = document.getElementsByName("tracking-mode-selection-builder");
        for(let i = 0; i < trackingModeRadios.length; i++)
        {
            trackingModeRadios[i].addEventListener('click', () => 
            {
                //Current selected value
                let trackingMode = trackingModeRadios[i].value;
                //change 3D scene
                //sceneManager.changeTrackingMode(trackingMode)
                //change selector inspector
                //main.uiManager.changeTrackingMode(trackingMode);
                //document.getElementById("tracking-mode-selection-inspector").value = trackingMode;
                sceneManager.trackingModeObservable.set(trackingModeRadios[i].value)
                //reset warning messages on successive tabs
                resetWarnings();
            });
        }

        /* TODO ADVANCED TRACKING MODES
        document.getElementById('tracking-mode-advanced').addEventListener('click', () => {
            const trackingModeChoices = document.getElementById('tracking-mode-selection-builder').children;
            for(let i = 0; i < trackingModeChoices.length; i++)
            {
                trackingModeChoices[i].classList.remove('hidden');
            }
            document.getElementById('tracking-mode-advanced').classList.add('hidden');
        });
        */

        document.getElementById("overlap-height-selection-popup").addEventListener('change', () => {
            sceneManager.heightDetected = parseFloat(document.getElementById("overlap-height-selection-popup").value);
            sceneManager.objects.populateStorage();
        });

        document.getElementById('next-button-setup').addEventListener('click', () => 
        {
            const trackingModeRadios = document.getElementsByName("tracking-mode-selection-builder");
            for(let i = 0; i < trackingModeRadios.length; i++)
            {
                if(trackingModeRadios[i].checked)
                {
                    trackingMode = trackingModeRadios[i].value
                    break;
                }
            }

            if(!trackingMode)
            {
                document.getElementById('setup-warning-message').classList.remove('hidden');
                return;
            }

            const trackingModes = ['human-tracking', 'hand-tracking','wall-tracking'];
            if(!trackingModes.includes(trackingMode))
            {
                /* TODO: TO FORM */
                return;
            }
            
            initDimensionsSection();

            document.getElementById('setup-content').classList.add('hidden');
            document.getElementById('dimensions-content').classList.remove('hidden');
            document.getElementById('dimensions-tab').classList.add('passed-tab');

            sessionStorage.setItem('builderStep', 1);
        });

        document.getElementById('dimensions-need-something-different-button').addEventListener('click', () => {
            /* TODO: TO FORM */
        });


        /** DIMENSIONS SECTION */
        function resetDimensionsSection()
        {
            givenWidth = undefined;
            givenLength = undefined;
            givenHeight = undefined;

            document.getElementById('dimensions-length').classList.remove('hidden');
            document.getElementById('dimensions-distance-text-default').classList.remove('hidden');
            document.getElementById('dimensions-distance-text-hand-tracking').classList.add('hidden');
            document.getElementById('dimensions-distance-text-wall-tracking').classList.add('hidden');
            document.getElementById('dimensions-distance-input').placeholder = `Sensor height`;

            document.getElementById('dimensions-warning-message').classList.add('hidden');
        }

        document.getElementById('dimensions-width-input').addEventListener('change', onChangeDimensionsInput);
        document.getElementById('dimensions-length-input').addEventListener('change', onChangeDimensionsInput);
        document.getElementById('dimensions-distance-input').addEventListener('change', onChangeDimensionsInput);

        document.getElementById('sensor-height-infos').addEventListener('mouseover', (e) => 
        {
            const infosText = document.getElementById('sensor-height-infos-text');
            infosText.style.left = (e.clientX - 180).toString() + "px";
            infosText.style.top = (e.clientY - 130).toString() + "px";
            infosText.classList.remove('hidden');
        });
        document.getElementById('sensor-height-infos').addEventListener('mouseleave', () => document.getElementById('sensor-height-infos-text').classList.add('hidden'));

        function onChangeDimensionsInput()
        {
            const inputSceneWidth = parseFloat(document.getElementById('dimensions-width-input').value);
            const inputSceneLength = parseFloat(document.getElementById('dimensions-length-input').value);
            const inputSceneHeight = parseFloat(document.getElementById('dimensions-distance-input').value);

            const givenSceneWidth = Math.floor(parseFloat(inputSceneWidth) / sceneManager.currentUnit.value * 100) / 100;
            const givenSceneLength = Math.floor(parseFloat(inputSceneLength) / sceneManager.currentUnit.value * 100) / 100;
            const givenSceneHeight = Math.floor(parseFloat(inputSceneHeight) / sceneManager.currentUnit.value * 100) / 100;
            
            //CHECK INPUT COHERENCE
            if(trackingMode === "wall-tracking" && inputSceneWidth && inputSceneHeight)
            {
                if(inputSceneWidth > 0 && inputSceneHeight > 0)
                {
                    document.getElementById('dimensions-negative-values-warning').classList.add('hidden');
                    if(checkLidarCoherence(givenSceneWidth, givenSceneHeight, getMaxFarFromSensors(getLidarsTypes().filter(l => l.recommended), trackingMode)))
                    {
                        sceneManager.updateWallYAugmentaSceneBorder(inputSceneWidth, inputSceneHeight);

                        // update inspector infos
                        document.getElementById('input-wall-y-scene-width-inspector').value = inputSceneWidth;
                        document.getElementById('input-wall-y-scene-height-inspector').value = inputSceneHeight;

                        document.getElementById('dimensions-warning-message').classList.add('hidden');
                        return true;
                    }
                    else
                    {
                        resetWarnings();
                        document.getElementById('dimensions-warning-message').classList.remove('hidden');
                        return false;
                    }
                }
                else
                {
                    resetWarnings();
                    document.getElementById('dimensions-negative-values-warning').classList.remove('hidden');
                }
            }
            else if(inputSceneWidth && inputSceneLength)
            {
                if(inputSceneWidth > 0 && inputSceneLength > 0)
                {
                    document.getElementById('dimensions-negative-values-warning').classList.add('hidden');
                    sceneManager.updateFloorAugmentaSceneBorder(inputSceneWidth, inputSceneLength);
                    //update inspector
                    document.getElementById('input-scene-width-inspector').value = inputSceneWidth;
                    document.getElementById('input-scene-length-inspector').value = inputSceneLength;
                }
                else
                {
                    resetWarnings();
                    document.getElementById('dimensions-negative-values-warning').classList.remove('hidden');
                }

                if(givenSceneHeight > 0)
                {
                    const camerasTypesRecommended = getCamerasTypes().filter(c => c.recommended);
                    const overlapHeightDetection = trackingMode === 'human-tracking' ? SceneManager.DEFAULT_DETECTION_HEIGHT : SceneManager.HAND_TRACKING_OVERLAP_HEIGHT;
                    const maxFar = getMaxFarFromSensors(camerasTypesRecommended, trackingMode);
                    const minNear = getMinNearFromSensors(camerasTypesRecommended);
                    
                    if(checkCameraCoherence(givenSceneHeight, overlapHeightDetection, maxFar, minNear))
                    {
                        const warningElem = document.getElementById('warning-hook-height');
                        if(warningElem) document.getElementById('surface-warning-message').classList.add('hidden');
                        //update inspector
                        document.getElementById('input-scene-sensor-height-inspector').value = inputSceneHeight;

                        return true;
                    }
                    else
                    {
                        const warningElem = document.getElementById('warning-hook-height');
                        if(!warningElem)
                        {
                            const newWarningElem = document.createElement("p");
                            newWarningElem.classList.add("warning-text");
                            newWarningElem.id = 'warning-hook-height';
                            newWarningElem.innerHTML = `The camera(s) you chose cannot see your tracking surface at this distance (min = <span data-unit=` + sceneManager.currentUnit.value + `>` + (Math.round(((minNear + overlapHeightDetection) * sceneManager.currentUnit.value) * 100) / 100.0) + `</span> <span data-unittext=` + sceneManager.currentUnit.label + `>` + sceneManager.currentUnit.label + `</span>, max = <span data-unit=` + sceneManager.currentUnit.value + `>` + (Math.round((maxFar * sceneManager.currentUnit.value) * 100) / 100.0) + `</span> <span data-unittext=` + sceneManager.currentUnit.label + `>` + sceneManager.currentUnit.label + `</span>)`;
                            document.getElementById('surface-warning-message').appendChild(newWarningElem);
                        }
                        resetWarnings();
                        document.getElementById('surface-warning-message').classList.remove('hidden');
                        return false;
                    }
                }
            }
            
            return false;
        }

        function resetWarnings(){
            document.getElementById('dimensions-negative-values-warning').classList.add('hidden');
            document.getElementById('dimensions-warning-message').classList.add('hidden');
            document.getElementById('surface-warning-message').classList.add('hidden');
            document.getElementById('dimensions-no-value-warning').classList.add('hidden');
        }

        function initDimensionsSection()
        {
            if(trackingMode === "hand-tracking")
            {
                document.getElementById('dimensions-distance-text-default').classList.add('hidden');
                document.getElementById('dimensions-distance-text-hand-tracking').classList.remove('hidden');
            }

            if(trackingMode === "wall-tracking")
            {
                document.getElementById('dimensions-length').classList.add('hidden');
                document.getElementById('dimensions-distance-text-default').classList.add('hidden');
                document.getElementById('dimensions-distance-text-wall-tracking').classList.remove('hidden');
                document.getElementById('dimensions-distance-input').placeholder = `Height`;
            }
            
            if(trackingMode)
            {
                const sceneInfos = sessionStorage.getItem('sceneInfos');
                if(sceneInfos)
                {
                    const sceneSize = JSON.parse(sceneInfos).sceneSize;
                    switch(trackingMode)
                    {
                        case 'wall-tracking':
                            document.getElementById('dimensions-width-input').value = Math.floor(sceneSize[0] * sceneManager.currentUnit.value * 100) / 100;
                            document.getElementById('dimensions-distance-input').value = Math.floor(sceneSize[1] * sceneManager.currentUnit.value * 100) / 100;
                            break;
                        case 'hand-tracking':
                        case 'human-tracking':
                            document.getElementById('dimensions-width-input').value = Math.floor(sceneSize[0] * sceneManager.currentUnit.value * 100) / 100;
                            document.getElementById('dimensions-length-input').value = Math.floor(sceneSize[1] * sceneManager.currentUnit.value * 100) / 100;
                            const nodes = JSON.parse(sceneInfos).objects.nodes;
                            if(nodes.length > 0) document.getElementById('dimensions-distance-input').value = Math.floor((nodes[0].p_z - (trackingMode === 'hand-tracking' ? SceneManager.TABLE_ELEVATION : 0)) * sceneManager.currentUnit.value * 100) / 100;
                            else document.getElementById('dimensions-distance-input').value = '';
                            break;
                        default:
                            break;
                    }
                }
            }
        }

        function getDimensions()
        {
            givenWidth = Math.floor(parseFloat(document.getElementById('dimensions-width-input').value) / sceneManager.currentUnit.value * 100) / 100;
            givenLength = Math.floor(parseFloat(document.getElementById('dimensions-length-input').value) / sceneManager.currentUnit.value * 100) / 100;
            givenHeight = Math.floor(parseFloat(document.getElementById('dimensions-distance-input').value) / sceneManager.currentUnit.value * 100) / 100;
        }

        document.getElementById('next-button-dimensions').addEventListener('click', () => 
        {
            resetWarnings();
            document.getElementById('dimensions-no-value-warning').classList.remove('hidden');
            if(!onChangeDimensionsInput()) return;

            getDimensions()

            if((trackingMode !== 'wall-tracking' && ( !givenWidth || !givenLength || !givenHeight)) || 
                (trackingMode === 'wall-tracking' && (!givenWidth || !givenHeight))) {
                    return;
                }

            if((trackingMode !== 'wall-tracking' && (givenWidth <= 0 || givenLength <= 0 || givenHeight <= 0)) || 
                (trackingMode === 'wall-tracking' && (givenWidth <= 0 || givenHeight <= 0))) return;

            resetWarnings();
            initHardwareSection();
            selectFirstSensorAvailable();

            document.getElementById('dimensions-content').classList.add('hidden');
            document.getElementById('hardware-content').classList.remove('hidden');

            document.getElementById('hardware-tab').classList.add('passed-tab');

            sessionStorage.setItem('builderStep', 2);
        });

        document.getElementById('previous-button-dimensions').addEventListener('click', () => 
        {
            resetDimensionsSection();

            document.getElementById('dimensions-content').classList.add('hidden');
            document.getElementById('setup-content').classList.remove('hidden');

            document.getElementById('dimensions-tab').classList.remove('passed-tab');

            sessionStorage.setItem('builderStep', 0);
        });

        document.getElementById('hardware-need-something-different-button').addEventListener('click', () => {
            /* TODO: TO FORM */
        });


        /** HARDWARES SECTION */
        function resetHardwareSection()
        {
            usedSensor = undefined;

            sensorsCompatible.length = 0;
            deleteAllChildren(document.getElementById('hardware-sensors-selection'));

            document.getElementById('hardware-input-radio-indoor').checked = true;
            document.getElementById('hardware-input-radio-outdoor').checked = false;

            document.getElementById('hardware-warning-message').classList.add('hidden');
        }

        function initHardwareSection()
        {
            if(trackingMode === "wall-tracking")
            {
                getLidarsTypes().filter(l => l.recommended).forEach(l => {
                    if(checkLidarCoherence(givenWidth, givenHeight, l.rangeFar, trackingMode))
                        { sensorsCompatible.push(l) }
                })
            }
            else
            {
                getCamerasTypes().filter(c => c.recommended).forEach(c => {
                    const overlapHeightDetection = trackingMode === 'human-tracking' ? SceneManager.DEFAULT_DETECTION_HEIGHT : SceneManager.HAND_TRACKING_OVERLAP_HEIGHT;
                    if(checkCameraCoherence(givenHeight, overlapHeightDetection, trackingMode === 'hand-tracking' ? c.handFar : c.rangeFar, c.rangeNear))
                        { sensorsCompatible.push(c) }
                })
            }

            if(sensorsCompatible.length === 0) return;

            const sensorsDiv = document.getElementById('hardware-sensors-selection');
            sensorsCompatible.forEach(s => {
                const sensorChoice = document.createElement('label');
                sensorChoice.id = "hardware-input-" + s.textId;
                sensorChoice.classList.add("row", "center-x", "hardware-sensors-type", "hardware-radio-label");

                const near = Math.floor(s.rangeNear * sceneManager.currentUnit.value * 100) / 100;
                const far = Math.floor((trackingMode === 'hand-tracking' ? s.handFar : s.rangeFar) * sceneManager.currentUnit.value * 100) / 100;
                sensorChoice.innerHTML = `
                    <input id="` + s.textId + `" type="radio" name="sensor-choice" value="` + s.textId + `">
                    <div class="row center-x center-y hardware-switch">
                    <p>` + s.niceName + ` (<span data-unit=` + sceneManager.currentUnit.value + `>` + near + `</span> - <span data-unit=` + sceneManager.currentUnit.value + `>` + far + `</span><span data-unittext=` + sceneManager.currentUnit.value + `>` + sceneManager.currentUnit.label +`</span>)</p>
                    </div>`;
                sensorsDiv.appendChild(sensorChoice);
            });
        
            bindHardwareEventListeners(sensorsDiv.children);
        
            const sceneInfos = sessionStorage.getItem('sceneInfos');
            let sceneEnvironment = undefined;
            if(sceneInfos) sceneEnvironment = JSON.parse(sceneInfos).sceneEnvironment;

            const switchElement = document.getElementById('hardware-switch-indoor-outdoor');
            const switchInputs = switchElement.querySelectorAll('input');
            for(let i = 0; i < switchInputs.length; i++)
            {
                if(switchInputs[i].value === (sceneEnvironment ? sceneEnvironment : 'indoor'))
                {
                    disableSensorsConsideringEnvironment(switchInputs[i].value);
                    switchInputs[i].checked = true;
                }
                else switchInputs[i].checked = false;
            }
        }

        function bindHardwareEventListeners(sensorsElements)
        {
            // Switch indoor-outdoor events
            const switchElement = document.getElementById('hardware-switch-indoor-outdoor');
            const switchInputs = switchElement.querySelectorAll('input');
            for(let i = 0; i < switchInputs.length; i++)
            {
                switchInputs[i].addEventListener('click', () => {
                    disableSensorsConsideringEnvironment(switchInputs[i].value);
                    sceneManager.changeEnvironment(switchInputs[i].value); 
                });
            }

            //Click on sensor events
            for(let i = 0; i < sensorsElements.length; i++)
            {
                if(!sensorsElements[i].disabled)
                {
                    sensorsElements[i].addEventListener('click', () => {
                        const sensorInput = sensorsElements[i].querySelector('input');
                        if(!sensorInput.disabled && !sensorInput.checked)
                        {
                            const sensorTextId = sensorsElements[i].id.substring("hardware-input-".length);

                            //on click on a sensor, display the scene calculated with this sensor
                            switch(trackingMode)
                            {
                                case 'wall-tracking':
                                {
                                    const sensor = getLidarsTypes().find(sensorType => sensorType.textId === sensorTextId);
                                    const config = calculateLidarConfig(sensor, givenWidth, givenHeight);
                                    if(!config){
                                        console.error('no config found with this setup');
                                        return;
                                    }
                                    sceneManager.objects.removeSensors();
                                    createSceneFromLidarConfig(config, sceneManager);
                                    break;
                                }
                                case 'human-tracking':
                                case 'hand-tracking':
                                {
                                    const sensor = getCamerasTypes().find(sensorType => sensorType.textId === sensorTextId);
                                    const overlapHeightDetection = trackingMode === 'human-tracking' ? SceneManager.DEFAULT_DETECTION_HEIGHT : SceneManager.HAND_TRACKING_OVERLAP_HEIGHT;
                                    const config = calculateCameraConfig(trackingMode, sensor, givenWidth, givenLength, givenHeight, overlapHeightDetection);
                                    if(!config){
                                        console.error('no config found with this setup');
                                        return;
                                    }
                                    sceneManager.objects.removeSensors();
                                    createSceneFromCameraConfig(config, trackingMode, givenWidth, givenLength, givenHeight + sceneManager.sceneElevation, sceneManager);
                                    break;
                                }
                                default:
                                    break;
                            }
                        }
                    });
                }
            }
        }

        function disableSensorsConsideringEnvironment(environment)
        {
            let disabledSensorsNumber = 0;
            sensorsCompatible.forEach(s => {
                if(s.canBeUsed.includes(environment)){
                    document.getElementById(s.textId).disabled = false;
                    document.getElementById("hardware-input-" + s.textId).classList.remove("unselectable");
                }
                else{
                    document.getElementById(s.textId).disabled = true;
                    document.getElementById("hardware-input-" + s.textId).classList.add("unselectable")
                    document.getElementById(s.textId).checked = false;

                    disabledSensorsNumber++;
                }
            });
            if(sensorsCompatible.length === disabledSensorsNumber){
                document.getElementById('hardware-warning-message').classList.remove('hidden');
            }
            else {
                document.getElementById('hardware-warning-message').classList.add('hidden');
                selectFirstSensorAvailable();
            }
        }

        function selectFirstSensorAvailable()
        {
            const sensorsDiv = document.getElementById('hardware-sensors-selection');
            for(let i = 0; i < sensorsDiv.children.length; i++)
            {
                if(!sensorsDiv.children[i].classList.contains('unselectable'))
                {
                    if(sceneManager.augmentaSceneLoaded) sensorsDiv.children[i].dispatchEvent(new Event('click'));
                    sensorsDiv.children[i].children[0].checked = true;
                    break;
                }
            }
        }

        function selectUsedSensor()
        {
            const sceneInfos = sessionStorage.getItem('sceneInfos');
            if(sceneInfos)
            {
                const objects = JSON.parse(sceneInfos).objects;
                if(objects.lidars.length > 0 || objects.nodes.length > 0)
                {
                    let sensorTextId;
                    switch(trackingMode)
                    {
                        case "wall-tracking":
                            const usedLidarId = (objects.lidars.length > 0) ? objects.lidars[0].lidarTypeId : 0;
                            sensorTextId = getLidarsTypes().find(l => l.id === usedLidarId).textId;
                            break;
                        case "hand-tracking":
                        case "human-tracking":
                            const usedCameraId = (objects.nodes.length > 0) ? objects.nodes[0].cameraTypeId : 0
                            sensorTextId = getCamerasTypes().find(c => c.id === usedCameraId).textId;
                            break;
                        default:
                            break;
                    }
            
                    const sensorsLabels = document.getElementById('hardware-sensors-selection').children;
            
                    for(let i = 0; i < sensorsLabels.length; i++)
                    {
                        if(!sensorsLabels[i].classList.contains('unselectable') && sensorsLabels[i].querySelector('input').value === sensorTextId)
                        {
                            if(sceneManager.augmentaSceneLoaded) sensorsLabels[i].dispatchEvent(new Event('click'));
                            sensorsLabels[i].querySelector('input').checked = true;
                            break;
                        }
                    }
                }
                else selectFirstSensorAvailable();
            }
        }

        function getHardware()
        {
            const sensorsRadios = document.getElementsByName("sensor-choice");
            for(let i = 0; i < sensorsRadios.length; i++)
            {
                if(sensorsRadios[i].checked) usedSensor = getCamerasTypes().concat(getLidarsTypes()).find(sensorType => sensorType.textId === sensorsRadios[i].value);
            }
        }

        document.getElementById('next-button-hardware').addEventListener('click', () => 
        {
            document.getElementById('popup').classList.remove('is-visible');

            // getHardware();
            
            // if(!usedSensor) return;

            // // fill "My system" section
            // initMySystemSection();

            // document.getElementById('hardware-content').classList.add('hidden');
            // document.getElementById('my-system-content').classList.remove('hidden');

            // document.getElementById('my-system-tab').classList.add('passed-tab');

            // sessionStorage.setItem('builderStep', 3);
        });

        document.getElementById('previous-button-hardware').addEventListener('click', () => 
        {
            sceneManager.objects.removeSensors();
            resetHardwareSection();

            document.getElementById('hardware-content').classList.add('hidden');
            document.getElementById('dimensions-content').classList.remove('hidden');

            document.getElementById('hardware-tab').classList.remove('passed-tab');

            sessionStorage.setItem('builderStep', 1);
        });


        /** MY SYTEM SECTION */
        function resetMySystemSection()
        {
            deleteAllChildren(document.getElementById('my-system-tracking-mode'));
            deleteAllChildren(document.getElementById('my-system-dimensions'));
            deleteAllChildren(document.getElementById('my-system-recap'));
        }

        function initMySystemSection()
        {
            // Tracking Mode 
            const mySystemTrackingMode = document.getElementById("tracking-mode-" + trackingMode + "-input").cloneNode(true);
            mySystemTrackingMode.id += '-copy';
            mySystemTrackingMode.children[0].checked = false;
            mySystemTrackingMode.children[0].disabled = true;
            document.getElementById('my-system-tracking-mode').appendChild(mySystemTrackingMode);

            // Dimensions 
            const mySystemDimensions = document.getElementById('dimensions-inputs').cloneNode(true);
            mySystemDimensions.id += 'copy';
            mySystemDimensions.classList.remove('row');
            mySystemDimensions.classList.add('column');
            const dimensionsInputs = mySystemDimensions.getElementsByTagName("input");
            for(let i = 0; i < dimensionsInputs.length; i++)
            {
                dimensionsInputs[i].readOnly = true;
            }
            document.getElementById('my-system-dimensions').appendChild(mySystemDimensions);
            
            // Recap 
            const recapDiv = document.getElementById('my-system-recap');

            let nbSensors;
            const sceneInfos = sessionStorage.getItem('sceneInfos');
            if(sceneInfos)
            {
                const objects = JSON.parse(sceneInfos).objects;
                switch(trackingMode)
                {
                    case "wall-tracking":
                        nbSensors = objects.lidars.length;
                        break;
                    case "hand-tracking":
                    case "human-tracking":
                        nbSensors = objects.nodes.length;
                        break;
                    default:
                        break;
                }
            }
            else
            {
                nbSensors = sceneManager.objects.getNbSensors();
            }

            const sensorInfo = document.createElement('p');
            sensorInfo.innerHTML = `x` + nbSensors + ` ` + usedSensor.niceName;
            recapDiv.appendChild(sensorInfo);

            usedSensor.accessories.forEach(a => {
                const nodeInfo = document.createElement('p');
                nodeInfo.innerHTML = `x` + nbSensors + ` ` + a;
                recapDiv.appendChild(nodeInfo)
            });
        }

        document.getElementById('previous-button-my-system').addEventListener('click', () => 
        {
            resetMySystemSection();

            document.getElementById('my-system-content').classList.add('hidden');
            document.getElementById('hardware-content').classList.remove('hidden');

            document.getElementById('my-system-tab').classList.remove('passed-tab');

            sessionStorage.setItem('builderStep', 2);
        });

        document.getElementById('finish-button-my-system').addEventListener('click', () => 
        {
            document.getElementById('popup').classList.remove('is-visible');
        });

        // Closing popup
        document.getElementById('close-popup').addEventListener('click', () => {
            document.getElementById('popup').classList.remove('is-visible');
        });

    }
}

export {Popup}

/** HANDY FUNCTIONS */
function deleteAllChildren(element)
{
    while (element.firstChild) 
    {
        element.removeChild(element.firstChild);
    }
}