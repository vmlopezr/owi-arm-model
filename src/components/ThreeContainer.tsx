import React, { Component } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import '../App.scss';
import { RobotValue } from './AnimatePanel';
import { ThreeModelObjects } from './constants';
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
      this.threeRootElement.current.appendChild(
        this.handles.renderer.domElement,
      );
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
  drawCoordinates = (text: string, x: number, y: number) => {
    if (this.canvasCtx) {
      this.canvasCtx.font = 'Bold 25px Roboto';
      this.canvasCtx.fillStyle = 'rgba(0,0,0,1)';
      this.canvasCtx.fillText(text, x, y);
    }
  };
  createBoundingBoxes = () => {
    this.handles.endEffector.geometry.computeBoundingBox();
    this.handles.robotBase.geometry.computeBoundingBox();
    this.handles.boundingBox1 = new THREE.Box3();
    this.handles.boundingBox2 = new THREE.Box3();
    this.handles.boundingBox1?.setFromObject(this.handles.robotBase);
    this.handles.boundingBox2?.setFromObject(this.handles.endEffector);
  };
  endEffectorIntersect = (): boolean => {
    return this.handles.boundingBox1?.containsPoint(
      this.endEffectorCoordinates(),
    ) as boolean;
  };
  // Canvas does not need to re-render. Only need to receive data on
  // Componentdidreceiveprops to update model with its renderTHREE() loop.
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
  startAnimation = (robotValues: RobotValue[]) => {
    if (robotValues.length !== 0) {
      this.newPosition = [...robotValues[0].values];
      this.angleDelta = [0, 0, 0, 0, 0];
      this.crtIndex = 0;
      this.nextIndex = 1;
      this.setState({
        animation: true,
        positionSeq: [...robotValues],
        robotValues: [...robotValues[0].values],
      });
    }
  };
  stopAnimation = () => {
    this.setState({ animation: false });
    this.resetPosition();
  };
  onSizeChange = () => {
    if (this.threeRootElement.current) {
      const { clientWidth, clientHeight } = this.threeRootElement.current;
      this.handles.renderer.setSize(clientWidth, clientHeight, true);
      this.handles.camera.aspect = clientWidth / clientHeight;
      this.handles.camera.updateProjectionMatrix();
    }
  };
  sendRobotValues = () => {
    return this.state.robotValues;
  };
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
    const leftDelta = this.handles.gripperPositions[1].position
      .clone()
      .sub(this.handles.gripperPositions[0].position);
    const rightDelta = this.handles.gripperPositions[3].position
      .clone()
      .sub(this.handles.gripperPositions[2].position);
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
  updateAxesVisibility = (value: boolean) => {
    this.handles.axis.visible = value;
    for (let i = 5; i < 8; i++) {
      this.handles.labels[i].visible = value;
    }
  };
  displayLabelVisibility = (value: boolean) => {
    for (let i = 0; i < 5; i++) {
      this.handles.labels[i].visible = value;
    }
    this.handles.lines.forEach((line) => (line.visible = value));
  };
  resetPosition = () => {
    this.setState({ robotValues: [0, 0, 0, 0, 0] });
  };
  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.renderTHREE);
    }
  };
  stop = () => {
    cancelAnimationFrame(this.frameId);
  };
  getEndEffectorYcor = () => {
    this.handles.endEffector.getWorldPosition(this.worldPos);
    return this.worldPos.y;
  };
  endEffectorCoordinates = () => {
    this.handles.endEffector.getWorldPosition(this.worldPos);
    return this.worldPos.clone();
  };
  drawEffectCoordinates = () => {
    this.handles.endEffector.getWorldPosition(this.worldPos);
    const { x, y, z } = this.worldPos;
    this.renderCoordinates(x.toFixed(1), y.toFixed(1), z.toFixed(1));
  };
  updateView = () => {
    this.controls.update();
    this.light.position.copy(this.handles.camera.position);
    this.handles.renderer.render(this.handles.scene, this.handles.camera);
  };
  renderTHREE = () => {
    this.updateView();
    this.drawEffectCoordinates();
    if (this.state.animation) {
      this.drawPositions();
    }

    this.frameId = requestAnimationFrame(this.renderTHREE);
  };
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
        // set new position
        if (this.frameCount === 0) {
          this.angleDelta = this.angleDelta.map((value, index) => {
            return (value =
              (positions[this.nextIndex].values[index] -
                positions[this.crtIndex].values[index]) /
              frames);
          });
        }
        this.frameCount++;
        this.newPosition = this.newPosition.map((value, index) => {
          return value + this.angleDelta[index];
        });

        this.setState({ robotValues: [...this.newPosition] });
      }
    }
  };

  renderCoordinates = (x: string, y: string, z: string) => {
    const { width, height } = this.canvasCtx?.canvas as HTMLCanvasElement;
    this.canvasCtx?.clearRect(0, 0, width, height);
    this.drawCoordinates(`End Effector: `, 80, 30);
    this.drawCoordinates(`( ${x}, ${y}, ${z} )`, 80, 60);
  };

  render() {
    console.log('rendering three js');
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
