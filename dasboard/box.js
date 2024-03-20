
// this is based on work from https://d3-graph-gallery.com/graph/boxplot_show_individual_points.html

// set the dimensions and margins of the SVG
let mar = {  top: 40,
    right: 100,
    bottom: 40,
    left: 20 };

let Continents = ['Africa', 'Asia', 'Europe', 'North America', 'Oceania',
  'South America'].sort();
// append the svg object to the body of the page
let box = d3.select("#panel3").select('.card').select('#chart3')
.select("svg")
.attr("width", w)
.attr("height", h)
.attr("viewBox", "-"
  + 1 + " -"
  + 1 + " "
  + (w +1 * 100) + " "
  + (h + 1 * 4))
.attr('margin', '.5rem')
.attr("style", "max-width: 100%; height: auto;")
.attr('preserveAspectRatio', 'xMidYMid')
.append("g")

;
// add chart title



// Read the data and compute summary statistics for each continent
d3.csv("bubbles.csv", function (data) {

  const n = w / 40;
  // Compute quartiles, median, interquartile range, min, and max for each continent
  let dataDesc = d3.group(d => d.continent)
                  .rollup(function (values) {
                    let sortedData = values.map(g => +g.deaths).sort(d3.ascending);
                    let q1 = d3.quantile(sortedData, 0.25);
                    let median = d3.quantile(sortedData, 0.5);
                    let q3 = d3.quantile(sortedData, 0.75);
                    let interQuartileRange = q3 - q1;
                    let min = d3.min(sortedData);
                    let max = d3.max(sortedData);
                    return { q1, median, q3, interQuartileRange, min, max };
                  })
                  .entries(data);

  // Define x scale
  const xScale = d3.scaleBand()
    .domain(Continents)
    .range([0, w])
    .paddingInner(1)
    .paddingOuter(.5);

  // Define y scale
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataDesc, d => d.value.max)])
    .range([h, 0]);

  // Append x-axis
  svg.append('g')
    .attr('transform', 'translate(0,' + h + ')')
    .call(d3.axisBottom(xScale));

  // Append y-axis
  svg.append('g')
    .call(d3.axisLeft(yScale));

  // Append boxplots
  svg.selectAll(".box")
    .data(dataDesc)
    .enter().append("rect")
    .attr("class", "box")
    .attr("x", d => xScale(d.key) - 40)
    .attr("y", d => yScale(d.value.q3))
    .attr("width", 80)
    .attr("height", d => yScale(d.value.q1) - yScale(d.value.q3))
    .style("fill", "#24BDE6")
    .style("stroke", "black");

  // Append median lines
  svg.selectAll(".median")
    .data(dataDesc)
    .enter().append("line")
    .attr("class", "median")
    .attr("x1", d => xScale(d.key) - 40)
    .attr("x2", d => xScale(d.key) + 40)
    .attr("y1", d => yScale(d.value.median))
    .attr("y2", d => yScale(d.value.median))
    .style("stroke", "red");

  // Append individual points
  svg.selectAll(".point")
    .data(data)
    .enter().append("circle")
    .attr("class", "point")
    .attr("cx", d => xScale(d.continent))
    .attr("cy", d => yScale(+d.deaths))
    .attr("r", 5)
    .style("fill", "#E64505")
    .style("stroke", "black");

  // Tooltip
  const tooltip = svg.append('g')
    .style("opacity", 0)
    .style("background-color", "#120536")
    .style("padding", "5px")
    .style("color", "white")
    .attr("font-size", 30)
    .style('position', 'absolute');

  svg.selectAll(".point")
    .on('mouseover', function (event, d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html("Min: " + d.value.min + "<br/>" +
        "Q1: " + d.value.q1 + "<br/>" +
        "Median: " + d.value.median + "<br/>" +
        "Q3: " + d.value.q3 + "<br/>" +
        "Max: " + d.value.max + "<br/>" +
        "IQR: " + d.value.interQuartileRange)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on('mouseout', function (d) {
      tooltip.transition().duration(500).style("opacity", 0);
    });
});

