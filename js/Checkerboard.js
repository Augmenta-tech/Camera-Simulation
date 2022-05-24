import * as THREE from 'three';
import { units } from './cameras.js'


class Checkerboard{
    constructor(unit = units.meters, width = 0, height = 0)
    {
        //const gridSize = size
        this.width = width;
        this.height = height;
        this.unit = 1 / unit;
        const planes = new THREE.Group();

        /*function buildPlanes(unit)
        {
            const geometry = new THREE.PlaneGeometry( unit, unit );
            const material = new THREE.MeshBasicMaterial( {color: 0x111111, side: THREE.DoubleSide} );
            const plane = new THREE.Mesh( geometry, material );
            for(let i = - Math.ceil(gridSize / 2.0 / unit); i < Math.ceil(gridSize / 2.0 / unit); i++)
            {
                for(let j = - Math.ceil(gridSize / 2.0 / unit); j < Math.ceil(gridSize / 2.0 / unit); j++)
                {
                    if((i+j)%2 === 0)
                    {
                        let newPlane = plane.clone();
                        newPlane.rotation.x = Math.PI / 2.0;
                        newPlane.position.set(unit*(i + 0.5), -0.005, unit*(j + 0.5));
                        planes.add(newPlane);
                    }
                }
            }
        }*/

        function buildPlanes(width, height, unit)
        {
            const nbFullSquareWidth = Math.floor(width / unit);
            const nbFullSquareHeight = Math.floor(height / unit);

            const geometry = new THREE.PlaneGeometry( unit, unit );
            const material = new THREE.MeshBasicMaterial( {color: 0x111111, side: THREE.DoubleSide} );
            const plane = new THREE.Mesh( geometry, material );

            const endLineGeometryWidth = width - unit * nbFullSquareWidth;
            const endLineGeometry = new THREE.PlaneGeometry(endLineGeometryWidth, unit);
            const endColumnGeometryHeight = height - unit * nbFullSquareHeight;
            const endColumnGeometry = new THREE.PlaneGeometry(unit, endColumnGeometryHeight);
            for(let i = 0; i < nbFullSquareHeight; i++)
            {
                for(let j = 0; j < nbFullSquareWidth; j++)
                {
                    if((i+j)%2 === 0)
                    {
                        const newPlane = plane.clone();
                        newPlane.rotation.x = Math.PI / 2.0;
                        newPlane.position.set(unit*(j + 0.5), -0.005, unit*(i + 0.5));
                        planes.add(newPlane);
                    }
                }
                if((i + nbFullSquareWidth)%2 === 0)
                {
                    const newPlane = new THREE.Mesh( endLineGeometry, material );
                    newPlane.rotation.x = Math.PI / 2.0;
                    newPlane.position.set(unit*(nbFullSquareWidth) + endLineGeometryWidth / 2.0, -0.005, unit*(i + 0.5));
                    planes.add(newPlane);
                }
            }
            for(let j = 0; j < nbFullSquareWidth; j++)
            {
                if((nbFullSquareHeight + j)%2 === 0)
                {
                    const newPlane = new THREE.Mesh( endColumnGeometry, material );
                    newPlane.rotation.x = Math.PI / 2.0;
                    newPlane.position.set(unit*(j + 0.5), -0.005, unit*(nbFullSquareHeight) + endColumnGeometryHeight / 2.0);
                    planes.add(newPlane);
                }
            }
            if((nbFullSquareWidth + nbFullSquareHeight)%2 === 0)
            {
                const lastPlaneGeometry = new THREE.PlaneGeometry(endLineGeometryWidth, endColumnGeometryHeight);
                const lastPlane = new THREE.Mesh( lastPlaneGeometry, material );
                lastPlane.rotation.x = Math.PI / 2.0;
                lastPlane.position.set(unit*(nbFullSquareWidth) + endLineGeometryWidth / 2.0, -0.005, unit*(nbFullSquareHeight) + endColumnGeometryHeight / 2.0);
                planes.add(lastPlane);
            }
        }

        this.addPlanesToScene = function (scene)
        {
            //buildPlanes(this.unit);
            buildPlanes(this.width, this.height, this.unit);
            scene.add(planes);
        }

        this.toggleUnit = function(unit)
        {
            this.dispose();
            this.unit = 1 / unit;
            buildPlanes(this.width, this.height, this.unit);
        }

        this.setSize = function(newWidth, newHeight)
        {
            this.dispose();
            this.width = newWidth;
            this.height = newHeight;
            buildPlanes(this.width, this.height, this.unit);
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
        }
    }
}

export { Checkerboard }