const camerasTypes = 
[
    {
        id:0, 
        name:"Orbbec Astra +", 
        HFov:56.5, 
        VFov:45, 
        rangeNear: 0.6,
        rangeFar: 6,
        handFar: 2,
        suitable: [
            "human-tracking",
            "hand-tracking" 
        ],
        checkedDefault : true,
        recommanded: true
    },
    {
        id:1, 
        name:"Orbbec Astra Pro", 
        HFov:60, 
        VFov:49.5, 
        rangeNear: 0.6,
        rangeFar: 6,
        handFar: 2,
        suitable: [
            "human-tracking",
            "hand-tracking" 
        ],
        checkedDefault : false,
        recommanded: true
    },
    {
        id:2, 
        name:"Azure Kinect (NFOV)", 
        // inscribed square. 75°x65° are official FOV for the hexagon
        HFov: Math.round(2 * (Math.atan((1/3) * ( - Math.tan(75/2 * Math.PI/180) + Math.sqrt(3*Math.tan(65/2 * Math.PI/180)*Math.tan(65/2 * Math.PI/180) + 4*Math.tan(75/2 * Math.PI/180)*Math.tan(75/2 * Math.PI/180))))) * 180/Math.PI * 10) / 10, 
        VFov:65, 
        rangeNear: 0.5,
        rangeFar: 5.46,
        handFar: 1.5,
        suitable: [
            "human-tracking",
            "hand-tracking" 
        ],
        checkedDefault : false,
        recommanded: true
    },
    {
        id:3, 
        name:"Azure Kinect (WFOV)", 
        // inscribed square. 120° are the FOV for the circle. 
        // tan(squareFOV / 2) = sqrt(2)/2 * tan(circleFOV/2)
        // => squareFOV = 2 * arctan(sqrt(2) / 2 * tan(circleFOV/2))
        // +Conversion from degrees to radians and radians to degrees
        HFov: Math.round(2 * Math.atan((Math.sqrt(2) / 2) * Math.tan(120 * Math.PI/180 / 2)) * 180/Math.PI * 10) / 10, 
        VFov: Math.round(2 * Math.atan((Math.sqrt(2) / 2) * Math.tan(120 * Math.PI/180 / 2)) * 180/Math.PI * 10) / 10, 
        rangeNear: 0.25,
        rangeFar: 2.21,
        handFar: 2.21,
        suitable: [
            "hand-tracking" 
        ],
        checkedDefault : false,
        recommanded: true
    },
    {
        id:4, 
        name:"Orbbec Femto", 
        HFov:64.6, 
        VFov:50.8, 
        rangeNear: 0.25,
        rangeFar: 5,
        handFar: 1.75,
        suitable: [
            "human-tracking",
            "hand-tracking" 
        ],
        checkedDefault : false,
        recommanded: false
    }
];

camerasTypes.forEach(type => type.aspectRatio = Math.abs(Math.tan((type.HFov/2.0) * Math.PI / 180.0)/Math.tan((type.VFov/2.0) * Math.PI / 180.0)));

const units = {
    meters: 1,
    feets: 3.28084
};

/*
const units = {
    meters: {
        value: 1,
        label: 'm',
        squaredLabel: 'm²'
    },
    feets: {
        value: 3.28084,
        label: 'ft',
        squaredLabel: 'sqft'
    }
};
*/

export {units}
export { camerasTypes }