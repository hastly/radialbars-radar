import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import '../../prebuild/RadialBarsRadarChart/styles/scss/RadialBarsRadarChart.css'

import { scaleLinear } from 'd3-scale'
import { axisRight } from 'd3-axis'
import { arc as d3arc } from 'd3-shape'
import { extent as d3extent } from 'd3-array'
import { range as d3range } from 'd3-array'
import { randomUniform } from 'd3-random'
import { select as d3select } from 'd3-selection'

function generateDataSequence() {
  return d3range( Math.round( randomUniform(1,16)() ) )
    .map(randomUniform(1,100))
    .map(Math.round)
}


class RadialBarsRadarChart extends Component {
  state = {
    data: generateDataSequence(),
    optionsSet: this.props.optionsSet || 'A',
  }

  classNames = {
    frame: 'radial-bar-chart',
    root: 'radial-bar-chart-root',
    fgCircle: 'circle-grid',
    fgCircleFifty: 'circle-grid-middle',
    bgCircle: 'circle-grid-background',
    radialAxis: 'radial-axis',
    radialAxisTick: 'radial-axis-tick',
    dataBar: 'data-bar',
    dataBarSelectedTemplate: 'data-bar-selected',
    dataBarSelectableTemplate: 'data-bar-selectable',
  }

  optionsSets = {
    A: {
      extent: [12, 90],
      extentByData: false,
      extentByDataMax: true,
      tickCount: 8,
      pullOut: false,
      carrots: 'none',
      hoverColor: 'A',
      selectedColor: 'B',
      hoverSelectedTheSameColor: true,
    },
    B: {
      extent: [10, 90],
      extentByData: false,
      extentByDataMax: true,
      tickCount: 8,
      pullOut: true,
      carrots: 'hardly',
      hoverColor: 'C',
      selectedColor: 'B',
      hoverSelectedTheSameColor: false,
    },
    C: {
      extent: [10, 90],
      extentByData: true,
      extentByDataMax: true,
      tickCount: 8,
      pullOut: true,
      carrots: 'sassy',
      hoverColor: 'B',
      selectedColor: 'C',
      hoverSelectedTheSameColor: false,
    },
  }

  constructor(props){
    super(props)
    this.createBarChart = this.createChart.bind(this)
    
    this.options = this.optionsSets[this.state.optionsSet]
    this.initFromOptions()
  }

  componentDidMount() {
    this.createChart()
  }

  componentDidUpdate() {
    this.initFromOptions()
    this.createChart()
  }

  componentWillUpdate(nextProps, nextState) {
    this.options = this.optionsSets[nextState.optionsSet]
  }

  createChart() {
    // prepare SVG canvas
    const [canvas, renderHeight] = this.renderSvgRoot()
    const scales = this.generateUsableScales(renderHeight)
    const data = this.state.data
  
    // render background grid circles with alternate color
    canvas.selectAll('circleGridBackground')
      .data(scales.bgCircles.ticks(this.options.tickCount))
      .enter()
      .append('circle')
      .attr('r', d => scales.bgCircles(d))
      .attr('class', this.classNames.bgCircle)
      .classed('even', (d, i) => !(i % 2))    

    // render data bars (segments)
    this.casualArc = d3arc()
      .startAngle((d, i) => this.computeSectorAngle(i))
      .endAngle((d, i) => this.computeSectorAngle(i + 1))
      .innerRadius(0)
      .outerRadius((d, i) => scales.fgCircles(d))
      .padAngle(this.padAngle)
      .cornerRadius(this.cornerRadius)
    
    this.pullOutArc = d3arc()
      .startAngle((d, i) => this.computeSectorAngle(i))
      .endAngle((d, i) => this.computeSectorAngle(i + 1))
      .innerRadius(7)
      .outerRadius((d, i) => scales.fgCircles(d) + 7)
      .padAngle(this.padAngle + 0.02)
      .cornerRadius(this.cornerRadius)      

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
      .attr('d', this.casualArc)

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
    return <div className={this.classNames.frame}>
        <svg
          ref={node => this.node = node}
          className={this.classNames.root}
        ></svg>
        <div className='flex-container'>
        <button className='flex-item' onClick={this.handleDefaultData.bind(this)}>Default Data</button>
        <button className='flex-item' onClick={this.handleRandomData.bind(this)}>Random Data</button>
        <select className='flex-item' onChange={this.handlePresetChange.bind(this)}>
          <option value="A">Preset A</option>
          <option value="B">Preset B</option>
          <option value="C">Preset C</option>
        </select>
        </div>
      </div>
  }

  handlePresetChange(ev) {
    this.setState({
      optionsSet: ev.target.value
    })
  }

  handleRandomData(ev) {
    this.setState({
      data: generateDataSequence()
    })
  }

  handleDefaultData(ev) {
    this.setState({
      data: this.props.data
    })
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

  initFromOptions() {
    const options = this.options

    // set data extent according to options
    let dataExtent = d3extent(this.state.data, d => d)
    dataExtent = options.extentByData ? dataExtent : options.extent
    // align extent by decimals
    const align = (val) => Math.round(val / 10) * 10
    this.extent = [(options.extentByData && options.extentByDataMax) ? 0 : align(dataExtent[0]), align(dataExtent[1])] 

    // set corners and pads according to options
    switch (options.carrots) {
      case 'hardly': {
        this.padAngle = 0.03
        this.cornerRadius = 3
        break
      }
      case 'sassy': {
        this.padAngle = 0.06
        this.cornerRadius = 7
        break
      }
      default: {
        this.padAngle = 0
        this.cornerRadius = 0
      }
    }
        
    //set highlight colors according to options
    const optionColors = new Set(['A', 'B', 'C'])
    const hoverColorSuffix = optionColors.has(options.hoverColor) ? options.hoverColor : 'A'
    const selectedColorSuffix = optionColors.has(options.selectedColor) ? options.selectedColor : 'A'
    this.classNames.dataBarSelectable = this.classNames.dataBarSelectableTemplate + hoverColorSuffix
    if (options.hoverSelectedTheSameColor) {
      this.classNames.dataBarSelected = this.classNames.dataBarSelectedTemplate + hoverColorSuffix
    } else {
      this.classNames.dataBarSelected = this.classNames.dataBarSelectedTemplate + selectedColorSuffix
    }
  
  }

  computeSectorAngle(index) {
    return (index * 2 * Math.PI) / this.state.data.length
  }

  resetBarOnDeselect(element, d, i) {
    const iterElement = d3select(element)
    if (iterElement.classed(this.classNames.dataBarSelected)) {
      iterElement.attr('d', this.casualArc(d, i))
    }	
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
    const that = this
    d3select(element.parentNode)
      .selectAll(`.${cls}`)
      .each(function(d, i) {
        if (that.options.pullOut) {
          that.resetBarOnDeselect(this, d, i)
        }
      })
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
      if (this.options.pullOut) {
        thisElement.attr('d', this.casualArc(d, i))
      }
    } else {
      if (this.options.pullOut) {
        thisElement.attr('d', this.pullOutArc(d, i))
      }
	}

  }
}


export default RadialBarsRadarChart
