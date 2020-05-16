import React, { Component } from 'react';
import * as THREE from 'three';
import FONT from 'three/examples/fonts/helvetiker_regular.typeface.json';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import '../App.scss';

interface Props {
  robotValues: number[];
}
interface SpriteColor {
  r: number;
  g: number;
  b: number;
  a: number;
}
const defaultFontBackground = { r: 255, g: 255, b: 255, a: 0.1 };
const redColor = { r: 255, g: 0, b: 0, a: 1 };
const greenColor = { r: 0, g: 255, b: 0, a: 1 };
const blueColor = { r: 0, g: 0, b: 255, a: 1 };
const defSpriteParams: SpriteParam = {
  fontsize: 100,
  fontface: 'Roboto',
  backgroundColor: defaultFontBackground,
};
const xParams: SpriteParam = {
  fontsize: 100,
  textColor: redColor,
  borderColor: redColor,
};
const yParams: SpriteParam = {
  fontsize: 100,
  textColor: greenColor,
  borderColor: greenColor,
};
const zParams: SpriteParam = {
  fontsize: 100,
  textColor: blueColor,
  borderColor: blueColor,
};
interface SpriteParam {
  fontface?: string;
  fontsize?: number;
  borderThickness?: number;
  borderColor?: SpriteColor;
  backgroundColor?: SpriteColor;
  textColor?: SpriteColor;
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
  gripper: THREE.Object3D[];
  gripperPositions: THREE.Object3D[];
  yMat: THREE.MeshStandardMaterial;
  blackMat: THREE.MeshStandardMaterial;
  prevAngles: number[];
  labels: THREE.Sprite[];
  constructor(props: any) {
    super(props);
    this.frameId = 0;
    this.threeRootElement = React.createRef<HTMLDivElement>();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.light = new THREE.PointLight(0xffffff);
    this.prevAngles = [0, 0, 0, 0];
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();
    this.joint = [];
    // Use the join axis arrays to calculate the rotation axis
    this.jointAxisStart = [];
    this.jointAxisEnd = [];
    this.origins = [];
    this.gripperPositions = [];
    this.labels = [];
    for (let i = 0; i < 4; i++) {
      this.joint.push(new THREE.Group());
      this.gripperPositions.push(new THREE.Object3D());
      if (i < 3) {
        this.jointAxisStart.push(new THREE.Object3D());
        this.jointAxisEnd.push(new THREE.Object3D());
        this.origins.push(new THREE.Object3D());
      }
    }

    this.gripper = [];
    this.scene = new THREE.Scene();
    this.yMat = new THREE.MeshStandardMaterial({ color: 0xffdf20 });
    this.blackMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
  }
  shouldComponentUpdate(prevProps: Props) {
    if (prevProps.robotValues[0] !== this.props.robotValues[0]) {
      this.rotateJoint1();
    } else if (prevProps.robotValues[1] !== this.props.robotValues[1]) {
      this.rotateJoint2();
    } else if (prevProps.robotValues[2] !== this.props.robotValues[2]) {
      this.rotateJoints3();
    } else if (prevProps.robotValues[3] !== this.props.robotValues[3]) {
      this.rotateJoints4();
    } else if (prevProps.robotValues[4] !== this.props.robotValues[4]) {
      this.updateGripper();
    }
    return false;
  }
  componentDidMount() {
    if (this.threeRootElement.current) {
      this.threeRootElement.current.appendChild(this.renderer.domElement);
      const { clientHeight, clientWidth } = this.threeRootElement.current;
      this.renderer.setClearColor(0xd6d6d6, 1);
      this.renderer.setSize(clientWidth, clientHeight);
      this.camera.aspect = clientWidth / clientHeight;
      this.camera.updateProjectionMatrix();
    }

    // Add the groups to the scene
    this.joint[2].add(this.joint[3]);
    this.joint[1].add(this.joint[2]);
    this.joint[0].add(this.joint[1]);
    this.scene.add(this.joint[0]);

    this.constructJoint1();
    this.constructJoint2();
    this.constructJoint3();
    this.constructJoint4();
    this.constructGripper();
    this.createLabels();
    this.createDisplay();
    window.addEventListener('resize', this.onSizeChange, false);

    this.start();
  }
  constructJoint1 = () => {
    // Constructor Robot Arm base
    const base = new THREE.Group();
    const baseCylinder = [];
    baseCylinder.push(new THREE.Mesh(this.createCylinder(4, 1), this.blackMat));
    baseCylinder[0].position.set(0, 0.5, 0);
    baseCylinder.push(new THREE.Mesh(this.createCylinder(4, 2), this.yMat));
    baseCylinder[1].position.set(0, 2, 0);
    baseCylinder.push(new THREE.Mesh(this.createCylinder(4, 1), this.blackMat));
    baseCylinder[2].position.set(0, 3.5, 0);
    baseCylinder.forEach((cylinder) => base.add(cylinder));

    const baseBox = [];
    baseBox.push(new THREE.Mesh(this.createBox(12, 4, 6), this.blackMat));
    baseBox[0].position.set(6, 2, 0);
    baseBox.push(new THREE.Mesh(this.createBox(6, 0.5, 4), this.yMat));
    baseBox[1].position.set(8, 4.25, 0);
    base.add(baseBox[0]);
    base.add(baseBox[1]);
    this.scene.add(base);
    base.rotateY(Math.PI / 2);
    this.joint[0].rotateY(Math.PI / 2);
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
  };
  constructJoint2 = () => {
    const joint2Bar = [];
    const jointCylinder = [];
    joint2Bar.push(new THREE.Mesh(this.createBox(1.5, 8, 0.5), this.blackMat));
    joint2Bar[0].position.set(0, 9.5, -1.75);
    joint2Bar.push(new THREE.Mesh(this.createBox(1.5, 8, 0.5), this.blackMat));
    joint2Bar[1].position.set(0, 9.5, 1.75);
    joint2Bar.forEach((value) => this.joint[1].add(value));
    jointCylinder.push(
      new THREE.Mesh(this.createCylinder(1.25, 0.5), this.blackMat),
    );
    jointCylinder[0].rotateX(Math.PI / 2);
    jointCylinder[0].position.set(0, 13.5, 1.75);
    jointCylinder.push(
      new THREE.Mesh(this.createCylinder(1.25, 0.5), this.blackMat),
    );
    jointCylinder[1].rotateX(Math.PI / 2);
    jointCylinder[1].position.set(0, 13.5, -1.75);
    this.joint[1].add(jointCylinder[0]);
    this.joint[1].add(jointCylinder[1]);

    // Position the first join axis objects to joint[1]
    this.jointAxisStart[0].position.set(0, 5.5, -5);
    this.jointAxisEnd[0].position.set(0, 5.5, 5);
    this.origins[0].position.set(0, 5.5, 0);
    this.joint[1].add(this.jointAxisStart[0]);
    this.joint[1].add(this.jointAxisEnd[0]);
    this.joint[1].add(this.origins[0]);
    const points = [];
    points.push(new THREE.Vector3(0, 5.5, 0));
    points.push(new THREE.Vector3(0, 5.5, 4.75));
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: 0x3b3b3b }),
    );
    this.joint[1].add(line);
  };
  constructJoint3 = () => {
    const points = [];
    points.push(new THREE.Vector3(0, 18.5, 0));
    points.push(new THREE.Vector3(0, 18.5, 4.75));
    const line3 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([points[0], points[1]]),
      new THREE.LineBasicMaterial({ color: 0x3b3b3b }),
    );
    this.joint[2].add(line3);

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

    const jointCylinder = [];
    jointCylinder.push(
      new THREE.Mesh(this.createCylinder(1.25, 0.5), this.blackMat),
    );
    jointCylinder[0].rotateX(Math.PI / 2);
    jointCylinder[0].position.set(0, 18.5, 1.75);
    jointCylinder.push(
      new THREE.Mesh(this.createCylinder(1.25, 0.5), this.blackMat),
    );
    jointCylinder[1].rotateX(Math.PI / 2);
    jointCylinder[1].position.set(0, 18.5, -1.75);
    this.joint[2].add(jointCylinder[0]);
    this.joint[2].add(jointCylinder[1]);

    // Position the second join axis objects to joint[2]
    this.jointAxisStart[1].position.set(0, 13.5, -5);
    this.jointAxisEnd[1].position.set(0, 13.5, 5);
    this.origins[1].position.set(0, 13.5, 0);
    this.joint[2].add(this.jointAxisStart[1]);
    this.joint[2].add(this.jointAxisEnd[1]);
    this.joint[2].add(this.origins[1]);
    points.push(new THREE.Vector3(0, 13.5, 0));
    points.push(new THREE.Vector3(0, 13.5, 4.75));
    const line2 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([points[2], points[3]]),
      new THREE.LineBasicMaterial({ color: 0x3b3b3b }),
    );
    this.joint[2].add(line2);
  };
  constructJoint4 = () => {
    const jointCylinder = [];
    jointCylinder.push(
      new THREE.Mesh(this.createCylinder(1.25, 3), this.blackMat),
    );
    jointCylinder[0].rotateX(Math.PI / 2);
    jointCylinder[0].position.set(0, 21.5, 0);
    this.joint[3].add(jointCylinder[0]);

    const baseBox = [];
    baseBox.push(new THREE.Mesh(this.createBox(2.5, 2.5, 0.5), this.blackMat));
    baseBox[0].position.set(0, 21.5, -1.75);
    baseBox.push(new THREE.Mesh(this.createBox(2.5, 2.5, 0.5), this.blackMat));
    baseBox[1].position.set(0, 21.5, 1.75);
    baseBox.push(new THREE.Mesh(this.createBox(2.5, 0.5, 3), this.blackMat));
    baseBox[2].position.set(0, 23, 0);
    this.joint[3].add(baseBox[0]);
    this.joint[3].add(baseBox[1]);
    this.joint[3].add(baseBox[2]);

    // Position the third join axis objects to joint[3]
    this.jointAxisStart[2].position.set(0, 18.5, -5);
    this.jointAxisEnd[2].position.set(0, 18.5, 5);
    this.origins[2].position.set(0, 18.5, 0);
    this.joint[3].add(this.jointAxisStart[2]);
    this.joint[3].add(this.jointAxisEnd[2]);
    this.joint[3].add(this.origins[2]);
  };
  constructGripper = () => {
    this.gripper.push(
      new THREE.Mesh(this.createBox(0.7, 6, 0.7), this.blackMat),
    );
    this.gripper[0].position.set(0, 23.5, -0.7);
    this.gripper.push(
      new THREE.Mesh(this.createBox(0.7, 6, 0.7), this.blackMat),
    );
    this.gripper[1].position.set(0, 23.5, 0.7);
    this.gripper.forEach((value) => this.joint[3].add(value));
    this.gripperPositions[0].position.set(0, 23.5, -0.15);
    this.gripperPositions[1].position.set(0, 23.5, -0.7);
    this.gripperPositions[2].position.set(0, 23.5, 0.15);
    this.gripperPositions[3].position.set(0, 23.5, 0.7);
    this.gripperPositions.forEach((value) => this.joint[3].add(value));
  };
  createLabels = () => {
    // Create joint labels
    this.labels.push(
      this.makeTextSprite('Joint 1', defSpriteParams, -10.5, 1.5, 0),
    );
    this.scene.add(this.labels[0]);
    this.labels.push(
      this.makeTextSprite('Joint 2', defSpriteParams, 0, 5.5, 5.5),
    );
    this.labels[1].rotateY(-Math.PI / 2);
    this.joint[0].add(this.labels[1]);
    this.labels.push(
      this.makeTextSprite('Joint 3', defSpriteParams, 0, 13.5, 5.5),
    );
    this.joint[1].add(this.labels[2]);
    this.labels.push(
      this.makeTextSprite('Joint 4', defSpriteParams, 0, 18.5, 5.5),
    );
    this.joint[2].add(this.labels[3]);
    this.labels.push(
      this.makeTextSprite('Gripper', defSpriteParams, 0, 23.5, 3.5),
    );
    this.joint[3].add(this.labels[4]);
    this.labels.push(this.makeTextSprite('x', xParams, 40, 0, 0));
    this.labels.push(this.makeTextSprite('y', yParams, 0, 40, 0));
    this.labels.push(this.makeTextSprite('z', zParams, 0, 0, 40));
    this.scene.add(this.labels[5]);
    this.scene.add(this.labels[6]);
    this.scene.add(this.labels[7]);
  };
  componentWillUnmount() {
    window.removeEventListener('resize', this.onSizeChange);
  }
  createCylinder = (radius: number, height: number): THREE.CylinderGeometry => {
    return new THREE.CylinderGeometry(radius, radius, height, 30);
  };
  onSizeChange = () => {
    if (this.threeRootElement.current) {
      const { clientWidth, clientHeight } = this.threeRootElement.current;
      this.camera.aspect = clientWidth / clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(clientWidth, clientHeight, true);
    }
  };
  createBox = (
    width: number,
    height: number,
    depth: number,
  ): THREE.BoxGeometry => {
    return new THREE.BoxGeometry(width, height, depth);
  };
  rotateJoint1 = () => {
    const angle = this.props.robotValues[0] - this.prevAngles[0];
    this.joint[0].rotateY((angle * Math.PI) / 180);
    this.prevAngles[0] = this.props.robotValues[0];
  };
  rotateJoint2 = () => {
    const angle = this.rad(this.props.robotValues[1] - this.prevAngles[1]);
    const axis = this.jointAxisStart[0].position
      .clone()
      .sub(this.jointAxisEnd[0].position);
    const point = this.origins[0].position;
    this.rotate(this.joint[1], point, axis, angle);
    // Store angle
    this.prevAngles[1] = this.props.robotValues[1];
  };

  rotateJoints3 = () => {
    const angle = this.rad(this.props.robotValues[2] - this.prevAngles[2]);
    const axis = this.jointAxisStart[1].position
      .clone()
      .sub(this.jointAxisEnd[1].position);
    const point = this.origins[1].position;
    this.rotate(this.joint[2], point, axis, angle);

    this.prevAngles[2] = this.props.robotValues[2];
  };
  rotateJoints4 = () => {
    const angle = this.rad(this.props.robotValues[3] - this.prevAngles[3]);
    const axis = this.jointAxisStart[2].position
      .clone()
      .sub(this.jointAxisEnd[2].position);
    const point = this.origins[2].position;
    this.rotate(this.joint[3], point, axis, angle);

    this.prevAngles[3] = this.props.robotValues[3];
  };
  updateGripper = () => {
    const leftDelta = this.gripperPositions[1].position
      .clone()
      .sub(this.gripperPositions[0].position);
    const rightDelta = this.gripperPositions[3].position
      .clone()
      .sub(this.gripperPositions[2].position);
    this.gripper[0].position.copy(
      leftDelta
        .multiplyScalar((this.props.robotValues[4] - 50) / 100)
        .add(this.gripperPositions[1].position),
    );
    this.gripper[1].position.copy(
      rightDelta
        .multiplyScalar((this.props.robotValues[4] - 50) / 100)
        .add(this.gripperPositions[3].position),
    );
  };

  rad = (angle: number): number => (angle * Math.PI) / 180;

  createDisplay = (): void => {
    const axes = new THREE.AxesHelper(40);
    this.scene.add(axes);

    // Add a grid on the xz plane
    const gridhelper = new THREE.GridHelper(60, 60);
    this.scene.add(gridhelper);

    //Set the lightsource
    this.light.position.set(-5, 5, 5);
    this.scene.add(this.light);

    // Set camera
    this.camera?.position.set(15, 15, 15);
    // this.camera?.lookAt(10, 40, 0);
  };
  addText = (
    message: string,
    x: number,
    y: number,
    z: number,
    size: number,
    color: number,
  ) => {
    const loader = new THREE.FontLoader();
    const font = loader.parse(FONT);

    const matDark = new THREE.LineBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
    });

    const shapes = font.generateShapes(message, size);

    const geometry = new THREE.ShapeBufferGeometry(shapes);

    const vec = new THREE.Vector3();

    const text = new THREE.Mesh(geometry, matDark);
    text.geometry.computeBoundingBox();
    text.geometry.boundingBox?.getCenter(vec);
    text.geometry.center();
    text.position.copy(vec);
    text.position.set(x, y, z);
    return text;
  };
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

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  };
  stop = () => {
    cancelAnimationFrame(this.frameId);
  };

  makeTextSprite = (
    message: string,
    params: SpriteParam,
    x: number,
    y: number,
    z: number,
  ): THREE.Sprite => {
    const fontface = params.fontface ? params.fontface : 'Arial';
    const fontsize = params.fontsize ? params.fontsize : 18;
    const borderThickness = params.borderThickness ? params.borderThickness : 4;
    const borderColor = params.borderColor
      ? params.borderColor
      : { r: 0, g: 0, b: 0, a: 1.0 };
    const backgroundColor = params.backgroundColor
      ? params.backgroundColor
      : { r: 255, g: 255, b: 255, a: 1.0 };
    const textColor = params.textColor
      ? params.textColor
      : { r: 0, g: 0, b: 0, a: 1.0 };

    const canvas = document.createElement('canvas');

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const context = canvas.getContext('2d')!;
    canvas.width = 400;
    canvas.height = 200;
    context.font = 'Bold ' + fontsize + 'px ' + fontface;
    const metrics = context.measureText(message);
    const textWidth = metrics.width;

    context.fillStyle =
      'rgba(' +
      backgroundColor.r +
      ',' +
      backgroundColor.g +
      ',' +
      backgroundColor.b +
      ',' +
      backgroundColor.a +
      ')';
    context.strokeStyle =
      'rgba(' +
      borderColor.r +
      ',' +
      borderColor.g +
      ',' +
      borderColor.b +
      ',' +
      borderColor.a +
      ')';

    context.lineWidth = borderThickness;
    this.roundRect(
      context,
      borderThickness / 2,
      borderThickness / 2,
      textWidth + borderThickness,
      fontsize * 1.4 + borderThickness,
      20,
    );

    context.fillStyle =
      'rgba(' +
      textColor.r +
      ', ' +
      textColor.g +
      ', ' +
      textColor.b +
      ', 1.0)';

    context.fillText(message, borderThickness + 15, fontsize + borderThickness);

    const texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      premultipliedAlpha: true,
      dithering: false,
      transparent: true,
    });
    spriteMaterial.precision = 'highp';
    spriteMaterial.depthWrite = false;
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(8, 4, 1.0);
    sprite.center.set(0.1, 0.65);

    sprite.position.set(x, y, z);
    return sprite;
  };
  roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w + 30 - r, y);
    ctx.quadraticCurveTo(x + w + 30, y, x + w + 30, y + r);
    ctx.lineTo(x + w + 30, y + h - r);
    ctx.quadraticCurveTo(x + w + 30, y + h, x + w + 30 - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };
  animate = () => {
    if (this.camera) {
      this.renderer.render(this.scene, this.camera);
      this.controls?.update();
      this.light.position.copy(this.camera.position);
    }

    this.frameId = requestAnimationFrame(this.animate);
  };
  render() {
    return <div ref={this.threeRootElement} className="threeCanvas" />;
  }
}
