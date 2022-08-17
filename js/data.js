const camerasTypes = 
[
    {
        name:"Orbbec Astra +", 
        HFov:56.5, 
        VFov:45, 
        rangeNear: 0.6,
        rangeFar: 6,
        handFar: 2.2,
        suitable: [
            "human-tracking",
            "hand-tracking" 
        ],
        checkedDefault : true,
        recommended: true
    },
    {
        name:"Orbbec Astra Pro", 
        HFov:60, 
        VFov:49.5, 
        rangeNear: 0.6,
        rangeFar: 6,
        handFar: 2.2,
        suitable: [
            "human-tracking",
            "hand-tracking" 
        ],
        checkedDefault : false,
        recommended: true
    },
    {
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
        recommended: true
    },
    {
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
        recommended: true
    },
    {
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
        recommended: true
    },
    {
        name:"Orbbec Femto W", 
        HFov:90, 
        VFov:74, 
        rangeNear: 0.25,
        rangeFar: 2.5,
        handFar: 2.5,
        suitable: [
            "human-tracking",
            "hand-tracking" 
        ],
        checkedDefault : false,
        recommended: false
    },
    {
        name:"Helios2", 
        HFov:69, 
        VFov:51, 
        rangeNear: 0.3,
        rangeFar: 8.3,
        handFar: 3,
        suitable: [
            "human-tracking",
            "hand-tracking" 
        ],
        checkedDefault : false,
        recommended: false
    },
    {
        name:"Kinect 1", 
        HFov:57, 
        VFov:43, 
        rangeNear: 1.2,
        rangeFar: 3.5,
        handFar: 3.5,
        suitable: [
            "human-tracking",
            "hand-tracking" 
        ],
        checkedDefault : false,
        recommended: false
    },
    {
        name:"Kinect 2", 
        HFov:70, 
        VFov:60, 
        rangeNear: 0.5,
        rangeFar: 4.5,
        handFar: 2.5,
        suitable: [
            "human-tracking",
            "hand-tracking" 
        ],
        checkedDefault : false,
        recommended: false
    }
];

let i = 0;
camerasTypes.forEach(type => type.id = i++);
camerasTypes.forEach(type => type.aspectRatio = Math.abs(Math.tan((type.HFov/2.0) * Math.PI / 180.0)/Math.tan((type.VFov/2.0) * Math.PI / 180.0)));

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


export { units }
export { camerasTypes }