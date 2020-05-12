import React, { Component } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import '../App.scss';
interface Props {
  angles: number[];
}
export default class ThreeContainer extends Component<Props> {
  threeRootElement: React.RefObject<HTMLDivElement>;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  frameId: number;
  light: THREE.PointLight;
  joint1: THREE.Group;
  joint2: THREE.Group;
  joint3: THREE.Group;
  joint4: THREE.Group;
  gripper: THREE.Group;
  yMat: THREE.MeshStandardMaterial;
  blackMat: THREE.MeshStandardMaterial;
  angles: number[];
  constructor(props: any) {
    super(props);
    this.frameId = 0;
    this.threeRootElement = React.createRef<HTMLDivElement>();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.light = new THREE.PointLight(0xffffff);
    this.angles = [0, 0, 0, 0];
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();
    this.joint1 = new THREE.Group();
    this.joint2 = new THREE.Group();
    this.joint3 = new THREE.Group();
    this.joint4 = new THREE.Group();
    this.gripper = new THREE.Group();

    this.scene = new THREE.Scene();
    this.yMat = new THREE.MeshStandardMaterial({ color: 0xffdf20 });
    this.blackMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
  }
  shouldComponentUpdate(prevProps: Props) {
    if (prevProps.angles[0] !== this.props.angles[0]) {
      this.rotateJoint1();
    } else if (prevProps.angles[1] !== this.props.angles[1]) {
      this.rotateJoint2();
    } else if (prevProps.angles[2] !== this.props.angles[2]) {
      this.rotateJoint3();
    } else if (prevProps.angles[3] !== this.props.angles[1]) {
      this.rotateJoint4();
    }
    return false;
  }
  componentDidMount() {
    if (this.threeRootElement.current) {
      this.threeRootElement.current.appendChild(this.renderer.domElement);
      const { clientHeight, clientWidth } = this.threeRootElement.current;
      this.renderer.setClearColor(0xababab, 1);
      this.renderer.setSize(clientWidth, clientHeight);
      this.camera.aspect = clientWidth / clientHeight;
      this.camera.updateProjectionMatrix();
    }

    const baseCylinder = [];
    baseCylinder.push(new THREE.Mesh(this.createCylinder(4, 1), this.blackMat));
    baseCylinder[0].position.set(0, 0.5, 0);
    baseCylinder.push(new THREE.Mesh(this.createCylinder(4, 2), this.yMat));
    baseCylinder[1].position.set(0, 2, 0);
    baseCylinder.push(new THREE.Mesh(this.createCylinder(4, 1), this.blackMat));
    baseCylinder[2].position.set(0, 3.5, 0);
    baseCylinder.forEach((cylinder) => {
      this.scene.add(cylinder);
    });
    const baseBox = [];
    baseBox.push(new THREE.Mesh(this.createBox(12, 4, 6), this.blackMat));
    baseBox[0].position.set(6, 2, 0);
    baseBox.push(new THREE.Mesh(this.createBox(6, 0.5, 4), this.yMat));
    baseBox[1].position.set(8, 4.25, 0);
    this.scene.add(baseBox[0]);
    this.scene.add(baseBox[1]);
    const joint5Base = new THREE.Mesh(this.createBox(3, 3, 3), this.yMat);
    joint5Base.position.set(0, 5.5, 0);
    this.joint1.add(joint5Base);

    const jointCylinder = [];
    jointCylinder.push(
      new THREE.Mesh(this.createCylinder(1.25, 0.5), this.blackMat),
    );
    jointCylinder[0].rotateX(Math.PI / 2);
    jointCylinder[0].position.set(0, 5.5, -1.75);
    jointCylinder.push(
      new THREE.Mesh(this.createCylinder(1.25, 0.5), this.blackMat),
    );
    jointCylinder[1].rotateX(Math.PI / 2);
    jointCylinder[1].position.set(0, 5.5, 1.75);

    this.joint1.add(jointCylinder[0]);
    this.joint1.add(jointCylinder[1]);

    const joint2Bar = [];
    joint2Bar.push(new THREE.Mesh(this.createBox(1.5, 8, 0.5), this.blackMat));
    joint2Bar[0].position.set(0, 9.5, -1.75);
    joint2Bar.push(new THREE.Mesh(this.createBox(1.5, 8, 0.5), this.blackMat));
    joint2Bar[1].position.set(0, 9.5, 1.75);
    joint2Bar.forEach((value) => this.joint2.add(value));
    jointCylinder.push(
      new THREE.Mesh(this.createCylinder(1.25, 0.5), this.blackMat),
    );
    jointCylinder[2].rotateX(Math.PI / 2);
    jointCylinder[2].position.set(0, 13.5, 1.75);
    jointCylinder.push(
      new THREE.Mesh(this.createCylinder(1.25, 0.5), this.blackMat),
    );
    jointCylinder[3].rotateX(Math.PI / 2);
    jointCylinder[3].position.set(0, 13.5, -1.75);
    this.joint2.add(jointCylinder[2]);
    this.joint2.add(jointCylinder[3]);

    const armBody = new THREE.Mesh(this.createBox(3, 8, 3), this.yMat);
    armBody.position.set(0, 16, 0);
    this.joint3.add(armBody);

    const armBodyCover = [];
    armBodyCover.push(
      new THREE.Mesh(this.createBox(0.25, 6, 2.5), this.blackMat),
    );
    armBodyCover[0].position.set(-1.625, 16, 0);
    this.joint3.add(armBodyCover[0]);
    armBodyCover.push(
      new THREE.Mesh(this.createBox(0.25, 6, 2.5), this.blackMat),
    );
    armBodyCover[1].position.set(1.625, 16, 0);
    this.joint3.add(armBodyCover[1]);

    jointCylinder.push(
      new THREE.Mesh(this.createCylinder(1.25, 0.5), this.blackMat),
    );
    jointCylinder[4].rotateX(Math.PI / 2);
    jointCylinder[4].position.set(0, 18.5, 1.75);
    jointCylinder.push(
      new THREE.Mesh(this.createCylinder(1.25, 0.5), this.blackMat),
    );
    jointCylinder[5].rotateX(Math.PI / 2);
    jointCylinder[5].position.set(0, 18.5, -1.75);
    this.joint3.add(jointCylinder[4]);
    this.joint3.add(jointCylinder[5]);

    jointCylinder.push(
      new THREE.Mesh(this.createCylinder(1.25, 3), this.blackMat),
    );
    jointCylinder[6].rotateX(Math.PI / 2);
    jointCylinder[6].position.set(0, 21.5, 0);
    this.joint4.add(jointCylinder[6]);

    baseBox.push(new THREE.Mesh(this.createBox(2.5, 2.5, 0.5), this.blackMat));
    baseBox[2].position.set(0, 21.5, -1.75);
    baseBox.push(new THREE.Mesh(this.createBox(2.5, 2.5, 0.5), this.blackMat));
    baseBox[3].position.set(0, 21.5, 1.75);
    baseBox.push(new THREE.Mesh(this.createBox(2.5, 0.5, 3), this.blackMat));
    baseBox[4].position.set(0, 23, 0);
    this.joint4.add(baseBox[2]);
    this.joint4.add(baseBox[3]);
    this.joint4.add(baseBox[4]);

    const gripper = [];
    gripper.push(new THREE.Mesh(this.createBox(0.7, 6, 0.7), this.blackMat));
    gripper[0].position.set(0, 23.5, -0.675);
    gripper.push(new THREE.Mesh(this.createBox(0.7, 6, 0.7), this.blackMat));
    gripper[1].position.set(0, 23.5, 0.675);
    gripper.forEach((value) => this.joint4.add(value));
    this.joint3.add(this.joint4);
    this.joint2.add(this.joint3);
    this.joint1.add(this.joint2);
    this.scene.add(this.joint1);
    window.addEventListener('resize', this.onSizeChange, false);
    this.createDisplay();
    this.start();
  }
  createCylinder = (radius: number, height: number): THREE.CylinderGeometry => {
    return new THREE.CylinderGeometry(radius, radius, height, 30);
  };
  onSizeChange = () => {
    const { innerHeight, innerWidth } = window;
    this.renderer.setSize(innerWidth * 0.6, innerHeight);
    this.camera.aspect = (innerWidth * 0.6) / innerHeight;
    this.camera.updateProjectionMatrix();
  };
  createBox = (
    width: number,
    height: number,
    depth: number,
  ): THREE.BoxGeometry => {
    return new THREE.BoxGeometry(width, height, depth);
  };
  rotateJoint1 = () => {
    const angle = this.props.angles[0] - this.angles[0];
    this.joint1.rotateY((angle * Math.PI) / 180);
    this.angles[0] = this.props.angles[0];
  };
  rotateJoint2 = () => {
    const angle = this.props.angles[1] - this.angles[1];
    // this.joint2.rotateZ((angle * Math.PI) / 180);
    this.rotateAroundObjectAxis(
      this.joint2,
      new THREE.Vector3(0, 0, 1),
      (angle * Math.PI) / 180,
    );
    this.angles[1] = this.props.angles[1];
  };
  rotateJoint3 = () => {
    console.log('rotate');
  };
  rotateJoint4 = () => {
    console.log('rotate');
  };
  getRotateAngle(newAngle: number, prevAngle: number): number {
    return newAngle - prevAngle;
  }
  createDisplay = (): void => {
    const axes = new THREE.AxesHelper(40);
    this.scene.add(axes);
    // Add a grid on the xz plane
    const gridhelper = new THREE.GridHelper(40, 40);
    this.scene.add(gridhelper);
    //Set the lightsource
    this.light.position.set(-5, 5, 5);
    this.scene.add(this.light);
    // Set camera
    this.camera?.position.set(-20, 20, 20);
    this.camera?.lookAt(0, 0, 0);
  };

  rotateAroundWorldAxis = (
    object: any,
    axis: THREE.Vector3,
    radians: number,
  ) => {
    const rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    rotWorldMatrix.multiply(object.matrix); // pre-multiply

    object.matrix = rotWorldMatrix;
    object.rotation.setFromRotationMatrix(object.matrix);
  };

  rotateAroundObjectAxis = (object: any, axis: any, radians: number) => {
    const rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

    object.matrix.multiply(rotObjectMatrix);
    object.rotation.setFromRotationMatrix(object.matrix);
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
    if (this.camera) {
      this.renderer.render(this.scene, this.camera);
      this.controls?.update();
      this.light.position.set(
        this.camera.position.x,
        this.camera.position.y,
        this.camera.position.z,
      );
    }

    this.frameId = requestAnimationFrame(this.animate);
  };
  render() {
    console.log('rendering');
    return <div ref={this.threeRootElement} className="threeCanvas" />;
  }
}
