import { ViewportManager } from './ViewportManager.js';
import { UIManager } from './UI/UIManager.js';

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
    document.getElementById('display-lidars-rays-button').addEventListener('click', () => viewportManager.sceneManager.objects.displayRays());
    document.getElementById('toggle-unit-button').addEventListener('click', () => viewportManager.sceneManager.toggleUnit());

    document.getElementById('add-node-button').addEventListener('click', () => viewportManager.sceneManager.objects.addNode());
    document.getElementById('delete-all-nodes-button').addEventListener('click', () => viewportManager.sceneManager.objects.removeNodes());

    document.getElementById('add-lidar-button').addEventListener('click', () => viewportManager.sceneManager.objects.addLidar());
    document.getElementById('delete-all-lidars-button').addEventListener('click', () => viewportManager.sceneManager.objects.removeLidars());

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
