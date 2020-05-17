import React from 'react';
import '../App.scss';

interface Props {
  updateValue(index: number, value: number): void;
  index: number;
  label: string;
  defaultVal?: number;
  max?: number;
  min?: number;
  valUnit?: string;
}
const ValueSlider = React.memo((props: Props) => {
  const [value, setValue] = React.useState(
    props.defaultVal ? props.defaultVal : 0,
  );

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(parseInt(event.target.value));
    props.updateValue(props.index, parseInt(event.target.value));
    event.stopPropagation();
    event.preventDefault();
  };
  const onMouseDown = (
    event: React.MouseEvent<HTMLInputElement, MouseEvent>,
  ) => {
    // Stop propagation to parent div event
    event.stopPropagation();
  };
  const onMouseUp = (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    // Stop propagation to parent div event
    event.stopPropagation();
  };
  const onTouchStart = (event: React.TouchEvent<HTMLInputElement>) => {
    // Stop propagation to parent div event
    event.stopPropagation();
  };
  const onTouchEnd = (event: React.TouchEvent<HTMLInputElement>) => {
    // Stop propagation to parent div event
    event.stopPropagation();
  };
  const valUnit = props.valUnit ? props.valUnit : '';

  return (
    <div className="slider-container">
      <div className="slider-label">
        <b>{props.label}</b>
      </div>
      <div className="sliderDiv">
        <input
          className="slider"
          type="range"
          defaultValue={value}
          style={{ zIndex: 20 }}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onChange={handleSliderChange}
          min={props.min ? props.min : 0}
          max={props.max ? props.max : 0}
          step="1"
        />
      </div>
      <div className="slider-value">
        <b>{value + valUnit}</b>
      </div>
    </div>
  );
});
export default ValueSlider;
