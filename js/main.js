
import {
    Vector2,
    Vector3,
    Raycaster
} from 'three';
import { ViewportManager } from './ViewportManager.js';
import { UIManager } from './UIManager.js';

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

    document.getElementById('add-node').addEventListener('click', () => viewportManager.sceneManager.addNode());
    document.getElementById('remove-nodes').addEventListener('click', () => viewportManager.sceneManager.removeNodes());

    document.getElementById('add-dummy').addEventListener('click', () => viewportManager.sceneManager.addDummy());
    document.getElementById('remove-dummies').addEventListener('click', () => viewportManager.sceneManager.removeDummies());

    //DEBUG
    document.addEventListener( 'keydown', onKeyDown );
    //END DEBUG

    uiManager.bindEventListeners(viewportManager.sceneManager);

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
    uiManager.update(viewportManager.sceneManager);
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
    if(viewportManager.activeCamera.isOrthographicCamera) viewportManager.setupCameraChangement();
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
    
    const meshes = viewportManager.sceneManager.nodeMeshes.concat(viewportManager.sceneManager.dummiesMeshes);

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
            viewportManager.sceneManager.debug();
            break;

    }
}