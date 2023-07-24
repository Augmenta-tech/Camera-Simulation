import { SceneManager } from '/wp-content/themes/salient-child/builder-v2/designer/js/scene/SceneManager.js';
import { Node } from '/wp-content/themes/salient-child/builder-v2/designer/js/scene/objects/sensors/Node.js';
import { Wizard } from '/wp-content/themes/salient-child/builder-v2/designer/js/UI/Wizard.js';
import { Popup } from '/wp-content/themes/salient-child/builder-v2/designer/js/UI/Popup.js';

class UIManager{
    constructor()
    {
        //this.wizard = new Wizard();
        const scope = this;
        this.popup = null;
        var sceneManager;

        resetValues();

        this.bindEventListeners = function(viewportManager)
        {
            this.popup = new Popup(viewportManager.sceneManager);

            /* HANDLE BUTTONS */
            const toggleUnitButton = document.getElementById('toggle-unit-button');
            if(toggleUnitButton) toggleUnitButton.addEventListener('click', () => viewportManager.sceneManager.toggleUnit());

            const frustumButton = document.getElementById('display-frustums-button');
            if(frustumButton) frustumButton.addEventListener('click', () => viewportManager.sceneManager.objects.displayFrustums());
            const lidarRaysButton = document.getElementById('display-lidars-rays-button');
            if(lidarRaysButton) lidarRaysButton.addEventListener('click', () => viewportManager.sceneManager.objects.displayRays());

            const addNodeButton = document.getElementById('add-node-button');
            if(addNodeButton) addNodeButton.addEventListener('click', () => viewportManager.sceneManager.objects.addNode());
            const deleteAllNodesButton = document.getElementById('delete-all-nodes-button');
            if(deleteAllNodesButton) deleteAllNodesButton.addEventListener('click', () => viewportManager.sceneManager.objects.removeNodes());

            const addLidarButton = document.getElementById('add-lidar-button');
            if(addLidarButton) addLidarButton.addEventListener('click', () => viewportManager.sceneManager.objects.addLidar());
            const deleteAllLidarsButton = document.getElementById('delete-all-lidars-button');
            if(deleteAllLidarsButton) deleteAllLidarsButton.addEventListener('click', () => viewportManager.sceneManager.objects.removeLidars());

            const addDummyButton = document.getElementById('add-dummy-button');
            if(addDummyButton) addDummyButton.addEventListener('click', () => viewportManager.sceneManager.objects.addDummy());
            const deleteAllDummiesButton = document.getElementById('delete-all-dummies-button');
            if(deleteAllDummiesButton) deleteAllDummiesButton.addEventListener('click', () => viewportManager.sceneManager.objects.removeDummies());

            sceneManager = viewportManager.sceneManager
            //Share button click
            const copyUrlModal = document.getElementById("share-modal");
            document.getElementById('generate-link').addEventListener('click', () => {
                copyLink(sceneManager.objects.generateLink());
            });
            //Copy to clipboard click
            document.getElementById('copy-scene-link').addEventListener('click', () => {
                copyLink(sceneManager.objects.generateLink());
            });
            //CLOSE MODAL CHEN CLICKING THE CROSS
            document.getElementById('close-share-modal').addEventListener('click', () => copyUrlModal.classList.add('hidden'));
            //CLOSE MODAL WHEN CLICKING OUTSIDE
            window.addEventListener('click', () => {
                if(event.target == copyUrlModal) copyUrlModal.classList.add('hidden');
            });

            document.getElementById('load-file-input').addEventListener('change', (e) => loadJsonFile(e, sceneManager), false);
            document.getElementById('download-scene-file').addEventListener('click', () => downloadSceneFile(viewportManager.sceneManager));

            document.getElementById("input-scene-width-inspector").addEventListener('change', () => sceneManager.updateAugmentaSceneBorder(parseFloat(document.getElementById("input-scene-width-inspector").value), parseFloat(document.getElementById("input-scene-length-inspector").value)));
            document.getElementById("input-scene-length-inspector").addEventListener('change', () => sceneManager.updateAugmentaSceneBorder(parseFloat(document.getElementById("input-scene-width-inspector").value), parseFloat(document.getElementById("input-scene-length-inspector").value)));

            document.getElementById("input-wall-y-scene-width-inspector").addEventListener('change', () => sceneManager.updateWallYAugmentaSceneBorder(parseFloat(document.getElementById("input-wall-y-scene-width-inspector").value), parseFloat(document.getElementById("input-wall-y-scene-height-inspector").value)));
            document.getElementById("input-wall-y-scene-height-inspector").addEventListener('change', () => sceneManager.updateWallYAugmentaSceneBorder(parseFloat(document.getElementById("input-wall-y-scene-width-inspector").value), parseFloat(document.getElementById("input-wall-y-scene-height-inspector").value)));

            document.getElementById('open-wizard-button').addEventListener('click', () => {
                if(sceneManager.augmentaSceneLoaded)
                {
                    document.getElementById('popup').classList.add('is-visible');
                }
            });

            // document.getElementById("tracking-mode-selection-inspector").addEventListener('change', () => {
            //     const mode = document.getElementById("tracking-mode-selection-inspector").value;
            //     sceneManager.trackingModeObservable.set(mode);
            //     scope.displayWarning(sceneManager);
            // });

            // document.getElementById("overlap-height-selection-inspector").addEventListener('change', () => {
            //     sceneManager.heightDetectedObservable.set(parseFloat(document.getElementById("overlap-height-selection-inspector").value));
            // });

            //this.wizard.bindEventListeners(viewportManager, this);
        }

        function resetValues()
        {
            /* TODO: This should disappear : add data-unit="1" in every numeral inputs that we want to convert (this adds it in all inputs)*/
            //TOGGLE INPUTS  UNITS
            // const inputs = document.getElementsByTagName('input');
            // for(let i = 0; i < inputs.length; i++)
            //     if(inputs[i].type !== 'file' && inputs[i].id !== 'scene-file-name-input')
            //     { inputs[i].dataset.unit = SceneManager.DEFAULT_UNIT.value; }

            document.getElementById('scene-file-name-input').value = '';

            //INSPECTOR INPUTS
            //document.getElementById("tracking-mode-selection-inspector").value = SceneManager.DEFAULT_TRACKING_MODE;
            document.getElementById('overlap-height-selection-inspector').value = SceneManager.DEFAULT_DETECTION_HEIGHT;
            document.getElementById("input-scene-width-inspector").value = SceneManager.DEFAULT_WIDTH;
            document.getElementById("input-scene-length-inspector").value = SceneManager.DEFAULT_LENGTH;
            document.getElementById("input-wall-y-scene-width-inspector").value = SceneManager.DEFAULT_WIDTH;
            document.getElementById("input-wall-y-scene-height-inspector").value = SceneManager.DEFAULT_LENGTH;

            //WIZARD INPUTS
            // document.getElementById("input-scene-width-wizard").value = SceneManager.DEFAULT_WIDTH;
            // document.getElementById("input-scene-length-wizard").value = SceneManager.DEFAULT_LENGTH;
            // document.getElementById("input-wall-y-scene-width-wizard").value = SceneManager.DEFAULT_WIDTH;
            // document.getElementById("input-wall-y-scene-height-wizard").value = SceneManager.DEFAULT_LENGTH;
            // document.getElementById("input-hook-height-wizard").value = '';

            //INSPECTOR READONLY INPUTS
            document.getElementById("input-scene-sensor-height-inspector").value = Node.DEFAULT_NODE_HEIGHT;
            document.getElementById('scene-size-text-div').innerHTML= '<h3 id="scene-size-text">Scene size: <span data-unit=1>' + SceneManager.DEFAULT_WIDTH +'</span>x<span data-unit=1>'+ SceneManager.DEFAULT_LENGTH +'</span><span data-unittext="1">m</span> with a sensor height of <span data-unit="1">' + Node.DEFAULT_NODE_HEIGHT + '</span><span data-unittext="1">m</span></h3>';

            //document.getElementById("tracking-mode-selection-inspector").value = 'human-tracking';
        }

        function copyLink(link)
        {
            navigator.clipboard.writeText(link);

            document.getElementById("share-modal").classList.remove('hidden');
            //window.setTimeout(() => document.getElementById("share-modal").classList.add('hidden'), 1500);
        }

        function downloadSceneFile(sceneManager)
        {
            const fileNameInput = document.getElementById('scene-file-name-input');
            console.log("downloading...");
            if(fileNameInput && fileNameInput.value)
            {
                console.log("file name ok");
                const illegalSymbols = ['*', '.', '"', '/', '\\', '[', ']', ':', ';', '|', ',', '?', '<', '>'];
                const fileName = fileNameInput.value.toString();

                for(let i = 0; i < illegalSymbols.length; i++)
                {
                    const s = illegalSymbols[i];
                    if(fileName.includes(s))
                    {
                        document.getElementById('warning-text-input-illegal-symbol').classList.remove('hidden');
                        document.getElementById('illegal-symbol-used').innerHTML = s;
                        return;
                    }
                }
                console.log("file name ok ok");

                const data = sceneManager.objects.generateJson();
                const blob = new Blob([data], { type: 'application/json' });
                saveAs(blob, fileName + '.builder'); // module FileSaver
                document.getElementById('warning-text-input-illegal-symbol').classList.add('hidden');
            }
        }

        function loadJsonFile(e, sceneManager)
        {
            const file = e.target.files[0];
            if (!file) {
                return;
            }
            console.log(file);
            if(file.type !== 'application/json' && file.name.split(".")[1] != "builder")
            {
                alert(`Invalid file. Your file must end with ".json"`);
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                const contents = e.target.result;
                sceneManager.objects.removeSensors();
                sceneManager.objects.parseJson(contents);
            };
            reader.readAsText(file);
        }

        this.changeTrackingMode = function(trackingMode)
        {
            //console.log('Setting tracking mode UI to ', trackingMode);
            //Displayed image
            document.getElementById("tracking-img").src = "img/" + String(trackingMode) + ".png";

            switch (trackingMode) {
                case 'hand-tracking':
                    document.getElementById("coverage-section").classList.remove("hidden");
                    document.getElementById("height-detection-text").classList.add("hidden");
                    document.getElementById('scene-size-text-div').innerHTML= '<h3 id="scene-size-text">Scene size: <span data-unit=1>' + sceneManager.sceneWidth +'</span>x<span data-unit=1>'+ sceneManager.sceneWidth +'</span><span data-unittext="1">m</span> with a sensor height of <span data-unit="1">' + sceneManager.sceneSensorHeight + '</span><span data-unittext="1">m</span></h3>';
                    break;
                case 'wall-tracking':
                    document.getElementById("coverage-section").classList.add("hidden");
                    document.getElementById("height-detection-text").classList.add("hidden");
                    document.getElementById('scene-size-text-div').innerHTML= '<h3 id="scene-size-text">Scene size: <span data-unit=1>' + sceneManager.sceneWidth +'</span>x<span data-unit=1>'+ sceneManager.sceneLength +'</span><span data-unittext="1">m</span></h3>';
                    break;
                case 'human-tracking':
                    document.getElementById("coverage-section").classList.remove("hidden");
                    document.getElementById("height-detection-text").classList.remove("hidden");
                    document.getElementById('scene-size-text-div').innerHTML= '<h3 id="scene-size-text">Scene size: <span data-unit=1>' + sceneManager.sceneWidth +'</span>x<span data-unit=1>'+ sceneManager.sceneWidth +'</span><span data-unittext="1">m</span> with a sensor height of <span data-unit="1">' + sceneManager.sceneSensorHeight + '</span><span data-unittext="1">m</span></h3>';
                    break;
                default:
                    break;
            }

            //Old inspector system
            document.getElementById("tracking-mode-selection-inspector").value = trackingMode;
            switch(trackingMode)
            {
                case 'hand-tracking':
                    document.getElementById('overlap-height-inspector').classList.add('hidden');

                    document.getElementById('floor-scene-size-inspector').classList.remove('hidden');
                    document.getElementById('floor-scene-size-title-inspector').innerHTML = "Table scene size";
                    document.getElementById('wall-y-scene-size-inspector').classList.add('hidden');

                    //document.getElementById("delete-all-lidars-button").dispatchEvent(new Event('click'));

                    document.getElementById('nodes-buttons').classList.remove('hidden');
                    document.getElementById('lidars-buttons').classList.add('hidden');

                    const infoTableElemInspector = document.getElementById('info-table-height-inspector');

                    infoTableElemInspector.innerHTML = `<h3>The table is <span data-unit=1>` + SceneManager.TABLE_ELEVATION +`</span><span data-unittext=1>m</span> high</h3>`;

                    infoTableElemInspector.classList.remove("hidden");
                    break;
                case 'wall-tracking':
                    document.getElementById('overlap-height-inspector').classList.add('hidden');

                    document.getElementById('wall-y-scene-size-inspector').classList.remove('hidden');
                    document.getElementById('floor-scene-size-inspector').classList.add('hidden');

                    //document.getElementById("delete-all-nodes-button").dispatchEvent(new Event('click'));

                    document.getElementById('lidars-buttons').classList.remove('hidden');
                    document.getElementById('nodes-buttons').classList.add('hidden');
                    document.getElementById('info-table-height-inspector').classList.add("hidden");
                    break;
                case 'human-tracking':
                default:
                    document.getElementById('overlap-height-inspector').classList.remove('hidden');
                    document.getElementById('overlap-height-selection-inspector').value = document.getElementById('default-height-detected').value;

                    document.getElementById('floor-scene-size-inspector').classList.remove('hidden');
                    document.getElementById('floor-scene-size-title-inspector').innerHTML = "Floor scene size";
                    document.getElementById('wall-y-scene-size-inspector').classList.add('hidden');

                    //document.getElementById("delete-all-lidars-button").dispatchEvent(new Event('click'));

                    document.getElementById('nodes-buttons').classList.remove('hidden');
                    document.getElementById('lidars-buttons').classList.add('hidden');
                    document.getElementById('info-table-height-inspector').classList.add("hidden");

                    break;
            }
        }

        this.changeHeightDetected = function(value){
            //console.log("changing height to ", value);
            let text;
            switch (value) {
                case 1.2:
                    text = "Target overlap height detection: Hips"
                    break;
                case 1.6:
                    text = "Target overlap height detection: Shoulders"
                    break;
                case 2:
                    text = "Target overlap height detection: Entire body"
                    break;
                default:
                    text = ""
                    break;
            }
            document.getElementById("height-detection-text").innerText = text;

            //document.getElementById('overlap-height-selection-inspector').value = value;
        }

        /* UPDATE */
        function isAreaCoveredUI(sceneManager)
        {
            const coversArea = sceneManager.objects.doesCoverArea();
            const coversUI = document.getElementById('scene-fully-covered-icon');
            coversUI.dataset.icon = coversArea ? "ion:checkmark-circle-sharp" : "ion:close-circle";
            coversUI.style = coversArea ? "color: #2b2;" : "color: #b22;";
        }

        function changeNumberOfNodes(sceneManager)
        {
            document.getElementById('number-nodes-value').innerHTML = sceneManager.objects.getNbSensors();
        }

        this.update = function(sceneManager)
        {
            isAreaCoveredUI(sceneManager);
            changeNumberOfNodes(sceneManager);
        }

    }
}

export { UIManager }
