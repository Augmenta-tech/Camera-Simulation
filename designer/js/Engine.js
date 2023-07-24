import { UIManager } from '/wp-content/themes/salient-child/builder-v2/designer/js/UI/UIManager.js';
import { SceneManager } from '/wp-content/themes/salient-child/builder-v2/designer/js/scene/SceneManager.js';

class Engine{
    constructor(isBuilder = false)
    {
        /* initialize ui */
        this.uiManager = isBuilder ? undefined : new UIManager();
        const uiManager = this.uiManager;

        this.sceneManager = new SceneManager(isBuilder, uiManager);
        const sceneManager = this.sceneManager;
        const viewportManager = sceneManager.viewportManager;

        bindEventListeners();
        animate();

        function bindEventListeners()
        {
            window.addEventListener('resize', () => onWindowResize(viewportManager));

            uiManager.bindEventListeners(viewportManager);
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
