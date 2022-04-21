import * as THREE from 'three';
import { units } from './projection-area.js'


export class Grid{
    constructor(size, unit = units.meters)
    {
        this.size = size
        this.unit = 1 / unit;
        this.planes = [];
        const geometry = new THREE.PlaneGeometry( this.unit, this.unit );
        for(let i = - this.size/2.0; i < this.size/2.0; i++)
        {
            for(let j = - this.size/2.0; j < this.size/2.0; j++)
            {
                const material = new THREE.MeshBasicMaterial( {color: ( (i+j)%2 === 0 ? 0x111111 : 0x333333), side: THREE.DoubleSide} );
                const plane = new THREE.Mesh( geometry, material );
                plane.rotation.x = Math.PI / 2.0;
                plane.position.set(this.unit*(i + 0.5), -0.005, this.unit*(j + 0.5));
                this.planes.push(plane);
            }
        }
    }

    updateUnit(unit)
    {
        this.unit = 1 / unit;
        const geometry = new THREE.PlaneGeometry( this.unit, this.unit );
        for(let i = - this.size/2.0; i < this.size/2.0; i++)
        {
            for(let j = - this.size/2.0; j < this.size/2.0; j++)
            {
                let plane = this.planes[(i + this.size/2.0) * this.size + (j + this.size/2.0)];
                plane.geometry = geometry;
                plane.position.set(this.unit*(i + 0.5), -0.005, this.unit*(j + 0.5));
            }
        }
    }
}