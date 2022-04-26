import * as THREE from 'three';
import { units } from './projection-area.js'


export class Grid{
    constructor(size, unit = units.meters)
    {
        const gridSize = size
        this.unit = 1 / unit;
        const planes = new THREE.Group();

        function buildPlanes(unit)
        {
            const geometry = new THREE.PlaneGeometry( unit, unit );
            const material = new THREE.MeshBasicMaterial( {color: 0x111111, side: THREE.DoubleSide} );
            const plane = new THREE.Mesh( geometry, material );
            for(let i = - Math.ceil(30 / unit); i < Math.ceil(gridSize / 2.0 / unit); i++)
            {
                for(let j = - Math.ceil(30 / unit); j < Math.ceil(gridSize / 2.0 / unit); j++)
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
        }

        this.addPlanesToScene = function (scene)
        {
            buildPlanes(this.unit);
            scene.add(planes);
        }

        this.toggleUnit = function(unit)
        {
            planes.clear();
            this.unit = 1 / unit;
            buildPlanes(this.unit);
        }

        this.delete = function (scene)
        {
            scene.remove(planes);
            planes.clear();
        }
    }
}