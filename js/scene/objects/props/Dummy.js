import {
    MeshPhongMaterial,
    BoxGeometry,
    Mesh,
    Object3D
} from 'three';

import { MTLLoader } from 'three-loaders/MTLLoader.js';
import { OBJLoader } from 'three-loaders/OBJLoader.js';


class Dummy {
    static DEFAULT_DUMMIES_HEIGHT = document.getElementById('dummy-height-reference').value;
    static maleModel;
    static femaleModel;
    
    constructor(id)
    {
        this.id = id;

        this.xPos = 0;
        this.yPos = 0;
        this.zPos = 0;

        this.mesh = buildMesh(this.xPos, this.zPos)
        
        //this.model = new Object3D();

        this.model = buildModel();

        function buildMesh(initialPosX, initialPosZ)
        {
            const geometry = new BoxGeometry( 0.7, Dummy.DEFAULT_DUMMIES_HEIGHT* 4/5.0, 0.8 );
            const material = new MeshPhongMaterial( { color: 0x000000 } );
            material.transparent = true;
            material.opacity = 0;
            material.alphaTest = 0.5;
            const dummyMesh = new Mesh( geometry, material );
            dummyMesh.position.set(initialPosX, Dummy.DEFAULT_DUMMIES_HEIGHT / 2.0, initialPosZ);
            dummyMesh.name = 'Dummy';

            return dummyMesh;
        }

        function buildModel()
        {
            const model = new Object3D().copy((Math.random() < 0.5) ? Dummy.maleModel : Dummy.femaleModel);
            const scaling = Dummy.DEFAULT_DUMMIES_HEIGHT / 180.0; 
            model.scale.set(scaling, scaling, scaling);
            //model.position.set(dummy.xPos, dummy.yPos, dummy.zPos);

            return model;
        }

        this.addToScene = function(scene)
        {
            //loadModel(this, scene)
            scene.add(this.model);
            scene.add(this.mesh);
            this.model.position.clone(this.mesh.position);
        }

        this.removeFromScene = function(scene)
        {
            scene.remove(this.model);
            scene.remove(this.mesh);
        }

        this.updatePosition = function()
        {
            this.xPos = this.mesh.position.x;
            this.yPos = this.mesh.position.y - Dummy.DEFAULT_DUMMIES_HEIGHT / 2.0;
            this.zPos = this.mesh.position.z;
            this.model.position.set(this.xPos, this.yPos, this.zPos);
        }

        this.dispose = function()
        {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();

            this.model.children.forEach(mesh => {
                if(mesh.isMesh)
                {
                    mesh.geometry.dispose();
                    mesh.material.dispose();
                }
            });
            this.model.clear()
        }
    }
}

loadModel('male');
loadModel('female');

function loadModel(genre)
{
    const onProgress = function ( xhr ) {

        if ( xhr.lengthComputable ) {

            const percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

        }

    };

    new MTLLoader()
    .setPath( 'models/'+ genre +'02/' )
    .setRequestHeader({ "Content-Type" : "model/mtl"})
    .load( genre +'02.mtl', function ( materials ) {

        materials.preload();

        new OBJLoader()
            .setMaterials( materials )
            .setPath( 'models/'+ genre +'02/' )
            .setRequestHeader({ "Content-Type" : "model/obj"})
            .load( genre +'02.obj', function ( object ) {

                if(genre === 'male') Dummy.maleModel = object;
                else if(genre === 'female') Dummy.femaleModel = object;

            }, onProgress );
    } );
}

export { Dummy }