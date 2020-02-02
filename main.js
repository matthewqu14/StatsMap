// The svg
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
// World map use this
var projection = d3.geoNaturalEarth1()
    .scale(800)
    .translate([1920,980]);

// US map use another projection

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

    // Add the path
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
        .style("stroke-width", 0);

    var paths = document.getElementsByClassName("line");
    top10array = [];
    percentarray = [];

    $(document).ready(function () {
        $('.state').hover(function () {
            statename = this.id.toString();
            top10.forEach(function (row) {
                if (statename === row.state) {
                    top10array = row.top10;
                    percentarray = row.percent;
                    console.log(top10array);
                }
            });
            for (i = 0; i < paths.length; i++) {
                for (j = 0; j < 10; j++) {
                    if (paths[i].classList.contains(top10array[j]) && paths[i].classList.contains(statename) && top10array[j] !== statename) {
                        paths[i].style.strokeWidth = percentarray[j]/2.0; //add some scale to make min and max line widths good
                    }
                }
            }
        },
        function () {
            for (i = 0; i < paths.length; i++) {
                paths[i].style.strokeWidth = 0;
            }
        });
    })
}