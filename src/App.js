import React, { Component } from 'react';
import './App.css';

import BarChart from './RadialBarsRadarChart'


class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Basic D3-React test</h2>
        </div>
        <div>
          <BarChart data={[1, 3, 5, 17]} size={[500, 500]} />
        </div>
      </div>
    );
  }
}


export default App;
