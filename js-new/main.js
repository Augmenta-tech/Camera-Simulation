
import {
    Vector2,
    Vector3,
    Raycaster
} from 'three'
import { ViewportManager } from './ViewportManager.js'
import { UIManager } from './UIManager.js'

const viewportElement = document.getElementById('viewport');
const viewportManager = new ViewportManager(viewportElement);
const uiManager = new UIManager();

bindEventListeners();
animate();

function bindEventListeners()
{
    window.addEventListener('resize', onWindowResize);

    /* HANDLE BUTTONS */
    document.getElementById('display-frustums').addEventListener('click', () => viewportManager.sceneManager.displayFrustums());
    document.getElementById('toggle-unit').addEventListener('click', () => viewportManager.sceneManager.toggleUnit());

    document.getElementById('new-camera').addEventListener('click', () => viewportManager.sceneManager.addCamera());
    document.getElementById('delete-cameras').addEventListener('click', () => viewportManager.sceneManager.resetCams());

    document.getElementById('add-dummy').addEventListener('click', () => viewportManager.sceneManager.addDummy());
    document.getElementById('remove-dummies').addEventListener('click', () => viewportManager.sceneManager.removeDummies());


    //document.getElementById("generate-link").addEventListener('click', () => viewportManager.sceneManager.generateLink());

    //DEBUG
    document.addEventListener( 'keydown', onKeyDown );
    //END DEBUG


    document.getElementById("areaWantedWidth").addEventListener('change', () => viewportManager.sceneManager.updateBorder(parseFloat(document.getElementById("areaWantedWidth").value), parseFloat(document.getElementById("areaWantedHeight").value)));
    document.getElementById("areaWantedHeight").addEventListener('change', () => viewportManager.sceneManager.updateBorder(parseFloat(document.getElementById("areaWantedWidth").value), parseFloat(document.getElementById("areaWantedHeight").value)));

    document.getElementById('generate-scene').addEventListener('click', () => uiManager.createSceneFromForm(viewportManager.sceneManager));
    
    document.getElementById('copy-link').addEventListener('click', () => navigator.clipboard.writeText(viewportManager.sceneManager.generateLink()));

    /* HANDLE VIEWPORT ACTIONS */
    viewportManager.element.addEventListener( 'pointerdown', onPointerDown );
    viewportManager.element.addEventListener( 'pointerup', onPointerUp );
    viewportManager.element.addEventListener( 'pointermove', onPointerMove );

    viewportManager.sceneManager.transformControl.addEventListener( 'objectChange', function () {
        viewportManager.element.removeEventListener( 'pointermove', onDrag);
        viewportManager.sceneManager.updateObjectsPosition();
    });
}

function onWindowResize()
{
    viewportManager.onWindowResize();
}


//RENDER
function animate() {

    requestAnimationFrame( animate );

    viewportManager.render();

    isAreaCoveredUI();
}


/* MOUSE CONTROLS */
const onDownPosition = new Vector2();
const onUpPosition = new Vector2();

function onPointerDown( event ) {
    onDownPosition.x = event.clientX;
    onDownPosition.y = event.clientY;

    if(event.button === 0) viewportManager.element.addEventListener( 'pointermove', onDrag);
    viewportManager.element.removeEventListener( 'pointermove', onPointerMove);
}

function onDrag()
{
    if(viewportManager.activeCamera.isOrthographicCamera)
    {
        const camPos = new Vector3(6,6,6);
        viewportManager.setupCameraChangement(camPos);
    }
}

function onPointerUp(event) {
    onUpPosition.x = event.clientX;
    onUpPosition.y = event.clientY;

    if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) viewportManager.sceneManager.transformControl.detach();

    viewportManager.element.removeEventListener( 'pointermove', onDrag);
    viewportManager.element.addEventListener( 'pointermove', onPointerMove);
}

function onPointerMove(event)
{
    const pointer = new Vector2(
        (event.clientX / viewportElement.offsetWidth) * 2 - 1,
        - ((event.clientY - document.getElementById('header').offsetHeight) / viewportElement.offsetHeight) * 2 + 1
    );
    
    const raycaster = new Raycaster()
    raycaster.setFromCamera( pointer, viewportManager.activeCamera );
    
    const meshes = viewportManager.sceneManager.camMeshes.concat(viewportManager.sceneManager.dummiesMeshes);

    const intersect = raycaster.intersectObjects( meshes, false );

    if(intersect.length > 0) {
        const object = intersect[0].object;
        if (object !== viewportManager.sceneManager.transformControl.object)
        {
            viewportManager.sceneManager.transformControl.attach(object);
            if(viewportManager.activeCamera.isOrthographicCamera)
            {
                let dir = new Vector3();
                viewportManager.activeCamera.getWorldDirection(dir);
                viewportManager.sceneManager.transformControl.showX = 1 - Math.abs(dir.dot(new Vector3(1, 0, 0))) < 0.001 ? false : true;
                viewportManager.sceneManager.transformControl.showZ = 1 - Math.abs(dir.dot(new Vector3(0, 0, 1))) < 0.001 ? false : true;
                viewportManager.sceneManager.transformControl.showY = (1 - Math.abs(dir.dot(new Vector3(0, 1, 0))) < 0.001) || object.name === 'Dummy' ? false : true;
            }
            else
            {
                viewportManager.sceneManager.transformControl.showX = true;
                viewportManager.sceneManager.transformControl.showZ = true;
                viewportManager.sceneManager.transformControl.showY = object.name === 'Dummy' ? false : true;
            }
        }
    }
}

/* DEBUG */
function onKeyDown( event ) {

    switch ( event.keyCode ) {

        case 80: /*P*/

            console.log(viewportManager.sceneManager.heightDetected);
            break;

    }
}

/* TO PUT SOMEWHERE ELSE */
function isAreaCoveredUI()
{
    const coversArea = viewportManager.sceneManager.doesCoverArea();
    const coversUI = document.getElementById('covers-check');
    coversUI.dataset.icon = coversArea ? "ion:checkmark-circle-sharp" : "ion:close-circle";
    coversUI.style = coversArea ? "color: #2b2;" : "color: #b22;";
}