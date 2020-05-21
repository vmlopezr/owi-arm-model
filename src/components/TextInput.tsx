import React, { memo, useState } from 'react';
import { RobotValueKey } from './AnimatePanel';
import './styles/TextInput.scss';
interface TextInputProps {
  label: string;
  index: number;
  property: RobotValueKey;
  value: string;
  min: number;
  max: number;
  updateRobotValue(index: number, key: RobotValueKey, value: number): void;
}
const stopPropagation = (
  event:
    | React.MouseEvent<HTMLFormElement, MouseEvent>
    | React.TouchEvent<HTMLFormElement>
    | React.TouchEvent<HTMLInputElement>
    | React.MouseEvent<HTMLInputElement, MouseEvent>,
) => {
  event.stopPropagation();
};
const isNormalInteger = (text: string) => {
  const n = Math.floor(Number(text));
  return n !== Infinity && String(n) === text;
};
const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (event.key === 'Enter') event.currentTarget.blur();
};
const onBlur = (props: TextInputProps, value: string) => (
  event: React.FocusEvent<HTMLInputElement>,
) => {
  event.stopPropagation();
  event.preventDefault();
  if (!isNormalInteger(value)) {
    alert('The value must be numeric.');
    event.currentTarget.value = props.value;
    window.scrollTo(0, 0);
    return;
  }
  const numValue = parseInt(value);
  if (numValue >= props.min && numValue <= props.max)
    props.updateRobotValue(props.index, props.property, numValue);
  else {
    alert(
      `The value must be within the boundaries. \nMin: ${props.min}    Max: ${props.max}`,
    );
    event.currentTarget.value = props.value;
  }
  window.scrollTo(0, 0);
};
export const TextInput = memo((props: TextInputProps) => {
  const [robotValue, updateRobotValue] = useState('0');
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateRobotValue(event.target.value);
    event.stopPropagation();
  };

  React.useEffect(() => {
    updateRobotValue(props.value);
  }, [props.value]);
  return (
    <form
      onMouseUp={stopPropagation}
      onTouchEnd={stopPropagation}
      onMouseDown={stopPropagation}
      onTouchStart={stopPropagation}
    >
      <div className="label">
        <p>{props.label}</p>
      </div>
      <div className="input">
        <input
          type="number"
          onChange={onChange}
          value={robotValue}
          max={props.max}
          min={props.min}
          onBlur={onBlur(props, robotValue)}
          onKeyDown={handleKeyDown}
          onMouseUp={stopPropagation}
          onTouchEnd={stopPropagation}
          onMouseDown={stopPropagation}
          onTouchStart={stopPropagation}
        ></input>
      </div>
    </form>
  );
});
