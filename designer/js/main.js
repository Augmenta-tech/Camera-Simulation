import { ViewportManager } from '/wp-content/themes/salient-child/builder-v2/designer/js/ViewportManager.js';
import { UIManager } from '/wp-content/themes/salient-child/builder-v2/designer/js/UI/UIManager.js';

const viewportElement = document.getElementById('viewport');

/* initialize viewport, scene and objects */
const viewportManager = new ViewportManager(viewportElement);
/* initialize ui */
const uiManager = new UIManager();

bindEventListeners();
animate();

function bindEventListeners()
{
    window.addEventListener('resize', onWindowResize);

    /* HANDLE BUTTONS */
    document.getElementById('display-frustums-button').addEventListener('click', () => viewportManager.sceneManager.objects.displayFrustums());
    document.getElementById('toggle-unit-button').addEventListener('click', () => viewportManager.sceneManager.toggleUnit());

    document.getElementById('add-node-button').addEventListener('click', () => viewportManager.sceneManager.objects.addNode());
    document.getElementById('delete-all-nodes-button').addEventListener('click', () => viewportManager.sceneManager.objects.removeNodes());

    document.getElementById('add-dummy-button').addEventListener('click', () => viewportManager.sceneManager.objects.addDummy());
    document.getElementById('delete-all-dummies-button').addEventListener('click', () => viewportManager.sceneManager.objects.removeDummies());

    uiManager.bindEventListeners(viewportManager);
    viewportManager.bindEventListeners();
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
