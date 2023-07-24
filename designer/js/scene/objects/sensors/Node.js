import {
    PerspectiveCamera,
    CameraHelper,
    BoxGeometry,
    MeshPhongMaterial,
    Mesh,
    Color,
    Vector3
} from 'three';
import { TextGeometry } from 'three-text-geometry';
import { getCamerasTypes } from '../../../data.js';

import { SceneObjects } from '/wp-content/themes/salient-child/builder-v2/designer/js/scene/objects/SceneObjects.js';

class Node{
    static DEFAULT_CAMERA_TYPE_ID = 0;
    static DEFAULT_NODE_HEIGHT = 5.5;
    static DEFAULT_NODE_ROTATION_X = - Math.PI / 2.0;
    static SIZE_TEXT_NODE = 0.4;

    constructor(id, mode = document.getElementById("tracking-mode-inspector").value, cameraTypeID = Node.DEFAULT_CAMERA_TYPE_ID, p_x = 0, p_y = Node.DEFAULT_NODE_HEIGHT, p_z = 0, r_x = 0, r_y = 0, r_z = 0)
    {
        this.id = id;
        this.cameraType = getCamerasTypes().find(t => t.id === cameraTypeID);

        this.xPos = p_x;
        this.yPos = p_y;
        this.zPos = p_z;
        this.xRot = r_x;
        this.yRot = r_y;
        this.zRot = r_z;

        this.cameraPerspective = buildCamera(this.cameraType, mode, this.xPos, this.yPos, this.zPos, this.xRot, this.yRot, this.zRot);
        this.cameraPerspectiveHelper = new CameraHelper( this.cameraPerspective );

        this.color = new Color(Math.random(), Math.random(), Math.random());
        this.mesh = buildMesh(this.color, this.xPos, this.yPos, this.zPos);

        this.coveredPointsAbove = [];

        this.areaCoveredFloor = new Mesh();
        this.areaCoveredAbove = new Mesh();
        this.areaCoveredWallX = new Mesh();
        this.areaCoveredWallZ = new Mesh();

        this.areaAppear = true;
        this.areaValue = 0;

        this.nameText = buildTextMesh("Node " + (this.id+1), Node.SIZE_TEXT_NODE, this.xPos - Node.SIZE_TEXT_NODE * 2, this.yPos - (this.cameraType.rangeFar - 1), this.zPos + Node.SIZE_TEXT_NODE/2.0)
        this.areaValueText = buildTextMesh("AREA VALUE", Node.SIZE_TEXT_NODE * 2/3.0, this.xPos - Node.SIZE_TEXT_NODE * 4/3.0, this.yPos - (this.cameraType.rangeFar - 1), this.zPos + 3*Node.SIZE_TEXT_NODE/2.0);

    /* BUILDERS */
        function buildCamera(camType, mode, pos_x, pos_y, pos_z, rot_x, rot_y, rot_z)
        {
            let augmentaFar = 0;
            switch(mode)
            {
                case 'hand-tracking':
                    augmentaFar = camType.handFar;
                    break;
                case 'human-tracking':
                default:
                    augmentaFar = camType.rangeFar;
                    break;
            }
            const camPersp = new PerspectiveCamera( camType.VFov, camType.aspectRatio, camType.rangeNear, augmentaFar );

            camPersp.position.set(pos_x, pos_y, pos_z);
            camPersp.rotation.set(rot_x + Node.DEFAULT_NODE_ROTATION_X, - rot_y, rot_z);

            return camPersp;
        }

        function buildMesh(color, x, y, z)
        {
            const material = new MeshPhongMaterial( { color: color, dithering: true } );
            const geometry = new BoxGeometry( 0.2,0.2,0.2 );
            const mesh = new Mesh( geometry, material );
            mesh.position.set(x, y, z);
            mesh.name = 'Camera';

            return mesh;
        }

        function buildTextMesh(text, size, initialXPos, initialYPos, initialZPos)
        {
            const textGeometry = new TextGeometry(text, { font: SceneObjects.font, size: size, height: 0.01 } );
            const textMesh = new Mesh(textGeometry, new MeshPhongMaterial( { color: 0xffffff } ))
            textMesh.position.set(initialXPos, initialYPos, initialZPos);
            textMesh.rotation.x = -Math.PI / 2.0;

            return textMesh;
        }

    /* SCENE MANAGEMENT */
        this.addToScene = function(scene)
        {
            scene.add(this.cameraPerspective);
            scene.add(this.cameraPerspectiveHelper);
            scene.add(this.mesh);
            scene.add(this.nameText);
            scene.add(this.areaValueText);
            this.areaAppear = true;
        }

        this.removeFromScene = function(scene)
        {
            this.areaAppear = false;
            scene.remove(this.cameraPerspective);
            scene.remove(this.cameraPerspectiveHelper);
            scene.remove(this.mesh);
            scene.remove(this.areaCoveredFloor);
            scene.remove(this.areaCoveredAbove);
            scene.remove(this.areaCoveredWallX);
            scene.remove(this.areaCoveredWallZ);
            scene.remove(this.nameText);
            scene.remove(this.areaValueText);
        }

    /* USER'S ACTION */
        //TODO: Mettre le code de la UI dans camera UI (stocke sa propre camera UI et appelle les méthodes)
        this.changeVisibility = function(display = !this.areaAppear)
        {
            const value = display;
            this.areaAppear = value;
            this.cameraPerspective.visible = value;
            this.cameraPerspectiveHelper.visible = value;
            this.nameText.visible = value;
            this.areaValueText.visible = value;

            this.uiElement.changeVisibility(value);
        }

        this.updatePosition = function(currentUnitValue)
        {
            this.xPos = this.mesh.position.x;
            this.yPos = this.mesh.position.y;
            this.zPos = this.mesh.position.z;
            this.cameraPerspective.position.set(this.xPos, this.yPos, this.zPos);

            this.uiElement.updatePosition(this.xPos, this.yPos, this.zPos, currentUnitValue)
        }

        this.updateAreaText = function(currentUnit)
        {
            this.areaValueText.geometry.dispose();
            this.areaValueText.geometry = new TextGeometry( Math.round(this.areaValue*100)/100 + currentUnit.squaredLabel, { font: SceneObjects.font, size: Node.SIZE_TEXT_NODE * 2/3.0 * Math.sqrt(this.areaValue) / 3 / currentUnit.value, height: 0.01 } );
            //this.areaDisplay.geometry = new TextGeometry( "X: " + Math.round(this.XPos*currentUnit.value*100)/100 + currentUnit.label + ", Y: " + Math.round(this.ZPos*currentUnit.value*100)/100 + currentUnit.label, { font: Camera.font, size: Camera.SIZE_TEXT_CAMERA * 2/3.0, height: 0.01 } );

            this.nameText.geometry.dispose();
            this.nameText.geometry = new TextGeometry("Node " + (this.id+1), { font: SceneObjects.font, size: Node.SIZE_TEXT_NODE * Math.sqrt(this.areaValue) / 3 / currentUnit.value, height: 0.01 } );
        }

        this.changeTextPosition = function(position, currentUnitValue)
        {
            this.nameText.scale.set(1, 1, 1);
            this.nameText.position.copy(position.add(new Vector3( - Node.SIZE_TEXT_NODE * 2 * Math.sqrt(this.areaValue) / 3 / currentUnitValue, 0.1, 0)));
            this.areaValueText.position.copy(position.add(new Vector3(0, 0, 1.5*Node.SIZE_TEXT_NODE * Math.sqrt(this.areaValue) / 3 / currentUnitValue )));
            this.areaValueText.visible = this.areaAppear;
        }

        this.changeMode = function(mode)
        {
            switch(mode)
            {
                case 'hand-tracking':
                    this.cameraPerspective.far = this.cameraType.handFar;
                    break;
                case 'human-tracking':
                default:
                    this.cameraPerspective.far = this.cameraType.rangeFar;
                    break;
            }

            this.uiElement.changeFar();
        }

        this.update = function()
        {
            this.cameraPerspective.updateProjectionMatrix();
            this.cameraPerspectiveHelper.update();
        }

        this.dispose = function()
        {

            this.cameraPerspective.children.forEach(mesh => {
                if(mesh.isMesh)
                {
                    mesh.geometry.dispose();
                    mesh.material.dispose();
                }
            });
            this.cameraPerspective.clear()

            this.cameraPerspectiveHelper.children.forEach(mesh => {
                if(mesh.isMesh)
                {
                    mesh.geometry.dispose();
                    mesh.material.dispose();
                }
            });
            this.cameraPerspectiveHelper.clear()
            this.cameraPerspectiveHelper.geometry.dispose();
            this.cameraPerspectiveHelper.material.dispose();
            this.cameraPerspectiveHelper.dispose();

            this.mesh.geometry.dispose();
            this.mesh.material.dispose();

            this.coveredPointsAbove.length = 0;

            this.areaCoveredFloor.geometry.dispose();
            this.areaCoveredFloor.material.dispose();
            this.areaCoveredAbove.geometry.dispose();
            this.areaCoveredAbove.material.dispose();
            this.areaCoveredWallX.geometry.dispose();
            this.areaCoveredWallX.material.dispose();
            this.areaCoveredWallZ.geometry.dispose();
            this.areaCoveredWallZ.material.dispose();

            this.nameText.geometry.dispose();
            this.nameText.material.dispose();
            this.areaValueText.geometry.dispose();
            this.areaValueText.material.dispose();

            this.uiElement.dispose();
        }
    }
}

export { Node }
