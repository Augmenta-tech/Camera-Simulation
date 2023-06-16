import { SceneManager } from '/js/scene/SceneManager.js';
import { Node } from '/js/scene/objects/sensors/Node.js';
import { Wizard } from './Wizard.js';

class UIManager{
    constructor()
    {
        this.wizard = new Wizard();
        resetValues();

        this.bindEventListeners = function(viewportManager)
        {
            const sceneManager = viewportManager.sceneManager
            const copyUrlModal = document.getElementById("share-modal");
            document.getElementById('generate-link').addEventListener('click', () => {
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

            document.getElementById("tracking-mode-selection-inspector").addEventListener('change', () => {
                const mode = document.getElementById("tracking-mode-selection-inspector").value;
                this.changeTrackingMode(mode);
                sceneManager.changeTrackingMode(mode);
                this.displayWarning(sceneManager);
            });
            document.getElementById("overlap-height-selection-inspector").addEventListener('change', () => {
                sceneManager.heightDetected = parseFloat(document.getElementById("overlap-height-selection-inspector").value);
                sceneManager.objects.populateStorage();
            });
            

            this.wizard.bindEventListeners(viewportManager, this);
        }

        function resetValues()
        {
            /* TODO: This should disappear : add data-unit="1" in every numeral inputs that we want to convert (this adds it in all inputs)*/
            //TOGGLE INPUTS  UNITS
            const inputs = document.getElementsByTagName('input');
            for(let i = 0; i < inputs.length; i++)
                if(inputs[i].type !== 'file' && inputs[i].id !== 'scene-file-name-input')
                { inputs[i].dataset.unit = SceneManager.DEFAULT_UNIT.value; }

            document.getElementById('scene-file-name-input').value = '';
            
            //INSPECTOR INPUTS
            document.getElementById("tracking-mode-selection-inspector").value = SceneManager.DEFAULT_TRACKING_MODE;
            document.getElementById('overlap-height-selection-inspector').value = SceneManager.DEFAULT_DETECTION_HEIGHT;
            document.getElementById("input-scene-width-inspector").value = SceneManager.DEFAULT_WIDTH;
            document.getElementById("input-scene-length-inspector").value = SceneManager.DEFAULT_LENGTH;
            document.getElementById("input-wall-y-scene-width-inspector").value = SceneManager.DEFAULT_WIDTH;
            document.getElementById("input-wall-y-scene-height-inspector").value = SceneManager.DEFAULT_LENGTH;

            //WIZARD INPUTS
            document.getElementById("input-scene-width-wizard").value = SceneManager.DEFAULT_WIDTH;
            document.getElementById("input-scene-length-wizard").value = SceneManager.DEFAULT_LENGTH;
            document.getElementById("input-wall-y-scene-width-wizard").value = SceneManager.DEFAULT_WIDTH;
            document.getElementById("input-wall-y-scene-height-wizard").value = SceneManager.DEFAULT_LENGTH;
            document.getElementById("input-hook-height-wizard").value = '';

            //INSPECTOR READONLY INPUTS
            document.getElementById("input-scene-sensor-height-inspector").value = Node.DEFAULT_NODE_HEIGHT;
            document.getElementById("tracking-mode-selection-inspector").value = 'human-tracking';
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
            if(fileNameInput && fileNameInput.value)
            {
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

                const data = sceneManager.objects.generateJson();
                const blob = new Blob([data], { type: 'application/json' });
                saveAs(blob, fileName + '.json'); // module FileSaver
                document.getElementById('warning-text-input-illegal-symbol').classList.add('hidden');
            }
        }

        function loadJsonFile(e, sceneManager)
        {
            const file = e.target.files[0];
            if (!file) {
                return;
            }
            if(file.type !== 'application/json')
            {
                alert(`Invalid file. Your file must end with ".json"`);
                return;
            }
            console.log(file);
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
            switch(trackingMode)
            {
                case 'hand-tracking':
                    document.getElementById('overlap-height-inspector').classList.add('hidden');

                    document.getElementById('floor-scene-size-inspector').classList.remove('hidden');
                    document.getElementById('floor-scene-size-title-inspector').innerHTML = "Table scene size";
                    document.getElementById('wall-y-scene-size-inspector').classList.add('hidden');

                    document.getElementById("delete-all-lidars-button").dispatchEvent(new Event('click'));

                    document.getElementById('nodes-buttons').classList.remove('hidden');
                    document.getElementById('lidars-buttons').classList.add('hidden');
                    break;
                case 'wall-tracking':
                    document.getElementById('overlap-height-inspector').classList.add('hidden');

                    document.getElementById('wall-y-scene-size-inspector').classList.remove('hidden');
                    document.getElementById('floor-scene-size-inspector').classList.add('hidden');

                    document.getElementById("delete-all-nodes-button").dispatchEvent(new Event('click'));

                    document.getElementById('lidars-buttons').classList.remove('hidden');
                    document.getElementById('nodes-buttons').classList.add('hidden');
                    break;
                case 'human-tracking':
                default:
                    document.getElementById('overlap-height-inspector').classList.remove('hidden');
                    document.getElementById('overlap-height-selection-inspector').value = document.getElementById('default-height-detected').value;

                    document.getElementById('floor-scene-size-inspector').classList.remove('hidden');
                    document.getElementById('floor-scene-size-title-inspector').innerHTML = "Floor scene size";
                    document.getElementById('wall-y-scene-size-inspector').classList.add('hidden');

                    document.getElementById("delete-all-lidars-button").dispatchEvent(new Event('click'));

                    document.getElementById('nodes-buttons').classList.remove('hidden');
                    document.getElementById('lidars-buttons').classList.add('hidden');
                    break;
            }
        }

        this.displayWarning = function(sceneManager)
        {
            if(sceneManager.trackingMode === 'hand-tracking')
            {
                const infoTableElemInspector = document.getElementById('info-table-height-inspector');
                if(!infoTableElemInspector)
                {
                    const newInfoTableElemInspector = document.createElement('p');
                    newInfoTableElemInspector.id = 'info-table-height-inspector';
                    newInfoTableElemInspector.innerHTML = `The table is <span data-unit=` + sceneManager.currentUnit.value + `>` + (Math.round(sceneManager.sceneElevation*sceneManager.currentUnit.value * 100) / 100.0) + `</span><span data-unittext=` + sceneManager.currentUnit.value + `>` + sceneManager.currentUnit.label + `</span> high`;
                    newInfoTableElemInspector.style.color = 'orange';
                    document.getElementById('tracking-section-inspector').appendChild(newInfoTableElemInspector);
                }
            }
            else
            {
                const infoTableElemInspector = document.getElementById('info-table-height-inspector');
                if(infoTableElemInspector) infoTableElemInspector.remove();
            }
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
