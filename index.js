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
    .key(function(d) { return d.artist; })
    .entries(data);

console.log(nestedData)

//Make the bubbl chart
const w = 800
const h = 800

const svg = d3.select(".bubbleChart")
    .append("svg")
    .attrs({
        width: w,
        height: h
    })

const radiusScale = d3.scaleSqrt()
    .domain([1,100])
    .range([3,80])

const getRadius = function(d) {
    return radiusScale(d.values.length)
}

//const getRadius = function (d) { return d.values.length *1.2}
const getColor = function (d) {
    if(d.values.length >= 20) {
        return "#FFFFFF"
    } else if (d.values.length >= 10) {
        return "#FF2A8D"
    } else if (d.values.length >= 5) {
        return "#A657EC"
    } else {
        return "#75FFE0"
    }
}

const circles = svg.selectAll(".artist")
    .data(nestedData)
    .enter()
    .append("circle")
    .attrs({
        "class": "artist",
        "fill": getColor,
        "r" : getRadius,
        "artist" : function (d) { return d.key}
    })


//Define the force simulation
const ticked = function () {
    circles.attrs({
        "cx" : function(d) { return d.x },
        "cy" : function(d) { return d.y }
    })
}  

const simulation = d3.forceSimulation(nestedData)
    .force("center", d3.forceCenter(w/2, h/2))
    .force("charge", d3.forceManyBody().strength(-0.5))
    .force("collision", d3.forceCollide().radius(getRadius))
    .on("tick", ticked)

 