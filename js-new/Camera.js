import {
    PerspectiveCamera,
    CameraHelper,
    BoxGeometry,
    MeshPhongMaterial,
    Mesh,
    Color,
    Vector3
} from 'three';

import { FontLoader } from 'three-loaders/FontLoader.js';
import { TextGeometry } from 'three-text-geometry';

import { camerasTypes, units } from './cameras.js'

class Camera{
    static loadFont(callback)
    {
        new FontLoader().load( 'fonts/helvetiker_regular.typeface.json', function ( response ) {
            Camera.font = response;
            callback();
            return;
        });
    }
    static font;
    static DEFAULT_CAMERA_TYPE_ID = 0;
    static DEFAULT_CAMERA_HEIGHT = 4.5;
    static DEFAULT_CAMERA_PITCH = - Math.PI / 2.0;
    static SIZE_TEXT_CAMERA = 0.4;

    constructor(id, typeID = Camera.DEFAULT_CAMERA_TYPE_ID, x = 0, y = Camera.DEFAULT_CAMERA_HEIGHT, z = 0, p = 0, a = 0, r = 0)
    {
        this.id = id;
        this.type = camerasTypes.find(t => t.id === typeID);
        this.XPos = x;
        this.YPos = y;
        this.ZPos = z;
        this.pitch = p;
        this.yaw = a;
        this.roll = r;

        this.cameraPerspective = buildCamera(this.type, this.XPos, this.YPos, this.ZPos, this.pitch, this.yaw, this.roll);
        this.cameraPerspectiveHelper = new CameraHelper( this.cameraPerspective );
    
        this.color = new Color(Math.random(), Math.random(), Math.random());
        this.mesh = buildMesh(this.color, this.XPos, this.YPos, this.ZPos);

        this.coveredPointsAbove = [];

        this.areaCoveredFloor = new Mesh();
        this.areaCoveredAbove = new Mesh();
        this.areaCoveredWallX = new Mesh();
        this.areaCoveredWallZ = new Mesh();

        this.areaAppear = true;
        this.areaValue = 0;

        this.nameText = buildTextMesh("Node " + (this.id+1), Camera.SIZE_TEXT_CAMERA, this.XPos - Camera.SIZE_TEXT_CAMERA * 2, this.YPos - (this.type.rangeFar - 1), this.ZPos + Camera.SIZE_TEXT_CAMERA/2.0)
        this.areaDisplay = buildTextMesh("AREA VALUE", Camera.SIZE_TEXT_CAMERA * 2/3.0, this.XPos - Camera.SIZE_TEXT_CAMERA * 4/3.0, this.YPos - (this.type.rangeFar - 1), this.ZPos + 3*Camera.SIZE_TEXT_CAMERA/2.0);


        function buildCamera(camType, x, y, z, pitch, yaw, roll)
        {
            const camPersp = new PerspectiveCamera( camType.VFov, camType.aspectRatio, camType.rangeNear, camType.rangeFar );

            camPersp.position.set(x, y, z);

            camPersp.rotateX(Camera.DEFAULT_CAMERA_PITCH);
            camPersp.rotateOnWorldAxis(new Vector3(1,0,0), pitch);
            camPersp.rotateOnAxis(new Vector3(0,1,0), yaw);
            let rotationAxis = new Vector3();
            camPersp.getWorldDirection(rotationAxis);
            camPersp.rotateOnWorldAxis(rotationAxis, roll);

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
            const textGeometry = new TextGeometry(text, { font: Camera.font, size: size, height: 0.01 } );
            const textMesh = new Mesh(textGeometry, new MeshPhongMaterial( { color: 0xffffff } ))
            textMesh.position.set(initialXPos, initialYPos, initialZPos);
            textMesh.rotation.x = -Math.PI / 2.0;

            return textMesh;
        }

        this.addToScene = function(scene)
        {
            scene.add(this.cameraPerspective);
            scene.add(this.cameraPerspectiveHelper);
            scene.add(this.mesh);
            scene.add(this.nameText);
            scene.add(this.areaDisplay);
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
            scene.remove(this.areaDisplay);
        }

        //TODO: Mettre le code de la UI dans camera UI (stocke sa propre camera UI et appelle les méthodes)
        this.changeVisibility = function(display = !this.areaAppear)
        {
            const value = display;
            this.areaAppear = value;
            this.cameraPerspective.visible = value;
            this.cameraPerspectiveHelper.visible = value;
            this.nameText.visible = value;
            let iconElem = document.getElementById('cam-' + (this.id) + '-visible').firstChild;
            iconElem.dataset.icon = value ? "akar-icons:eye-open" : "akar-icons:eye-slashed";
            this.areaDisplay.visible = value;
        }

        this.updatePosition = function(currentUnit)
        {
            this.XPos = this.mesh.position.x;
            this.YPos = this.mesh.position.y;
            this.ZPos = this.mesh.position.z;
            this.cameraPerspective.position.set(this.XPos, this.YPos, this.ZPos);
    
            document.getElementById('x-pos-'+ this.id).getElementsByTagName('strong')[0].innerHTML = Math.round(this.XPos * currentUnit * 10)/10.0;
            document.getElementById('y-pos-'+ this.id).getElementsByTagName('strong')[0].innerHTML = Math.round(- this.ZPos * currentUnit * 10)/10.0;
            document.getElementById('z-pos-'+ this.id).getElementsByTagName('strong')[0].innerHTML = Math.round(this.YPos * currentUnit * 10)/10.0;
        }

        this.updateTextArea = function(currentUnit)
        {
            this.areaDisplay.geometry.dispose();
            this.areaDisplay.geometry = new TextGeometry( Math.round(this.areaValue*100)/100 + (currentUnit === units.meters ? 'm²' : 'sqft'), { font: Camera.font, size: Camera.SIZE_TEXT_CAMERA * 2/3.0, height: 0.01 } );
            //this.areaDisplay.geometry = new TextGeometry( "X: " + Math.round(this.XPos*currentUnit*100)/100 + (currentUnit === units.meters ? 'm' : 'ft') + ", Y: " + Math.round(this.ZPos*currentUnit*100)/100 + (currentUnit === units.meters ? 'm' : 'ft'), { font: Camera.font, size: Camera.SIZE_TEXT_CAMERA * 2/3.0, height: 0.01 } );
        }

        this.changeTextPosition = function(center)
        {
            this.nameText.position.copy(center.add(new Vector3( - Camera.SIZE_TEXT_CAMERA * 2, 0.1, 0)));
            this.areaDisplay.position.copy(center.add(new Vector3(0, 0, 1.5*Camera.SIZE_TEXT_CAMERA )));
            this.areaDisplay.visible = this.areaAppear;
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
            this.areaDisplay.geometry.dispose();
            this.areaDisplay.material.dispose();
        }
    }
}

export { Camera }