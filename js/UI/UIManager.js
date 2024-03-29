import { SceneManager } from '/js/scene/SceneManager.js';
import { Node } from '/js/scene/objects/sensors/Node.js';

import { Wizard } from '/js/UI/Wizard.js';

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
            window.addEventListener('click', () => {
                if(event.target == copyUrlModal) copyUrlModal.classList.add('hidden');
            });

            document.getElementById("input-scene-width-inspector").addEventListener('change', () => sceneManager.updateAugmentaSceneBorder(parseFloat(document.getElementById("input-scene-width-inspector").value), parseFloat(document.getElementById("input-scene-length-inspector").value)));
            document.getElementById("input-scene-length-inspector").addEventListener('change', () => sceneManager.updateAugmentaSceneBorder(parseFloat(document.getElementById("input-scene-width-inspector").value), parseFloat(document.getElementById("input-scene-length-inspector").value)));

            document.getElementById("tracking-mode-selection-inspector").addEventListener('change', () => {
                const mode = document.getElementById("tracking-mode-selection-inspector").value;
                sceneManager.changeTrackingMode(mode);
                changeTrackingMode(mode);
                this.displayWarning(sceneManager);
            });
            document.getElementById("overlap-height-selection-inspector").addEventListener('change', () => sceneManager.heightDetected = parseFloat(document.getElementById("overlap-height-selection-inspector").value));
            

            this.wizard.bindEventListeners(viewportManager, this);
        }

        function resetValues()
        {
            const inputs = document.getElementsByTagName('input');
            for(let i = 0; i < inputs.length; i++)
            {
                inputs[i].dataset.unit = SceneManager.DEFAULT_UNIT.value;
                if(inputs[i].id != 'input-hook-height-wizard') inputs[i].value = 5*SceneManager.DEFAULT_UNIT.value;
                else inputs[i].value = '';
            }

            document.getElementById("input-scene-sensor-height-inspector").value = Node.DEFAULT_NODE_HEIGHT;
            document.getElementById("tracking-mode-selection-inspector").value = 'human-tracking';
        }

        function copyLink(link)
        {
            navigator.clipboard.writeText(link);

            document.getElementById("share-modal").classList.remove('hidden');
            window.setTimeout(() => document.getElementById("share-modal").classList.add('hidden'), 1500);
        }

        function changeTrackingMode(trackingMode)
        {
            switch(trackingMode)
            {
                case 'hand-tracking':
                    document.getElementById('overlap-height-inspector').classList.add('hidden');
                    break;
                case 'human-tracking':
                default:
                    document.getElementById('overlap-height-inspector').classList.remove('hidden');
                    document.getElementById('overlap-height-selection-inspector').value = document.getElementById('default-height-detected').value;
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
            document.getElementById('number-nodes-value').innerHTML = sceneManager.objects.getNbNodes();
        }

        this.update = function(sceneManager)
        {
            isAreaCoveredUI(sceneManager);
            changeNumberOfNodes(sceneManager);
        }

    }
}

export { UIManager }
