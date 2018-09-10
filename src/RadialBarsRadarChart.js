import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './App.css'
import './styles/css/RadialBarsRadarChart.css'

import { scaleLinear } from 'd3-scale'
import { axisRight } from 'd3-axis'
import { extent as d3extent } from 'd3-array'
import { select as d3select } from 'd3-selection'


class RadialBarsRadarChart extends Component {
  constructor(props){
    super(props)
    this.createBarChart = this.createChart.bind(this)

    const options = this.options = {
      extent: [10, 90],
      extentByData: false,
      extentByDataMax: true,
      tickCount: 8,
    }

    this.classNames = {
      root: 'radial-bar-chart-root',
      fgCircle: 'circle-grid',
      fgCircleFifty: 'circle-grid-middle',
      bgCircle: 'circle-grid-background',
      radialAxis: 'radial-axis',
      radialAxisTick: 'radial-axis-tick',
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
    // prepare SVG canvas
    const [canvas, renderHeight] = this.renderSvgRoot()
    const scales = this.generateUsableScales(renderHeight)
    const data = this.props.data
  
    // render background grid circles with alternate color
    canvas.selectAll('circleGridBackground')
      .data(scales.bgCircles.ticks(this.options.tickCount))
      .enter()
      .append('circle')
      .attr('r', d => scales.bgCircles(d))
      .attr('class', this.classNames.bgCircle)
      .classed('even', (d, i) => !(i % 2))    

    // render foreground grid circles
    canvas.selectAll('circleGridStroke')
      .data(scales.fgCircles.ticks(this.options.tickCount))
      .enter()
      .append('circle')
      .attr('r', d => scales.fgCircles(d))
      .attr('class', this.classNames.fgCircle)
      .classed(this.classNames.fgCircleFifty, (d, i) => d === 50)

    // render radial value axis
    canvas.selectAll('line')
      .data(data)
      .enter()
      .append('line')
      .attr('y2', -renderHeight)
      .attr('class', this.classNames.radialAxis)
      .attr('transform', (d, i) => `rotate(${i * 360 / data.length})`)

    // render value scale ticks
    const valueAxe = axisRight()
      .scale(scales.axisTicks)
      .ticks(this.options.tickCount)
      .tickFormat(d => d >= 20 ? d + ' %' : '')

    canvas.append('g')
      .attr('class', this.classNames.radialAxisTick)
      .call(valueAxe)
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
