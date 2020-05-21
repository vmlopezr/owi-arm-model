import React from 'react';
import '../App.scss';

interface Props {
  updateValue(index: number, value: number): void;
  value: number;
  index: number;
  label: string;
  defaultVal?: number;
  max?: number;
  min?: number;
  valUnit?: string;
  endEffectorYcor(): number;
  effectorIntersect(): boolean;
}
// Stop propagation to parent div event
const stopPropagation = (
  event:
    | React.MouseEvent<HTMLInputElement, MouseEvent>
    | React.TouchEvent<HTMLInputElement>
    | React.MouseEvent<HTMLDivElement, MouseEvent>
    | React.TouchEvent<HTMLDivElement>,
) => {
  event.stopPropagation();
};

const oppositeSigns = (num1: number, num2: number): boolean =>
  (num1 ^ num2) < 0;

const handleSliderChange = (
  props: Props,
  value: number,
  setValue: React.Dispatch<React.SetStateAction<number>>,
  changeDir: number,
  setChangeDir: React.Dispatch<React.SetStateAction<number>>,
) => (event: React.ChangeEvent<HTMLInputElement>) => {
  const ypos = parseFloat(props.endEffectorYcor().toFixed(1));
  const newValue = parseInt(event.target.value);
  const intersecting = props.effectorIntersect();
  if (ypos >= 0.5 && !intersecting) {
    setValue(newValue);
    setChangeDir(newValue - value);
    props.updateValue(props.index, newValue);
  } else {
    if (oppositeSigns(newValue - value, changeDir)) {
      props.updateValue(props.index, newValue);
    } else if (props.index === 0 && !intersecting)
      props.updateValue(props.index, newValue);
  }

  event.stopPropagation();
  event.preventDefault();
};
const ValueSlider = React.memo((props: Props) => {
  const [value, setValue] = React.useState(props.value);
  const [changeDir, setChangeDir] = React.useState(0);
  const valUnit = props.valUnit ? props.valUnit : '';
  return (
    <div className="slider-container">
      <div className="slider-label">
        <b>{props.label}</b>
      </div>
      <div
        className="sliderDiv"
        onMouseDown={stopPropagation}
        onMouseUp={stopPropagation}
        onTouchStart={stopPropagation}
        onTouchEnd={stopPropagation}
      >
        <input
          className="slider"
          type="range"
          value={props.value}
          onChange={handleSliderChange(
            props,
            value,
            setValue,
            changeDir,
            setChangeDir,
          )}
          min={props.min ? props.min : 0}
          max={props.max ? props.max : 0}
          step={1}
        />
      </div>
      <div className="slider-value">
        <b>{props.value + valUnit}</b>
      </div>
    </div>
  );
});
export default ValueSlider;
