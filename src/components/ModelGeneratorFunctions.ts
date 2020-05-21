import * as THREE from 'three';
import FONT from 'three/examples/fonts/helvetiker_regular.typeface.json';
import {
  defSpriteParams,
  SpriteParam,
  ThreeModelObjects,
  xParams,
  yParams,
  zParams,
} from './constants';
import { blackMat, yMat } from './ThreeContainer';

const createCylinder = (radius: number, height: number) => {
  return new THREE.CylinderGeometry(radius, radius, height, 30);
};
export const createBox = (width: number, height: number, depth: number) => {
  return new THREE.BoxGeometry(width, height, depth);
};
const roundRect = (
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
const makeTextSprite = (
  message: string,
  params: SpriteParam,
  x: number,
  y: number,
  z: number,
): THREE.Sprite => {
  const fontface = params.fontface ? params.fontface : 'Arial';
  const fontsize = params.fontsize ? params.fontsize : 18;
  const borderThickness = params.borderThickness ? params.borderThickness : 4;
  const borderColor = params.borderColor ? params.borderColor : '#000000';
  const backgroundColor = params.backgroundColor
    ? params.backgroundColor
    : '#ffffff00';
  const textColor = params.textColor ? params.textColor : '#000000';

  const canvas = document.createElement('canvas');

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const context = canvas.getContext('2d')!;
  canvas.width = 400;
  canvas.height = 200;
  context.font = 'Bold ' + fontsize + 'px ' + fontface;
  const metrics = context.measureText(message);
  const textWidth = metrics.width;

  context.fillStyle = backgroundColor;
  context.strokeStyle = borderColor;

  context.lineWidth = borderThickness;
  roundRect(
    context,
    borderThickness / 2,
    borderThickness / 2,
    textWidth + borderThickness,
    fontsize * 1.4 + borderThickness,
    20,
  );

  context.fillStyle = textColor;

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

export const constructJoint1 = (object: ThreeModelObjects) => {
  // Constructor Robot Arm base
  const base = new THREE.Group();
  const baseCylinder = [];
  baseCylinder.push(new THREE.Mesh(createCylinder(4, 1), blackMat));
  baseCylinder[0].position.set(0, 0.5, 0);
  baseCylinder.push(new THREE.Mesh(createCylinder(4, 2), yMat));
  baseCylinder[1].position.set(0, 2, 0);
  baseCylinder.push(new THREE.Mesh(createCylinder(4, 1), blackMat));
  baseCylinder[2].position.set(0, 3.5, 0);
  baseCylinder.forEach((cylinder) => base.add(cylinder));

  const baseBox = [];
  baseBox.push(new THREE.Mesh(createBox(12, 4, 6), blackMat));
  baseBox[0].position.set(6, 2, 0);
  baseBox.push(new THREE.Mesh(createBox(6, 0.5, 4), yMat));
  baseBox[1].position.set(8, 4.25, 0);
  base.add(baseBox[0]);
  base.add(baseBox[1]);
  object.scene.add(base);
  base.rotateY(Math.PI / 2);
  object.joint[0].rotateY(Math.PI / 2);
  // Construct joint[0]
  const joint2Base = new THREE.Mesh(createBox(3, 3, 3), yMat);
  joint2Base.position.set(0, 5.5, 0);
  object.joint[0].add(joint2Base);

  const jointCylinder = [];
  jointCylinder.push(new THREE.Mesh(createCylinder(1.25, 0.5), blackMat));
  jointCylinder[0].rotateX(Math.PI / 2);
  jointCylinder[0].position.set(0, 5.5, -1.75);
  jointCylinder.push(new THREE.Mesh(createCylinder(1.25, 0.5), blackMat));
  jointCylinder[1].rotateX(Math.PI / 2);
  jointCylinder[1].position.set(0, 5.5, 1.75);

  object.joint[0].add(jointCylinder[0]);
  object.joint[0].add(jointCylinder[1]);
  object.robotBase.position.set(0, 2, -4);
  object.scene.add(object.robotBase);
};
export const constructJoint2 = (object: ThreeModelObjects) => {
  const joint2Bar = [];
  const jointCylinder = [];
  joint2Bar.push(new THREE.Mesh(createBox(1.5, 8, 0.5), blackMat));
  joint2Bar[0].position.set(0, 9.5, -1.75);
  joint2Bar.push(new THREE.Mesh(createBox(1.5, 8, 0.5), blackMat));
  joint2Bar[1].position.set(0, 9.5, 1.75);
  joint2Bar.forEach((value) => object.joint[1].add(value));
  jointCylinder.push(new THREE.Mesh(createCylinder(1.25, 0.5), blackMat));
  jointCylinder[0].rotateX(Math.PI / 2);
  jointCylinder[0].position.set(0, 13.5, 1.75);
  jointCylinder.push(new THREE.Mesh(createCylinder(1.25, 0.5), blackMat));
  jointCylinder[1].rotateX(Math.PI / 2);
  jointCylinder[1].position.set(0, 13.5, -1.75);
  object.joint[1].add(jointCylinder[0]);
  object.joint[1].add(jointCylinder[1]);

  // Position the first join axis objects to joint[1]
  object.jointAxisStart[0].position.set(0, 5.5, -5);
  object.jointAxisEnd[0].position.set(0, 5.5, 5);
  object.origins[0].position.set(0, 5.5, 0);
  object.joint[1].add(object.jointAxisStart[0]);
  object.joint[1].add(object.jointAxisEnd[0]);
  object.joint[1].add(object.origins[0]);
};
export const constructJoint3 = (object: ThreeModelObjects) => {
  const armBody = new THREE.Mesh(createBox(3, 8, 3), yMat);
  armBody.position.set(0, 16, 0);
  object.joint[2].add(armBody);

  const armBodyCover = [];
  armBodyCover.push(new THREE.Mesh(createBox(0.25, 6, 2.5), blackMat));
  armBodyCover[0].position.set(-1.625, 16, 0);
  object.joint[2].add(armBodyCover[0]);
  armBodyCover.push(new THREE.Mesh(createBox(0.25, 6, 2.5), blackMat));
  armBodyCover[1].position.set(1.625, 16, 0);
  object.joint[2].add(armBodyCover[1]);

  const jointCylinder = [];
  jointCylinder.push(new THREE.Mesh(createCylinder(1.25, 0.5), blackMat));
  jointCylinder[0].rotateX(Math.PI / 2);
  jointCylinder[0].position.set(0, 18.5, 1.75);
  jointCylinder.push(new THREE.Mesh(createCylinder(1.25, 0.5), blackMat));
  jointCylinder[1].rotateX(Math.PI / 2);
  jointCylinder[1].position.set(0, 18.5, -1.75);
  object.joint[2].add(jointCylinder[0]);
  object.joint[2].add(jointCylinder[1]);

  // Position the second join axis objects to joint[2]
  object.jointAxisStart[1].position.set(0, 13.5, -5);
  object.jointAxisEnd[1].position.set(0, 13.5, 5);
  object.origins[1].position.set(0, 13.5, 0);
  object.joint[2].add(object.jointAxisStart[1]);
  object.joint[2].add(object.jointAxisEnd[1]);
  object.joint[2].add(object.origins[1]);
};
export const constructJoint4 = (object: ThreeModelObjects) => {
  const jointCylinder = [];
  jointCylinder.push(new THREE.Mesh(createCylinder(1.25, 3), blackMat));
  jointCylinder[0].rotateX(Math.PI / 2);
  jointCylinder[0].position.set(0, 21.5, 0);
  object.joint[3].add(jointCylinder[0]);

  const baseBox = [];
  baseBox.push(new THREE.Mesh(createBox(2.5, 2.5, 0.5), blackMat));
  baseBox[0].position.set(0, 21.5, -1.75);
  baseBox.push(new THREE.Mesh(createBox(2.5, 2.5, 0.5), blackMat));
  baseBox[1].position.set(0, 21.5, 1.75);
  baseBox.push(new THREE.Mesh(createBox(2.5, 0.5, 3), blackMat));
  baseBox[2].position.set(0, 23, 0);
  object.joint[3].add(baseBox[0]);
  object.joint[3].add(baseBox[1]);
  object.joint[3].add(baseBox[2]);

  // Position the third join axis objects to joint[3]
  object.jointAxisStart[2].position.set(0, 18.5, -5);
  object.jointAxisEnd[2].position.set(0, 18.5, 5);
  object.origins[2].position.set(0, 18.5, 0);
  object.joint[3].add(object.jointAxisStart[2]);
  object.joint[3].add(object.jointAxisEnd[2]);
  object.joint[3].add(object.origins[2]);
};
export const constructGripper = (object: ThreeModelObjects) => {
  object.gripper.push(new THREE.Mesh(createBox(0.7, 6, 0.7), blackMat));
  object.gripper[0].position.set(0, 23.5, -0.7);
  object.gripper.push(new THREE.Mesh(createBox(0.7, 6, 0.7), blackMat));
  object.gripper[1].position.set(0, 23.5, 0.7);

  object.gripper.forEach((value) => object.joint[3].add(value));
  object.gripperPositions[0].position.set(0, 23.5, -0.15);
  object.gripperPositions[1].position.set(0, 23.5, -0.7);
  object.gripperPositions[2].position.set(0, 23.5, 0.15);
  object.gripperPositions[3].position.set(0, 23.5, 0.7);
  object.endEffector.position.set(0, 26.5, 0);
  object.joint[3].add(object.endEffector);
  object.gripperPositions.forEach((value) => object.joint[3].add(value));
};
export const createLabels = (object: ThreeModelObjects) => {
  // Create joint labels
  object.labels.push(makeTextSprite('Joint 1', defSpriteParams, -10.5, 1.5, 0));
  object.scene.add(object.labels[0]);
  object.labels.push(makeTextSprite('Joint 2', defSpriteParams, 0, 5.5, 10.5));
  object.labels[1].rotateY(-Math.PI / 2);
  object.joint[0].add(object.labels[1]);
  object.labels.push(makeTextSprite('Joint 3', defSpriteParams, 0, 13.5, 10.5));
  object.joint[1].add(object.labels[2]);
  object.labels.push(makeTextSprite('Joint 4', defSpriteParams, 0, 18.5, 10.5));
  object.joint[2].add(object.labels[3]);
  object.labels.push(makeTextSprite('Gripper', defSpriteParams, 0, 23.5, 8.5));
  object.joint[3].add(object.labels[4]);
  object.labels.push(makeTextSprite('x', xParams, 30, 0, 0));
  object.labels.push(makeTextSprite('y', yParams, 0, 30, 0));
  object.labels.push(makeTextSprite('z', zParams, 0, 0, 30));

  object.scene.add(object.labels[5]);
  object.scene.add(object.labels[6]);
  object.scene.add(object.labels[7]);

  // Create Lines
  const points = [];
  points.push(new THREE.Vector3(0, 5.5, 0));
  points.push(new THREE.Vector3(0, 5.5, 9.75));
  object.lines.push(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: 0x3b3b3b }),
    ),
  );
  object.joint[1].add(object.lines[0]);

  points.push(new THREE.Vector3(0, 18.5, 0));
  points.push(new THREE.Vector3(0, 18.5, 9.75));
  object.lines.push(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([points[2], points[3]]),
      new THREE.LineBasicMaterial({ color: 0x3b3b3b }),
    ),
  );
  object.joint[2].add(object.lines[1]);

  points.push(new THREE.Vector3(0, 13.5, 0));
  points.push(new THREE.Vector3(0, 13.5, 9.75));
  object.lines.push(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([points[4], points[5]]),
      new THREE.LineBasicMaterial({ color: 0x3b3b3b }),
    ),
  );
  object.joint[2].add(object.lines[2]);
  points.push(new THREE.Vector3(0, 22.5, 0));
  points.push(new THREE.Vector3(0, 22.5, 7.95));
  object.lines.push(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([points[6], points[7]]),
      new THREE.LineBasicMaterial({ color: 0x3b3b3b }),
    ),
  );
  object.joint[3].add(object.lines[3]);
};
export const createDisplay = (object: ThreeModelObjects): void => {
  object.scene.add(object.axis);

  // Add a grid on the xz plane
  const gridhelper = new THREE.GridHelper(60, 60);
  object.scene.add(gridhelper);

  // Set camera
  object.camera?.position.set(0, 33, 40);
  object.camera?.lookAt(object.scene.position);
};
export const addText = (
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
