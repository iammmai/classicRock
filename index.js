import { data } from './data.js'

const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))

const nestedData = d3.nest().key(d => d.artist).entries(data)

// Make the bubbl chart
const w = 900
const h = 1000

const svg = d3
  .select('.bubbleChart')
  .append('svg')
  .attrs({
    width: w,
    height: h
  })

const radiusScale = d3.scaleSqrt().domain([1, 100]).range([3, 80])

const getRadius = d => radiusScale(d.values.length)

const getColor = d =>
  (d.values.length >= 20
    ? '#FFFFFF'
    : d.values.length >= 10
        ? '#FF2A8D'
        : d.values.length >= 5 ? '#A657EC' : '#75FFE0')

const circles = svg
  .selectAll('.artist')
  .data(nestedData)
  .enter()
  .append('circle')
  .attrs({
    class: 'artist',
    fill: getColor,
    r: getRadius,
    artist: d => d.key
  })
  .on('mouseover', function (d) {
    let xpos = parseFloat(d3.select(this).attr('cx'))
    let ypos = parseFloat(d3.select(this).attr('cy'))
    d3.select('.tooltip')
      .style('display', 'block')
      .select('p')
      .text(d.key)
    svg.append('line')
      .attrs({
        x1: 105,
        x2: xpos,
        y1: 85,
        y2: 85,
        stroke: 'white'
      })
    svg.append('line')
      .attrs({
        x1: xpos,
        x2: xpos,
        y1: 85,
        y2: ypos,
        stroke: 'white'
      })  
    
  })
  .on('mouseout', function () {
    d3.select('.tooltip').style('display', 'none')
    d3.selectAll('line').style('display', 'none')
  })

// Define the force simulation
const ticked = function () {
  circles.attrs({
    cx: d => d.x,
    cy: d => d.y
  })
}

const size = d3
  .scaleThreshold()
  .domain([5, 10, 20])
  .range(['tiny', 'small', 'medium', 'large'])
const getSongNumber = d => d.values.length

const getHitClass = compose(size, getSongNumber)
const simulation = d3
  .forceSimulation(nestedData)
  .force('center', d3.forceCenter(w / 2, h / 2))
  //.force("x", d3.forceX(w/2).strength(0.05))
  //.force("y", d3.forceY(h/2).strength(0.05))
  .force('charge', d3.forceManyBody().strength(-0.5))
  .force('collision', d3.forceCollide().radius(getRadius))
  .on('tick', ticked)

const xForces = {
  tiny: w/2,
  small: w/2,
  medium: w/2,
  large: w/2,
}
const yForces = {
  tiny: h,
  small: 3*h/4,
  medium: h/4,
  large: 0
}

const getForceX = d => xForces[getHitClass(d)]
const getForceY = d => yForces[getHitClass(d)]


// sort the force layout by clicking the button
d3.select('.sort').on('click', () => {
  simulation
    .force('y', d3.forceY(getForceY).strength(0.3))
    .force('x', d3.forceX(getForceX).strength(0.3))
    .force('collision', d3.forceCollide(getRadius))
    .alphaTarget(0.1)
    .restart()

})

// Make the next chart
const chartHeight = 400
const chartWidth = w * 0.80
const padding = 50

const isBy = name => song => name == song.key

const hasYear = song => song.key !== 'null'

const songsByArtist = (songs, artist) => {
  const selected = songs.filter(isBy(artist))
  return selected[0].values
}

const isMostActive = artist => artist.values.length > 7

//the data:
const groupByYear = d3.nest()
.key(d => d.artist)
.key(d => d.releaseYear).sortKeys(d3.ascending)
.entries(data)

const newData = songsByArtist(groupByYear, 'Aerosmith').filter(hasYear)

const mostActiveArtists = groupByYear.filter(isMostActive)

// the scales:
const xScale = d3.scaleLinear()
.domain(
d3.extent(newData, d => parseFloat(d.key))
)
.range([padding, chartWidth - padding]);

const rScale = d3.scaleSqrt()
.domain(d3.extent(newData, d => d.values.length))
.range([10, 50])

//Define X axis
const xAxis = d3.axisBottom()
.scale(xScale)
.ticks(5)
.tickFormat(d3.format('.0f'))


//build the chart
const svgChart = d3.select('.timeChart')
  .append('svg')
  .attrs({
    width: chartWidth,
    height: chartHeight
  })

  svgChart.selectAll('circle')
    .data(newData)
    .enter()
    .append('circle')
    .attrs({
      cx: d => xScale(parseFloat(d.key)),
      cy: 200,
      r: d => rScale(d.values.length),
      fill: '#FF2A8D',
      opacity: 0.6
    })

    //Create X axis
    svgChart.append("g")
    .attrs({
      class: 'axis',
      transform: 'translate(0,' + (chartHeight - padding) + ')'
    })
    .call(xAxis);
      
    //create list
    const makeUl = array => {
      const list = document.createElement('ul')
      array.forEach(element => {
        const listItem = document.createElement('li')
        listItem.appendChild(document.createTextNode(element.key))
        list.appendChild(listItem)
      })
      return list
    }

    document.getElementById('left').appendChild(makeUl(mostActiveArtists))

    console.log(groupByYear)
    console.log(newData)
    console.log(mostActiveArtists)