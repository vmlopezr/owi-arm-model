import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import React from 'react';

interface Props {
  updateValue(value: number): void;
  label: string;
  defaultValue?: number;
  max?: number;
  min?: number;
}
const ValueSlider = (props: Props) => {
  const [value, setValue] = React.useState(
    props.defaultValue ? props.defaultValue : 0,
  );

  const handleSliderChange = (event: React.ChangeEvent<{}>, value: any) => {
    setValue(value);
    props.updateValue(value);
  };

  return (
    <div>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
      />
      <Typography id="input-slider" gutterBottom>
        Volume
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <h2>{props.label}</h2>
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
          <p>{value}</p>
        </Grid>
      </Grid>
    </div>
  );
};
export default ValueSlider;
