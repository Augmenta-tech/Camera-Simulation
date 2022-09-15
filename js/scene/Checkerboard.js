import {
    Group,
    PlaneGeometry,
    EdgesGeometry,
    BoxGeometry,
    LineSegments,
    MeshBasicMaterial,
    MeshPhongMaterial,
    LineBasicMaterial,
    Mesh,
    Vector3
} from 'three';
import { DoubleSide } from 'three';
import { TextGeometry } from 'three-text-geometry';

import { units } from '../data.js'
import { SceneManager } from './SceneManager.js'

class Checkerboard{
    static SIZE_TEXT_SCENE = 0.3;
    constructor(surface, unit = units.meters, sceneElevation = 0, width = SceneManager.DEFAULT_WIDTH, height = SceneManager.DEFAULT_HEIGHT)
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
            planes.children.forEach((plane) => {
                plane.geometry.dispose();
                plane.material.dispose();
            });
            planes.clear();

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
            const lastPlaneGeometry = new PlaneGeometry(endLineGeometryWidth, endColumnGeometryHeight);

            // Floor under checkerboard
            const materialFloor = new MeshBasicMaterial( {side:DoubleSide, color: 0x2e2e2e});
            const geometryFloor = new PlaneGeometry( width + 0.02, height + 0.02 );
            geometryFloor.translate(- width / 2.0, height / 2.0, 0);
            const floor = new Mesh(geometryFloor, materialFloor);
            floor.position.set(width / 2.0 + 0.01, -height / 2.0 + 0.01, - 0.01 );
            planes.add(floor);

            for(let i = 0; i < nbFullSquareHeight; i++)
            {
                for(let j = 0; j < nbFullSquareWidth; j++)
                {
                    if((i+j)%2 === 0)
                    {
                        const newGeometry = geometry.clone();
                        newGeometry.translate(-width / 2.0 + (j + 0.5) * squareSize, height / 2.0 - (i + 0.5) * squareSize,  0);
                        const newPlane = new Mesh( newGeometry, material );
                        planes.add(newPlane);
                    }
                }
                if((i + nbFullSquareWidth)%2 === 0)
                {
                    const newGeometry = endLineGeometry.clone();
                    newGeometry.translate(-width / 2.0 + nbFullSquareWidth * squareSize + endLineGeometryWidth / 2.0, height / 2.0 - (i + 0.5) * squareSize, 0);
                    const newPlane = new Mesh( newGeometry, material );
                    planes.add(newPlane);
                }
            }
            for(let j = 0; j < nbFullSquareWidth; j++)
            {
                if((nbFullSquareHeight + j)%2 === 0)
                {
                    const newGeometry = endColumnGeometry.clone();
                    newGeometry.translate(-width / 2.0 + (j + 0.5) * squareSize, height / 2.0 - nbFullSquareHeight * squareSize - endColumnGeometryHeight / 2.0, 0);
                    const newPlane = new Mesh( newGeometry, material );
                    planes.add(newPlane);
                }
            }
            if((nbFullSquareWidth + nbFullSquareHeight)%2 === 0)
            {
                const newGeometry = lastPlaneGeometry.clone();
                newGeometry.translate(-width / 2.0 + nbFullSquareWidth * squareSize + endLineGeometryWidth / 2.0, height / 2.0 - nbFullSquareHeight * squareSize - endColumnGeometryHeight / 2.0, 0);
                const newPlane = new Mesh( newGeometry, material );
                planes.add(newPlane);
            }

            applyTransforms(planes, width, height, elevation)
        }

        function buildTextMesh(width, height)
        {
            const textGeometry = new TextGeometry("", { font: SceneManager.font, size: Checkerboard.SIZE_TEXT_SCENE, height: 0.01 } );
            const textMesh = new Mesh(textGeometry, new MeshPhongMaterial( { color: 0xffffff } ));
            return textMesh;
        }

        function updateText(width, height, elevation, unit)
        {
            dimensionsText.geometry.dispose();
            const dimensionsString = Math.round((width * unit.value)*100)/100 + unit.label + ' x ' + Math.round((height * unit.value)*100)/100 + unit.label;
            dimensionsText.geometry = new TextGeometry(dimensionsString, { font: SceneManager.font, size: Checkerboard.SIZE_TEXT_SCENE * 2/3.0, height: 0.01 } );
            applyTransforms(dimensionsText, width, height, elevation);
            
            const offsetX = 0.14 * dimensionsString.length;
            dimensionsText.translateX(width/ 2.0 - 0.2 - offsetX);
            dimensionsText.translateY(- (height / 2.0 - 0.2));
            //dimensionsText.position.set(width - 0.2 - offsetX, elevation + 0.01, height - 0.2);
        }
        
        function createCheckerboard(width, height, elevation, unit)
        {
            sceneBorder.geometry.dispose();
            const geometry = new BoxGeometry(Math.round(width * 100) / 100.0 + 0.02, Math.round(height * 100) / 100.0 + 0.02, 0);
            sceneBorder.geometry = new EdgesGeometry(geometry);

            applyTransforms(sceneBorder, width, height, elevation);

            buildPlanes(width, height, elevation, unit.value);
            updateText(width, height, elevation, unit);
        }

        function applyTransforms(object, width, height, elevation)
        {
            const sceneAxis = new Vector3(1, 1, 0);
            const lambda = new Vector3(width / 2.0, height / 2.0, 0);
            object.position.set(0, 0, 0);

            sceneAxis.applyEuler(surface.rotation);
            lambda.applyEuler(surface.rotation);

            object.position.set(sceneAxis.x * Math.abs(lambda.x), sceneAxis.y * Math.abs(lambda.y), - sceneAxis.z * Math.abs(lambda.z));
            object.translateZ(elevation + 0.005); // avoid z-fighting

            object.setRotationFromEuler(surface.rotation);
        }

        this.addToScene = function (scene)
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
            scene.remove(sceneBorder);
            scene.remove(planes);
            scene.remove(dimensionsText);
        }

        this.dispose = function()
        {
            planes.children.forEach((plane) => {
                plane.geometry.dispose();
                plane.material.dispose();
            });
            planes.clear();

            sceneBorder.geometry.dispose();
            sceneBorder.material.dispose();

            dimensionsText.geometry.dispose();
            dimensionsText.material.dispose();
        }

        createCheckerboard(this.width, this.height, this.elevation, this.unit);
    }
}

export { Checkerboard }