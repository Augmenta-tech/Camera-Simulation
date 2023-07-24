import {
    CylinderGeometry,
    BufferGeometry,
    BufferAttribute,
    MeshPhongMaterial,
    MeshBasicMaterial,
    Mesh,
    LineSegments,
    Color,
    Group
} from 'three';

import { getLidarsTypes, units } from '/js/data.js'


class Lidar{
    static DEFAULT_LIDAR_TYPE_ID = 0;
    static DEFAULT_LIDAR_HOOK_HEIGHT = 8;
    static DEFAULT_LIDAR_SIZE = 0.1;
    static DEFAULT_MIN_ANGLE_TO_AVOID_OBSTRUCTION = Math.PI/180 * 60;
    static DEFAULT_RATIO_FAR_MINDIST = 2;
    
    constructor(id, lidarTypeID = Lidar.DEFAULT_LIDAR_TYPE_ID, p_x = 0, p_z = Lidar.DEFAULT_LIDAR_HOOK_HEIGHT, r_y = 0)
    {
        this.id = id;
        this.lidarType = getLidarsTypes().find(t => t.id === lidarTypeID);

        this.xPos = p_x;
        this.yPos = Lidar.DEFAULT_LIDAR_SIZE + 0.01*this.id;
        this.zPos = p_z;
        this.xRot = 0;
        this.yRot = r_y;
        this.zRot = 0;
    
        this.color = new Color(0.5*Math.random(), 0.5*Math.random(), 0.5*Math.random());

        this.mesh = buildMesh(this.color, this.xPos, Lidar.DEFAULT_LIDAR_SIZE, this.zPos);
        this.rays = new Group();

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
            const material = new MeshBasicMaterial( {color: this.color, transparent: true, opacity: 0.4, alphaTest: 0.3 } );

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

                this.rays.add(ray);
            }

            this.rays.position.set(this.xPos, this.zPos, this.yPos);
            this.rays.rotation.z = this.yRot;
        }

    /* SCENE MANAGEMENT */
        this.addToScene = function(scene)
        {
            scene.add(this.mesh);
            scene.add(this.rays);
        }

        this.removeFromScene = function(scene)
        {
            scene.remove(this.mesh);
            scene.remove(this.rays);
        }

    /* USER'S ACTION */
        this.changeVisibility = function(display = !this.raysAppear)
        {
            const value = display;
            this.raysAppear = value;
            this.rays.visible = value;

            if(this.uiElement) this.uiElement.changeVisibility(value);
        }

        this.updatePosition = function(currentUnitValue)
        {
            this.xPos = this.mesh.position.x;
            this.zPos = this.mesh.position.y;
            this.rays.position.set(this.xPos, this.zPos, this.yPos);

            if(this.uiElement) this.uiElement.updatePosition(this.xPos, this.zPos, currentUnitValue)
        }

        this.update = function()
        {
            
        }

        this.dispose = function()
        {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();

            this.rays.children.forEach(m => {
                m.geometry.dispose();
                m.material.dispose();
            });
            this.rays.clear();

            if(this.uiElement) this.uiElement.dispose();
        }

        this.buildRays();
    }
}

export { Lidar }