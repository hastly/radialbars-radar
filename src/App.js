import React, { Component } from 'react';
import './App.css';

import BarChart from './components/RadialBarsRadarChart/RadialBarsRadarChart'
import highOrdered from './components/createSkipMarkedArgsSelector/createSkipMarkedArgsSelector'


class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Radial Bars Radar Chart</h2>
        </div>
        <div>
          <BarChart data={[55, 60, 70, 47, 60, 40, 72, 60, 56, 78, 70, 72]} optionsSet={'A'}/>
        </div>
      </div>
    );
  }
}

let mutationValueA = 0
let mutationValueB = 0

const fnA = (v) => {
  // check for ignore when value is null, true for ignore and don't recalculate
  if (v === null)
    return true
  return v * 3 + mutationValueA
}
const fnB = (v) => {
  if (v === null)
    return false
  return v / 2 + mutationValueB
}

const fnSummary = (a, b) => {
  if (a === null) {
    return (a, b) => a === b
  }
  return a + b
}

const processFunction = highOrdered(fnA, fnB, fnSummary)
console.log(processFunction(2))
console.log(processFunction(2))
mutationValueA = 1
console.log(processFunction(2))
console.log(processFunction(5))
mutationValueB = 1
console.log(processFunction(5))
console.log(processFunction(5))

export default App;
