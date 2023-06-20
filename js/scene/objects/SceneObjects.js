import { FontLoader } from 'three-loaders/FontLoader.js';

import * as POLYBOOL from 'polybool';

import { NodeUI } from '../../UI/NodeUI.js';
import { LidarUI } from '../../UI/LidarUI.js';
import { SceneManager } from '../SceneManager.js';
import { Dummy, loadModel } from './props/Dummy.js';
import { Node } from './sensors/Node.js';
import { Lidar } from './sensors/Lidar.js';


class SceneObjects{
    static loadFont(isBuilder, callback)
    {
        const path = isBuilder ? './designer/' : './';
        new FontLoader().load( path + 'fonts/helvetiker_regular.typeface.json', function ( response ) {
            SceneObjects.font = response;
            callback();
            return;
        });
    }
    static font;

    constructor(sceneManager, isBuilder)
    {
        const nodes = [];
        const lidars = [];
        const dummies = [];
        this.nodeMeshes = [];
        this.lidarsMeshes = [];
        this.dummiesMeshes = [];
        
        const givenAreaPolygonRegions = [[]];

        /* SCENE INITIALISATION */

        this.initObjects = function()
        {
            const url = new URL(document.location.href);
            
            const sceneInfoFromURL = url.searchParams.get("sceneData");

            if(!sceneInfoFromURL) //scene from cookie case
            {
                //if local storage, uncomment this
                //const sceneInfosStorage = sessionStorage.getItem('sceneInfos')
                // and comment this
                const sceneInfo = sessionStorage.getItem('sceneInfos')
                if(sceneInfo) {
                    this.parseJson(sceneInfo);
                    return;
                }
            }
            else if (sceneInfoFromURL) //scene from url case
            {
                this.parseJson(sceneInfoFromURL);
                document.getElementById('popup').classList.remove('is-visible');
                //if local storage, uncomment this
                //sessionStorage.setItem('sceneInfos', sceneInfosStorage);
                //and comment this
                this.populateStorage();
                return;
            }

            //Default case
            if(!isBuilder) this.addNode(false, sceneManager.trackingMode, Node.DEFAULT_CAMERA_TYPE_ID, 2.5, 2.5, Node.DEFAULT_NODE_HEIGHT);
            sceneManager.updateFloorAugmentaSceneBorder(SceneManager.DEFAULT_WIDTH, SceneManager.DEFAULT_LENGTH);
            this.populateStorage();
        }

    /* SCENE SUBJECTS MANAGEMENT */

        // TODO: dans deleteObject, vérifier la présence de l'objet mesh, et des méthodes et renvoyer un message clair "il faut les définir"
        /**
         * Remove an object from the scene and free its memory
         * 
         * @param {Object} obj object to delete. Must have a "removeFromScene" and "dispose" method. 
         */
        this.deleteObject = function(obj)
        {
            if (sceneManager.transformControl) if (sceneManager.transformControl.object === obj.mesh) sceneManager.transformControl.detach();
            obj.removeFromScene(sceneManager.scene);
            obj.dispose();
        }

        this.addDummy = function()
        {
            if(!Dummy.maleModel || !Dummy.femaleModel)
            {
                //TODO: Add UI to inform that button will work in few seconds
                console.log("Add Dummy button will work in an instant");
                return;
            }
            const newDummy = new Dummy(dummies.length);

            //Offset
            for(let i = 0; i < dummies.length; i++)
            {
                if(newDummy.mesh.position.distanceTo(dummies[i].mesh.position) < 1.0)
                {
                    newDummy.mesh.position.x++;
                    i = 0;
                }
            }
            newDummy.updatePosition();

            //Add to scene
            newDummy.addToScene(sceneManager.scene);

            //Management
            dummies.push(newDummy);
            this.dummiesMeshes.push(newDummy.mesh);

            this.populateStorage();
        }

        this.removeDummies = function()
        {
            dummies.forEach(d => this.deleteObject(d));
            dummies.length = 0;
            this.dummiesMeshes.length = 0;

            this.populateStorage();
        }

        /**
         * Add a node to the scene
         * 
         * @param {boolean} autoConstruct Is this node added automatically or manually. Default is false (manually).
         * @param {string} mode 'human-tracking', 'hand-tracking', ...
         * @param {int} typeID Camera Type ID. See cameras.js. Default is defined in Node.js.
         * @param {float} x x (horizontal) position at creation. Default is 0.
         * @param {float} y y (-depth) position at creation. Default is defined in Node.js.
         * @param {float} z z (up) position at creation. Default is 0.
         * @param {float} p pitch rotation at creation. Default is 0.
         * @param {float} a yaw rotation at creation. Default is 0.
         * @param {float} r roll rotation at creation. Default is 0.
         */
        this.addNode = function(autoConstruct = false, mode = sceneManager.trackingMode, typeID = Node.DEFAULT_CAMERA_TYPE_ID, x = 0, y = 0, z = Node.DEFAULT_NODE_HEIGHT, p = 0, a = 0, r = 0)
        {
            if(!SceneObjects.font)
            {
                //TODO: Add UI to inform that button will work in few seconds
                console.log("Add Node button will work in an instant");
                return;
            }
            const newCamera = new Node(nodes.length, mode, typeID, x, y, z, p, a, r)
            if(!isBuilder) newCamera.uiElement = new NodeUI(newCamera, sceneManager);
            
            //Offset
            if(!autoConstruct)
            {
                for(let i = 0; i < nodes.length; i++)
                {
                    if(newCamera.mesh.position.distanceTo(nodes[i].mesh.position) < 0.5)
                    {
                        newCamera.mesh.position.x += 0.5;
                        i = 0;
                    }
                }
            }
            newCamera.updatePosition(sceneManager.currentUnit.value);

            newCamera.addToScene(sceneManager.scene);

            nodes.push(newCamera);
            this.nodeMeshes.push(newCamera.mesh);

            sceneManager.sceneSensorHeight = z;

            this.populateStorage();
        }

        this.displayFrustums = function()
        {
            const visibles = nodes.filter(n => n.areaAppear);
            nodes.forEach(n => n.changeVisibility(visibles.length != nodes.length));
            const iconElem = document.getElementById('display-frustums-button-icon');
            if(iconElem) iconElem.dataset.icon = visibles.length != nodes.length ? "akar-icons:eye-open" : "akar-icons:eye-slashed";
        }

        this.updateFrustumIcon = function()
        {
            const visibles = nodes.filter(n => n.areaAppear);
            const iconElem = document.getElementById('display-frustums-button-icon');
            if(iconElem) iconElem.dataset.icon = visibles.length != 0 ? "akar-icons:eye-open" : "akar-icons:eye-slashed";
        }

        this.removeNodes = function()
        {
            nodes.forEach(n => this.deleteObject(n));
            nodes.length = 0;
            this.nodeMeshes.length = 0;

            this.populateStorage();
        }

        this.addLidar = function(autoConstruct = false, typeID = Lidar.DEFAULT_LIDAR_TYPE_ID, x = 0, z = Lidar.DEFAULT_LIDAR_HEIGHT, r = 0)
        {
            if(!SceneObjects.font)
            {
                //TODO: Add UI to inform that button will work in few seconds
                console.log("Add Lidar button will work in an instant");
                return;
            }
            const newLidar = new Lidar(lidars.length, typeID, x, z, r);
            if(!isBuilder) newLidar.uiElement = new LidarUI(newLidar, sceneManager);
            
            //Offset
            if(!autoConstruct)
            {
                for(let i = 0; i < lidars.length; i++)
                {
                    if(newLidar.mesh.position.distanceTo(lidars[i].mesh.position) < 1)
                    {
                        newLidar.mesh.position.x += 1;
                        i = 0;
                    }
                }
            }
            newLidar.updatePosition(sceneManager.currentUnit.value);

            newLidar.addToScene(sceneManager.scene);

            lidars.push(newLidar);
            this.lidarsMeshes.push(newLidar.mesh);

            this.populateStorage();
        }

        this.displayRays = function()
        {
            const visibles = lidars.filter(l => l.raysAppear);
            lidars.forEach(l => l.changeVisibility(visibles.length != lidars.length));
            const iconElem = document.getElementById('display-lidars-rays-button-icon');
            if(iconElem) iconElem.dataset.icon = visibles.length != nodes.length ? "akar-icons:eye-open" : "akar-icons:eye-slashed";
        }

        this.updateRaysIcon = function()
        {
            const visibles = lidars.filter(l => l.raysAppear);
            const iconElem = document.getElementById('display-lidars-rays-button-icon');
            if(iconElem) iconElem.dataset.icon = visibles.length != 0 ? "akar-icons:eye-open" : "akar-icons:eye-slashed";
        }

        this.removeLidars = function()
        {
            lidars.forEach(l => this.deleteObject(l));
            lidars.length = 0;
            this.lidarsMeshes.length = 0;

            this.populateStorage();
        }
        

        this.removeSensors = function()
        {
            this.removeNodes();
            this.removeLidars();
        }


    /* USER'S ACTIONS */

        this.calculateScenePolygon = function(givenWidth, givenLength)
        {
            givenAreaPolygonRegions[0].length = 0;
            givenAreaPolygonRegions[0].push([0, 0]);
            givenAreaPolygonRegions[0].push([givenWidth, 0]);
            givenAreaPolygonRegions[0].push([givenWidth, givenLength]);
            givenAreaPolygonRegions[0].push([0, givenLength]);
        }

        this.updateObjectsPosition = function()
        {
            nodes.forEach(n => n.updatePosition(sceneManager.currentUnit.value));
            lidars.forEach(l => l.updatePosition(sceneManager.currentUnit.value));
            dummies.forEach(d => d.updatePosition());
        }

        /**
         * Create an url containing all the informations of the scene from sessionStorage json
         * 
         * @returns the url of this scene
         */
        this.generateLink = function()
        {
            //Get only the base url of the site
            const url = new URL(document.location.href.split('?')[0]);

            //Create an URL with a sceneData parameter with the string json of the scene
            url.searchParams.append("sceneData", sessionStorage.getItem('sceneInfos'));
        
            return url;
        }

        this.parseJson = function(jsonDatas)
        {
            const datas = JSON.parse(jsonDatas);

            // /!\ parsing order matters

            //scene environment
            if(datas.hasOwnProperty('sceneEnvironment'))
            {
                sceneManager.sceneEnvironment = datas.sceneEnvironment;
            }

            //scene size
            let mode = 'human-tracking';
            if(datas.hasOwnProperty('trackingMode'))
            {
                mode = datas.trackingMode;
            }
            
            if(datas.hasOwnProperty('sceneSize') && datas.sceneSize.length === 2)
            {
                const sceneWidth = datas.sceneSize[0];
                const sceneLength = datas.sceneSize[1];

                switch(mode)
                {
                    case 'wall-tracking':
                    {
                        const sceneWidthElement = document.getElementById("input-wall-y-scene-width-inspector");
                        if(sceneWidthElement) sceneWidthElement.value = sceneWidth;
                        
                        const sceneHeightElement = document.getElementById("input-wall-y-scene-height-inspector");
                        if(sceneHeightElement) sceneHeightElement.value = sceneLength;
                        sceneManager.updateWallYAugmentaSceneBorder(sceneWidth, sceneLength);
                        break;
                    }
                    case 'hand-tracking':
                    case 'human-tracking':
                    {
                        const sceneWidthElement = document.getElementById("input-scene-width-inspector");
                        if(sceneWidthElement) sceneWidthElement.value = sceneWidth;
                        
                        const sceneLengthElement = document.getElementById("input-scene-length-inspector");
                        if(sceneLengthElement) sceneLengthElement.value = sceneLength;
                        sceneManager.updateFloorAugmentaSceneBorder(sceneWidth, sceneLength);
                        break;
                    }
                    default:
                        break;
                }
            }

            //unit
            if(datas.hasOwnProperty('unit'))
            {
                sceneManager.toggleUnit(datas.unit);
            }

            //tracking mode
            const trackingModeElement = document.getElementById("tracking-mode-selection-inspector");
            if(trackingModeElement)
            {
                trackingModeElement.value = mode;
                trackingModeElement.dispatchEvent(new Event('change'));
            }

            //height detected
            if(datas.hasOwnProperty('heightDetected'))
            {
                const overlapElement = document.getElementById("overlap-height-selection-inspector");
                if(overlapElement)
                {
                    overlapElement.value = datas.heightDetected;
                    overlapElement.dispatchEvent(new Event('change'));
                }
                sceneManager.heightDetected = datas.heightDetected;
            }

            //scene sensor height
            if(datas.hasOwnProperty('sceneSensorHeight'))
            {
                const sceneSensorHeightElement = document.getElementById("input-scene-sensor-height-inspector");
                if(sceneSensorHeightElement)
                {
                    sceneSensorHeightElement.value = datas.sceneSensorHeight;
                    sceneSensorHeightElement.dispatchEvent(new Event('change'));
                }
                sceneManager.sceneSensorHeight = datas.sceneSensorHeight;
            }

            //objects
            if(datas.hasOwnProperty('objects'))
            {
                if(datas.objects.hasOwnProperty('nodes'))
                {
                    datas.objects.nodes.forEach(n => this.addNode(true, datas.trackingMode, n.cameraTypeId, n.p_x, n.p_y, n.p_z, n.r_x, n.r_y, n.r_z));
                }
                if(datas.objects.hasOwnProperty('lidars'))
                {
                    datas.objects.lidars.forEach(l => this.addLidar(true, l.lidarTypeId, l.p_x, l.p_z, l.r_y));
                }
                if(datas.objects.hasOwnProperty('dummies'))
                {
                    datas.objects.dummies.forEach(d => {
                        this.addDummy();
                        const dummy = dummies[dummies.length - 1];
                        dummy.mesh.translateX(d.p_x);
                        dummy.mesh.translateZ(d.p_y);
                        dummy.updatePosition();
                    });
                }
            }
        }
        
        /**
         * Create a json format containing all the informations of the scene
         * 
         * @returns scene infos in json format
         */
        this.generateJson = function()
        {
            const datas = {
                sceneEnvironment: sceneManager.sceneEnvironment,
                sceneSize: [sceneManager.sceneWidth, sceneManager.sceneLength],
                unit: sceneManager.currentUnit,
                trackingMode: sceneManager.trackingMode,
                heightDetected: sceneManager.heightDetected,
                sceneSensorHeight: sceneManager.sceneSensorHeight,
                objects: {
                    nodes: [],
                    lidars: [],
                    dummies: []
                }
            };

            nodes.forEach(n => {
                const nodeData = {
                    id: n.id,
                    cameraTypeId: n.cameraType.id,
                    p_x: n.xPos,
                    p_y: n.yPos,
                    p_z: n.zPos,
                    r_x: n.xRot,
                    r_y: n.yRot,
                    r_z: n.zRot
                };

                datas.objects.nodes.push(nodeData);
            });

            lidars.forEach(l => {
                const lidarData = {
                    id: l.id,
                    lidarTypeId: l.lidarType.id,
                    p_x: l.xPos,
                    p_z: l.zPos,
                    r_y: l.yRot
                };

                datas.objects.lidars.push(lidarData);
            });

            dummies.forEach(d => {
                const dummiesData = {
                    id: d.id,
                    p_x: d.xPos,
                    p_y: d.yPos,
                    p_z: d.zPos
                };
                
                datas.objects.dummies.push(dummiesData);
            });

            return JSON.stringify(datas);
        }

        this.populateStorage = () => sessionStorage.setItem('sceneInfos', this.generateJson())

        this.changeSensorsTrackingMode = function(mode)
        {
            nodes.forEach(n => n.changeMode(mode))
        }


        /* SCENE UPDATE */

        /**
         * Calculate the area covered by node and compare it to the scene size
         * 
         * @returns {boolean} whether the scene is fully tracked by nodes or not
         */
        this.doesCoverArea = function()
        {
            // see https://github.com/velipso/polybooljs for more information

            const unionRegions = [...givenAreaPolygonRegions];
            let union = {
                regions: unionRegions,
                inverted: true
            };

            nodes.forEach(n => {
                const polyCam = {
                    regions: [[]],
                    inverted: false
                };
                n.coveredPointsAbove.forEach(p => {
                    polyCam.regions[0].push([p.x, p.z]);
                });

                //union = PolyBool.union(union, polyCam);
                
                const segmentsCam = PolyBool.segments(polyCam);
                const segmentsUnion = PolyBool.segments(union);
                const comb = PolyBool.combine(segmentsCam, segmentsUnion);
                union = PolyBool.polygon(PolyBool.selectUnion(comb))
            });

            return union.regions.length === 0;
        }

        this.getNbNodes = () => nodes.length;

        this.getNbLidars = () => lidars.length;

        this.getNbSensors = () => this.getNbNodes() + this.getNbLidars();

        // press P for DEBUG
        this.debug = function()
        {
            console.log(JSON.parse(sessionStorage.getItem('sceneInfos')));
        }

        this.update = function ()
        {
            nodes.forEach(n => {
                n.update();
                sceneManager.drawProjection(n);
            });
        }
        SceneObjects.loadFont(isBuilder, () => SceneManager.loadFont(isBuilder, () => sceneManager.initAugmentaScene()));
        
        loadModel(isBuilder, 'male');
        loadModel(isBuilder, 'female');
    }
}

export { SceneObjects }