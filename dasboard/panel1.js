// set the dimensions and margins of the graph
// set the dimensions and margins of the graph
const margin = {
  top: 40,
  right: 100,
  bottom: 40,
  left: 20
};
const w = 1100 - margin.left - margin.right;
const h = 800 - margin.top - margin.bottom;

// append the svg object to the body of the page
const chart = d3.select('#panel1')
  .select(".card").select("#bub")
  .select("svg")
  .attr("width", w)
  .attr("height", h)
  .attr("viewBox", "-"
    + 1 + " -"
    + 1 + " "
    + (w +1 * 100) + " "
    + (h + 1 * 4))
  .attr('margin', '.5rem')
  .attr('preserveAspectRatio', 'xMidYMid')
  .attr("style", "max-width: 100%; height: auto;")
 
  .append("g")
  ;
  // read the data
  /* Load Data: The code starts by loading data from a JSON file 
  named "data.json" using d3.json(). 
  The loaded data is then passed to a callback function via the then() method. */
  d3.json("data.json").then((data) => {
          
            /************************************************************************
                                      //set the Y-axis
          Sets up the y-axis of the chart. It calculates the maximum y-value (maximum 
            fatality rate) from the data, creates a linear scale (yScale), and 
            appends the y-axis to the chart.
          ***********************************************************************/
          const maxY = d3.max(data.map((d) => (d.Fatality)));
          const yScale = d3.scaleLinear()
              .domain([0, maxY+5])
              .range([h - 70, -30])
              .nice();
          const yAxis = d3.axisLeft(yScale).ticks(10).tickSizeOuter(0);
          const yAxisGroup = chart.append('g')
              .attr('transform', 'translate(80,10)')//translate(x,y)
              .call(yAxis);
          yAxisGroup.append("text")
              .text("Fatality Rate(%)")
              .attr("y", h / 2 - 10)
              .attr("transform", "translate(-400,300) rotate(270)")
              .style("fill", "blue")
              .attr("font-size", 20)
              .attr("text-anchor", "middle");

          /************************************************************************
                                      //set the X-axis
          Sets up the x-axis of the chart. Similar to the y-axis, it calculates 
          the maximum x-value (maximum vaccinations), creates a linear scale (xScale),
           and appends the x-axis to the chart.
          ***********************************************************************/
          const maxX = d3.max(data.map((d) => (d.Cases/100000000)));
          const xScale = d3.scaleLinear()
              .domain([0, maxX])
              .range([0, w - 70])
              .nice();
          const xAxis = d3.axisBottom(xScale).ticks(6).tickSizeOuter(0);
          const xAxisGroup = chart.append('g')
              .attr('transform', 'translate(80,660)')
              .call(xAxis);
          xAxisGroup.append("text")
              .text("No of Cases (X 100000000))")
              .attr("x", w / 2 + 50)
              .attr("y", 60)
              //.attr('transform', 'translate(300,565)')
              .style("fill", "blue")
              .attr("font-size", 20)
              .attr("text-anchor", "middle");
            /*************************************************************
                   Bubble property  
              Sets up properties for the bubbles in the chart, including scale 
              for size (z) based on the number of deaths and scale for color (locationColor) 
              based on the continent.            
              ***************************************************************/
            // Scale for size
            
            const z = d3.scaleLinear()
              .domain([0, d3.max(data, (d) => +d.Deaths)])
              .range([1, 40]);
  
            // Scale for color
            //const Continents = Array.from(data, (d) => d.continent);
            const locationColor = d3.scaleOrdinal()
              .domain(['Africa', 'Asia', 'Europe', 'North America', 'Oceania',
              'South America'])
              .range(d3.schemeSet2);
             /*************************************************************
                  tooltip               
             ***************************************************************/
            
               
            // tooltip:hidden by default:
            const tooltip = d3
            .select("#bub").append('div')
            .style("opacity", 0)
            .classed("tooltip", true)
            .style("background-color", "black")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("color", "white")
            .style('position', 'absolute')
            ;
          //Mouseover Event Handler (mouseover):

          /* This event handler function is called when the user hovers over a bubble.
          It transitions the tooltip to become visible (opacity: 1) and updates its content to displayed
          relevant information about the hovered data point (country).
          Information displayed includes the country name (d.location), number of cases (d.Cases), total deaths
          (d.T_Deaths), total vaccinations (d.T_Vaccinations), and fatality ratio (d.Fatality). 
          This information is retrieved from the data associated with the hovered bubble (d).
          The tooltip is positioned near the mouse cursor using the event.x and event.y properties, 
          with a slight offset (+15px) to prevent it from overlapping the cursor. */
          const mouseover = (event, d) => {
            tooltip.transition().duration(500);
            tooltip
              .style("opacity", 1)
              .html("Country: " + d.location + " <br/> " + "Cases: "+ d.Cases +" <br/> "+ "Deaths: "+ d.T_Deaths + " <br/> " + "Vaccinations: "+ d.T_Vaccinations +" <br/> "+ "Fatality Ratio: "+ d.Fatality)
              .style("left", event.x + 0 + "px")
              .style("top", event.y + 0 + "px")
              //.style("left", `${d3.pointer(this)[0] + 100}px`)
            //.style("top", `${d3.pointer(this)[1] + 100}px`)
          };
          /* Mousemove Event Handler (mousemove):

        This event handler function is called when the user moves their mouse while hovering over a bubble.
        It updates the position of the tooltip to follow the mouse cursor using the style() 
        method to set the left and top CSS properties.
        The tooltip is positioned slightly offset from the cursor (+15px) to avoid obstructing it. */
          const movemouse = (event, d) => {
            tooltip
            .style("left", `${d3.pointer(this)[0] + 0}px`)
            .style("top", `${d3.pointer(this)[1] + 0}px`)
           
          };
 /*          Mouseleave Event Handler (mouseleave):

        This event handler function is called when the user moves their mouse 
        away from a bubble, ending the hover event.It transitions the tooltip to become 
        hidden (opacity: 0) over a short duration (200ms), making it disappear smoothly. */

          const mouseleave = (event, d) => {
            tooltip.transition()
            .duration(200)
            .style("opacity", 0);
          };

           // ---------------------------//
          //       HIGHLIGHT GROUP      //
          // ---------------------------//
     
        // What to do when one group is selected
  const Selected = function(event, d) {
    const checked = this.value; // value of the selected
    console.log(checked)
    // When 'World' is selected, display all continents
    if (checked === "World") {
        chart.transition().duration(500)
            .selectAll('.bubbles') // Select all bubbles
            .style("opacity", 1); // Set opacity to 1 for all bubbles
    } else {
        // Hide bubbles of continents other than the selected one
        chart.selectAll('.bubbles')
            .filter((d) => d.continent !== checked) // Filter out bubbles not matching the selected continent
            .transition().delay(100).duration(2500)
            .style("opacity", 0); // Hide bubbles

        // Show bubbles of the selected continent
        chart.selectAll('.bubbles')
            .filter((d) => d.continent === checked) // Filter bubbles matching the selected continent
            .transition().duration(2500)
            .style("opacity", 1); // Show bubbles
    }
  }


    /************************************************************************
                        DRAW chart 
                        
***********************************************************************/

    
    //const dots = d3.append('g').attr("transform", "translate(-90,50)");
    chart
    .selectAll("dot")
    .data(data)
      .join("circle")
      .attr("class", (d) => "bubbles " + d.location)
      .attr('cx', (d, i) => xScale(d.Cases/100000000))
      .attr('cy', (d, i) => yScale(d.Fatality))
      .attr('r', (d) => z(d.Fatality) * 2)
      .style("fill", (d) => locationColor(d.continent))
      .attr('transform', 'translate(85,5)')
      .on("mouseover", mouseover)
      .on("mousemove", movemouse)
      .on("mouseleave", mouseleave);

    // ---------------------------//
    //       dropdown           //
    // ---------------------------//
//function to show or hide elements based on radio selection 
/* function Selected() {
checked = this.value //value of solected Radibutton
//when the world is selected display all
if (checked == "World") {
  world
    .transition().duration(500)
    .style("opacity", 1)
  //for each selelected continent.....
  //hide other continents
} else {
  world
    .filter((d) => (d.properties.continent != checked))
    .transition().delay(100).duration(2500)
    .style("opacity", 0);

  //show only selected continent
  world
    .filter((d) => (d.properties.continent == checked))
    .transition().duration(2500)
    .style("opacity", 1);
}
} */

const Continents = ['World', 'Africa', 'Asia', 'Europe', 'North America', 'Oceania',
        'South America'];
// Create a dropdown menu for selecting continents
const dropdown = d3.select('#selectButton')
.append('select') // Use <select> element for dropdown
.on('change', Selected)

  // Perform actions based on the selected continent
  // For example, filter the data based on the selected continent
  // and update the visualization accordingly
;
// Add options for each continent to the dropdown
dropdown.selectAll('option')
.data(Continents)
.enter()
.append('option')
.attr('value', (d) => d)
.text((d) => d);

  })