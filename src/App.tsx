import React from 'react';
import './App.scss';
import ModelControls from './components/ModelControls';
import ThreeContainer from './components/ThreeContainer';
interface State {
  robotValues: number[];
  showAxis: boolean;
  showLabels: boolean;
}
class App extends React.PureComponent<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      robotValues: [0, 0, 0, 0, 0],
      showAxis: false,
      showLabels: false,
    };
  }
  updateArmConfig = (index: number, value: number): void => {
    const config = this.state.robotValues.slice();
    config[index] = value;
    this.setState({ robotValues: config });
    console.log('arm config setstate');
  };
  updateAxis = (value: boolean): void => {
    this.setState({ showAxis: value });
    console.log('axis config setstate');
  };
  updateLabel = (value: boolean): void => {
    this.setState({ showLabels: value });
    console.log('label config setstate');
  };
  render(): JSX.Element {
    return (
      <div className="page">
        <ModelControls
          updateConfig={this.updateArmConfig}
          updateAxis={this.updateAxis}
          updateLabel={this.updateLabel}
        />
        <ThreeContainer {...this.state} />
      </div>
    );
  }
}

export default App;
