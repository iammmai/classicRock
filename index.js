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
const nestedData = d3.nest()
    .key((d) => d.artist)
    .entries(data);

console.log(nestedData)

//Make the bubbl chart
const w = 800
const h = 1000

const svg = d3.select(".bubbleChart")
    .append("svg")
    .attrs({
        width: w,
        height: h
    })
    .style("z-index", "-1")
    .style("position", "absolute")

const radiusScale = d3.scaleSqrt()
    .domain([1,100])
    .range([3,80])

const getRadius = (d) => radiusScale(d.values.length)

const getColor = (d) => 
(d.values.length >= 20) ?  "#FFFFFF" 
: (d.values.length >= 10) ? "#FF2A8D"
: (d.values.length >= 5) ? "#A657EC" : "#75FFE0"

const circles = svg.selectAll(".artist")
    .data(nestedData)
    .enter()
    .append("circle")
    .attrs({
        "class": "artist",
        "fill": getColor,
        "r" : getRadius,
        "artist" : (d) => d.key
    })
    .on("mouseover", function(d) {
        let xpos = parseFloat(d3.select(this).attr("cx"))
        let ypos = parseFloat(d3.select(this).attr("cy"))

        d3.select(".tooltip")
            .style("display", "block")
            .style("left", xpos + "px")
            .style("top", ypos + "px")
            .select("p")
            .text(d.key)
    })
    .on("mouseout", function() {
        d3.select(".tooltip")
        .style("display", "none")
    })


//Define the force simulation
const ticked = function () {
    circles.attrs({
        "cx" : (d) => d.x ,
        "cy" : (d) => d.y
    })
}  

const simulation = d3.forceSimulation(nestedData)
    .force("center", d3.forceCenter(w/2, h/2))
    //.force("x", d3.forceX(w/2).strength(0.05))
    //.force("y", d3.forceY(h/2).strength(0.05))
    .force("charge", d3.forceManyBody().strength(-0.5))
    .force("collision", d3.forceCollide().radius(getRadius))
    
    .on("tick", ticked)

    
const getForceX = (d) =>
    (d.values.length >= 20) ? 400
    : (d.values.length >= 10) ? 800
    : (d.values.length >= 5) ? 400 : 800

const getForceY = (d) =>
    (d.values.length >= 20) ? 400
    : (d.values.length >= 10) ? 400
    : (d.values.length >= 5) ? 800 : 800

d3.select(".sort")
    .on("click", () => {
    simulation.force("y", d3.forceY(getForceY))
    .force("x", d3.forceX(getForceX))
    .force("collision", d3.forceCollide(Math.pow(getRadius,0.5)))
        .alphaTarget(0.1)
        .restart()
    }
    )