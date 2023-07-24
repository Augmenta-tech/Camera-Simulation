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

import { units } from '/wp-content/themes/salient-child/builder-v2/designer/js/data.js'
import { SceneManager } from '/wp-content/themes/salient-child/builder-v2/designer/js/scene/SceneManager.js'

class Checkerboard{
    static SIZE_TEXT_SCENE = 0.3;
    constructor(unit = units.meters, sceneElevation = 0, width = SceneManager.DEFAULT_WIDTH, height = SceneManager.DEFAULT_LENGTH)
    {
        //const gridSize = size
        this.width = width;
        this.height = height;
        this.unit = unit;
        this.elevation = sceneElevation;

        const sceneBorder = new LineSegments(new EdgesGeometry(), new LineBasicMaterial( { color: 0x000000 }));
        const planes = new Group();
        const dimensionsText = buildTextMesh(this.width, this.height);


        function buildPlanes(width, height, elevation, unitValue)
        {
            const nbFullSquareWidth = Math.floor(width * unitValue);
            const nbFullSquareHeight = Math.floor(height * unitValue);

            const squareSize = 1 / unitValue; // 1 square / unitValue
            const geometry = new PlaneGeometry( squareSize, squareSize );
            const material = new MeshBasicMaterial( {color: 0x111111, side: DoubleSide} );
            const plane = new Mesh( geometry, material );

            const endLineGeometryWidth = width - nbFullSquareWidth * squareSize;
            const endLineGeometry = new PlaneGeometry(endLineGeometryWidth, squareSize);
            const endColumnGeometryHeight = height - nbFullSquareHeight * squareSize;
            const endColumnGeometry = new PlaneGeometry(squareSize, endColumnGeometryHeight);

            // Floor under checkerboard
            const materialFloor = new MeshBasicMaterial( {side:DoubleSide, color: 0x2e2e2e});
            const geometryFloor = new PlaneGeometry( width + 0.02, height + 0.02 );
            const floor = new Mesh(geometryFloor, materialFloor);
            floor.position.set( width / 2.0 + 0.01, elevation - 0.02, height / 2.0 + 0.01 ); //to avoid z-fight with area covered by cam (y = elevation for area covered)
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
                        newPlane.position.set((j + 0.5) * squareSize, elevation - 0.005, (i + 0.5) * squareSize);
                        planes.add(newPlane);
                    }
                }
                if((i + nbFullSquareWidth)%2 === 0)
                {
                    const newPlane = new Mesh( endLineGeometry, material );
                    newPlane.rotation.x = Math.PI / 2.0;
                    newPlane.position.set(nbFullSquareWidth * squareSize + endLineGeometryWidth / 2.0, elevation - 0.005, (i + 0.5) * squareSize);
                    planes.add(newPlane);
                }
            }
            for(let j = 0; j < nbFullSquareWidth; j++)
            {
                if((nbFullSquareHeight + j)%2 === 0)
                {
                    const newPlane = new Mesh( endColumnGeometry, material );
                    newPlane.rotation.x = Math.PI / 2.0;
                    newPlane.position.set((j + 0.5) * squareSize, elevation - 0.005, nbFullSquareHeight * squareSize + endColumnGeometryHeight / 2.0);
                    planes.add(newPlane);
                }
            }
            if((nbFullSquareWidth + nbFullSquareHeight)%2 === 0)
            {
                const lastPlaneGeometry = new PlaneGeometry(endLineGeometryWidth, endColumnGeometryHeight);
                const lastPlane = new Mesh( lastPlaneGeometry, material );
                lastPlane.rotation.x = Math.PI / 2.0;
                lastPlane.position.set(nbFullSquareWidth * squareSize + endLineGeometryWidth / 2.0, elevation - 0.005, nbFullSquareHeight * squareSize + endColumnGeometryHeight / 2.0);
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

        function createText(width, height, elevation, unit)
        {
            dimensionsText.geometry.dispose();
            const dimensionsString = Math.round((width * unit.value)*100)/100 + unit.label + ' x ' + Math.round((height * unit.value)*100)/100 + unit.label;
            dimensionsText.geometry = new TextGeometry(dimensionsString, { font: SceneManager.font, size: Checkerboard.SIZE_TEXT_SCENE * 2/3.0, height: 0.01 } );
            const offsetX = 0.14 * dimensionsString.length;
            dimensionsText.position.set(width - 0.2 - offsetX, elevation + 0.01, height - 0.2);
        }

        function createCheckerboard(width, height, elevation, unit)
        {
            sceneBorder.geometry.dispose();
            const geometry = new BoxGeometry(Math.round(width * 100) / 100.0 + 0.02, 0, Math.round(height * 100) / 100.0 + 0.02);
            sceneBorder.geometry = new EdgesGeometry(geometry);
            sceneBorder.position.set(width / 2.0, elevation + 0.01, height / 2.0);
            buildPlanes(width, height, elevation, unit.value);
            createText(width, height, elevation, unit);
        }

        this.addPlanesToScene = function (scene)
        {
            scene.add(sceneBorder);
            scene.add(planes);
            scene.add(dimensionsText);
        }

        this.toggleUnit = function(unit)
        {
            this.dispose();
            this.unit = unit;
            if(this.width > 0 && this.height > 0) createCheckerboard(this.width, this.height, this.elevation, this.unit);
        }

        this.setSize = function(newWidth, newHeight)
        {
            this.dispose();
            this.width = newWidth;
            this.height = newHeight;
            createCheckerboard(this.width, this.height, this.elevation, this.unit);
        }

        this.setSceneElevation = function(sceneElevation)
        {
            this.dispose();
            this.elevation = sceneElevation;
            createCheckerboard(this.width, this.height, this.elevation, this.unit);
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

        createCheckerboard(this.width, this.height, this.elevation, this.unit);
    }
}

export { Checkerboard }
