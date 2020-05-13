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
  joint: THREE.Group[];
  jointAxisStart: THREE.Object3D[];
  jointAxisEnd: THREE.Object3D[];
  origins: THREE.Object3D[];
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
    this.joint = [];
    // Use the join axis arrays to calculate the rotation axis
    this.jointAxisStart = [];
    this.jointAxisEnd = [];
    this.origins = [];
    for (let i = 0; i < 4; i++) {
      this.joint.push(new THREE.Group());
      if (i < 3) {
        this.jointAxisStart.push(new THREE.Object3D());
        this.jointAxisEnd.push(new THREE.Object3D());
        this.origins.push(new THREE.Object3D());
      }
    }

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
      this.rotateJoints3();
    } else if (prevProps.angles[3] !== this.props.angles[3]) {
      this.rotateJoints4();
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
    this.joint[2].add(this.joint[3]);
    this.joint[1].add(this.joint[2]);
    this.joint[0].add(this.joint[1]);
    this.scene.add(this.joint[0]);
    // Constructor Robot Arm base
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

    this.joint.forEach((value) => console.log(value));
    // Construct joint[0]
    const joint2Base = new THREE.Mesh(this.createBox(3, 3, 3), this.yMat);
    joint2Base.position.set(0, 5.5, 0);
    this.joint[0].add(joint2Base);

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

    this.joint[0].add(jointCylinder[0]);
    this.joint[0].add(jointCylinder[1]);

    // Construction joint[1]
    const joint2Bar = [];
    joint2Bar.push(new THREE.Mesh(this.createBox(1.5, 8, 0.5), this.blackMat));
    joint2Bar[0].position.set(0, 9.5, -1.75);
    joint2Bar.push(new THREE.Mesh(this.createBox(1.5, 8, 0.5), this.blackMat));
    joint2Bar[1].position.set(0, 9.5, 1.75);
    joint2Bar.forEach((value) => this.joint[1].add(value));
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
    this.joint[1].add(jointCylinder[2]);
    this.joint[1].add(jointCylinder[3]);

    // Position the first join axis objects to joint[1]
    this.jointAxisStart[0].position.set(0, 5.5, -5);
    this.jointAxisEnd[0].position.set(0, 5.5, 5);
    this.origins[0].position.set(0, 5.5, 0);
    this.joint[1].add(this.jointAxisStart[0]);
    this.joint[1].add(this.jointAxisEnd[0]);
    this.joint[1].add(this.origins[0]);
    const points = [];
    points.push(new THREE.Vector3(0, 5.5, -5));
    points.push(new THREE.Vector3(0, 5.5, 5));
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: 0xff0000 }),
    );
    this.joint[1].add(line);

    // Construct objects for joints[2]
    const armBody = new THREE.Mesh(this.createBox(3, 8, 3), this.yMat);
    armBody.position.set(0, 16, 0);
    this.joint[2].add(armBody);

    const armBodyCover = [];
    armBodyCover.push(
      new THREE.Mesh(this.createBox(0.25, 6, 2.5), this.blackMat),
    );
    armBodyCover[0].position.set(-1.625, 16, 0);
    this.joint[2].add(armBodyCover[0]);
    armBodyCover.push(
      new THREE.Mesh(this.createBox(0.25, 6, 2.5), this.blackMat),
    );
    armBodyCover[1].position.set(1.625, 16, 0);
    this.joint[2].add(armBodyCover[1]);

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
    this.joint[2].add(jointCylinder[4]);
    this.joint[2].add(jointCylinder[5]);

    // Position the second join axis objects to joint[2]
    this.jointAxisStart[1].position.set(0, 13.5, -5);
    this.jointAxisEnd[1].position.set(0, 13.5, 5);
    this.origins[1].position.set(0, 13.5, 0);
    this.joint[2].add(this.jointAxisStart[1]);
    this.joint[2].add(this.jointAxisEnd[1]);
    this.joint[2].add(this.origins[1]);
    points.push(new THREE.Vector3(0, 13.5, -5));
    points.push(new THREE.Vector3(0, 13.5, 5));
    const line2 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([points[2], points[3]]),
      new THREE.LineBasicMaterial({ color: 0xff0000 }),
    );
    this.joint[2].add(line2);

    jointCylinder.push(
      new THREE.Mesh(this.createCylinder(1.25, 3), this.blackMat),
    );
    jointCylinder[6].rotateX(Math.PI / 2);
    jointCylinder[6].position.set(0, 21.5, 0);
    this.joint[3].add(jointCylinder[6]);

    baseBox.push(new THREE.Mesh(this.createBox(2.5, 2.5, 0.5), this.blackMat));
    baseBox[2].position.set(0, 21.5, -1.75);
    baseBox.push(new THREE.Mesh(this.createBox(2.5, 2.5, 0.5), this.blackMat));
    baseBox[3].position.set(0, 21.5, 1.75);
    baseBox.push(new THREE.Mesh(this.createBox(2.5, 0.5, 3), this.blackMat));
    baseBox[4].position.set(0, 23, 0);
    this.joint[3].add(baseBox[2]);
    this.joint[3].add(baseBox[3]);
    this.joint[3].add(baseBox[4]);

    // Position the third join axis objects to joint[3]
    this.jointAxisStart[2].position.set(0, 18.5, -5);
    this.jointAxisEnd[2].position.set(0, 18.5, 5);
    this.origins[2].position.set(0, 18.5, 0);
    this.joint[3].add(this.jointAxisStart[2]);
    this.joint[3].add(this.jointAxisEnd[2]);
    this.joint[3].add(this.origins[2]);
    points.push(new THREE.Vector3(0, 18.5, -5));
    points.push(new THREE.Vector3(0, 18.5, 5));
    const line3 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([points[4], points[5]]),
      new THREE.LineBasicMaterial({ color: 0xff0000 }),
    );
    this.joint[2].add(line3);

    const gripper = [];
    gripper.push(new THREE.Mesh(this.createBox(0.7, 6, 0.7), this.blackMat));
    gripper[0].position.set(0, 23.5, -0.675);
    gripper.push(new THREE.Mesh(this.createBox(0.7, 6, 0.7), this.blackMat));
    gripper[1].position.set(0, 23.5, 0.675);
    gripper.forEach((value) => this.joint[3].add(value));

    this.joint[0].applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, 0));
    // this.joint[1].applyMatrix4(new THREE.Matrix4().makeTranslation(0, 5.5, 0));
    // this.joint[2].applyMatrix4(
    //   new THREE.Matrix4().makeTranslation(0, 13.5, 0)
    // );
    // this.joint[3].applyMatrix4(
    //   new THREE.Matrix4().makeTranslation(0, 18.5, 0)
    // );

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
  // get a new vector
  vec(x: number, y: number, z: number): THREE.Vector3 {
    return new THREE.Vector3(x, y, z);
  }
  worldPos(object: THREE.Object3D): THREE.Vector3 {
    const position = new THREE.Vector3();
    return object.getWorldPosition(position);
  }
  rotateJoint1 = () => {
    const angle = this.props.angles[0] - this.angles[0];
    this.joint[0].rotateY((angle * Math.PI) / 180);
    this.angles[0] = this.props.angles[0];
  };
  rotateJoint2 = () => {
    const angle = this.props.angles[1] - this.angles[1];
    const axis = this.jointAxisStart[0].position
      .clone()
      .sub(this.jointAxisEnd[0].position);
    this.rotateAboutPoint(
      this.joint[1],
      this.origins[0].position,
      axis.normalize(),
      this.rad(angle),
      false,
    );

    this.angles[1] = this.props.angles[1];
  };

  rotateJoints3 = () => {
    const angle = this.props.angles[2] - this.angles[2];
    const axis = this.jointAxisStart[1].position
      .clone()
      .sub(this.jointAxisEnd[1].position);
    this.rotateAboutPoint(
      this.joint[2],
      this.origins[1].position,
      axis.normalize(),
      this.rad(angle),
      false,
    );

    this.angles[2] = this.props.angles[2];
  };
  rotateJoints4 = () => {
    const angle = this.props.angles[3] - this.angles[3];
    const axis = this.jointAxisStart[2].position
      .clone()
      .sub(this.jointAxisEnd[2].position);
    this.rotateAboutPoint(
      this.joint[3],
      this.origins[2].position,
      axis.normalize(),
      this.rad(angle),
      false,
    );

    this.angles[3] = this.props.angles[3];
  };
  rad = (angle: number): number => (angle * Math.PI) / 180;

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
  rotateAboutPoint = (
    obj: THREE.Object3D,
    point: THREE.Vector3,
    axis: THREE.Vector3,
    theta: number,
    pointIsWorld: boolean,
  ) => {
    const IsWorld = pointIsWorld ? true : false;
    if (IsWorld) {
      obj.parent?.localToWorld(obj.position); // compensate for world coordinate
    }
    obj.position.sub(point); // remove the offset
    obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
    obj.position.add(point); // re-add the offset
    //
    if (IsWorld) {
      obj.parent?.worldToLocal(obj.position); // undo world coordinates compensation
    }

    obj.rotateOnAxis(axis, theta); // rotate the OBJECT
    // obj.rotateOnWorldAxis(axis, theta);
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
