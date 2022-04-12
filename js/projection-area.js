import * as THREE from 'three';

import { TextGeometry } from 'three-text-geometry';

import { scene } from './main.js'
import { cameras } from './Camera.js';

let floor, wallX, wallZ;
const floorNormal = new THREE.Vector3(0,1,0);
const DEFAULT_FLOOR_HEIGHT = 0;
let heightDetected = 1;
const wallXNormal = new THREE.Vector3(1,0,0);
const DEFAULT_WALLX_DEPTH = -10;
let wallXDepth = DEFAULT_WALLX_DEPTH;
const wallZNormal = new THREE.Vector3(0,0,1);
const DEFAULT_WALLZ_DEPTH = -10;
let wallZDepth = DEFAULT_WALLZ_DEPTH;

//DEBUG

let spheres = [];
let rays = [];

//END DEBUG

export function initScene(scene)
{
    // Lighting
    const ambient = new THREE.AmbientLight( 0xffffff, 0.5 );
    scene.add(ambient);

    // Floor
    let materialFloor = new THREE.MeshPhongMaterial( { color: 0x8DAA9D, dithering: true } ); // green-blue

    let geometryFloor = new THREE.PlaneGeometry( 2000, 2000 );

    floor = new THREE.Mesh(geometryFloor, materialFloor);
    floor.position.set( 0, DEFAULT_FLOOR_HEIGHT - 0.01, 0 ); //to avoid noise with area covered by cam (y = 0 for area covered)
    floor.rotation.x = - Math.PI / 2.0;
    scene.add(floor);

    // Grid
    const size = 50;
    const divisions = 50

    const gridHelper = new THREE.GridHelper( size, divisions, 0x666666 , 0x666666 );
    gridHelper.position.y = - 0.005;
    scene.add( gridHelper );

    // WallX
    let materialWallX = new THREE.MeshPhongMaterial( { color: 0x522B47, dithering: true } ); // violet

    let geometryWallX = new THREE.PlaneGeometry( 2000, 2000 );

    wallX = new THREE.Mesh(geometryWallX, materialWallX);
    wallX.position.set( DEFAULT_WALLX_DEPTH - 0.01, 0, 0 ); //to avoid noise with area covered by cam (y = 0 for area covered)
    wallX.rotation.y = Math.PI / 2.0;
    scene.add(wallX);

    // WallZ
    let materialWallZ = new THREE.MeshPhongMaterial( { color: 0x7B0828, dithering: true } ); // magenta

    let geometryWallZ = new THREE.PlaneGeometry( 2000, 2000 );

    wallZ = new THREE.Mesh(geometryWallZ, materialWallZ);
    wallZ.position.set( 0, 0, DEFAULT_WALLZ_DEPTH - 0.01 ); //to avoid noise with area covered by cam (y = 0 for area covered)
    scene.add(wallZ);
}

/* Calculate area covered by the camera cam to draw it and display it*/ 
export function drawProjection(cam)
{
    scene.remove(cam.areaCoveredFloor);
    scene.remove(cam.areaCoveredAbove);
    scene.remove(cam.areaCoveredWallX);
    scene.remove(cam.areaCoveredWallZ);
    let raysIntersect = [];

    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(cam.cameraPerspective.projectionMatrix);
    //calculate the rays representing the intersection between frustum's planes and the floor or the walls
    for(let i = 0; i < 6; i++) 
    {
        let plane = frustum.planes[i].applyMatrix4(cam.cameraPerspective.matrixWorld);

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
    }

    //adding rays for walls intersections
    let origin = new THREE.Vector3(wallXDepth, 0, wallZDepth);
    raysIntersect.push(new THREE.Ray(origin, wallXNormal));
    raysIntersect.push(new THREE.Ray(origin, floorNormal));
    raysIntersect.push(new THREE.Ray(origin, wallZNormal));

    /*let originAbove = new THREE.Vector3(wallXDepth, heightDetected, wallZDepth);
    raysIntersect.push(new THREE.Ray(originAbove, wallXNormal));
    raysIntersect.push(new THREE.Ray(originAbove, wallZNormal));*/
    
    
    //floor points
    let floorRays = raysIntersect.filter(r => Math.abs(r.origin.y < 0.01 && Math.abs(r.direction.y) < 0.01));
    let intersectionPointsFloor = getIntersectionPoints(floorRays);

    //floor points heightDetected m above floor
    let aboveRays = raysIntersect.filter(r => Math.abs(r.origin.y - heightDetected) < 0.01 && Math.abs(r.direction.y) < 0.01);
    let intersectionPointsAbove = getIntersectionPoints(aboveRays);

    //wallX points
    let wallXRays = raysIntersect.filter(r => Math.abs(r.origin.x - wallXDepth) < 0.01  && Math.abs(r.direction.x) < 0.01);
    let intersectionPointsWallX = getIntersectionPoints(wallXRays);

    //wallZ points
    let wallZRays = raysIntersect.filter(r => Math.abs(r.origin.z - wallZDepth) < 0.01 && Math.abs(r.direction.z) < 0.01);
    let intersectionPointsWallZ = getIntersectionPoints(wallZRays);

    cam.raysFloor = floorRays;
    cam.raysAbove = aboveRays;
    cam.raysWallX = wallXRays;
    cam.raysWallZ = wallZRays;

    //DEBUG RAYS
    /*
    for(let i = 0; i < rays.length; i++)
    {
        scene.remove(rays[i]);
    }
    for(let i = 0; i < floorRays.length; i++)
    {
        for(let t = -2; t < 5; t++)
        {
            const geometry = new THREE.BoxGeometry( 0.6, 0.6, 0.6 );
            const material = new THREE.MeshBasicMaterial(t < 3.9 ? { color: 0xffffff } : { color: 0xffff00 } );
            const cube = new THREE.Mesh( geometry, material );
            scene.add( cube );
            let translation = new THREE.Vector3();
            floorRays[i].at(t, translation);
            cube.translateOnAxis(translation, 1);
            rays.push(cube);
        }
    }
    */
    
    //FIN DEBUG

    //filter points
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


    if(coveredPointsFloor.length > 2 && coveredPointsAbove.length > 2)
    {
        let raysAbove = [...aboveRays];
        raysAbove.forEach(r => r.origin.y -= heightDetected);
        let raysAroundArea = floorRays.concat(raysAbove);
        let pointsIntersect = getIntersectionPoints(raysAroundArea).filter(p => frustumScaled.containsPoint(p));
        let candidatesPoints = coveredPointsAbove.concat(pointsIntersect);

        //delete identical points
        candidatesPoints.sort((A,B) => A.length() < B.length());
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

    coveredPointsFloor.sort((A, B) => sortByAngle(A, B, coveredPointsFloor));
    coveredPointsAbove.sort((A, B) => sortByAngle(A, B, coveredPointsAbove));
    coveredPointsWallX.sort((A, B) => sortByAngle(A, B, coveredPointsWallX));
    coveredPointsWallZ.sort((A, B) => sortByAngle(A, B, coveredPointsWallZ));

    coveredPointsFloor.forEach((p) => p.y += 0.01*cam.id / cameras.length);
    coveredPointsAbove.forEach((p) => p.y += 0.01 + 0.01*cam.id / cameras.length);
    coveredPointsWallX.forEach((p) => p.y += 0.01*cam.id / cameras.length);
    coveredPointsWallZ.forEach((p) => p.y += 0.01*cam.id / cameras.length);

    //DEBUG SPHERES
    /*
    for(let i = 0; i < spheres.length; i++)
    {
        scene.remove(spheres[i]);
    }
    for(let i = 0; i < coveredPointsAbove.length; i++)
    {
        const geometry = new THREE.SphereGeometry( 0.7, 32, 16 );
        const material = new THREE.MeshBasicMaterial(frustumScaled.containsPoint(coveredPointsAbove[i]) ? { color: 0x00ffff } : { color: 0xff0000 } );
        const sphere = new THREE.Mesh( geometry, material );
        scene.add( sphere );
        sphere.translateOnAxis(coveredPointsAbove[i],1);
        spheres.push(sphere);
    }*/
    
    //FIN DEBUG

    //display area value 
    let previousValue = cam.areaValue;
    cam.areaValue = calculateArea(coveredPointsAbove);

    //Place text 
    if(coveredPointsAbove.length > 2)
    {
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
    cam.areaCoveredFloor = drawAreaWithPoints(coveredPointsFloor, 0xff0f00);
    cam.areaCoveredAbove = drawAreaWithPoints(coveredPointsAbove);
    cam.areaCoveredWallX = drawAreaWithPoints(coveredPointsWallX);
    cam.areaCoveredWallZ = drawAreaWithPoints(coveredPointsWallZ);

    cam.areaAppear ? scene.add(cam.areaCoveredFloor) : scene.remove(cam.areaCoveredFloor);
    cam.areaAppear ? scene.add(cam.areaCoveredAbove) : scene.remove(cam.areaCoveredAbove);
    cam.areaAppear ? scene.add(cam.areaCoveredWallX) : scene.remove(cam.areaCoveredWallX);
    cam.areaAppear ? scene.add(cam.areaCoveredWallZ) : scene.remove(cam.areaCoveredWallZ);

    //Calculate overlaps
    /*
    if(cam.areaValue > 0.01)
    {
        for(let i = 0; i < cam.id; i++)
        {
            if(cameras[i].areaValue > 0.01)
            {
                let raysCamsFloor = floorRays.concat(cameras[i].raysFloor);
                let pointsSuperposition = getIntersectionPoints(raysCamsFloor);

                //only keep points in both the frustums
                const frustumOtherCamScaled = new THREE.Frustum();
                frustumOtherCamScaled.setFromProjectionMatrix(cameras[i].cameraPerspective.projectionMatrix);

                for(let j = 0; j < 6; j++) 
                {
                    frustumOtherCamScaled.planes[j].applyMatrix4(cameras[i].cameraPerspective.matrixWorld);
                    frustumOtherCamScaled.planes[j].constant += 0.01;
                }
                pointsSuperposition = pointsSuperposition.filter(p => frustumScaled.containsPoint(p) && frustumOtherCamScaled.containsPoint(p));

                //delete identical points
                pointsSuperposition.sort((A,B) => A.length() < B.length());
                for(let j = 0; j < pointsSuperposition.length - 1; j++)
                {
                    if(pointsSuperposition[j].distanceTo(pointsSuperposition[j + 1]) < 0.01)
                    {
                        pointsSuperposition.splice(j,1);
                        j--;
                    }
                }

                pointsSuperposition.sort((A,B) => sortByAngle(A,B,pointsSuperposition));
                let superpositionArea = calculateArea(pointsSuperposition);
                //cameras[i].overlaps[cam.id] = superpositionArea; // / cameras[i].areaValue * 100;
                if(cam.overlaps[i] != superpositionArea)
                {
                    cam.overlaps[i] = superpositionArea; // / cam.areaValue * 100;
                    let barycentreSuperposition = getBarycentre(pointsSuperposition);
                    let areaOverlapsGeometry = new TextGeometry(  Math.round(superpositionArea*100)/100 + "m²", { font: font, size: SIZE_TEXT_CAMERA * 2/3.0, height: 0.05 } );
                    cam.areaOverlaps[i].geometry = areaOverlapsGeometry;
                    cam.areaOverlaps[i].position.copy(barycentreSuperposition.add(new Vector3( - SIZE_TEXT_CAMERA*2, 0.1, SIZE_TEXT_CAMERA/2.0 )));
                }
                if(pointsSuperposition.length > 2)
                {
                    cam.areaOverlaps[i].visible = cam.areaAppear && cameras[i].areaAppear;
                }
                else
                {
                    cam.areaOverlaps[i].visible = false;
                }
            }
        }
    }*/
}

function sortByAngle(A, B, coveredPoints){
    let center = new THREE.Vector3();
    center.addVectors(coveredPoints[0], coveredPoints[1]).divideScalar(2.0);

    let vector = new THREE.Vector3();
    vector.subVectors(coveredPoints[0], center);

    let vectorA = new THREE.Vector3();
    vectorA.subVectors(A, center);

    let vectorB = new THREE.Vector3();
    vectorB.subVectors(B, center);
    
    return vector.angleTo(vectorA) - vector.angleTo(vectorB);
}

function getIntersectionPoints(raysCrossing)
{

    let intersectionPoints = [];
    for(let i = 0; i < raysCrossing.length - 1; i++)
    {
        let ray1 = raysCrossing[i];
        for(let j = i+1; j < raysCrossing.length; j++)
        {
            let ray2 = raysCrossing[j]

            //intersection point
            let A = ray1.origin;
            let u = ray1.direction;
            let B = ray2.origin;
            let v = ray2.direction;
            
            let normal = new THREE.Vector3();
            normal.copy(u);
            normal.cross(v);

            let dirX = new THREE.Vector3(1, 0, 0);
            let dirY = new THREE.Vector3(0, 1, 0);
            let dirZ = new THREE.Vector3(0, 0, 1);

            let qy = 0;
            let sy = 0;
            if(dirY.cross(normal).length() < 0.01)
            {
                qy = (A.z - B.z) * u.x + (B.x - A.x) * u.z ;
                sy = u.x * v.z - v.x * u.z;
            }
            else if(dirX.cross(normal).length() < 0.01)
            {
                qy = (A.z - B.z) * u.y + (B.y - A.y) * u.z ;
                sy = u.y * v.z - v.y * u.z;
            }
            else if(dirZ.cross(normal).length() < 0.01)
            {
                qy = (A.x - B.x) * u.y + (B.y - A.y) * u.x ;
                sy = u.y * v.x - v.y * u.x;
            }

            // if lines are identical or do not cross
            if (Math.abs(sy) > 0.01)
            {
                let param = qy/ sy;

                let point = new THREE.Vector3();
                ray2.at(param, point);
                intersectionPoints.push(point);
            }
        }
    }

    return intersectionPoints;
}

function calculateArea(borderPoints)
{
    let areaValue = 0;
    
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

/* WIP
function totalAreaCovered()
{
    let totalAreaCovered = 0;
    cameras.forEach(c => {
        totalAreaCovered += c.areaValue;
        for(let i = 0; i < c.id; i++)
        {
            totalAreaCovered -= c.overlaps[i];
        }
    });
    return totalAreaCovered;
}*/