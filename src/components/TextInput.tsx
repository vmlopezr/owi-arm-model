import React, { memo, useState } from 'react';
import './styles/TextInput.scss';
interface TextInputProps {
  label: string;
  index: number;
  valueIndex: number;
  value: string;
  min: number;
  max: number;
  updateRobotValue(index: number, valueIndex: number, value: number): void;
}

// Stop propagation to parent div press, mouse events.
const stopPropagation = (
  event:
    | React.MouseEvent<HTMLFormElement, MouseEvent>
    | React.TouchEvent<HTMLFormElement>
    | React.TouchEvent<HTMLInputElement>
    | React.MouseEvent<HTMLInputElement, MouseEvent>,
) => {
  event.stopPropagation();
};

/* Verify that the text is a numeric value*/
const isNormalInteger = (text: string) => {
  const n = Math.floor(Number(text));
  return n !== Infinity && String(n) === text;
};

/* Detect whether the Enter key is press. Without this, the default action is
to reload the page. With the event, the target is blurred and sent up to the 
parent via props.                                                            */
const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (event.key === 'Enter') event.currentTarget.blur();
};

/* Update the values stored by the parent via a props callback */
const onBlur = (props: TextInputProps, value: string) => (
  event: React.FocusEvent<HTMLInputElement>,
) => {
  event.stopPropagation();
  event.preventDefault();

  /* Verify that the text is numberic*/
  if (!isNormalInteger(value)) {
    alert('The value must be numeric.');
    event.currentTarget.value = props.value;
    window.scrollTo(0, 0);
    return;
  }

  /* Verify that the input text numeric is within specific bounds*/
  const numValue = parseInt(value);
  if (numValue >= props.min && numValue <= props.max)
    // Update parent values
    props.updateRobotValue(props.index, props.valueIndex, numValue);
  else {
    alert(
      `The value must be within the boundaries. \nMin: ${props.min}    Max: ${props.max}`,
    );
    event.currentTarget.value = props.value;
  }

  // Scroll the window upwards because the keyboard moves the viewport.
  window.scrollTo(0, 0);
};

// Text Input component
export const TextInput = memo((props: TextInputProps) => {
  // Local value stored by the input
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
