// The svg is based on data from our world in data
/* Hannah Ritchie, Edouard Mathieu, Lucas Rodés-Guirao,
 Cameron Appel, Charlie Giattino, Esteban Ortiz-Ospina,
 Joe Hasell, Bobbie Macdonald, Diana Beltekian and Max Roser (2020) -
  "Coronavirus Pandemic (COVID-19)". 
  Published online at OurWorldInData.org. 
  Retrieved from: 'https://ourworldindata.org/coronavirus'  */
//color sheme source:https://github.com/d3/d3-scale-chromatic
/*Inspiration sources: 
https://d3-graph-gallery.com/graph/choropleth_hover_effect.html,
https://bl.ocks.org/d3noob/82f4db23d47971c74699abb5f4bf8204*/
/***************************************************************
           The SVG
***************************************************************/
//the dimensions
var colorScale;

let countryData, Fatalities;

const adj = 4;
const keys = ["Very low", "Low", "Average", "High"];

// append the svg object to the body of the page
const map = d3.select('#panel2')
          .select(".card").select("#map")
          .select("svg")
          .attr("width", w)
          .attr("hightght", h)
          .attr("viewBox", "-"
            + adj + " -"
            + adj + " "
            + (w +adj * 80) + " "
            + (h + adj * 2))
          .attr('margin', '.5rem')
          .attr('preserveAspectRatio', 'xMidYMid')
          .attr("style", "max-width: 100%; hightght: auto;")
          .append("g")
          ;


/***************************************************************
            tooltip
***************************************************************/
const maptip = d3
  .select(".cardbody")
  .append('div')
  
  .style("opacity", 0)
  .classed("tooltip", true)
  .style("background-color", "black")
  .style("border-radius", "5px")
  .style("padding", "10px")
  .style("color", "white")
  .style('position', 'absolute')
  ;

/**********************************************************
 *  Projections
 ************************************************************/
const projection = d3.geoMercator()
  .center([-30, 20])
  .scale(180)
  .rotate([0, 0])
  .translate([w / 2, h / 2]);
const path = d3.geoPath()
  .projection(projection);
/**********************************************************
 *  Add data
 ************************************************************/
d3.json("custom.geojson").then(Geo => {
  //source https://geojson-maps.ash.ms/
  // tooltip:hidden by default:
  //const Continents = Geo.features.map((d) => (d.properties.continent));
  const mouseover = function (event, d,) {
    const clicked = this.id,
      selected = countryData.filter(function (d) {
        return (d.location == clicked);
      });

    //console.log(clicked);
    function update(d) {

      return "Country: " + selected[0].location + " <br/> "
        + "Cases: " + selected[0].Cases + " <br/> "
        + "Deaths: " + selected[0].Deaths + " <br/> "
        + "Vaccinations: " + selected[0].Vaccinations + " <br/> "
        + "Fatality Rate(%): ~ " + selected[0].Fatality
    };

 
    maptip.transition().duration(500);
    maptip
      .style("opacity", 1)
      .html(update)
      .style("left", `${event.x -900}px`)
      .style("top", `${event.y +10}px`);

  };
  const movemouse = (event, d) => {
    maptip
      .style("left", d3.event(this) + 10)
      .style("top", d3.event(this) + 10);
  };
  const mouseleave = (event, d) => {
    maptip.transition()
      .duration(200)
      .style("opacity", 0);


  };

  const colorMap = {
    1: "very low",
    2: "low",
    3: "average",
    4: "high"
  }

  d3.csv("ica.csv", function (d) {
    return ({
      location: d.location,
      Vaccinations: +d.T_Vaccinations,
      Deaths: +d.T_Deaths,
      Cases: +d.Cases,
      Fatality: +d.Fatality,
      n: +d.n,
      v: +d.v
    });
  }).then(data => { //https://ourworldindata.org/coronavirus

    countryData = data;


    /*************************************************************
           map colors
      ***************************************************************/

    const minColor = d3.min(data, (d) => +d.Fatality)
    const maxColor = d3.max(data, (d) => +d.Fatality)


    const color = d3.scaleOrdinal(d3.interpolateReds(4))
      .domain(keys)
      .range(d3.schemeReds[4])
    // console.log(maxColor)
    colorScale = color;


    const minVax = d3.min(data, (d) => +d.Vaccinations)
    const maxVax = d3.max(data, (d) => +d.Vaccinations)
    const color2 = d3.scaleOrdinal()
      .domain(keys)
      .range(d3.schemeGreens[4])
    //console.log(minVax, maxVax);
   /* const minDeaths = d3.min(data, (d) => +d.Deaths)
    const maxDeaths = d3.max(data, (d) => +d.Deaths)
    const color3 = d3.scaleOrdinal()
      .domain([minDeaths, maxDeaths])
      .range(d3.schemeGreys[4])  */
    //console.log(minDeaths, maxDeaths);

    /*************************************************************
           Draw the map
      ***************************************************************/
    //console.log(countryData)

    //create the zoom effect
    // Draw the map
    const world = map
      .append("g")
      .selectAll("path")
      .data(Geo.features)
      .enter()
      .append("path")
      .attr("id", (d) => d.properties.name)
      .attr("fill", function (d) {
        const countryObj = countryData.filter(
          function (row) {
            return row.location === d.properties.name;
          })[0]
        if (countryObj === undefined)
          console.log(d.properties.name)
        return color(countryObj === undefined ? "low" : colorMap[countryObj.n])
      })
      .attr('d', path)
      //.attr("d", d3.geoPath()
      // .projection(projection))
      .style("stroke", "black")
      .attr("stroke-width", 2)
      .style("opacity", 1)
      .attr("transform", `translate(10,0) scale(1)`)
      .on("mouseover", mouseover)
      .on("mousemove", movemouse)
      .on("mouseleave", mouseleave)

      ;
    // ------------------------------------------//
    //       radioButton Selector                //
    // ------------------------------------------//

    const metric = ['Fatalities', 'Vaccinations'];

    //function to show or hide elements based on radio selection 
    function updateRadio() {
      checked = this.value //value of solected Radibutton
      //when the world is selected display all
      if (checked == "Fatalities") {
        world.transition().duration(1500)
        .attr("fill", (d) => {
            const countryObj = countryData.filter(
              function (row) {
                return row.location === d.properties.name;
              })[0];
            if (countryObj === undefined)
              console.log(d.properties.name);
            return color(countryObj === undefined ? "low" : colorMap[countryObj.n]);
          })
        gradient.style("fill", (d) => color(d));
        //for each selelected continent.....
        //hide the unselected bubbles
      } else if (checked == "Vaccinations") {
        world
          .transition().duration(1500)
          .attr("fill",function (d) {
            const countryObj = countryData.filter(
              (row) => row.location === d.properties.name)[0]
            if (countryObj === undefined)
              console.log(d.properties.name)
            return color2(countryObj === undefined ? "low" : colorMap[countryObj.v])
            });
        gradient.style("fill", (d) => color2(d));

        /*     } else if (checked == "Deaths") {
              world
                .transition(30).duration(1500)
                .attr("fill", color3);
                
                gradient.style("fill", (d) => color3(d));
            } */
      }
    }

    //create radio buttons
    const radioButtons = d3
      .select('#map')
      .selectAll('radio')
      .data(metric)
      .enter()
      .append('radio');
    //put them in a row add add text
    radioButtons
      .append('span')
      .text((d) => d);
    //attach the data to the buttons for text value
    radioButtons
      .append('input')
      .attr('type', 'radio')
      .classed('radio', true)
      .attr("value", (d) => d)
      .attr('name', "metric")
      .on('click', updateRadio);

    //create buttons to highlight continents
    const Continents = ['World', 'Africa', 'Asia', 'Europe', 'North America', 'Oceania',
      'South America'];
    //function to show or hide elements based on radio selection 
    function highlight() {
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
          .transition().delay(50).duration(2500)
          .style("opacity", 0);

        //show only selected continent

        world
          .filter((d) => (d.properties.continent == checked))
          .transition().duration(2500)
          .style("opacity", 1);
      }
    }
    const consButtons = d3.select('#button2')
                    .append('select') // Use <select> element for dropdown
                    .on('change', highlight)
      ;
    // Add options for each continent to the dropdown
    consButtons.selectAll('option')
      .data(Continents)
      .enter()
      .append('option')
      .attr('value', (d) => d)
      .text((d) => d);



    // Legend
    const Legend = d3.select(".legend")
      .append('svg').attr('id', 'legend_label').attr('margin', '2rem');

    const size = 20
    // Add one dot in the legend for each fatality band.       
    const g1 = Legend.append("g");
    const gradient = g1.selectAll('rect')
      .data(keys)
      .enter()
      .append('rect')
      .attr("x", 20)
      .attr("y", (d, i) => 10 + i * (size + 12))
      .attr('width', size)
      .attr('height', size)
      .attr('stroke', "black")
      .style("fill", (d) => color(d));

    // Add one dot in the legend for each name.
    Legend
      .selectAll('text')
      .data(keys)
      .enter()
      .append('text')
      .attr("x", 25 + size * 1.2)
      .attr("y", (d, i) => 10 + i * (size + 12) + 15)
      .text((d) => d)
      .attr('stroke', "black")
    // .attr("text-anchor", "left")
    // .style("alignment-baseline", "middle")

    var zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', function (event) {
        map.selectAll('path')
          .attr('transform', event.transform);
      });

    map.call(zoom);
  })

});