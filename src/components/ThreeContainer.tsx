import React, { Component } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import '../App.scss';
import { RobotValue, ThreeModelObjects } from './constants';
import ModelControls from './ModelControls';
import {
  constructGripper,
  constructJoint1,
  constructJoint2,
  constructJoint3,
  constructJoint4,
  createBox,
  createDisplay,
  createLabels,
} from './ModelGeneratorFunctions';
interface Props {
  active?: boolean;
}
interface State {
  robotValues: number[];
  positionSeq: RobotValue[];
  showAxis: boolean;
  showLabels: boolean;
  animation: boolean;
}
const transparentMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0,
});
const frames = 100;
export const yMat = new THREE.MeshStandardMaterial({ color: 0xffdf20 });
export const blackMat = new THREE.MeshStandardMaterial({ color: 0x000000 });

export default class ThreeContainer extends Component<Props, State> {
  threeRootElement = React.createRef<HTMLDivElement>();
  canvasRef = React.createRef<HTMLCanvasElement>();
  canvasCtx: CanvasRenderingContext2D | null;
  plane: THREE.Mesh | null;
  frameId = 0;
  light = new THREE.PointLight(0xffffff);
  prevState: State = {
    robotValues: [0, 0, 0, 0, 0],
    showAxis: true,
    showLabels: true,
    animation: false,
    positionSeq: [],
  };
  rotateFuncs: any[];
  handles: ThreeModelObjects = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(75, 1, 0.1, 1000),
    renderer: new THREE.WebGLRenderer({
      antialias: true,
    }),
    joint: [],
    jointAxisStart: [],
    jointAxisEnd: [],
    origins: [],
    gripper: [],
    gripperPositions: [],
    endEffector: new THREE.Mesh(createBox(0.5, 0.5, 0.5), transparentMat),
    robotBase: new THREE.Mesh(createBox(8, 5, 16), transparentMat),
    labels: [],
    axis: new THREE.AxesHelper(30),
    boundingBox1: null,
    boundingBox2: null,
    lines: [],
  };
  controls = new OrbitControls(
    this.handles.camera,
    this.handles.renderer.domElement,
  );
  worldPos = new THREE.Vector3();
  crtIndex = 0;
  nextIndex = 0;
  angleDelta = [0, 0, 0, 0, 0];
  newPosition = [0, 0, 0, 0, 0];
  frameCount = 0;

  constructor(props: any) {
    super(props);
    this.state = this.prevState;
    this.plane = null;
    //Set the lightsource
    this.light.position.set(-5, 5, 5);
    this.handles.scene.add(this.light);
    this.handles.renderer.setPixelRatio(window.devicePixelRatio);
    this.canvasCtx = null;
    this.controls.update();
    // Use the join axis arrays to calculate the rotation axis for joints
    this.rotateFuncs = [
      this.rotateJoint1,
      this.rotateJoint2,
      this.rotateJoint3,
      this.rotateJoint4,
      this.updateGripper,
    ];
    // Create the groups and objects used to calculate rotation axes
    for (let i = 0; i < 4; i++) {
      this.handles.joint.push(new THREE.Group());
      this.handles.gripperPositions.push(new THREE.Object3D());
      if (i < 3) {
        this.handles.jointAxisStart.push(new THREE.Object3D());
        this.handles.jointAxisEnd.push(new THREE.Object3D());
        this.handles.origins.push(new THREE.Object3D());
      }
    }
  }

  componentDidMount() {
    if (this.threeRootElement.current) {
      // Add the canvas to the parent div element
      this.threeRootElement.current.appendChild(
        this.handles.renderer.domElement,
      );
      // Set camera and canvas sizing
      const { clientHeight, clientWidth } = this.threeRootElement.current;
      this.handles.renderer.setClearColor(0xd6d6d6, 1);
      this.handles.renderer.setSize(clientWidth, clientHeight);
      this.handles.camera.aspect = clientWidth / clientHeight;
      this.handles.camera.updateProjectionMatrix();
    }
    this.canvasCtx = this.canvasRef.current?.getContext(
      '2d',
    ) as CanvasRenderingContext2D;

    // Add the groups to the scene
    this.handles.joint[2].add(this.handles.joint[3]);
    this.handles.joint[1].add(this.handles.joint[2]);
    this.handles.joint[0].add(this.handles.joint[1]);
    this.handles.scene.add(this.handles.joint[0]);

    // Constructor the owi arm model
    constructJoint1(this.handles);
    constructJoint2(this.handles);
    constructJoint3(this.handles);
    constructJoint4(this.handles);
    constructGripper(this.handles);
    createLabels(this.handles);
    createDisplay(this.handles);
    this.createBoundingBoxes();
    window.addEventListener('resize', this.onSizeChange, false);
    this.start();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onSizeChange);
  }
  /* Create the bounding boxes which will be used to detect intersections*/
  createBoundingBoxes = () => {
    this.handles.endEffector.geometry.computeBoundingBox();
    this.handles.robotBase.geometry.computeBoundingBox();
    this.handles.boundingBox1 = new THREE.Box3();
    this.handles.boundingBox2 = new THREE.Box3();
    this.handles.boundingBox1?.setFromObject(this.handles.robotBase);
    this.handles.boundingBox2?.setFromObject(this.handles.endEffector);
  };
  /* Detect if the end-effector position is intersecting the robotBase bounding box*/
  endEffectorIntersect = (): boolean => {
    return this.handles.boundingBox1?.containsPoint(
      this.endEffectorCoordinates(),
    ) as boolean;
  };
  /* The canvas does not need to re-render. The ThreeContainer component only 
  needs to receive the updated state data for the THREE animation loop to update
  positioning. */
  shouldComponentUpdate(nextProps: Props, nextState: State) {
    this.rotateFuncs.forEach((rotate, index) => {
      if (nextState.robotValues[index] !== this.prevState.robotValues[index]) {
        rotate(nextState.robotValues[index], this.prevState.robotValues[index]);
        this.prevState.robotValues[index] = nextState.robotValues[index];
      }
    });
    if (nextState.showAxis !== this.prevState.showAxis) {
      this.updateAxesVisibility(nextState.showAxis);
      this.prevState.showAxis = nextState.showAxis;
    }
    if (nextState.showLabels !== this.prevState.showLabels) {
      this.displayLabelVisibility(nextState.showLabels);
      this.prevState.showLabels = nextState.showLabels;
    }
    return false;
  }
  /* Callback passed to children sliders to update the owi arm angle/position */
  updateArmConfig = (index: number, value: number): void => {
    const config = this.state.robotValues.slice();
    config[index] = value;
    this.setState({ robotValues: config });
  };
  displayAxis = (value: boolean): void => {
    this.setState({ showAxis: value });
  };
  displayLabel = (value: boolean): void => {
    this.setState({ showLabels: value });
  };
  /* Start showing the movement between positions loaded to state.positionSeq */
  startAnimation = (robotValues: RobotValue[]) => {
    if (robotValues.length !== 0) {
      this.newPosition = [...robotValues[0].values];
      this.angleDelta = [0, 0, 0, 0, 0];
      this.crtIndex = 0;
      this.nextIndex = 1;
      this.frameCount = 0;
      this.setState({
        animation: true,
        positionSeq: [...robotValues],
        robotValues: [...robotValues[0].values],
      });
    }
  };
  /* Stop the position animation loop */
  stopAnimation = () => {
    this.setState({ animation: false });
    this.resetPosition();
  };
  /* Update the canvas size on window size changes */
  onSizeChange = () => {
    if (this.threeRootElement.current) {
      const { clientWidth, clientHeight } = this.threeRootElement.current;
      this.handles.renderer.setSize(clientWidth, clientHeight, true);
      this.handles.camera.aspect = clientWidth / clientHeight;
      this.handles.camera.updateProjectionMatrix();
    }
  };
  /* Callback passed to children to give access to robotValues in state. */
  sendRobotValues = () => {
    return this.state.robotValues;
  };
  /* Fucntions used to rotate the owi arm at each joint */
  rotateJoint1 = (newAngle: number, prevAngle: number) => {
    const angle = this.rad(newAngle - prevAngle);
    this.handles.joint[0].rotateY(angle);
  };
  rotateJoint2 = (newAngle: number, prevAngle: number) => {
    const angle = this.rad(newAngle - prevAngle);
    const axis = this.handles.jointAxisStart[0].position
      .clone()
      .sub(this.handles.jointAxisEnd[0].position);
    const point = this.handles.origins[0].position;
    this.rotate(this.handles.joint[1], point, axis, angle);
  };

  rotateJoint3 = (newAngle: number, prevAngle: number) => {
    const angle = this.rad(newAngle - prevAngle);
    const axis = this.handles.jointAxisStart[1].position
      .clone()
      .sub(this.handles.jointAxisEnd[1].position);
    const point = this.handles.origins[1].position;
    this.rotate(this.handles.joint[2], point, axis, angle);
  };
  rotateJoint4 = (newAngle: number, prevAngle: number) => {
    const angle = this.rad(newAngle - prevAngle);
    const axis = this.handles.jointAxisStart[2].position
      .clone()
      .sub(this.handles.jointAxisEnd[2].position);
    const point = this.handles.origins[2].position;
    this.rotate(this.handles.joint[3], point, axis, angle);
  };
  updateGripper = (newValue: number, prevValue?: number) => {
    // Calculate the change distance between start and end positions for each gripper
    const leftDelta = this.handles.gripperPositions[1].position
      .clone()
      .sub(this.handles.gripperPositions[0].position);
    const rightDelta = this.handles.gripperPositions[3].position
      .clone()
      .sub(this.handles.gripperPositions[2].position);

    // Update the position of the grippers
    this.handles.gripper[0].position.copy(
      leftDelta
        .multiplyScalar((newValue - 50) / 100)
        .add(this.handles.gripperPositions[1].position),
    );
    this.handles.gripper[1].position.copy(
      rightDelta
        .multiplyScalar((newValue - 50) / 100)
        .add(this.handles.gripperPositions[3].position),
    );
  };

  rad = (angle: number): number => (angle * Math.PI) / 180;
  /* Rotate an object about an axis with respect to a point in space. Uses relative coordinates.*/
  rotate = (
    obj: THREE.Object3D,
    point: THREE.Vector3,
    axis: THREE.Vector3,
    theta: number,
  ) => {
    const normalAxis = axis.normalize();
    obj.position.sub(point); // remove the offset
    obj.position.applyAxisAngle(normalAxis, theta); // rotate the POSITION
    obj.position.add(point); // re-add the offset
    obj.rotateOnAxis(normalAxis, theta); // rotate the OBJECT
  };
  /* Update the visibility of the coordinate axes. */
  updateAxesVisibility = (value: boolean) => {
    this.handles.axis.visible = value;
    for (let i = 5; i < 8; i++) {
      this.handles.labels[i].visible = value;
    }
  };
  /* Update the visibility of the labels and lines. */

  displayLabelVisibility = (value: boolean) => {
    for (let i = 0; i < 5; i++) {
      this.handles.labels[i].visible = value;
    }
    this.handles.lines.forEach((line) => (line.visible = value));
  };
  resetPosition = () => {
    this.setState({ robotValues: [0, 0, 0, 0, 0] });
  };
  /* Start the THREE rendering loop*/
  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.renderTHREE);
    }
  };
  /* Retrieve the y world position of the end-effector */
  getEndEffectorYcor = () => {
    this.handles.endEffector.getWorldPosition(this.worldPos);
    return this.worldPos.y;
  };
  /* Retrieve end-effector coordinates as THREE.Vector3*/
  endEffectorCoordinates = () => {
    this.handles.endEffector.getWorldPosition(this.worldPos);
    return this.worldPos.clone();
  };
  /* Display the end-effector coordinates on the coordinate-canvas */
  drawEffectCoordinates = () => {
    this.handles.endEffector.getWorldPosition(this.worldPos);
    const { x, y, z } = this.worldPos;
    const { width, height } = this.canvasCtx?.canvas as HTMLCanvasElement;
    this.canvasCtx?.clearRect(0, 0, width, height);
    this.drawTextOnCanvas(`End Effector: `, 80, 30);
    this.drawTextOnCanvas(
      `( ${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)} )`,
      80,
      60,
    );
  };
  /* Draw the text at the specified position*/
  drawTextOnCanvas = (text: string, x: number, y: number) => {
    if (this.canvasCtx) {
      this.canvasCtx.font = 'Bold 25px Roboto';
      this.canvasCtx.fillStyle = 'rgba(0,0,0,1)';
      this.canvasCtx.fillText(text, x, y);
    }
  };
  /* Update the lighting in accordance to camera position */
  updateView = () => {
    this.controls.update();
    this.light.position.copy(this.handles.camera.position);
    this.handles.renderer.render(this.handles.scene, this.handles.camera);
  };

  /* THREE render loop */
  renderTHREE = () => {
    this.updateView();
    this.drawEffectCoordinates();
    if (this.state.animation) {
      this.drawPositions();
    }

    this.frameId = requestAnimationFrame(this.renderTHREE);
  };

  /* Animate the arm moving betweet the positions retrieved in state.positionSeq*/
  drawPositions = () => {
    const { length } = this.state.positionSeq;
    const positions = this.state.positionSeq;
    if (length === 0) return;
    else if (length === 1) {
      // Set the arm to the position
      this.setState({
        robotValues: positions[0].values.slice(),
      });
    } else {
      // Update the current arm position index
      if (this.frameCount === frames) {
        this.crtIndex++;
        this.frameCount = 0;
        if (this.crtIndex >= length) this.crtIndex = 0;
        this.nextIndex = this.crtIndex + 1;
        if (this.crtIndex === length - 1) this.nextIndex = 0;
        this.newPosition = [...positions[this.crtIndex].values];
      }
      // Set the angle change per position
      if (this.frameCount !== frames) {
        if (this.frameCount === 0) {
          // Calculate the angle delta to add to current position
          this.angleDelta = this.angleDelta.map((value, index) => {
            return (value =
              (positions[this.nextIndex].values[index] -
                positions[this.crtIndex].values[index]) /
              frames);
          });
        }
        this.frameCount++;

        // Update current position values
        this.newPosition = this.newPosition.map((value, index) => {
          return value + this.angleDelta[index];
        });
        // set new position
        this.setState({ robotValues: [...this.newPosition] });
      }
    }
  };

  render() {
    return (
      <div ref={this.threeRootElement} className="threeCanvas">
        <ModelControls
          resetPosition={this.resetPosition}
          updateConfig={this.updateArmConfig}
          displayAxis={this.displayAxis}
          displayLabel={this.displayLabel}
          receiveRobotValues={this.sendRobotValues}
          startAnimation={this.startAnimation}
          stopAnimation={this.stopAnimation}
          getEndEffectorYcor={this.getEndEffectorYcor}
          effectorIntersect={this.endEffectorIntersect}
        />
        <canvas className="coordinate-canvas" ref={this.canvasRef} />
      </div>
    );
  }
}
