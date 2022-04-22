import * as THREE from 'three';

import { MTLLoader } from 'three-loaders/MTLLoader.js';
import { OBJLoader } from 'three-loaders/OBJLoader.js';

import { scene } from './projection-area.js'
import { transformControl } from './main.js';


export let dummiesMeshes = [];
export let dummies = [];

const DEFAULT_DUMMIES_HEIGHT = 1.8;

class Dummy {
    constructor(id)
    {
        this.id = id;

        this.xPos = 0;
        this.yPos = 0;
        this.zPos = 0;

        for(let i = 0; i < dummies.length; i++)
        {
            if(new THREE.Vector3(this.xPos, this.yPos, this.zPos).distanceTo(dummies[i].model.position) < 1.0)
            {
                this.xPos++;
                i = 0;
            }
        }

        this.height = DEFAULT_DUMMIES_HEIGHT;

        this.model = new THREE.Object3D();

        const material = new THREE.MeshPhongMaterial( { color: 0x000000 } );
        const geometry = new THREE.BoxGeometry( 0.7, this.height* 4/5.0, 0.8 );
        material.transparent = true;
        material.opacity = 0;
        material.alphaTest = 0.5;
        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.position.set(this.xPos, this.height / 2.0, this.zPos);
        this.mesh.name = 'Dummy';
        dummiesMeshes.push(this.mesh);
    }

    addDummyToScene()
    {
        loadDummy(this)
        scene.add(this.mesh);
        this.model.position.clone(this.mesh.position); 
    }

    updatePosition()
    {
        this.XPos = this.mesh.position.x;
        this.YPos = this.mesh.position.y - this.height / 2.0;
        this.ZPos = this.mesh.position.z;
        this.model.position.set(this.XPos, this.YPos, this.ZPos);

    }

    remove()
    {
        if ( transformControl.object === this.mesh ) transformControl.detach();
        scene.remove(this.model);
        scene.remove(this.mesh);
    }
}

/* ADDING DUMMY */
document.getElementById('add-dummy').onclick = addDummy;
function addDummy()
{
    let newDummy = new Dummy(dummies.length);
    newDummy.addDummyToScene();
    dummies.push(newDummy);
}

function loadDummy(dummy)
{
    let genre = (Math.random() < 0.5) ? "male" : "female";
    let scaling = 0.01;

    const onProgress = function ( xhr ) {

        if ( xhr.lengthComputable ) {

            const percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

        }

    };

    new MTLLoader()
    .setPath( 'models/'+ genre +'02/' )
    .load( genre +'02.mtl', function ( materials ) {

        materials.preload();

        new OBJLoader()
            .setMaterials( materials )
            .setPath( 'models/'+ genre +'02/' )
            .load( genre +'02.obj', function ( object ) {

                dummy.model = object;
                dummy.model.scale.set(scaling, scaling, scaling);
                dummy.model.position.set(dummy.xPos, dummy.yPos, dummy.zPos);

                scene.add( dummy.model );

            }, onProgress );

    } );
}

/* REMOVE DUMMIES */
document.getElementById('remove-dummies').onclick = removeDummies;
function removeDummies()
{
    dummies.forEach(d => d.remove());
    dummies.splice(0, dummies.length);
    dummiesMeshes.splice(0, dummiesMeshes.length);
}