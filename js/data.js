// TODO: switch all .id to .textId (to retrieve sensor type for example)

const camerasTypes = 
[
    {
        name:"Orbbec Astra +",
        niceName: "3D Camera",
        textId: "orbbec-astra-plus",
        HFov:56.5, 
        VFov:45, 
        rangeNear: 0.6,
        rangeFar: 6,
        handFar: 2.2,
        suitable: [
            "human-tracking",
            "hand-tracking" 
        ],
        canBeUsed: [
            'indoor'
        ],
        accessories: [
            "Augmenta Node",
            "Hook"
        ],
        checkedDefault : true,
        recommended: true
    },
    {
        name:"Orbbec Astra Pro",
        niceName: "3D Camera",
        textId: "orbbec-astra-pro",
        HFov:60, 
        VFov:49.5, 
        rangeNear: 0.6,
        rangeFar: 6,
        handFar: 2.2,
        suitable: [
            "human-tracking",
            "hand-tracking" 
        ],
        canBeUsed: [
            'indoor'
        ],
        accessories: [
            "Augmenta Node",
            "Hook"
        ],
        checkedDefault : false,
        recommended: false
    },
    {
        name:"Azure Kinect (NFOV)", 
        niceName: "3D Camera",
        textId: "azure-kinect-nfov",
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
        canBeUsed: [
            'indoor'
        ],
        accessories: [
            "Augmenta Node",
            "Hook"
        ],
        checkedDefault : false,
        recommended: false
    },
    {
        name:"Azure Kinect (WFOV)", 
        niceName: "3D Camera",
        textId: "azure-kinect-wfov",
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
        canBeUsed: [
            'indoor'
        ],
        accessories: [
            "Augmenta Node",
            "Hook"
        ],
        checkedDefault : false,
        recommended: false
    },
    {
        name:"Orbbec Femto",
        niceName: "3D Camera",
        textId: "orbbec-femto",
        HFov:64.6, 
        VFov:50.8, 
        rangeNear: 0.25,
        rangeFar: 5,
        handFar: 1.75,
        suitable: [
            "human-tracking",
            "hand-tracking" 
        ],
        canBeUsed: [
            'indoor'
        ],
        accessories: [
            "Augmenta Node",
            "Hook"
        ],
        checkedDefault : false,
        recommended: false
    },
    {
        name:"Orbbec Femto Wide",
        niceName: "3D Camera",
        textId: "orbbec-femto-wide",
        HFov:90, 
        VFov:74, 
        rangeNear: 0.25,
        rangeFar: 2.5,
        handFar: 2.5,
        suitable: [
            "human-tracking",
            "hand-tracking" 
        ],
        canBeUsed: [
            'indoor'
        ],
        accessories: [
            "Augmenta Node",
            "Hook"
        ],
        checkedDefault : false,
        recommended: false
    },
    {
        name:"Helios2",
        niceName: "3D Camera",
        textId: "helios-two",
        HFov:69, 
        VFov:51, 
        rangeNear: 0.3,
        rangeFar: 8.3,
        handFar: 3,
        suitable: [
            "human-tracking",
            "hand-tracking" 
        ],
        canBeUsed: [
            'indoor',
            'outdoor'
        ],
        accessories: [
            "Augmenta Node",
            "Hook"
        ],
        checkedDefault : false,
        recommended: true
    },
    {
        name:"Helios2 - Wide",
        niceName: "3D Camera",
        textId: "helios-two-wide",
        HFov:108, 
        VFov:78, 
        rangeNear: 0.3,
        rangeFar: 4,
        handFar: 2,
        suitable: [
            "human-tracking",
            "hand-tracking" 
        ],
        canBeUsed: [
            'indoor'
        ],
        accessories: [
            "Augmenta Node",
            "Hook"
        ],
        checkedDefault : false,
        recommended: false
    },
    {
        name:"Kinect 1",
        niceName: "3D Camera",
        textId: "kinect-one",
        HFov:57, 
        VFov:43, 
        rangeNear: 1.2,
        rangeFar: 3.5,
        handFar: 3.5,
        suitable: [
            "human-tracking",
            "hand-tracking" 
        ],
        canBeUsed: [
            'indoor'
        ],
        accessories: [
            "Augmenta Node",
            "Hook"
        ],
        checkedDefault : false,
        recommended: false
    },
    {
        name:"Kinect 2",
        niceName: "3D Camera",
        textId: "kinect-two",
        HFov:70, 
        VFov:60, 
        rangeNear: 0.5,
        rangeFar: 4.5,
        handFar: 2.5,
        suitable: [
            "human-tracking",
            "hand-tracking" 
        ],
        canBeUsed: [
            'indoor'
        ],
        accessories: [
            "Augmenta Node",
            "Hook"
        ],
        checkedDefault : false,
        recommended: false
    }
];

let i = 0;
camerasTypes.forEach(type => type.id = i++); //lowest id is priorised 
camerasTypes.forEach(type => type.aspectRatio = Math.abs(Math.tan((type.HFov/2.0) * Math.PI / 180.0)/Math.tan((type.VFov/2.0) * Math.PI / 180.0)));

const lidarsTypes = [
    {
        name:"10LX - H01",
        niceName: "2D Lidar",
        textId: "10lx-h01", 
        angularResolution: 0.125, 
        fov: 270,
        steps: 2161, 
        rangeNear: 0.06,
        rangeFar: 10,
        canBeUsed: [
            'indoor'
        ],
        accessories: [],
        checkedDefault : true,
        recommended: true
    },
    {
        name:"10LX - H02",
        niceName: "2D Lidar",
        textId: "10lx-h02",
        angularResolution: 0.125, 
        fov: 270,
        steps: 2161, 
        rangeNear: 0.06,
        rangeFar: 10,
        canBeUsed: [
            'indoor'
        ],
        accessories: [],
        checkedDefault : false,
        recommended: true
    },
    {
        name:"20LX",
        niceName: "2D Lidar",
        textId: "20lx",
        angularResolution: 0.25, 
        fov: 270,
        steps: 1081, 
        rangeNear: 0.06,
        rangeFar: 20,
        canBeUsed: [
            'indoor'
        ],
        accessories: [],
        checkedDefault : true,
        recommended: true
    }
];

let j = 0;
lidarsTypes.forEach(type => type.id = j++);

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
export { lidarsTypes }
