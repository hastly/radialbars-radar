import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './App.css'
import './styles/css/RadialBarsRadarChart.css'

import { scaleLinear } from 'd3-scale'
import { axisRight } from 'd3-axis'
import { arc as d3arc } from 'd3-shape'
import { extent as d3extent } from 'd3-array'
import { select as d3select } from 'd3-selection'


class RadialBarsRadarChart extends Component {
  classNames = {
    root: 'radial-bar-chart-root',
    fgCircle: 'circle-grid',
    fgCircleFifty: 'circle-grid-middle',
    bgCircle: 'circle-grid-background',
    radialAxis: 'radial-axis',
    radialAxisTick: 'radial-axis-tick',
    dataBar: 'data-bar',
    dataBarSelected: 'data-bar-selected',
    dataBarSelectable: 'data-bar-selectable',
  }

  constructor(props){
    super(props)
    this.createBarChart = this.createChart.bind(this)

    const options = this.options = {
      extent: [10, 90],
      extentByData: false,
      extentByDataMax: true,
      tickCount: 8,
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

    // render data bars (segments)
    const arc = d3arc()
      .startAngle((d, i) => this.computeSectorAngle(i))
      .endAngle((d, i) => this.computeSectorAngle(i + 1))
      .innerRadius(0)
      .outerRadius((d, i) => scales.fgCircles(d))
    
    const that = this
    canvas.selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .on('click', function(d, i) {
        that.processHighlightClicks(this, d, i)
      })
      .classed(this.classNames.dataBar, true)
      .classed(this.classNames.dataBarSelectable, true)
      .attr('d', arc)

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

  computeSectorAngle(index) {
    return (index * 2 * Math.PI) / this.props.data.length
  }

  processHighlightClicks(element, d, i) {
    // shortcuts to elements and class names
    const thisElement = d3select(element)
    const cls = this.classNames.dataBar
    const clsSelected = this.classNames.dataBarSelected
    const clsSelectable = this.classNames.dataBarSelectable
    // trigger state flag
    const newState = !thisElement.classed(clsSelected)
  
    // for all data bars:
    // - turn off previous selection
    // - disable highlight on hover if element selected
    d3select(element.parentNode)
      .selectAll(`.${cls}`)
      .classed(clsSelected, false)
      .classed(clsSelectable, !newState)
  
    // trigger selection class on element
    thisElement.classed(clsSelected, newState)
    // disable hover highlighting for current element if state
    // has been triggered to off-state to indicate response on 
    // user action, or else it would be unclear for user that action
    // was processed
    thisElement.classed(clsSelectable, newState)

    if (!newState) {
      // turn on standard hover highlighting when leaving element
      thisElement.on('mouseleave', function() {
        thisElement.classed(clsSelectable, true)
        thisElement.on('mouseleave', null)
      })
    }
  }
}


export default RadialBarsRadarChart
