import { camerasTypes } from './cameras.js'
import { SceneManager } from './SceneManager.js';
import { Wizard } from './Wizard.js';

class UIManager{
    constructor()
    {
        this.wizard = new Wizard();
        resetValues();

        this.bindEventListeners = function(sceneManager)
        {
            const copyUrlModal = document.getElementById("link-modal")
            document.getElementById('generate-link').addEventListener('click', () => {
                copyLink(sceneManager.objects.generateLink());
                copyUrlModal.style.display = "block";
            });
            window.addEventListener('click', () => {
                if(event.target == copyUrlModal) copyUrlModal.style.display = "none"
            });

            document.getElementById("givenSceneWidth").addEventListener('change', () => sceneManager.updateSceneBorder(parseFloat(document.getElementById("givenSceneWidth").value), parseFloat(document.getElementById("givenSceneHeight").value)));
            document.getElementById("givenSceneHeight").addEventListener('change', () => sceneManager.updateSceneBorder(parseFloat(document.getElementById("givenSceneWidth").value), parseFloat(document.getElementById("givenSceneHeight").value)));

            document.getElementById("tracking-mode-inspector").addEventListener('change', () => {
                const mode = document.getElementById("tracking-mode-inspector").value;
                sceneManager.changeTrackingMode(mode);
                changeTrackingMode(mode);
            });
            document.getElementById("tracking-mode").addEventListener('change', () => {
                const mode = document.getElementById("tracking-mode").value;
                sceneManager.changeTrackingMode(mode);
                changeTrackingMode(mode);
            });

            document.getElementById("given-height-detection-inspector").addEventListener('change', () => sceneManager.heightDetected = parseFloat(document.getElementById("given-height-detection-inspector").value));
            

            this.wizard.bindEventListeners(sceneManager);
        }

        function resetValues()
        {
            const inputs = document.getElementsByTagName('input');//.forEach(elem => elem.dataset.unit = SceneManager.DEFAULT_UNIT);
            for(let i = 0; i < inputs.length; i++)
            {
                inputs[i].dataset.unit = SceneManager.DEFAULT_UNIT;
                if(inputs[i].id != 'hook-node') inputs[i].value = 5*SceneManager.DEFAULT_UNIT;
                else inputs[i].value = '';
            }

            document.getElementById("tracking-mode-inspector").value = 'human-tracking';
        }

        function copyLink(link)
        {
            navigator.clipboard.writeText(link);
            document.getElementById('copy-feedback').style.display = "block flex";
            window.setTimeout(() => document.getElementById("link-modal").style.display = "none", 1500);
        }

        function changeTrackingMode(mode)
        {
            document.getElementById("tracking-mode-inspector").value = mode;
            document.getElementById("tracking-mode").value = mode;

            switch(mode)
            {
                case 'hand-tracking':
                    document.getElementById('height-detection-choice-inspector').style.display = 'none';
                    document.getElementById('height-detection-choice').style.display = 'none';
                    break;
                case 'human-tracking':
                default:
                    document.getElementById('height-detection-choice-inspector').style.display = 'block';
                    document.getElementById('given-height-detection-inspector').value = "1";
                    document.getElementById('height-detection-choice').style.display = 'block';
                    document.getElementById('given-height-detection').value = "1";
                    break;
            }
        }

        /* UPDATE */
        function isAreaCoveredUI(sceneManager)
        {
            const coversArea = sceneManager.objects.doesCoverArea();
            const coversUI = document.getElementById('covers-check');
            coversUI.dataset.icon = coversArea ? "ion:checkmark-circle-sharp" : "ion:close-circle";
            coversUI.style = coversArea ? "color: #2b2;" : "color: #b22;";
        }
        
        function changeNumberOfNodes(sceneManager)
        {
            document.getElementById('nb-nodes').innerHTML = sceneManager.objects.getNbNodes();
        }

        this.update = function(sceneManager)
        {
            isAreaCoveredUI(sceneManager);
            changeNumberOfNodes(sceneManager);
        }
    }
}

export { UIManager }
