export const defaultFontBackground = '#ffffff';
export const redColor = '#ff0000';
export const greenColor = '#007000';
export const blueColor = '#00b0ff';
export const defSpriteParams: SpriteParam = {
  fontsize: 100,
  fontface: 'Roboto',
  backgroundColor: defaultFontBackground,
};
export const xParams: SpriteParam = {
  fontsize: 100,
  textColor: redColor,
  borderColor: redColor,
  backgroundColor: defaultFontBackground,
};
export const yParams: SpriteParam = {
  fontsize: 100,
  textColor: greenColor,
  borderColor: greenColor,
  backgroundColor: defaultFontBackground,
};
export const zParams: SpriteParam = {
  fontsize: 100,
  textColor: blueColor,
  borderColor: blueColor,
  backgroundColor: defaultFontBackground,
};
export interface SpriteParam {
  fontface?: string;
  fontsize?: number;
  borderThickness?: number;
  borderColor?: string;
  backgroundColor?: string;
  textColor?: string;
}
export interface ThreeModelObjects {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  joint: THREE.Group[];
  jointAxisStart: THREE.Object3D[];
  jointAxisEnd: THREE.Object3D[];
  origins: THREE.Object3D[];
  gripper: THREE.Object3D[];
  gripperPositions: THREE.Object3D[];
  endEffector: THREE.Mesh;
  robotBase: THREE.Mesh;
  labels: THREE.Sprite[];
  axis: THREE.AxesHelper;
  lines: THREE.Line[];
  boundingBox1: THREE.Box3 | null;
  boundingBox2: THREE.Box3 | null;
}
export interface HUDDisplay {
  camera: THREE.OrthographicCamera | null;
  bitMap: CanvasRenderingContext2D;
  sceneHUD: THREE.Scene;
  texture: THREE.Texture | null;
}
export const ControlConfig = [
  {
    label: 'Joint 1',
    defaultVal: 0,
    max: 135,
    min: -135,
    valUnit: '\u00b0',
  },
  {
    label: 'Joint 2',
    defaultVal: 0,
    max: 75,
    min: -75,
    valUnit: '\u00b0',
  },
  {
    label: 'Joint 3',
    defaultVal: 0,
    max: 135,
    min: -135,
    valUnit: '\u00b0',
  },
  {
    label: 'Joint 4',
    defaultVal: 0,
    max: 60,
    min: -60,
    valUnit: '\u00b0',
  },
  { label: 'Gripper', defaultVal: 0, max: 100, min: 0, valUnit: '%' },
];
