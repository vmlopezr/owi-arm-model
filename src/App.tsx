import React from 'react';
import './App.scss';
import ThreeContainer from './components/ThreeContainer';
import ValueSlider from './components/ValueSlider';
interface State {
  angles: number[];
}
class App extends React.PureComponent<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      angles: [0, 0, 0, 0],
    };
  }
  updateAngle1 = (value: number) => {
    const angles = this.state.angles.slice();
    angles[0] = value;
    this.setState({ angles: [...angles] });
  };
  updateAngle2 = (value: number) => {
    const angles = this.state.angles.slice();
    angles[1] = value;
    this.setState({ angles: [...angles] });
  };
  updateAngle3 = (value: number) => {
    const angles = this.state.angles.slice();
    angles[2] = value;
    this.setState({ angles: [...angles] });
  };
  updateAngle4 = (value: number) => {
    const angles = this.state.angles.slice();
    angles[3] = value;
    this.setState({ angles: [...angles] });
  };
  render(): JSX.Element {
    return (
      <div className="page">
        <div className="controls">
          <h1>Typescript react app</h1>
          <h1>TESTING THE </h1>
          <ValueSlider
            updateValue={this.updateAngle1}
            label={'Joint 1'}
            min={-135}
            max={135}
          />
          <ValueSlider
            updateValue={this.updateAngle2}
            label={'Joint 2'}
            max={85}
            min={-85}
          />
          <ValueSlider
            updateValue={this.updateAngle3}
            label={'Joint 3'}
            max={135}
            min={-135}
          />
          <ValueSlider
            updateValue={this.updateAngle4}
            label={'Joint 4'}
            max={60}
            min={-60}
          />
        </div>

        <ThreeContainer angles={this.state.angles} />
      </div>
    );
  }
}

export default App;
