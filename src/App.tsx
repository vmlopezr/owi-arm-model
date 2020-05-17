import React from 'react';
import './App.scss';
import ThreeContainer from './components/ThreeContainer';

class App extends React.PureComponent {
  constructor(props: any) {
    super(props);
    this.state = {
      robotValues: [0, 0, 0, 0, 0],
      showAxis: false,
      showLabels: false,
    };
  }

  render(): JSX.Element {
    return (
      <div className="page">
        <ThreeContainer />
      </div>
    );
  }
}

export default App;
