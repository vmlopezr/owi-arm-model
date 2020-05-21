import React from 'react';
import './App.scss';
import ThreeContainer from './components/ThreeContainer';

class App extends React.PureComponent {
  render(): JSX.Element {
    return (
      <div className="page">
        <ThreeContainer />
      </div>
    );
  }
}

export default App;
