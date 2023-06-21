import { UIManager } from './UI/UIManager.js';
import { SceneManager } from './scene/SceneManager.js';

class Engine{
    constructor(isBuilder = false)
    {
        /* initialize ui */ 
        this.uiManager = isBuilder ? undefined : new UIManager();
        const uiManager = this.uiManager;

        this.sceneManager = new SceneManager(isBuilder, uiManager);
        const viewportManager = this.sceneManager.viewportManager;

        bindEventListeners();
        animate();

        function bindEventListeners()
        {
            window.addEventListener('resize', () => onWindowResize(viewportManager));

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
