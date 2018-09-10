import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './App.css'
import './styles/css/RadialBarsRadarChart.css'

import { scaleLinear } from 'd3-scale'
import { extent as d3extent } from 'd3-array'
import { select as d3select } from 'd3-selection'


class RadialBarsRadarChart extends Component {
  constructor(props){
    super(props)
    this.createBarChart = this.createChart.bind(this)

    const options = this.options = {
      extent: [30, 70],
      extentByData: false,
      extentByDataMax: true,
    }

    this.classNames = {
      root: 'radial-bar-chart-root',
    }

    const dataExtent = d3extent(this.props.data, d => d)
    if (options.extentByDataMax) {
	    dataExtent[0] = 0	
    }
    this.extent = options.extentByData ? dataExtent : options.extent
  }

  componentDidMount() {
    this.createChart()
  }

  componentDidUpdate() {
    this.createChart()
  }

  createChart() {
    const [svg, renderHeight] = this.renderSvgRoot()
    const scales = this.generateUsableScales(renderHeight)
  }

  render() {
    return <svg
      ref={node => this.node = node}
      className={this.classNames.root}
      >
      </svg>
  }

  renderSvgRoot() {
	  const svgRoot = d3select(this.node)

    var elem = ReactDOM.findDOMNode(this.node);
    const svgRootHeight = +elem.clientHeight
	  const renderHeight = svgRootHeight * 0.35

	  svgRoot.append("rect")
		  .attr('class', 'root-background')

  	const svg = svgRoot.append("g")
	  	.attr('class', 'work-area')
	
  	return [svg, renderHeight]
  }
  
  generateUsableScales(renderHeight) {
    const genericScale = () => scaleLinear().domain(this.extent)
    return {
      // scale to draw foreground circles
      fgCircles: genericScale().range([0, renderHeight]),
      // scale to draw background circles in reverse order
      bgCircles: genericScale().range([renderHeight, 0]),
      // scale to draw axis ticks
      axisTicks: genericScale().range([0, -renderHeight]),
    }	
  }
}


export default RadialBarsRadarChart