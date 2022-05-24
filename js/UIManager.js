import { camerasTypes } from './cameras.js'

class UIManager{
    constructor()
    {
        createFormModal();
        addCamTypesToForm();

        createShareModal();

        function resetFormValues()
        {
            document.getElementById("areaWantedWidth").value = document.getElementById("givenSceneWidth").value;
            document.getElementById("areaWantedHeight").value = document.getElementById("givenSceneHeight").value;
            document.getElementById('hook-node').value = document.getElementById('hook-node').value ? document.getElementById('hook-node').value : 4.5;
        }

        function createFormModal()
        {
            const formModal = document.getElementById("generate-scene-modal");
            document.getElementById("open-scene-form").addEventListener('click', () => {
                resetFormValues();
                formModal.style.display = "block"
            });
            document.getElementById("close-form").addEventListener('click', () => closeModal());
            
            window.addEventListener('mousedown', () => {
                if(event.target === formModal) closeModal();
            });

            function closeModal()
            {
                formModal.style.display = "none"
            }
        }
        
        function createShareModal()
        {
            const copyUrlModal = document.getElementById("link-modal")
            document.getElementById("generate-link").addEventListener('click', () => copyUrlModal.style.display = "block");
            document.getElementById("close-link").addEventListener('click', () => copyUrlModal.style.display = "none");
            
            window.addEventListener('click', () => {
                if(event.target == copyUrlModal) copyUrlModal.style.display = "none"
            });
        }

        function addCamTypesToForm(){
            const camTypesForm = document.getElementById("cam-types-checkboxes");
            while (camTypesForm.firstChild) {
                camTypesForm.removeChild(camTypesForm.firstChild);
            }
            let title = document.createElement('h1');
            title.innerHTML = "Choose the type.s of camera.s you want to use";
            camTypesForm.appendChild(title);
            camerasTypes.filter(c => c.recommanded).forEach(c => {
                //const hookHeight = parseFloat(document.getElementById("hook-node").value);
                //if(hookHeight < c.rangeFar && c.suitable.includes(document.getElementById("tracking-mode").value))
                //{
                    const camTypeChoice = document.createElement("div");
                    const camTypeCheckbox = document.createElement("input");
                    camTypeCheckbox.setAttribute("type", "checkbox");
                    if(c.checkedDefault) camTypeCheckbox.setAttribute("checked", "true");
                    camTypeCheckbox.id = "check-" + c.id;
                    const label = document.createElement("label");
                    label.setAttribute("for", "check-" + c.id)
                    label.innerHTML = c.name;
                    camTypeChoice.appendChild(camTypeCheckbox);
                    camTypeChoice.appendChild(label);
                    camTypesForm.appendChild(camTypeChoice);
                //}
            });
        }


        this.createSceneFromForm = function(sceneManager)
        {
            //set heightDetected 
            sceneManager.heightDetected = parseFloat(document.getElementById('given-height-detection').value);

            //place cameras
            const givenWidth = parseFloat(document.getElementById('areaWantedWidth').value);
            const givenHeight = parseFloat(document.getElementById('areaWantedHeight').value);
            const camsHeight = parseFloat(document.getElementById('hook-node').value);

            if(!givenWidth || !givenHeight)
            {
                alert("Merci de renseigner une longueur et une largeur de scene. \nPlease fill your scene horizontal and vertical length");
                return;
            }

            document.getElementById("givenSceneWidth").value = givenWidth;
            document.getElementById("givenSceneHeight").value = givenHeight;

            let configs = [];

            camerasTypes.filter(c => c.recommanded).forEach(type => {
                /*
                let augmentaFar = 0;
                switch(document.getElementById("tracking-mode").value)
                {
                    case "human-tracking":
                        augmentaFar = 6;
                        break;
                    case "hand-tracking":
                        augmentaFar = 2;
                        break;
                    default:
                        augmentaFar = 6;
                        break;
                }
                if(type.rangeFar > augmentaFar) type.rangeFar = augmentaFar;
                */
                if(document.getElementById('check-' + type.id)) if(document.getElementById('check-' + type.id).checked && camsHeight <= type.rangeFar && camsHeight >= type.rangeNear + sceneManager.heightDetected)
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
                alert("Aucune camera n'est adaptée pour cette configuration. \nNo camera is adapted to your demand");
                return;
            }
            else
            {
                sceneManager.updateSceneBorder(givenWidth, givenHeight);

                configs.sort((A,B) => A.nbW * A.nbH - B.nbW * B.nbH);
                configs = configs.filter(c => c.nbW * c.nbH === configs[0].nbW * configs[0].nbH);
                configs.sort((A,B) => A.typeID - B.typeID);
                let chosenConfig = configs[0];
                sceneManager.removeNodes();

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
                            sceneManager.addNode(true, chosenConfig.typeID, offsetX + i*(chosenConfig.w - oX), camsHeight, offsetY + j*(chosenConfig.h - oY), 0, 0, Math.PI/2.0)
                            :
                            sceneManager.addNode(true, chosenConfig.typeID, offsetX + i*(chosenConfig.w - oX), camsHeight, offsetY + j*(chosenConfig.h - oY));

                    }
                }
                //placeCamera(new THREE.Vector3(givenWidth, 6, givenHeight));
                document.getElementById("generate-scene-modal").style.display = "none";
            }
        }

        /* UPDATE */
        function isAreaCoveredUI(sceneManager)
        {
            const coversArea = sceneManager.doesCoverArea();
            const coversUI = document.getElementById('covers-check');
            coversUI.dataset.icon = coversArea ? "ion:checkmark-circle-sharp" : "ion:close-circle";
            coversUI.style = coversArea ? "color: #2b2;" : "color: #b22;";
        }
        
        function changeNumberOfNodes(sceneManager)
        {
            document.getElementById('nb-nodes').innerHTML = sceneManager.getNbNodes();
        }

        this.update = function(sceneManager)
        {
            isAreaCoveredUI(sceneManager);
            changeNumberOfNodes(sceneManager);
        }
    }
}

export { UIManager }
