// set global variable
window.camerasTypes = null;

function readJSONFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}


export function getCamerasTypes()
{
    // try to only fetch the data a single time
    if(window.camerasTypes === null)
    {
        let result;
        readJSONFile("/wp-content/themes/salient-child/builder-v2/designer/js/camera-data/camera-data.json", function(text){
            const sensorsData = JSON.parse(text);
            result = sensorsData.sensors.cameras;
        });

        let i = 0;
        result.forEach(type => type.id = i++);
        result.forEach(type => type.aspectRatio = Math.abs(Math.tan((type.HFov/2.0) * Math.PI / 180.0)/Math.tan((type.VFov/2.0) * Math.PI / 180.0)));

        window.camerasTypes = result;
    }
    return window.camerasTypes;
}

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

export { units };
