import * as THREE from 'three';

import { cameras, camerasTypes } from './Camera.js';
import { resetCams, addCamera } from './Camera.js'
import { Grid } from './Grid.js';

import * as POLYBOOL from 'polybool';
import { placeCamera } from './main.js';

export let scene = new THREE.Scene();

export const units = {meters: 1, feets: 3.28084}
export let currentUnit = units.meters;

let floor, wallX, wallZ;
const floorNormal = new THREE.Vector3(0,1,0);
const DEFAULT_FLOOR_HEIGHT = 0;
let heightDetected = 1;
const wallXNormal = new THREE.Vector3(1,0,0);
let wallXDepth;
const wallZNormal = new THREE.Vector3(0,0,1);
let wallZDepth;
const DEFAULT_SCENE_SIZE = 70;
let grid;

//DEBUG

let spheres = [];
let rays = [];

//END DEBUG

export function initScene()
{
    // Lighting
    const ambient = new THREE.AmbientLight( 0xffffff, 0.5 );
    scene.add(ambient);

    // Floor
    let materialFloor = new THREE.MeshPhongMaterial( {color: 0x555555});//{ color: 0x8DAA9D, dithering: true } ); // green-blue
    materialFloor.side = THREE.DoubleSide;

    const size = DEFAULT_SCENE_SIZE;
    let geometryFloor = new THREE.PlaneGeometry( size, size );

    floor = new THREE.Mesh(geometryFloor, materialFloor);
    floor.position.set( 0, DEFAULT_FLOOR_HEIGHT - 0.01, 0 ); //to avoid noise with area covered by cam (y = 0 for area covered)
    floor.rotation.x = - Math.PI / 2.0;
    scene.add(floor);

    // Grid
    // const gridHelper = new THREE.GridHelper( size, size, 0x444444 , 0x444444 );
    // gridHelper.position.y = - 0.005;
    // scene.add( gridHelper );
    grid = new Grid(size, units.meters);
    grid.addPlanesToScene(scene);
    //grid.planes.forEach(p => scene.add(p));

    const axesHelper = new THREE.AxesHelper( 0.5 );
    axesHelper.position.y = 0.02;
    scene.add( axesHelper );
    //axesHelper.setColors(0xffffff, 0xffffff, 0xffffff);
    axesHelper.material = new THREE.LineBasicMaterial( {
        color: 0xffffff,
        linewidth: 3});

    // WallX
    let materialWallX = new THREE.MeshPhongMaterial( {color: 0xCCCCCC});//{ color: 0x522B47, dithering: true } ); // violet

    let geometryWallX = new THREE.PlaneGeometry( 2000, 2000 );

    wallXDepth = - size / 2.0;
    wallX = new THREE.Mesh(geometryWallX, materialWallX);
    wallX.position.set( wallXDepth - 0.01, 0, 0 ); //to avoid noise with area covered by cam (y = 0 for area covered)
    wallX.rotation.y = Math.PI / 2.0;
    scene.add(wallX);

    // WallZ
    let materialWallZ = new THREE.MeshPhongMaterial( {color: 0xAAAAAA});//{ color: 0x7B0828, dithering: true } ); // magenta

    let geometryWallZ = new THREE.PlaneGeometry( 2000, 2000 );

    wallZDepth = - size / 2.0;
    wallZ = new THREE.Mesh(geometryWallZ, materialWallZ);
    wallZ.position.set( 0, 0, - size/2.0 - 0.01 ); //to avoid noise with area covered by cam (y = 0 for area covered)
    scene.add(wallZ);

    //Close scene
    const wallRight = new THREE.Mesh(new THREE.PlaneGeometry( 2000, 2000 ), materialWallX);
    wallRight.position.set( size/2.0 , 0, 0 ); 
    wallRight.rotation.y = - Math.PI / 2.0;
    scene.add(wallRight);

    const wallBack = new THREE.Mesh(new THREE.PlaneGeometry( 2000, 2000 ), materialWallZ);
    wallBack.position.set( 0, 0, size/2.0 ); 
    wallBack.rotation.y = Math.PI;
    scene.add(wallBack);
}

document.getElementById('toggle-unit').onclick = changeUnit;
function changeUnit()
{
    grid.unit === units.meters ? toggleUnit(units.feets) : toggleUnit(units.meters);
}

function toggleUnit(unit)
{
    grid.toggleUnit(unit);
    let unitNumberElements = document.querySelectorAll('[data-unit]');
    unitNumberElements.forEach(e => {
        e.innerHTML = Math.round(e.innerHTML / e.dataset.unit * unit * 10) / 10.0;
        e.dataset.unit = unit;
    });
    let unitCharElements = document.querySelectorAll('[data-unittext]');
    unitCharElements.forEach(e => {
        e.dataset.unittext = unit;
        switch(unit)
        {
            case units.feets:
                e.innerHTML = "ft";
                break;
            case units.meters:
            default:
                e.innerHTML = 'm';
                break;
        }
    });
    
    currentUnit = unit;
}

/* DEBUG */
document.addEventListener( 'keydown', onKeyDown );
function onKeyDown( event ) {

    switch ( event.keyCode ) {

        case 80: /*P*/
            console.log(grid.planes);
            break;

    }
}

/* Calculate area covered by the camera cam to draw it and display it*/ 
export function drawProjection(cam)
{
    scene.remove(cam.areaCoveredFloor);
    scene.remove(cam.areaCoveredAbove);
    scene.remove(cam.areaCoveredWallX);
    scene.remove(cam.areaCoveredWallZ);

    //let raysIntersect = [];
    let floorRays = [];
    let aboveRays = [];
    let wallXRays = [];
    let wallZRays = [];

    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(cam.cameraPerspective.projectionMatrix);
    //calculate the rays representing the intersection between frustum's planes and the floor or the walls
    for(let i = 0; i < 6; i++) 
    {
        let plane = frustum.planes[i].applyMatrix4(cam.cameraPerspective.matrixWorld);

        //crossing the floor
        let floorPlane = new THREE.Plane(floorNormal, 0);
        const rayIntersectFloor = getIntersectionOfPlanes(plane, floorPlane);

        //crossing a plane heightDetected m above the floor
        let abovePlane = new THREE.Plane(floorNormal, -heightDetected);
        const rayIntersectAbove = getIntersectionOfPlanes(plane, abovePlane);

        //crossing the left wall
        let wallXPlane = new THREE.Plane(wallXNormal, -wallXDepth);
        const rayIntersectWallX = getIntersectionOfPlanes(plane, wallXPlane);

        //crossing the far wall
        let wallZPlane = new THREE.Plane(wallZNormal, -wallZDepth);
        const rayIntersectWallZ = getIntersectionOfPlanes(plane, wallZPlane);

        if(rayIntersectFloor !== -1) floorRays.push(rayIntersectFloor);
        if(rayIntersectAbove !== -1) aboveRays.push(rayIntersectAbove);
        if(rayIntersectWallX !== -1) wallXRays.push(rayIntersectWallX);
        if(rayIntersectWallZ !== -1) wallZRays.push(rayIntersectWallZ);
/*

        //crossing the floor
        let floorN = new THREE.Vector3();
        floorN.copy(floorNormal);
        floorN.cross(plane.normal);
        if(floorN.length() > 0.01)
        {
            if(Math.abs(plane.normal.x) > 0.01)
            {
                const point = new THREE.Vector3(- plane.constant/plane.normal.x, 0, 0);
                const direction = new THREE.Vector3(- plane.normal.z/plane.normal.x , 0, 1).normalize();
                const ray = new THREE.Ray(point, direction);
                raysIntersect.push(ray);
            }
            else if(Math.abs(plane.normal.z) > 0.01)
            {
                const point = new THREE.Vector3(0, 0, - plane.constant/plane.normal.z);
                const direction = new THREE.Vector3(1, 0, - plane.normal.x/plane.normal.z).normalize();
                const ray = new THREE.Ray(point, direction);
                raysIntersect.push(ray);
            }
        }

        //crossing a plane heightDetected m above the floor
        if(floorN.length() > 0.01)
        {
            if(Math.abs(plane.normal.x) > 0.01)
            {
                const point = new THREE.Vector3((- heightDetected*plane.normal.y - plane.constant)/plane.normal.x, heightDetected, 0);
                const direction = new THREE.Vector3((- plane.normal.z)/plane.normal.x , 0, 1).normalize();
                const ray = new THREE.Ray(point, direction);
                raysIntersect.push(ray);
            }
            else if(Math.abs(plane.normal.z) > 0.01)
            {
                const point = new THREE.Vector3(0, heightDetected, (- heightDetected*plane.normal.y - plane.constant)/plane.normal.z);
                const direction = new THREE.Vector3(1, 0, (- plane.normal.x)/plane.normal.z).normalize();
                const ray = new THREE.Ray(point, direction);
                raysIntersect.push(ray);
            }
        }

        //crossing the left wall
        let wallXN = new THREE.Vector3();
        wallXN.copy(wallXNormal);
        wallXN.cross(plane.normal);
        if(wallXN.length() > 0.01)
        {
            if(Math.abs(plane.normal.y) > 0.01)
            {
                const point = new THREE.Vector3(wallXDepth, (- wallXDepth*plane.normal.x - plane.constant)/plane.normal.y, 0);
                const direction = new THREE.Vector3(0, (- plane.normal.z)/plane.normal.y, 1).normalize();
                const ray = new THREE.Ray(point, direction);
                raysIntersect.push(ray);
            }
            else if(Math.abs(plane.normal.z) > 0.01)
            {
                const point = new THREE.Vector3(wallXDepth, 0, (- wallXDepth*plane.normal.x - plane.constant)/plane.normal.z);
                const direction = new THREE.Vector3(0, 1, (- plane.normal.y)/plane.normal.z).normalize();
                const ray = new THREE.Ray(point, direction);
                raysIntersect.push(ray);
            }
        }

        //crossing the far wall
        let wallZN = new THREE.Vector3();
        wallZN.copy(wallZNormal);
        wallZN.cross(plane.normal);
        if(wallZN.length() > 0.01)
        {
            if(Math.abs(plane.normal.x) > 0.01)
            {
                const point = new THREE.Vector3((- wallZDepth*plane.normal.z - plane.constant)/plane.normal.x, 0, wallZDepth);
                const direction = new THREE.Vector3((- plane.normal.y)/plane.normal.x, 1, 0).normalize();
                const ray = new THREE.Ray(point, direction);
                raysIntersect.push(ray);
            }
            else if(Math.abs(plane.normal.y) > 0.01)
            {
                const point = new THREE.Vector3(0, (- wallZDepth*plane.normal.z - plane.constant)/plane.normal.y, wallZDepth);
                const direction = new THREE.Vector3(1, (- plane.normal.x)/plane.normal.y, 0).normalize();
                const ray = new THREE.Ray(point, direction);
                raysIntersect.push(ray);
            }
        }
*/ 
    }

    //adding rays for walls intersections
    let origin = new THREE.Vector3(wallXDepth, 0, wallZDepth);
    
    let wallXdir = new THREE.Vector3().copy(floorNormal);
    wallXdir.cross(wallXNormal);
    let wallZdir = new THREE.Vector3().copy(floorNormal);
    wallZdir.cross(wallZNormal);

    const floorWallXRay = new THREE.Ray(origin, wallXdir);
    const wallXWallZRay = new THREE.Ray(origin, floorNormal);
    const floorWallZRay = new THREE.Ray(origin, wallZdir);

    floorRays.push(floorWallXRay, floorWallZRay);
    wallXRays.push(floorWallXRay, wallXWallZRay);
    wallZRays.push(floorWallZRay, wallXWallZRay);

    /*let originAbove = new THREE.Vector3(wallXDepth, heightDetected, wallZDepth);
    raysIntersect.push(new THREE.Ray(originAbove, wallXNormal));
    raysIntersect.push(new THREE.Ray(originAbove, wallZNormal));*/
    
    
    //get intersection points
    let intersectionPointsFloor = getIntersectionPoints(floorRays);
    let intersectionPointsAbove = getIntersectionPoints(aboveRays);
    let intersectionPointsWallX = getIntersectionPoints(wallXRays);
    let intersectionPointsWallZ = getIntersectionPoints(wallZRays);


    
    //DEBUG SPHERES
    /*
    for(let i = 0; i < spheres.length; i++)
    {
        scene.remove(spheres[i]);
    }
    for(let i = 0; i < intersectionPointsAbove.length; i++)
    {
        const geometry = new THREE.SphereGeometry( 0.4, 32, 16 );
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff22 });
        const sphere = new THREE.Mesh( geometry, material );
        scene.add( sphere );
        sphere.translateOnAxis(intersectionPointsAbove[i],1);
        spheres.push(sphere);
    }
    */
    //FIN DEBUG

    //DEBUG RAYS
    /*
    for(let i = 0; i < rays.length; i++)
    {
        scene.remove(rays[i]);
    }
    for(let i = 0; i < aboveRays.length; i++)
    {
        for(let t = -2; t < 5; t++)
        {
            const geometry = new THREE.BoxGeometry( 0.6, 0.6, 0.6 );
            const material = new THREE.MeshBasicMaterial(t < 3.9 ? { color: 0xffffff } : { color: 0xffff00 } );
            const cube = new THREE.Mesh( geometry, material );
            scene.add( cube );
            let translation = new THREE.Vector3();
            aboveRays[i].at(t, translation);
            cube.translateOnAxis(translation, 1);
            rays.push(cube);
        }
    }
    */
    //FIN DEBUG

    //filter points in the camera frustum
    const frustumScaled = new THREE.Frustum();
    frustumScaled.setFromProjectionMatrix(cam.cameraPerspective.projectionMatrix);

    for(let i = 0; i < 6; i++) 
    {
        frustumScaled.planes[i].applyMatrix4(cam.cameraPerspective.matrixWorld);
        frustumScaled.planes[i].constant += 0.01;
    }

    const coveredPointsFloor = intersectionPointsFloor.filter(p => frustumScaled.containsPoint(p) && p.x > wallXDepth - 0.01 && p.y > - 0.01 && p.z > wallZDepth - 0.01);
    let coveredPointsAbove = intersectionPointsAbove.filter(p => frustumScaled.containsPoint(p));
    coveredPointsAbove.forEach((p) => p.y -= heightDetected);
    const coveredPointsWallX = intersectionPointsWallX.filter(p => frustumScaled.containsPoint(p) && p.x > wallXDepth - 0.01 && p.y > - 0.01 && p.z > wallZDepth - 0.01);
    const coveredPointsWallZ = intersectionPointsWallZ.filter(p => frustumScaled.containsPoint(p) && p.x > wallXDepth - 0.01 && p.y > - 0.01 && p.z > wallZDepth - 0.01);

    //filter points above, they must be in the frustum at heightDetected but also on the floor
    if(coveredPointsFloor.length > 2 && coveredPointsAbove.length > 2)
    {
        let raysAbove = [...aboveRays];
        raysAbove.forEach(r => r.origin.y -= heightDetected);
        let raysAroundArea = floorRays.concat(raysAbove);
        let pointsIntersect = getIntersectionPoints(raysAroundArea).filter(p => frustumScaled.containsPoint(p));
        let candidatesPoints = coveredPointsAbove.concat(pointsIntersect);

        //delete identical points
        candidatesPoints.sort((A,B) => B.length() - A.length() );
        sortByAngle(candidatesPoints, floorNormal);

        for(let j = 0; j < candidatesPoints.length - 1; j++)
        {
            if(candidatesPoints[j].distanceTo(candidatesPoints[j + 1]) < 0.01)
            {
                candidatesPoints.splice(j,1);
                j--;
            }
        }

        coveredPointsAbove = candidatesPoints.filter(p => {
            let abovePoint = new THREE.Vector3();
            abovePoint.copy(p);
            abovePoint.y += heightDetected;
            return frustumScaled.containsPoint(p) && frustumScaled.containsPoint(abovePoint) && p.x > wallXDepth - 0.01 && p.y > - 0.01 && p.z > wallZDepth - 0.01;
        })
    }
    else{
        coveredPointsAbove = [];
    }

    // coveredPointsFloor.sort((A, B) => sortByAngle(A, B, coveredPointsFloor));
    // coveredPointsAbove.sort((A, B) => sortByAngle(A, B, coveredPointsAbove));
    // coveredPointsWallX.sort((A, B) => sortByAngle(A, B, coveredPointsWallX));
    // coveredPointsWallZ.sort((A, B) => sortByAngle(A, B, coveredPointsWallZ));

    sortByAngle(coveredPointsFloor, floorNormal);
    sortByAngle(coveredPointsAbove, floorNormal);
    sortByAngle(coveredPointsWallX, wallXNormal);
    sortByAngle(coveredPointsWallZ, wallZNormal);

    cam.coveredPointsAbove = coveredPointsAbove;

    coveredPointsFloor.forEach((p) => p.y += 0.01*cam.id / cameras.length);
    coveredPointsAbove.forEach((p) => p.y += 0.01 + 0.01*cam.id / cameras.length);
    coveredPointsWallX.forEach((p) => p.x += 0.01*cam.id / cameras.length);
    coveredPointsWallZ.forEach((p) => p.z += 0.01*cam.id / cameras.length);

    //DEBUG SPHERES
    /*
    for(let i = 0; i < spheres.length; i++)
    {
        scene.remove(spheres[i]);
    }
    for(let i = 0; i < coveredPointsAbove.length; i++)
    {
        const geometry = new THREE.SphereGeometry( 0.4, 32, 16 );
        const material = new THREE.MeshBasicMaterial(frustumScaled.containsPoint(coveredPointsAbove[i]) ? { color: 0x00ffff } : { color: 0xff0000 } );
        const sphere = new THREE.Mesh( geometry, material );
        scene.add( sphere );
        sphere.translateOnAxis(coveredPointsAbove[i],1);
        spheres.push(sphere);
    }
    */
    //FIN DEBUG

    //display area value 
    let previousValue = cam.areaValue;
    cam.areaValue = calculateArea(coveredPointsAbove) / (grid.unit * grid.unit);

    //Place text 
    if(coveredPointsAbove.length > 2)
    {
        //cam.nameText.geometry = new TextGeometry( "Cam " + (cam.id+1), { font: font, size: cam.areaValue / 40.0, height: 0.01 } );
        let barycentre = getBarycentre(coveredPointsAbove);
        cam.changeTextPosition(barycentre);
        if(previousValue != cam.areaValue) cam.changeAreaDisplayed(barycentre);
    }
    else
    {
        cam.nameText.position.copy(cam.cameraPerspective.position);
        cam.areaDisplay.visible = false;
    }

    //draw area

    cam.areaCoveredFloor.geometry.dispose();
    cam.areaCoveredAbove.geometry.dispose();
    cam.areaCoveredWallX.geometry.dispose();
    cam.areaCoveredWallZ.geometry.dispose();

    cam.areaCoveredFloor = drawAreaWithPoints(coveredPointsFloor, 0xff0f00);
    cam.areaCoveredAbove = drawAreaWithPoints(coveredPointsAbove);
    cam.areaCoveredWallX = drawAreaWithPoints(coveredPointsWallX);
    cam.areaCoveredWallZ = drawAreaWithPoints(coveredPointsWallZ);

    cam.areaAppear ? scene.add(cam.areaCoveredFloor) : scene.remove(cam.areaCoveredFloor);
    cam.areaAppear ? scene.add(cam.areaCoveredAbove) : scene.remove(cam.areaCoveredAbove);
    cam.areaAppear ? scene.add(cam.areaCoveredWallX) : scene.remove(cam.areaCoveredWallX);
    cam.areaAppear ? scene.add(cam.areaCoveredWallZ) : scene.remove(cam.areaCoveredWallZ);
}

/**
 * Returns the ray intersection of plane1 and plane2
 * 
 * @param {THREE.Plane} plane1 
 * @param {THREE.Plane} plane2 
 * @returns {THREE.Ray} the intersection of the planes or -1 if planes are coincident or parrallel
 */
function getIntersectionOfPlanes(plane1, plane2)
{
    if(plane1.normal.length() < 0.001 || plane2.normal.length() < 0.001)
    {
        console.error("invalid parameters : one of the plane's normal is zero Vector");
        return -1;
    }
    const a1 = plane1.normal.x;
    const b1 = plane1.normal.y;
    const c1 = plane1.normal.z;
    const d1 = plane1.constant;

    const a2 = plane2.normal.x;
    const b2 = plane2.normal.y;
    const c2 = plane2.normal.z;
    const d2 = plane2.constant;

    if(Math.abs(a1 * b2 - a2 * b1) < 0.001 && Math.abs(b1 * c2 - b2 * c1) < 0.001) 
    {
        //Coincident or parrallel planes
        return -1;
    }

    /** MATH PARAGRAPH
     * 
     * Planes equations are
     *  a1 * x + b1 * y + c1 * z + d1 = 0
     *  a2 * x + b2 * y + c2 * z + d2 = 0
     * 
     * We want to get the all (x,y,z) triplet respecting both the equation (will be a 3D line)
     * 
     * if a1 != 0 :
     *      // in this case, a1 and a2 are 'main' arguments for calculatePointOnIntersectionRayCoordinates function
     *      // mode argument is 'abc'
     * 
     *      if a1 * b2 - a2 * b1 != 0
     *          // in this case, b1 and b2 are 'secondary' arguments for calculatePointOnIntersectionRayCoordinates function
     * 
     *          |                  a1 * x   =   - b1 * y - c1 * t - d1                            // from first plane equation
     *          |                  b2 * y   =   - a2 * x - c2 * t - d2                            // from second plane equation
     *          |                       z   =   t                                                 // 2 equations, 3 variables: one variable is a parameter
     * 
     *          <=>
     * 
     *          |                       x   =   (1/a1) * (- b1 * y - c1 * t - d1)                 // second coordinate that can be deduct
     *          | (a1 * b2 - a2 * b1) * y   =   (a2 * c1 - a1 * c2) * t + (a2 * d1 - a1 * d2)     // first coordinate that can be deduct
     *          |                       z   =   t                                                 // param Variable 
     * 
     * 
     *      if a1 * c2 - a2 * c1 != 0
     *          // in this case, c1 and c2 are 'secondary' arguments for calculatePointOnIntersectionRayCoordinates function
     *          // mode argument is 'acb'
     * 
     *          |                  a1 * x   =   - b1 * t - c1 * z - d1                            // from first plane equation
     *          |                       y   =   t                                                 // 2 equations, 3 variables: one variable is a parameter
     *          |                  c2 * z   =   - a2 * x - b2 * t - d2                            // from second plane equation
     * 
     *          <=>
     * 
     *          |                       x   =   (1/a1) * (- b1 * t - c1 * z - d1)                 // second coordinate that can be deduct
     *          |                       y   =   t                                                 // param Variable
     *          | (a1 * c2 - a2 * c1) * z   =   (a2 * b1 - a1 * b2) * t + (a2 * d1 - a1 * d2)     // first coordinate that can be deduct
     * 
     *      else means a1 * b2 - a2 * b1 = 0 AND a1 * c2 - a2 * c1 = 0 which means normals are colinear, and planes are parrallel or coincident.
     *      This case must have been avoided earlier
     * 
     * Same for b1 != 0 and c1 != 0 (Normals of planes cannot be zero vectors. This case must have been avoided earlier)
     */

    if(Math.abs(a1) > 0.001)
    {
        if(Math.abs(a1 * b2 - a2 * b1) > 0.001)
        {
            return getIntersectionRay('abc');
        }
        else if(Math.abs(a1 * c2 - a2 * c1) > 0.001)
        {
            return getIntersectionRay('acb');
        }
        else
        {
            console.error("There is a mathematical incoherence in the code");
            return -1;
        }
    }

    else if(Math.abs(b1) > 0.001)
    {
        if(Math.abs(b1 * c2 - b2 * c1) > 0.001)
        {
            return getIntersectionRay('bca');
        }
        else if(Math.abs(b1 * a2 - b2 * a1) > 0.001)
        {
            return getIntersectionRay('bac');
        }
        else
        {
            console.error("There is a mathematical incoherence in the code");
            return -1;
        }
    }
    
    else if(Math.abs(c1) > 0.001)
    {
        if(Math.abs(c1 * a2 - c2 * a1) > 0.001)
        {
            return getIntersectionRay('cab');
        }
        else if(Math.abs(c1 * b2 - c2 * b1) > 0.001)
        {
            return getIntersectionRay('cba');
        }
        else
        {
            console.error("There is a mathematical incoherence in the code");
            return -1;
        }
    }

    else
    {
        console.error("invalid parameters : one of the plane's normal is zero vector");
        return -1;
    }
    
    /**
     * get a THREE.Ray object which represents the intersection of planes.
     * @param {string} mode Can be {'abc', 'acb', 'bca', 'bac', 'cab', 'cba'} depending on 'main', 'secondary' and third parameter. See math paragraph above.
     * @returns {THREE.Ray} intersection ray of the planes. -1 if 'order' argument is not valid
     */
    function getIntersectionRay(mode){
        switch(mode){
            case 'abc':
            {
                const originCoordinates = calculatePointOnIntersectionRayCoordinates(a1, a2, b1, b2, c1, c2, 0, mode);
                const directionCoordinates = calculatePointOnIntersectionRayCoordinates(a1, a2, b1, b2, c1, c2, 1, mode).sub(originCoordinates);
                return new THREE.Ray(originCoordinates, directionCoordinates.normalize());
            }
            case 'acb':
            {
                const originCoordinates = calculatePointOnIntersectionRayCoordinates(a1, a2, c1, c2, b1, b2, 0, mode);
                const directionCoordinates = calculatePointOnIntersectionRayCoordinates(a1, a2, c1, c2, b1, b2, 1, mode).sub(originCoordinates);
                return new THREE.Ray(originCoordinates, directionCoordinates.normalize());
            }
            case 'bca':
            {
                const originCoordinates = calculatePointOnIntersectionRayCoordinates(b1, b2, c1, c2, a1, a2, 0, mode);
                const directionCoordinates = calculatePointOnIntersectionRayCoordinates(b1, b2, c1, c2, a1, a2, 1, mode).sub(originCoordinates);
                return new THREE.Ray(originCoordinates, directionCoordinates.normalize());
            }
            case 'bac':
            {
                const originCoordinates = calculatePointOnIntersectionRayCoordinates(b1, b2, a1, a2, c1, c2, 0, mode);
                const directionCoordinates = calculatePointOnIntersectionRayCoordinates(b1, b2, a1, a2, c1, c2, 1, mode).sub(originCoordinates);
                return new THREE.Ray(originCoordinates, directionCoordinates.normalize());
            }
            case 'cab':
            {
                const originCoordinates = calculatePointOnIntersectionRayCoordinates(c1, c2, a1, a2, b1, b2, 0, mode);
                const directionCoordinates = calculatePointOnIntersectionRayCoordinates(c1, c2, a1, a2, b1, b2, 1, mode).sub(originCoordinates);
                return new THREE.Ray(originCoordinates, directionCoordinates.normalize());
            }
            case 'cba':
            {
                const originCoordinates = calculatePointOnIntersectionRayCoordinates(c1, c2, b1, b2, a1, a2, 0, mode);
                const directionCoordinates = calculatePointOnIntersectionRayCoordinates(c1, c2, b1, b2, a1, a2, 1, mode).sub(originCoordinates);
                return new THREE.Ray(originCoordinates, directionCoordinates.normalize());
            }
            default:
                console.error("getInteresectionRay: the 'mode' argument is not valid");
                return -1;
        }
    }

    /**
     * See math paragraph to well understand this function. Calculate a point on the ray intersection depending on param argument
     * @param {float} m1 "main" coordinate of the normal 1 (first letter of 'mode')
     * @param {float} m2 "main" coordinate of the normal 2 (first letter of 'mode')
     * @param {float} s1 "secondary" coordinate of the normal 1 (second letter of 'mode')
     * @param {float} s2 "secondary" coordinate of the normal 2 (second letter of 'mode')
     * @param {float} t1 "third" coordinate of the normal 1 (thirs letter of 'mode')
     * @param {float} t2 "third" coordinate of the normal 2 (thirs letter of 'mode')
     * @param {float} param parameter of the line
     * @param {string} mode Can be {'abc', 'acb', 'bca', 'bac', 'cab', 'cba'}
     * @returns {THREE.Vector3} a point on the intersection line of the planes at the parameter param.
     */
    function calculatePointOnIntersectionRayCoordinates(m1, m2, s1, s2, t1, t2, param, mode)
    {
        const paramVar = param;
        const firstDeduct = ((m2 * t1 - m1 * t2) * paramVar + (m2 * d1 - m1 * d2)) / (m1 * s2 - m2 * s1);
        const secondDeduct = (- s1 * firstDeduct - t1 * paramVar - d1) / m1;

        switch(mode){
            case 'abc':
                return new THREE.Vector3(secondDeduct, firstDeduct, paramVar);
            case 'acb': 
                return new THREE.Vector3(secondDeduct, paramVar, firstDeduct);
            case 'bca':
                return new THREE.Vector3(paramVar, secondDeduct, firstDeduct);
            case 'bac': 
                return new THREE.Vector3(firstDeduct, secondDeduct, paramVar);
            case 'cab':
                return new THREE.Vector3(firstDeduct, paramVar, secondDeduct);
            case 'cba': 
                return new THREE.Vector3(paramVar, firstDeduct, secondDeduct);
            default:
                console.error("calculatePointsOnIntersectionRayCoordinates: the 'mode' argument is not valid");
                return -1;
        }
    }
}

/**
 * Returns the intersection point of ray1 and ray2
 * 
 * @param {THREE.Ray} ray1 
 * @param {THREE.Ray} ray2 
 * @returns {THREE.Vector3} the intersection of the rays or -1 if rays do not cross or are coincident
 */
function getIntersectionPointOfRays(ray1, ray2)
{
    let o1 = ray1.origin;
    let d1 = ray1.direction;
    let o2 = ray2.origin;
    let d2 = ray2.direction;
    
    let normal = new THREE.Vector3();
    normal.copy(d1);
    normal.cross(d2);

    //no intersection points if rays are parrallel or coincident
    if(normal.length() < 0.001) return -1;

    //no intersection points if rays are not coplanar
    const plane = new THREE.Plane().setFromCoplanarPoints(o1, new THREE.Vector3().addVectors(o1, d1), new THREE.Vector3().addVectors(o2, d2))
    if(Math.abs(plane.distanceToPoint(o2)) > 0.001) return -1;

    /** MATH PARAGRAPH
     * 
     * Every points of rays can be written as :
     *  o1 + d1 * t     for ray1
     *  o2 + d2 * t'    for ray2
     * 
     * We want to get t as 
     *  o1 + d1 * t = o2 + d2 * t'
     * so we can calclate the intersection point of the rays: I = o1 + d1 * t 
     * 
     * We have those three equations:
     *  | o1.x + d1.x * t = o2.x + d2.x * t'
     *  | o1.x + d1.x * t = o2.x + d2.x * t'
     *  | o1.x + d1.x * t = o2.x + d2.x * t'
     * 
     * if d2.x != 0:
     * 
     *      t' = (1 / d2.x) * (d1.x * t + o1.x - o2.x)
     *  
     *      if d2.x * d1.y - d2.y * d1.x != 0:
     *          
     *          (d2.x * d1.y - d2.y * d1.x) * t = d2.y * (o1.x - o2.x) + d2.x * (o2.y - o1.y)
     * 
     *      if d2.x * d1.z - d2.z * d1.x != 0:
     *          
     *          (d2.x * d1.z - d2.z * d1.x) * t = d2.z * (o1.x - o2.x) + d2.x * (o2.z - o1.z)
     * 
     *      else means d2.x * d1.y - d2.y * d1.x = 0 AND d2.x * d1.z - d2.z * d1.x = 0 which means rays are parrallel or coincident.
     *      This case must have been avoided earlier
     * 
     * Same for d2.y != 0 and d2.z != 0 (Direction of lines cannot be zero vectors. This case must have been avoided earlier)
     */

    let intersectionPoint = new THREE.Vector3();
    if(Math.abs(d2.x) > 0.001)
    {
        if(Math.abs(d2.x * d1.y - d2.y * d1.x) > 0.001)
        {
            const param = (1/ (d2.x * d1.y - d2.y * d1.x)) * (d2.y * (o1.x - o2.x) + d2.x * (o2.y - o1.y))
            ray1.at(param, intersectionPoint);
            return intersectionPoint;
        }
        else if(Math.abs(d2.x * d1.z - d2.z * d1.x) > 0.001)
        {
            const param = (1/ (d2.x * d1.z - d2.z * d1.x)) * (d2.z * (o1.x - o2.x) + d2.x * (o2.z - o1.z))
            ray1.at(param, intersectionPoint);
            return intersectionPoint;
        }
        else
        {
            console.error("There is a mathematical incoherence in the code");
            return -1;
        }
    }

    else if(d2.y != 0)
    {
        if(Math.abs(d2.y * d1.z - d2.z * d1.y) > 0.001)
        {
            const param = (1/ (d2.y * d1.z - d2.z * d1.y)) * (d2.z * (o1.y - o2.y) + d2.y * (o2.z - o1.z))
            ray1.at(param, intersectionPoint);
            return intersectionPoint;
        }
        else if(Math.abs(d2.y * d1.x - d2.x * d1.y) > 0.001)
        {
            const param = (1/ (d2.y * d1.x - d2.x * d1.y)) * (d2.x * (o1.y - o2.y) + d2.y * (o2.x - o1.x))
            ray1.at(param, intersectionPoint);
            return intersectionPoint;
        }
        else
        {
            console.error("There is a mathematical incoherence in the code");
            return -1;
        }
    }

    else if(d2.z != 0)
    {
        if(Math.abs(d2.z * d1.x - d2.x * d1.z) > 0.001)
        {
            const param = (1/ (d2.z * d1.x - d2.x * d1.z)) * (d2.x * (o1.z - o2.z) + d2.z * (o2.x - o1.x))
            ray1.at(param, intersectionPoint);
            return intersectionPoint;
        }
        else if(Math.abs(d2.z * d1.y - d2.y * d1.z) > 0.001)
        {
            const param = (1/ (d2.z * d1.y - d2.y * d1.z)) * (d2.y * (o1.z - o2.z) + d2.z * (o2.y - o1.y))
            ray1.at(param, intersectionPoint);
            return intersectionPoint;
        }
        else
        {
            console.error("There is a mathematical incoherence in the code");
            return -1;
        }
    }

    else
    {
        console.error("invalid parameters : one of the rays direction is zero vector");
        return -1;
    }
}

/**
 * Get every intersection points of multiple rays
 * 
 * @param {Array} raysCrossing an array filled with THREE.Ray objects
 * @returns {Array} an array of points which are all the intersection poins of the rays in raysCrossing array
 */
function getIntersectionPoints(raysCrossing)
{
    let intersectionPoints = [];
    for(let i = 0; i < raysCrossing.length - 1; i++)
    {
        let ray1 = raysCrossing[i];
        for(let j = i+1; j < raysCrossing.length; j++)
        {
            let ray2 = raysCrossing[j]

            let point = getIntersectionPointOfRays(ray1, ray2);
            if(point != -1) intersectionPoints.push(point);
        }
    }

    return intersectionPoints;
}

/**
 * Sort the array passed as an argument so the vertices are ordered
 * 
 * @param {Array} coveredPoints array of vertices of a convex shape
 * @param {THREE.Vector3} planeNormal normal of the plane in which the shape is inscribed
 */
function sortByAngle(coveredPoints, planeNormal)
{
    if(coveredPoints.length > 2)
    {
        let center = getBarycentre(coveredPoints);
        let vector = new THREE.Vector3();
        vector.subVectors(coveredPoints[0], center);
        let vectorPerp = new THREE.Vector3();
        vectorPerp.copy(vector);
        vectorPerp.applyAxisAngle(planeNormal, Math.PI/2.0);

        coveredPoints.sort((A,B) => {
            let vectorA = new THREE.Vector3();
            vectorA.subVectors(A, center);
        
            let vectorB = new THREE.Vector3();
            vectorB.subVectors(B, center);
            
            let dotProdA = Math.abs(vectorPerp.dot(vectorA)) > 0.001 ? vectorPerp.dot(vectorA) : 1;
            let dotProdB = Math.abs(vectorPerp.dot(vectorB)) > 0.001 ? vectorPerp.dot(vectorB) : 1;

            return Math.abs(dotProdB) / dotProdB * vector.angleTo(vectorB) - Math.abs(dotProdA) / dotProdA * vector.angleTo(vectorA);
        });
    }
}

/**
 * Calculate the area of a convex shape
 * 
 * @param {Array} borderPoints array of THREE.Vector3 vertices of a convex shape. They must be ordered
 * @returns {float} value of area of the shape delimited by borderPoints
 */
function calculateArea(borderPoints)
{
    let areaValue = 0;
    /** MATH PARAGRAPH
     * 
     * If ABC is a triangle
     * vAB is the vector from A to B
     * vAC is the vector from A to C
     * A is the area value of the triangle
     *  A = (1/2) * || vAB ^ vAC ||
     * 
     * In three js, a shape is drawn thanks to the triangles it is composed of
     * The sum of the areas of those triangles gives the total area of the shape 
     */
    for(let i = 1; i < borderPoints.length - 1; i++)
    {
        let vectorAB = new THREE.Vector3();
        vectorAB.subVectors(borderPoints[i], borderPoints[0]);

        let vectorAC = new THREE.Vector3();
        vectorAC.subVectors(borderPoints[i + 1], borderPoints[0]);

        let areaOfThisTriangle = 0.5 * vectorAB.cross(vectorAC).length();
        areaValue += areaOfThisTriangle;
    }

    return areaValue;
}

function getBarycentre(points)
{
    let barycentre = new THREE.Vector3();
    points.forEach(p => barycentre.add(p));
    barycentre.divideScalar(points.length);
    return barycentre;
}

function drawAreaWithPoints(coveredPoints, color = 0x008888)
{
    const geometryArea = new THREE.BufferGeometry();
    let verticesArray = [];
    
    for(let i = 1; i < coveredPoints.length - 1; i++)
    {
        verticesArray.push(coveredPoints[i + 1].x);
        verticesArray.push(coveredPoints[i + 1].y);
        verticesArray.push(coveredPoints[i + 1].z);

        verticesArray.push(coveredPoints[i].x);
        verticesArray.push(coveredPoints[i].y);
        verticesArray.push(coveredPoints[i].z);

        verticesArray.push(coveredPoints[0].x);
        verticesArray.push(coveredPoints[0].y);
        verticesArray.push(coveredPoints[0].z);
    }

    const vertices = new Float32Array( verticesArray );

    geometryArea.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    const materialArea = new THREE.MeshBasicMaterial( { color: color } );
    
    materialArea.side = THREE.DoubleSide;
    materialArea.transparent = true;
    materialArea.opacity = 0.7;
    materialArea.alphaTest = 0.5;
    
    const areaCovered = new THREE.Mesh( geometryArea, materialArea );
    return(areaCovered);
}

/* GIVEN AREA */
//calculates and display the area
let line = new THREE.LineSegments(new THREE.EdgesGeometry(), new THREE.LineBasicMaterial( { color: 0x000000 }));
scene.add( line );

let inputAreaWidth = document.getElementById("areaWantedWidth");
let inputAreaHeight = document.getElementById("areaWantedHeight");

//reset values after reloading page
inputAreaWidth.value = 1;
inputAreaHeight.value = 1;
document.getElementById('hook-cam').value = 5;

inputAreaWidth.onchange = createBorder;
inputAreaHeight.onchange = createBorder;

let givenAreaPolygon = { regions: [[]], inverted: true};
function createBorder()
{
    let givenWidth = document.getElementById('areaWantedWidth').value
    let givenHeight = document.getElementById('areaWantedHeight').value

    if(givenWidth !== "" && givenHeight !=="")
    {
        givenWidth = parseFloat(givenWidth);
        givenHeight = parseFloat(givenHeight);

        const geometry = new THREE.BoxGeometry( Math.round(givenWidth*10) / 10.0, 0.001, Math.round(givenHeight*10) / 10.0 );
        line.geometry = new THREE.EdgesGeometry( geometry );
        line.position.set(givenWidth / 2.0, 0.01, givenHeight / 2.0)

        //Calculate area polygon
        givenAreaPolygon.regions[0] = [];
        givenAreaPolygon.regions[0].push([0, 0]);
        givenAreaPolygon.regions[0].push([givenWidth, 0]);
        givenAreaPolygon.regions[0].push([givenWidth, givenHeight]);
        givenAreaPolygon.regions[0].push([0, givenHeight]);
    }

}

//verifies if cameras cover the given area
export function doesCoverArea()
{
    let union = givenAreaPolygon;
    cameras.forEach(c => {
        let polyCam = {
            regions: [[]],
            inverted: false
        }
        c.coveredPointsAbove.forEach(p => {
            polyCam.regions[0].push([p.x, p.z]);
        });
        union = PolyBool.union(union, polyCam);
    });

    let coversUI = document.getElementById('covers-check');
    coversUI.dataset.icon = union.regions.length === 0 ? "ion:checkmark-circle-sharp" : "ion:close-circle";
    coversUI.style = union.regions.length === 0 ? "color: #2b2;" : "color: #b22;";
}

//creates scene according to form
document.getElementById('generate-scene').onclick = createSceneFromForm;
function createSceneFromForm()
{
    //set heightDetected 
    heightDetected = parseFloat(document.getElementById('given-height-detection').value);

    //place cameras
    let givenWidth = parseFloat(document.getElementById('areaWantedWidth').value);
    let givenHeight = parseFloat(document.getElementById('areaWantedHeight').value);
    let camsHeight = parseFloat(document.getElementById('hook-cam').value);

    let configs = [];

    camerasTypes.filter(c => c.recommanded).forEach(type => {
        /*
        let augmentaFar = 0;
        switch(document.getElementById("tracking-mode").value)
        {
            case "human-tracking":
                augmentaFar = 6;
                break;
            case "hand-tracking":
                augmentaFar = 2;
                break;
            default:
                augmentaFar = 6;
                break;
        }
        if(type.rangeFar > augmentaFar) type.rangeFar = augmentaFar;
        */
        if(document.getElementById('check-' + type.id)) if(document.getElementById('check-' + type.id).checked && camsHeight <= type.rangeFar && camsHeight >= type.rangeNear + heightDetected)
        {
            let widthAreaCovered = Math.abs(Math.tan((type.HFov/2.0) * Math.PI / 180.0))*(camsHeight - heightDetected) * 2;
            let heightAreaCovered = Math.abs(Math.tan((type.VFov/2.0) * Math.PI / 180.0))*(camsHeight - heightDetected) * 2;

            let nbCamsNoRot = Math.ceil(givenWidth / widthAreaCovered) * Math.ceil(givenHeight / heightAreaCovered);
            let nbCamsRot = Math.ceil(givenWidth / heightAreaCovered) * Math.ceil(givenHeight / widthAreaCovered);

            nbCamsRot < nbCamsNoRot
                ?
                configs.push({ typeID: type.id, w: heightAreaCovered, h:widthAreaCovered, nbW: Math.ceil(givenWidth / heightAreaCovered), nbH: Math.ceil(givenHeight / widthAreaCovered), rot: true })
                :
                configs.push({ typeID: type.id, w: widthAreaCovered, h:heightAreaCovered, nbW: Math.ceil(givenWidth / widthAreaCovered), nbH: Math.ceil(givenHeight / heightAreaCovered), rot: false });
        }
    });

    if(configs.length === 0)
    {
        alert("Aucune camera n'est adaptée pour cette configuration. \nNo camera is adapted to your demand");
    }
    else
    {
        createBorder();

        configs.sort((A,B) => A.nbW * A.nbH - B.nbW * B.nbH);
        configs = configs.filter(c => c.nbW * c.nbH === configs[0].nbW * configs[0].nbH);
        configs.sort((A,B) => A.typeID - B.typeID);
        let chosenConfig = configs[0];
        resetCams();

        let offsetX = chosenConfig.w / 2.0;
        let offsetY = chosenConfig.h / 2.0;
        if(chosenConfig.nbW === 1) offsetX -= (chosenConfig.nbW*chosenConfig.w - givenWidth)/2.0;
        if(chosenConfig.nbH === 1) offsetY -= (chosenConfig.nbH*chosenConfig.h - givenHeight)/2.0;
        let oX = chosenConfig.nbW > 1 ? (chosenConfig.nbW*chosenConfig.w - givenWidth)/(chosenConfig.nbW - 1) : 0;
        let oY = chosenConfig.nbH > 1 ? (chosenConfig.nbH*chosenConfig.h - givenHeight)/(chosenConfig.nbH - 1) : 0;

        for(let i = 0; i < chosenConfig.nbW; i++)
        {
            for(let j = 0; j < chosenConfig.nbH; j++)
            {
                chosenConfig.rot 
                    ?
                    addCamera(true, chosenConfig.typeID, offsetX + i*(chosenConfig.w - oX), camsHeight, offsetY + j*(chosenConfig.h - oY), 0, 0, Math.PI/2.0)
                    :
                    addCamera(true, chosenConfig.typeID, offsetX + i*(chosenConfig.w - oX), camsHeight, offsetY + j*(chosenConfig.h - oY));

            }
        }
        //placeCamera(new THREE.Vector3(givenWidth, 6, givenHeight));
        formModal.style.display = "none";
    }
}

// OPEN FORM
var formModal = document.getElementById("generate-scene-modal");
var openFormButton = document.getElementById("open-scene-form");
var closeFormElem = document.getElementById("close-form");
openFormButton.onclick = function() {
    formModal.style.display = "block";
}
closeFormElem.onclick = function() {
    formModal.style.display = "none";
}
window.onclick = function(event) {
    if (event.target == formModal) {
        formModal.style.display = "none";
    }
}

