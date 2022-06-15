import {
    Group,
    PlaneGeometry,
    EdgesGeometry,
    BoxGeometry,
    LineSegments,
    MeshBasicMaterial,
    MeshPhongMaterial,
    LineBasicMaterial,
    Mesh
} from 'three';
import { DoubleSide } from 'three';
import { TextGeometry } from 'three-text-geometry';

import { units } from '/js/cameras.js'
import { SceneManager } from '/js/scene/SceneManager.js'

class Checkerboard{
    static SIZE_TEXT_SCENE = 0.3;
    constructor(unit = units.meters, floorHeight = 0, width = 0, height = 0)
    {
        //const gridSize = size
        this.width = width;
        this.height = height;
        this.unit = 1 / unit;
        this.floorHeight = floorHeight;

        const sceneBorder = new LineSegments(new EdgesGeometry(), new LineBasicMaterial( { color: 0x000000 }));
        const planes = new Group();
        const dimensionsText = buildTextMesh(this.width, this.height);


        function buildPlanes(width, height, floorHeight, unit)
        {
            const nbFullSquareWidth = Math.floor(width / unit);
            const nbFullSquareHeight = Math.floor(height / unit);

            const geometry = new PlaneGeometry( unit, unit );
            const material = new MeshBasicMaterial( {color: 0x111111, side: DoubleSide} );
            const plane = new Mesh( geometry, material );

            const endLineGeometryWidth = width - unit * nbFullSquareWidth;
            const endLineGeometry = new PlaneGeometry(endLineGeometryWidth, unit);
            const endColumnGeometryHeight = height - unit * nbFullSquareHeight;
            const endColumnGeometry = new PlaneGeometry(unit, endColumnGeometryHeight);

            // Floor under checkerboard
            const materialFloor = new MeshBasicMaterial( {side:DoubleSide, color: 0x2e2e2e});
            const geometryFloor = new PlaneGeometry( width + 0.02, height + 0.02 );
            const floor = new Mesh(geometryFloor, materialFloor);
            floor.position.set( width / 2.0 + 0.01, floorHeight - 0.02, height / 2.0 + 0.01 ); //to avoid z-fight with area covered by cam (y = floorHeight for area covered)
            floor.rotation.x = - Math.PI / 2.0;
            planes.add(floor);

            for(let i = 0; i < nbFullSquareHeight; i++)
            {
                for(let j = 0; j < nbFullSquareWidth; j++)
                {
                    if((i+j)%2 === 0)
                    {
                        const newPlane = plane.clone();
                        newPlane.rotation.x = Math.PI / 2.0;
                        newPlane.position.set(unit*(j + 0.5), floorHeight - 0.005, unit*(i + 0.5));
                        planes.add(newPlane);
                    }
                }
                if((i + nbFullSquareWidth)%2 === 0)
                {
                    const newPlane = new Mesh( endLineGeometry, material );
                    newPlane.rotation.x = Math.PI / 2.0;
                    newPlane.position.set(unit*(nbFullSquareWidth) + endLineGeometryWidth / 2.0, floorHeight - 0.005, unit*(i + 0.5));
                    planes.add(newPlane);
                }
            }
            for(let j = 0; j < nbFullSquareWidth; j++)
            {
                if((nbFullSquareHeight + j)%2 === 0)
                {
                    const newPlane = new Mesh( endColumnGeometry, material );
                    newPlane.rotation.x = Math.PI / 2.0;
                    newPlane.position.set(unit*(j + 0.5), floorHeight - 0.005, unit*(nbFullSquareHeight) + endColumnGeometryHeight / 2.0);
                    planes.add(newPlane);
                }
            }
            if((nbFullSquareWidth + nbFullSquareHeight)%2 === 0)
            {
                const lastPlaneGeometry = new PlaneGeometry(endLineGeometryWidth, endColumnGeometryHeight);
                const lastPlane = new Mesh( lastPlaneGeometry, material );
                lastPlane.rotation.x = Math.PI / 2.0;
                lastPlane.position.set(unit*(nbFullSquareWidth) + endLineGeometryWidth / 2.0, floorHeight - 0.005, unit*(nbFullSquareHeight) + endColumnGeometryHeight / 2.0);
                planes.add(lastPlane);
            }
        }

        function buildTextMesh(width, height)
        {
            const textGeometry = new TextGeometry("", { font: SceneManager.font, size: Checkerboard.SIZE_TEXT_SCENE, height: 0.01 } );
            const textMesh = new Mesh(textGeometry, new MeshPhongMaterial( { color: 0xffffff } ))
            textMesh.position.set(width, 0.01, height);
            textMesh.rotation.x = -Math.PI / 2.0;

            return textMesh;
        }

        function createText(width, height, floorHeight, unit)
        {
            dimensionsText.geometry.dispose();
            const dimensionsString = Math.round((width / unit)*100)/100 + (unit === units.meters ? 'm' : 'ft') + ' x ' + Math.round((height / unit)*100)/100 + (unit === units.meters ? 'm' : 'ft')
            dimensionsText.geometry = new TextGeometry(dimensionsString, { font: SceneManager.font, size: Checkerboard.SIZE_TEXT_SCENE * 2/3.0, height: 0.01 } );
            const offsetX = 0.14 * dimensionsString.length;
            dimensionsText.position.set(width - 0.2 - offsetX, floorHeight + 0.01, height - 0.2);
        }

        function createCheckerboard(width, height, floorHeight, unit)
        {
            sceneBorder.geometry.dispose();
            const geometry = new BoxGeometry(Math.round(width * 100) / 100.0, 0, Math.round(height * 100) / 100.0);
            sceneBorder.geometry = new EdgesGeometry(geometry);
            sceneBorder.position.set(width / 2.0, floorHeight + 0.02, height / 2.0);
            buildPlanes(width, height, floorHeight, unit);
            createText(width, height, floorHeight, unit);
        }

        this.addPlanesToScene = function (scene)
        {
            //buildPlanes(this.unit);
            scene.add(sceneBorder);
            scene.add(planes);
            scene.add(dimensionsText);
        }

        this.toggleUnit = function(unit)
        {
            this.dispose();
            this.unit = 1 / unit;
            if(this.width > 0 && this.height > 0) createCheckerboard(this.width, this.height, this.floorHeight, this.unit);
        }

        this.setSize = function(newWidth, newHeight)
        {
            this.dispose();
            this.width = newWidth;
            this.height = newHeight;
            createCheckerboard(this.width, this.height, this.floorHeight, this.unit);
        }

        this.setFloorHeight = function(floorHeight)
        {
            this.dispose();
            this.floorHeight = floorHeight;
            createCheckerboard(this.width, this.height, this.floorHeight, this.unit);
        }

        this.removeFromScene = function (scene)
        {
            scene.remove(planes);
        }

        this.dispose = function()
        {
            planes.children.forEach((plane) => {
                plane.geometry.dispose();
                plane.material.dispose();
            });
            planes.clear();

            dimensionsText.geometry.dispose();
            dimensionsText.material.dispose();
        }
    }
}

export { Checkerboard }