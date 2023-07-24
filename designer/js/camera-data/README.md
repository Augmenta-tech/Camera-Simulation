# camera-data

Data source for all cameras used throughout the Augmenta softwares.

camera-data.json contains informations about the sensors that can be used with the Augmenta tracking system. This file should be the central data source to get data about the sensors.

## Non-standard data

Here should be explained value that differ from the official specs:

### Kinect Azure

The Kinect Azure camera has 2 operation modes: narrow and wide FoVs. Those FoVs are hexagonal shaped for the narrow FoV and circular for the wide FoV. To have a square/rectangular FoV we have done the computation below (which was necessary to simplify computations for the designer/builder).

```
        name:"Azure Kinect (NFOV)", 
        // inscribed square. 75°x65° are official FOV for the hexagon
        HFov: Math.round(2 * (Math.atan((1/3) * ( - Math.tan(75/2 * Math.PI/180) + Math.sqrt(3*Math.tan(65/2 * Math.PI/180)*Math.tan(65/2 * Math.PI/180) + 4*Math.tan(75/2 * Math.PI/180)*Math.tan(75/2 * Math.PI/180))))) * 180/Math.PI * 10) / 10, 
        VFov:65,

        name:"Azure Kinect (WFOV)", 
        // inscribed square. 120° are the FOV for the circle. 
        // tan(squareFOV / 2) = sqrt(2)/2 * tan(circleFOV/2)
        // => squareFOV = 2 * arctan(sqrt(2) / 2 * tan(circleFOV/2))
        // +Conversion from degrees to radians and radians to degrees
        HFov: Math.round(2 * Math.atan((Math.sqrt(2) / 2) * Math.tan(120 * Math.PI/180 / 2)) * 180/Math.PI * 10) / 10, 
        VFov: Math.round(2 * Math.atan((Math.sqrt(2) / 2) * Math.tan(120 * Math.PI/180 / 2)) * 180/Math.PI * 10) / 10, 
```
