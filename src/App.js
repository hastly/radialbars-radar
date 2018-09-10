import React, { Component } from 'react';
import './App.css';

import BarChart from './RadialBarsRadarChart'


class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Radial Bars Radar Chart</h2>
        </div>
        <div>
          <BarChart data={[55, 60, 70, 47, 60, 40, 72, 60, 56, 78, 70, 72]} />
        </div>
      </div>
    );
  }
}


export default App;
