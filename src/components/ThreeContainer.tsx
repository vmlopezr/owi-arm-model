import React, { Component } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import '../App.scss';
import { ThreeModelObjects } from './constants';
import ModelControls from './ModelControls';
import {
  constructGripper,
  constructJoint1,
  constructJoint2,
  constructJoint3,
  constructJoint4,
  createDisplay,
  createLabels,
} from './ModelGeneratorFunctions';
interface Props {
  active?: boolean;
}
interface State {
  robotValues: number[];
  showAxis: boolean;
  showLabels: boolean;
}
export const yMat = new THREE.MeshStandardMaterial({ color: 0xffdf20 });
export const blackMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
export default class ThreeContainer extends Component<Props, State> {
  threeRootElement = React.createRef<HTMLDivElement>();
  frameId = 0;
  light = new THREE.PointLight(0xffffff);
  prevState: State = {
    robotValues: [0, 0, 0, 0, 0],
    showAxis: true,
    showLabels: true,
  };
  rotateFuncs: any[];
  handles: ThreeModelObjects = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(75, 1, 0.1, 1000),
    renderer: new THREE.WebGLRenderer({ antialias: true }),
    joint: [],
    jointAxisStart: [],
    jointAxisEnd: [],
    origins: [],
    gripper: [],
    gripperPositions: [],
    endEffector: new THREE.Object3D(),
    labels: [],
    axis: new THREE.AxesHelper(30),
  };
  controls = new OrbitControls(
    this.handles.camera,
    this.handles.renderer.domElement,
  );
  constructor(props: any) {
    super(props);
    this.state = this.prevState;
    //Set the lightsource
    this.light.position.set(-5, 5, 5);
    this.handles.scene.add(this.light);
    this.handles.renderer.setPixelRatio(window.devicePixelRatio);
    this.controls.update();
    // Use the join axis arrays to calculate the rotation axis for joints
    this.rotateFuncs = [
      this.rotateJoint1,
      this.rotateJoint2,
      this.rotateJoints3,
      this.rotateJoints4,
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
  // Canvas does not need to re-render. Only need to receive data on
  // Componentdidreceiveprops to update model with its animate() loop.
  shouldComponentUpdate(nextProps: Props, nextState: State) {
    console.trace();
    this.rotateFuncs.forEach((rotate, index) => {
      if (nextState.robotValues[index] !== this.prevState.robotValues[index]) {
        rotate(nextState.robotValues[index], this.prevState.robotValues[index]);
        this.prevState.robotValues[index] = nextState.robotValues[index];
      }
    });
    if (nextState.showAxis !== this.prevState.showAxis) {
      console.log('updated axis');
      this.updateAxesVisibility(nextState.showAxis);
      this.prevState.showAxis = nextState.showAxis;
    }
    if (nextState.showLabels !== this.prevState.showLabels) {
      console.log('update labels');
      this.updateLabelVisibility(nextState.showLabels);
      this.prevState.showLabels = nextState.showLabels;
    }
    return false;
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
    window.addEventListener('resize', this.onSizeChange, false);
    this.start();
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.onSizeChange);
  }
  updateArmConfig = (index: number, value: number): void => {
    const config = this.state.robotValues.slice();
    config[index] = value;
    this.setState({ robotValues: config });
    console.log('arm config setstate');
  };
  updateAxis = (value: boolean): void => {
    this.setState({ showAxis: value });
    console.log('axis config setstate');
  };
  updateLabel = (value: boolean): void => {
    this.setState({ showLabels: value });
    console.log('label config setstate');
  };
  onSizeChange = () => {
    if (this.threeRootElement.current) {
      const { clientWidth, clientHeight } = this.threeRootElement.current;
      this.handles.camera.aspect = clientWidth / clientHeight;
      this.handles.camera.updateProjectionMatrix();
      this.handles.renderer.setSize(clientWidth, clientHeight, true);
    }
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

  rotateJoints3 = (newAngle: number, prevAngle: number) => {
    const angle = this.rad(newAngle - prevAngle);
    const axis = this.handles.jointAxisStart[1].position
      .clone()
      .sub(this.handles.jointAxisEnd[1].position);
    const point = this.handles.origins[1].position;
    this.rotate(this.handles.joint[2], point, axis, angle);
  };
  rotateJoints4 = (newAngle: number, prevAngle: number) => {
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
  updateLabelVisibility = (value: boolean) => {
    for (let i = 0; i < 5; i++) {
      this.handles.labels[i].visible = value;
    }
  };

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  };
  stop = () => {
    cancelAnimationFrame(this.frameId);
  };
  animate = () => {
    if (this.handles.camera) {
      this.handles.renderer.render(this.handles.scene, this.handles.camera);
      this.controls?.update();
      this.light.position.copy(this.handles.camera.position);
    }

    this.frameId = requestAnimationFrame(this.animate);
  };
  render() {
    console.log('rendering three js');
    return (
      <div ref={this.threeRootElement} className="threeCanvas">
        <ModelControls
          updateConfig={this.updateArmConfig}
          updateAxis={this.updateAxis}
          updateLabel={this.updateLabel}
        />
      </div>
    );
  }
}
