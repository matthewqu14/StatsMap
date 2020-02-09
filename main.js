// The svg
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
// Change scale and translate to move to correct place
var projection = d3.geoNaturalEarth1()
    .scale(800)
    .translate([2000,1000]);

// US map use another projection maybe (GEOAlbersUSA?)

// A path generator
var path = d3.geoPath()
    .projection(projection);

// Load world shape AND list of connection
d3.queue()
    .defer(d3.json, "us_states.json")  // US shape
    //.defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")  // World shape
    .defer(d3.csv, "data/centers.csv")
    .defer(d3.json, "data/top10.json")
    .await(ready);

function ready(error, dataGeo, data, top10) {

    // Reformat the list of link.
    // Draws all lines between every state
    var link = [];
    i = 0;
    data.forEach(function (row1) {
        data.forEach(function (row2, index)
        {
            if (index > i) {
                source = [+row1.long, +row1.lat];
                target = [+row2.long, +row2.lat];
                topush = {type: "LineString", coordinates: [source, target], places: [row1.state, row2.state]};
                link.push(topush);
            }
        });
        i++;
    });

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(dataGeo.features)
        .enter()
        .append("path")
        .attr("fill", "#b8b8b8")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .attr("class", "state")
        .attr("id", function (d) {
            // return d.properties.name; use for world map
            return d.properties.NAME; // use for US map
        })
        .style("stroke", "#fff")
        .style("stroke-width", 0.3);

    // Add the paths
    svg.selectAll("myPath")
        .data(link)
        .enter()
        .append("path")
        .attr("d", function (d) {
            return path(d)
        })
        .attr("class", function (d) {
            return "line " + d.places[0] + " " + d.places[1];
        })
        .attr("pointer-events", "none")
        .style("fill", "none")
        .style("stroke", "#ffdbea")
        // Makes paths invisible
        .style("stroke-width", 0);

    var place = svg.selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", function(d) {
            return "translate(" + projection([+d.long, +d.lat])[0] + "," + (projection([+d.long, +d.lat])[1] - 10) + ")"
        })
        .attr("id", function (d) {
            return "place" + d.state;
        })
        .append("text")
        .text("")
        .attr("id", function(d) {
            return "text" + d.state;
        })
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("font-family", "Verdana")
        .attr("font-size", "11px")
        .attr("display", "none");

    var paths = document.getElementsByClassName("line");
    top10array = [];
    percentarray = [];
    numarray = [];

    // Script to make lines visible on hover functionality
    $(document).ready(function () {
        $('.state').hover(function () {
            // On hover over state do all of this (chooses paths to draw and text to show)
            statename = this.id.toString();
            top10.forEach(function (row) {
                if (statename === row.state) {
                    top10array = row.top10;
                    percentarray = row.percent;
                    numarray = row.nummatches;
                }
            });
            for (i = 0; i < paths.length; i++) {
                for (j = 0; j < 10; j++) {
                    if (top10array[j] === statename) {
                        continue;
                    }
                    else if (paths[i].classList.contains(top10array[j]) && paths[i].classList.contains(statename)) {
                        // The scale right now is just divide percent by 2 which might not be suitable
                        // Depending on the data, make the scale probably have min strokeWidth 0.5 or 1 and max around 4
                        paths[i].style.strokeWidth = percentarray[j]/2.0;
                    }
                }
            }
            for (j = 0; j < 10; j++) {
                text = document.getElementById("text" + top10array[j]);
                text.style.display = "inline";
                text.textContent = ("Matches to " + top10array[j] + ": " + numarray[j])
                    .split("_").join(" ");
            }
        },
            // On hover off state do this (hides text and paths)
        function () {
            for (i = 0; i < paths.length; i++) {
                paths[i].style.strokeWidth = 0;
            }
            for (j = 0; j < 10; j++) {
                text = document.getElementById("text" + top10array[j]);
                text.style.display = "none";
            }
        });
    })
}