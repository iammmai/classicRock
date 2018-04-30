import { data } from './data.js'
/* function to return a grouped dataset, but was easier with d3.nest()
function getCounted(data){
    const getArtist = function(obj) {
        return obj.artist
    }
    const counted = data.reduce(function(countedSongs, currentSong) {
        const artistName = getArtist(currentSong)
        if (artistName in countedSongs) {
            countedSongs[artistName]++
        } else {
            countedSongs[artistName] = 1
        }
        return countedSongs
    }, {})
    return counted
}

const dataset = getCounted(data)
*/
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))

const nestedData = d3.nest().key(d => d.artist).entries(data)

console.log(nestedData)

// Make the bubbl chart
const w = 800
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
const padding = 20

const groupByYear = d3.nest()
  .key(d => d.artist)
  .key(d => d.releaseYear).sortKeys(d3.ascending)
  .entries(data)

console.log(groupByYear)
const xScale = d3.scaleLinear()
  .domain([
  d3.min(groupByYear, function(d) { return d.values; }),
  d3.max(groupByYear, function(d) { return d.values; })
  ])
.range([padding, w - padding]);

const svgChart = d3.select('.timeChart')
  .append('svg')
  .attrs({
    width: w,
    height: h
  })

  svgChart.selectAll('circle')
    .data(groupByYear)
    .enter()
    .append('circle')
    .attrs({
      cx: d => xScale(d.values),
      cy: 200,
      r: 20
    })