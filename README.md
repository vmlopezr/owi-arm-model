# OWI Arm Web Model
This project was built with react-app and three.js to build a model of a OWI-535 Robot Arm.
The app allows the user to move the arm with the provided sliders, set positions 
and move the arm with the position set. 

Demo: https://vmlopezr.github.io/owi-arm-model  

This is demo is an addition to  a [robotics project](https://github.com/vmlopezr/ECE5330_6311_Final_Project)
using the OWI-535 arm with an STM32 microcontroller and OpenCV.

**Available Controls:**  
- Left Clicking Drag: Rotate the camera about the 3D Model.
- Right Clicking Drag: Pan the camera.
- Middle Scroll: Zoom the camera view.
- Arrow Keys: Pan the camera in the same directions as right click dragging.   

![Model Demo](./assets/owi-arm.gif)

## Installing / Getting Started
To modify and use development mode clone the repository and run either of the following:
```bash
$ yarn install
$ npm install
```

## Development
Run the app in development mode with local server with either:
```bash
$ yarn start
$ npm run start
```

The development server can be accessed in the browser at [http://localhost:3000](http://localhost:3000).

## Build

To build the production files use either of the following:
```bash
$ yarn build
$ npm run build
```
The static files will be stored in the build folder at the root of this repository.


## Docker

The application can also be run with docker using the dockerfile provided.
To build the image use:
```bash
docker build -t $(YOUR_IMAGE_NAME) .      
```
To run the docker image in the background use:
```bash
docker run --rm -d -p 3000:3000 $(YOUR_IMAGE_NAME)
```

Once running, the application can be reached at:
```http://$(LOCAL_IP_ADDRESS):3000```