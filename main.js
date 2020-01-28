// The svg
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
var projection = d3.geoNaturalEarth1()
    .scale(800)
    .translate([1920,980]);

// A path generator
var path = d3.geoPath()
    .projection(projection);

// Load world shape AND list of connection
d3.queue()
    .defer(d3.json, "us_states.json")  // US shape
    //.defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")  // World shape
    .defer(d3.csv, "data/coordinates.csv")
    .await(ready);

function ready(error, dataGeo, data) {

    // Reformat the list of link. Note that columns in csv file are called long1, long2, lat1, lat2
    var link = [];
    var filteredData = data.filter(function (row) {
        return row.is_us === "true";
    });
    filteredData.forEach(function (row) {
        source = [+row.long1, +row.lat1];
        target = [+row.long2, +row.lat2];
        topush = {type: "LineString", coordinates: [source, target], places: [row.place1, row.place2]};
        link.push(topush);
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
            return d.properties.NAME;
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

    // Add circles at coordinates
    var place1 = svg.append('g').attr('class','place1');
    var place2 = svg.append('g').attr('class','place2');
    place1.selectAll("circle")
        .data(link)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return projection(d.coordinates[0])[0];
        })
        .attr("cy", function(d) {
            return projection(d.coordinates[0])[1];
        })
        .attr("class", function (d) {
            return "circle " + d.places[0] + " " + d.places[1];
        })
        .attr("r", 0)
        .attr("fill","none")
        .attr("stroke", "black");

    place2.selectAll("circle")
        .data(link)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return projection(d.coordinates[1])[0];
        })
        .attr("cy", function(d) {
            return projection(d.coordinates[1])[1];
        })
        .attr("class", function (d) {
            return "circle " + d.places[0] + " " + d.places[1];
        })
        .attr("r", 0)
        .attr("fill", "none")
        .attr("stroke", "black");

    var paths = document.getElementsByClassName("line");
    var circles = document.getElementsByClassName("circle");

    $(document).ready(function () {
            $('.state').hover(
                function () {
                    for (i = 0; i < paths.length; i++) {
                        if (paths[i].classList.contains(this.id.toString())) {
                            paths[i].style.strokeWidth = 2.25;
                        }
                    }
                    for (i = 0; i < circles.length; i++) {
                        if (circles[i].classList.contains(this.id.toString())) {
                            circles[i].style.r = 2;
                        }
                    }
                },
                function () {
                    for (i = 0; i < paths.length; i++) {
                        if (paths[i].classList.contains(this.id.toString())) {
                            paths[i].style.strokeWidth = 0;
                        }
                    }
                    for (i = 0; i < circles.length; i++) {
                        if (circles[i].classList.contains(this.id.toString())) {
                            circles[i].style.r = 0;
                        }
                    }
                }
            )
        }
    )
}