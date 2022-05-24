const camerasTypes = 
[
    {
        id:0, 
        name:"Orbbec Astra +", 
        HFov:56.5, 
        VFov:45, 
        rangeNear: 0.6,
        rangeFar: 6,
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
        suitable: [
            "human-tracking",
            "hand-tracking" 
        ],
        checkedDefault : false,
        recommanded: true
    },
    {
        id:2, 
        name:"Azure Kinect", 
        HFov:75, 
        VFov:65, 
        rangeNear: 0.5,
        rangeFar: 5.46,
        suitable: [
            "hand-tracking" 
        ],
        checkedDefault : false,
        recommanded: false
    },
    {
        id:3, 
        name:"Orbbec Femto", 
        HFov:64.6, 
        VFov:50.8, 
        rangeNear: 0.25,
        rangeFar: 5,
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

export {units}
export { camerasTypes }