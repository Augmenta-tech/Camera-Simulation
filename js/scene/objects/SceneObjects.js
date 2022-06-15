import { FontLoader } from 'three-loaders/FontLoader.js';

import * as POLYBOOL from 'polybool';

import { NodeUI } from '/js/UI/NodeUI.js';
import { SceneManager } from '/js/scene/SceneManager.js';
import { Dummy } from '/js/scene/objects/props/Dummy.js';
import { Node } from '/js/scene/objects/sensors/Node.js';


class SceneObjects{
    static loadFont(callback)
    {
        new FontLoader().load( 'fonts/helvetiker_regular.typeface.json', function ( response ) {
            SceneObjects.font = response;
            callback();
            return;
        });
    }
    static font;

    constructor(_transformControl, sceneManager)
    {
        const nodes = [];
        const dummies = [];
        this.nodeMeshes = [];
        this.dummiesMeshes = [];

        this.transformControl = _transformControl;
        
        const givenAreaPolygonRegions = [[]];


    /* SCENE INITIALISATION */

        this.initObjects = function()
        {
            sceneManager.scene.add(this.transformControl);
            createSceneFromURL(this);
        }

        /**
         * Initialize a scene according to the url
         * 
         * @param {SceneObjects} sceneObjects this object
         */
        function createSceneFromURL(sceneObjects)
        {
            let url = document.location.href;
            const index = url.indexOf('&');
            
            if(index === -1)
            {
                sceneObjects.addNode(false, sceneManager.trackingMode, Node.DEFAULT_CAMERA_TYPE_ID, 2.5, Node.DEFAULT_NODE_HEIGHT, 2.5);
            }
            else
            {
                url = url.substring(url.indexOf('?') + 1);
                const cams = url.split('&');
                const sceneInfo = cams.shift();
                const infos = sceneInfo.split(',');
                let mode, sceneWidth, sceneHeight;;
                infos.forEach(info => {
                    const keyVal = info.split('=');
                    const key = keyVal[0];
                    const val = keyVal[1];
                    switch(key)
                    {
                        case "L":
                            document.getElementById("givenSceneWidth").value = parseFloat(val);
                            sceneWidth = val;
                            break;
                        case "l":
                            document.getElementById("givenSceneHeight").value = parseFloat(val);
                            sceneHeight = val;
                            break;
                        case "m":
                            document.getElementById("tracking-mode-inspector").value = val;
                            mode = val;
                            sceneManager.changeTrackingMode(mode);
                            break;
                        case "h":
                            mode === 'human-tracking'
                                ?
                                document.getElementById('given-height-detection-inspector').value = val
                                :
                                document.getElementById('height-detection-choice-inspector').style.display = 'none';
                            sceneManager.heightDetected = parseFloat(val);
                            break;
                        default:
                            break;
                    }
                });
                sceneManager.updateSceneBorder(sceneWidth, sceneHeight);
                
                cams.forEach(c => {
                    const props = c.split(',');
                    let id, typeID;
                    let x, y, z, p, a, r;

                    props.forEach(prop => {
                        const keyVal = prop.split('=');
                        const key = keyVal[0];
                        const stringVal = keyVal[1];
                        if(key && stringVal)
                        {
                            const val = parseFloat(stringVal);
                            switch(key)
                            {
                                case "id":
                                    id = val
                                    break;
                                case "typeID":
                                    typeID = val;
                                    break;
                                case "x":
                                    x = val;
                                    break;
                                case "y":
                                    y = val;
                                    break;
                                case "z":
                                    z = val;
                                    break;
                                case "p":
                                    p = val;
                                    break;
                                case "a":
                                    a = val;
                                    break;
                                case "r":
                                    r = val;
                                    break;
                                default:
                                    break;
                            }
                        }
                    });
                    sceneObjects.addNode(true, sceneManager.trackingMode, typeID, x, y, z, p, a, r)
                })
            }
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
            if (this.transformControl.object === obj.mesh) this.transformControl.detach();
            obj.removeFromScene(sceneManager.scene);
            obj.dispose();
        }

        this.addDummy = function()
        {
            if(!Dummy.maleModel || !Dummy.femaleModel)
            {
                //TODO: Add UI to inform that button will work in few seconds
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
        }

        this.removeDummies = function()
        {
            dummies.forEach(d => this.deleteObject(d));
            dummies.length = 0;
            this.dummiesMeshes.length = 0;
        }

        /**
         * Add a node to the scene
         * 
         * @param {boolean} autoConstruct Is this node added automatically or manually. Default is false (manually).
         * @param {string} mode 'human-tracking', 'hand-tracking', ...
         * @param {int} typeID Camera Type ID. See cameras.js. Default is defined in Node.js.
         * @param {float} x x position at creation. Default is 0.
         * @param {float} y y position at creation. Default is defined in Node.js.
         * @param {float} z z position at creation. Default is 0.
         * @param {float} p pitch rotation at creation. Default is 0.
         * @param {float} a yaw rotation at creation. Default is 0.
         * @param {float} r roll rotation at creation. Default is 0.
         */
        this.addNode = function(autoConstruct = false, mode = sceneManager.trackingMode, typeID = Node.DEFAULT_CAMERA_TYPE_ID, x = 0, y = Node.DEFAULT_NODE_HEIGHT, z = 0, p = 0, a = 0, r = 0)
        {
            if(!SceneObjects.font)
            {
                //TODO: Add UI to inform that button will work in few seconds
                return;
            }
            const newCamera = new Node(nodes.length, mode, typeID, x, y, z, p, a, r)
            newCamera.uiElement = new NodeUI(newCamera, sceneManager.currentUnit, this);
            
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
        }

        this.displayFrustums = function()
        {
            const visibles = nodes.filter(n => n.areaAppear);
            nodes.forEach(n => n.changeVisibility(visibles.length != nodes.length));
            const iconElem = document.getElementById('display-frustums-button').firstElementChild;
            iconElem.dataset.icon = visibles.length != nodes.length ? "akar-icons:eye-open" : "akar-icons:eye-slashed";
        }

        this.updateFrustumIcon = function()
        {
            const visibles = nodes.filter(n => n.areaAppear);
            const iconElem = document.getElementById('display-frustums-button').firstElementChild;
            iconElem.dataset.icon = visibles.length != 0 ? "akar-icons:eye-open" : "akar-icons:eye-slashed";
        }

        this.removeNodes = function()
        {
            nodes.forEach(n => {
                delete n.uiElement;
                this.deleteObject(n);
            });
            nodes.length = 0;
            this.nodeMeshes.length = 0;

            const nodesUIdivs = document.getElementsByClassName("nodeUI");
            for(let i = nodesUIdivs.length - 1; i >= 0; i--)
            {
                nodesUIdivs[i].remove();
            }
        }


    /* USER'S ACTIONS */

        this.calculateScenePolygon = function(givenWidth, givenHeight)
        {
            givenAreaPolygonRegions[0].length = 0;
            givenAreaPolygonRegions[0].push([0, 0]);
            givenAreaPolygonRegions[0].push([givenWidth, 0]);
            givenAreaPolygonRegions[0].push([givenWidth, givenHeight]);
            givenAreaPolygonRegions[0].push([0, givenHeight]);
        }

        this.updateObjectsPosition = function()
        {
            nodes.forEach(n => n.updatePosition(sceneManager.currentUnit.value));
            dummies.forEach(d => d.updatePosition());
        }

        /**
         * Create an url containing all the informations of the scene
         * 
         * @returns the url of this scene
         */
        this.generateLink = function()
        {
            let url = document.location.href;
            let index = url.indexOf('?');
            if(index !== -1) url = url.substring(0, index);
            if(url[url.length-1] != '/') url += '/';
            url += '?';
            url += "L=";
            url += Math.floor(sceneManager.sceneWidth / sceneManager.currentUnit.value  * 100)/100;
            url += ",l=";
            url += Math.floor(sceneManager.sceneHeight / sceneManager.currentUnit.value * 100)/100;
            url += ",m=";
            url += sceneManager.trackingMode;
            url += ",h=";
            url += sceneManager.heightDetected;
            url += '&';
            nodes.forEach(n => {
                url += "id=";
                url += n.id;
                url += ",typeID=";
                url += n.cameraType.id;
                url += ",x=";
                url += Math.round(n.xPos*100)/100.0;
                url += ",y=";
                url += Math.round(n.yPos*100)/100.0;
                url += ",z=";
                url += Math.round(n.zPos*100)/100.0;
                url += ",p=";
                url += Math.round(n.xRot*10000)/10000.0;
                url += ",a=";
                url += Math.round(n.yRot*10000)/10000.0;
                url += ",r=";
                url += Math.round(n.zRot*10000)/10000.0;
                url += '&';
            });
            url = url.slice(0, -1);
        
            return url;
        }

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

        // DEBUG
        this.debug = function()
        {

        }

        this.update = function ()
        {
            nodes.forEach(n => {
                n.update();
                sceneManager.drawProjection(n);
            });
        }
        SceneObjects.loadFont(() => SceneManager.loadFont(() => sceneManager.initScene()));
    }
}

export { SceneObjects }