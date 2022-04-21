import * as THREE from 'three';

export class Grid{
    constructor(size, unit = "meters")
    {
        console.log("constr");
        this.planes = [];
        for(let i = - size/2.0; i < size/2.0; i++)
        {
            for(let j = - size/2.0; j < size/2.0; j++)
            {
                const geometry = new THREE.PlaneGeometry( 1, 1 );
                const material = new THREE.MeshBasicMaterial( {color: ( (i+j)%2 === 0 ? 0x111111 : 0x333333), side: THREE.DoubleSide} );
                const plane = new THREE.Mesh( geometry, material );
                plane.rotation.x = Math.PI / 2.0;
                plane.position.set(i + 0.5, - 0.005, j + 0.5);
                this.planes.push(plane);
            }
        }
    }
}