import React from 'react';
import './App.scss';
import ModelControls from './components/ModelControls';
import ThreeContainer from './components/ThreeContainer';
interface State {
  robotValues: number[];
}
class App extends React.PureComponent<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = { robotValues: [0, 0, 0, 0, 0] };
  }
  updateArmConfig = (index: number, value: number): void => {
    const config = this.state.robotValues.slice();
    config[index] = value;
    this.setState({ robotValues: config });
  };
  render(): JSX.Element {
    return (
      <div className="page">
        <ModelControls updateConfig={this.updateArmConfig} />
        <ThreeContainer robotValues={this.state.robotValues} />
      </div>
    );
  }
}

export default App;
