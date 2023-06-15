import { ViewportManager } from './ViewportManager.js';
import { UIManager } from './UI/UIManager.js';

class Engine{
    constructor(isBuilder = false)
    {
        const viewportElement = document.getElementById('viewport');

        /* initialize viewport, scene and objects */ 
        this.viewportManager = new ViewportManager(viewportElement, isBuilder);

        const viewportManager = this.viewportManager;

        /* initialize ui */ 
        this.uiManager = isBuilder ? undefined : new UIManager();
        const uiManager = this.uiManager;
        

        bindEventListeners();
        animate();

        function bindEventListeners()
        {
            window.addEventListener('resize', () => onWindowResize(viewportManager));

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

            if(uiManager) uiManager.bindEventListeners(viewportManager);
            viewportManager.bindEventListeners();
        }

        function onWindowResize(viewportManager)
        {
            viewportManager.onWindowResize();
        }


        //RENDER
        function animate() {

            requestAnimationFrame( animate );

            viewportManager.render();
            if(uiManager) uiManager.update(viewportManager.sceneManager);
        }
    }
}

export { Engine };
