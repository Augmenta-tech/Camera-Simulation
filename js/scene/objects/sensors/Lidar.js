import {
    CylinderGeometry,
    BufferGeometry,
    BufferAttribute,
    MeshPhongMaterial,
    MeshBasicMaterial,
    Mesh,
    LineSegments,
    Color
} from 'three';
import { TextGeometry } from 'three-text-geometry';

import { lidarsTypes, units } from '/js/data.js'

import { SceneObjects } from '/js/scene/objects/SceneObjects.js';

class Lidar{
    static DEFAULT_LIDAR_TYPE_ID = 0;
    static DEFAULT_LIDAR_HOOK_HEIGHT = 4.5;
    static DEFAULT_LIDAR_SIZE = 0.1;
    
    constructor(id, lidarTypeID = Lidar.DEFAULT_LIDAR_TYPE_ID, p_x = 0, p_z = Lidar.DEFAULT_LIDAR_HOOK_HEIGHT, r_y = 0)
    {
        this.id = id;
        this.lidarType = lidarsTypes.find(t => t.id === lidarTypeID);

        this.xPos = p_x;
        this.yPos = -10 + Lidar.DEFAULT_LIDAR_SIZE + 0.01*this.id;
        this.zPos = p_z;
        this.xRot = 0;
        this.yRot = r_y;
        this.zRot = 0;
    
        this.color = new Color(0.5*Math.random(), 0.5*Math.random(), 0.5*Math.random());

        this.raysAppear = true;

    /* BUILDERS */

        function buildMesh(color, x, y, z)
        {
            const material = new MeshPhongMaterial( { color: color, dithering: true } );
            const geometry = new CylinderGeometry(Lidar.DEFAULT_LIDAR_SIZE, Lidar.DEFAULT_LIDAR_SIZE, 2*Lidar.DEFAULT_LIDAR_SIZE);
            const mesh = new Mesh( geometry, material );
            mesh.position.set(x, z, y);
            mesh.rotation.set(Math.PI/2, 0, 0);
            mesh.name = 'Lidar';

            return mesh;
        }

        this.buildRays = function()
        {
            console.log(this.lidarType);
            const rays =[];
            const material = new MeshBasicMaterial( {color: this.color });//, transparent: true, opacity: 0.6, alphaTest: 0.5 } );

            const firstRayAngle = - Math.PI / 2 - (this.lidarType.fov / 2 * Math.PI / 180);
            for(let angle = firstRayAngle; angle <= firstRayAngle + this.lidarType.fov * Math.PI / 180; angle += this.lidarType.angularResolution * Math.PI / 180)
            {
                const geometry = new BufferGeometry();
                const verticesArray = [];

                verticesArray.push(this.lidarType.rangeNear * Math.cos(angle));
                verticesArray.push(this.lidarType.rangeNear * Math.sin(angle));
                verticesArray.push(0);

                verticesArray.push(this.lidarType.rangeFar * Math.cos(angle));
                verticesArray.push(this.lidarType.rangeFar * Math.sin(angle));
                verticesArray.push(0);

                const vertices = new Float32Array( verticesArray );
    
                geometry.setAttribute( 'position', new BufferAttribute( vertices, 3 ) );
                
                const ray = new LineSegments( geometry, material );

                ray.position.set(this.xPos, this.zPos, this.yPos);

                rays.push(ray);
            }

            return rays;
        }

        this.mesh = buildMesh(this.color, this.xPos, this.yPos - 0.01*this.id, this.zPos);
        this.rays = this.buildRays();

    /* SCENE MANAGEMENT */
        this.addToScene = function(scene)
        {
            scene.add(this.mesh);
            this.rays.forEach(m => scene.add(m));
        }

        this.removeFromScene = function(scene)
        {
            scene.remove(this.mesh);
            this.rays.forEach(m => scene.remove(m));
        }

    /* USER'S ACTION */
        //TODO: Mettre le code de la UI dans camera UI (stocke sa propre camera UI et appelle les méthodes)
        this.changeVisibility = function(display = !this.raysAppear)
        {
            const value = display;
            this.raysAppear = value;
            this.rays.forEach(m => m.visible = value);

            this.uiElement.changeVisibility(value);
        }

        this.updatePosition = function(currentUnitValue)
        {
            this.xPos = this.mesh.position.x;
            this.zPos = this.mesh.position.y;
            this.rays.forEach(m => m.position.set(this.xPos, this.zPos, this.yPos));

            this.uiElement.updatePosition(this.xPos, this.zPos, currentUnitValue)
        }

        this.update = function()
        {
            
        }

        this.dispose = function()
        {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();

            this.rays.forEach(m => {
                m.geometry.dispose();
                m.material.dispose();
            });
            this.rays.length = [];

            this.uiElement.dispose();
        }
    }
}

export { Lidar }