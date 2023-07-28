import {
    CylinderGeometry,
    BufferGeometry,
    BufferAttribute,
    MeshPhongMaterial,
    MeshBasicMaterial,
    DoubleSide,
    Mesh,
    LineSegments,
    Color,
    Group,
    ShaderMaterial
} from 'three';

import { units } from '../../../data.js'


class Cylinder{
    static DEFAULT_CYLINDER_HEIGHT = 2;
    static DEFAULT_CYLINDER_radius = 1;
    static DEFAULT_CYLINDER_SEGMENTS = 16;
    
    constructor(id, x, y, radius, height, elevation, unit)
    {
        this.id = id;

        this.xPos = x;
        this.yPos = y;
        this.zPos = height/2 + elevation;
        this.xRot = 0;
        this.yRot = 0;
        this.zRot = 0;

        this.radius = radius;
        this.height = height;
        this.elevation = elevation;
        this.unit = unit;
    
        this.color = new Color(0.5*Math.random(), 0.5*Math.random(), 0.5*Math.random());

        this.mesh = buildMesh(this.color, this.xPos, this.yPos, this.zPos, this.radius, this.height, this.elevation);

        /* BUILDERS */

        function buildMesh(color, x, y, z, radius, height, elevation)
        {
            const cylinderMesh = new Mesh( new CylinderGeometry(radius, radius, height, Cylinder.DEFAULT_CYLINDER_SEGMENTS, 1, true), 
                new MeshPhongMaterial ({side:DoubleSide}));

            cylinderMesh.position.set(x, z, y);
            cylinderMesh.rotation.set(0, 0, 0);
            cylinderMesh.name = 'Cylinder';

            return cylinderMesh;
        }

        /* SCENE MANAGEMENT */
        this.addToScene = function(scene)
        {
            scene.add(this.mesh);
        }

        this.removeFromScene = function(scene)
        {
            scene.remove(this.mesh);
        }

        /* USER'S ACTION */
        this.updatePosition = function(currentUnitValue)
        {
            this.xPos = this.mesh.position.x;
            this.yPos = this.mesh.position.y;

            if(this.uiElement) this.uiElement.updatePosition(this.xPos, this.zPos, currentUnitValue)
        }

        this.updateSize = function(newRadius, newHeight)
        {
            this.zPos += (newHeight-this.height)/2
            //Update class vars
            this.height = newHeight;
            this.radius = newRadius;
            //Update mesh
            this.mesh.geometry = new CylinderGeometry(newRadius, newRadius, newHeight, Cylinder.DEFAULT_CYLINDER_SEGMENTS, 1, true);
            this.mesh.position.set(this.xPos, this.zPos, this.yPos);
        }

        this.dispose = function()
        {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();

            if(this.uiElement) this.uiElement.dispose();
        }
    }
}

export { Cylinder }