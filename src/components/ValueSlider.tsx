import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
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
const ValueSlider = (props: Props) => {
  const [value, setValue] = React.useState(
    props.defaultVal ? props.defaultVal : 0,
  );

  const handleSliderChange = (event: React.ChangeEvent<{}>, value: any) => {
    setValue(value);
    props.updateValue(props.index, value);
    event.stopPropagation();
    event.preventDefault();
  };

  const valUnit = props.valUnit ? props.valUnit : '';
  return (
    <div className="slider">
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <b>{props.label}</b>
        </Grid>
        <Grid item xs>
          <Slider
            value={typeof value === 'number' ? value : 0}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            max={props.max ? props.max : 100}
            min={props.min ? props.min : 0}
          />
        </Grid>
        <Grid item>
          <b>{value + valUnit}</b>
        </Grid>
      </Grid>
    </div>
  );
};
export default ValueSlider;
