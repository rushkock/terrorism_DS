function makeArray(data, chosenValue){
  var values = []
  for (i in data){
    values.push({date: data[i]["year"], value: data[i][chosenValue]})
  }
  return values
}

function processData(data){
  fatalities = makeArray(data, 'nkill')
  wounded = makeArray(data, 'nwound')
  var processedData = [
               {name: "Fatalities",
               values: fatalities},
               {name: "Wounded",
               values: wounded}
              ]
  return processedData
}

function line(response, countryData){
var data = processData(countryData)

var width = 850;
var height = 700;
var margin = 100;
var duration = 250;

var lineOpacity = "0.25";
var lineOpacityHover = "0.85";
var otherLinesOpacityHover = "0.1";
var lineStroke = "2.5px";
var lineStrokeHover = "3.5px";

var circleOpacity = '0.85';
var circleOpacityOnLineHover = "0.25"
var circleRadius = 3;
var circleRadiusHover = 6;


/* Format Data */
var parseDate = d3.timeParse("%Y");
data.forEach(function(d) {
  d.values.forEach(function(d) {
    d.date = parseDate(d.date);
    d.value = +d.value;
  });
});

maxKill = d3.max(data[0].values, d => d.value)
maxWound = d3.max(data[1].values, d => d.value)
maxValue = maxWound
if (maxKill > maxWound){
  maxValue = maxKill
}



/* Scale */
var xScale = d3.scaleTime()
  .domain(d3.extent(data[0].values, d => d.date))
  .range([0, width-margin]);

var yScale = d3.scaleLinear()
  .domain([0, maxValue])
  .range([height-margin, 0]);

var color = d3.scaleOrdinal(d3.schemeCategory10);

/* Add SVG */
var svg = d3.select("#lineChart").append("svg")
  .attr("width", (width+margin)+"px")
  .attr("height", (height+margin)+"px")
  .append('g')
  .attr("transform", `translate(${margin}, ${margin})`);


/* Add line into SVG */
var line = d3.line()
  .x(d => xScale(d.date))
  .y(d => yScale(d.value));

let lines = svg.append('g')
  .attr('class', 'lines');

lines.selectAll('.line-group')
  .data(data).enter()
  .append('g')
  .attr('class', 'line-group')
  .on("mouseover", function(d, i) {
      svg.append("text")
        .attr("class", "title-text")
        .style("fill", color(i))
        .text(d.name)
        .attr("text-anchor", "middle")
        .attr("x", (width-margin)/2)
        .attr("y", 5);
    })
  .on("mouseout", function(d) {
      svg.select(".title-text").remove();
    })
  .append('path')
  .attr('class', 'line')
  .attr('d', d => line(d.values))
  .style('stroke', (d, i) => color(i))
  .style('opacity', lineOpacity)
  .on("mouseover", function(d) {
      d3.selectAll('.line')
					.style('opacity', otherLinesOpacityHover);
      d3.selectAll('.circle')
					.style('opacity', circleOpacityOnLineHover);
      d3.select(this)
        .style('opacity', lineOpacityHover)
        .style("stroke-width", lineStrokeHover)
        .style("cursor", "pointer");
    })
  .on("mouseout", function(d) {
      d3.selectAll(".line")
					.style('opacity', lineOpacity);
      d3.selectAll('.circle')
					.style('opacity', circleOpacity);
      d3.select(this)
        .style("stroke-width", lineStroke)
        .style("cursor", "none");
    });


/* Add circles in the line */
lines.selectAll("circle-group")
  .data(data).enter()
  .append("g")
  .style("fill", (d, i) => color(i))
  .selectAll("circle")
  .data(d => d.values).enter()
  .append("g")
  .attr("class", "circle")
  .on("mouseover", function(d) {
      d3.select(this)
        .style("cursor", "pointer")
        .append("text")
        .attr("class", "text")
        .text(`${d.value}`)
        .attr("x", d => xScale(d.date) + 5)
        .attr("y", d => yScale(d.value) - 10);
    })
  .on("mouseout", function(d) {
      d3.select(this)
        .style("cursor", "none")
        .transition()
        .duration(duration)
        .selectAll(".text").remove();
    })
  .append("circle")
  .attr("class", "oneCircle")
  .attr("cx", d => xScale(d.date))
  .attr("cy", d => yScale(d.value))
  .attr("r", circleRadius)
  .style('opacity', circleOpacity)
  .on("mouseover", function(d) {
        d3.select(this)
          .transition()
          .duration(duration)
          .attr("r", circleRadiusHover);
      })
    .on("mouseout", function(d) {
        d3.select(this)
          .transition()
          .duration(duration)
          .attr("r", circleRadius);
      });


/* Add Axis into SVG */
var xAxis = d3.axisBottom(xScale).ticks(10);
var yAxis = d3.axisLeft(yScale).ticks(5);

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0, ${height-margin})`)
  .call(xAxis);

svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append('text')
  .attr("y", 15)
  .attr("transform", "rotate(-90)")
  .attr("fill", "#000")
  .text("Total values");
  makeLegendLine(svg, color, width)

  divSelectedCountry  = d3.select('.selectedCountry')
                          .attr('id')
  if (divSelectedCountry === null){
    title = "No Data available"
  }
  else {
    title = "Number of fatalities and wounded in " + divSelectedCountry
  }

  svg.append("g")
        .append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "30px")
        .text(title);
}

// this functions makes the legends and writes the text
function makeLegendLine(svg, color, width)
{
  // make legend for the countries
  var names = ["Fatalies", "Wounded"];
  var legend =  d3.select(".lineChart")
                  .select("svg")
                  .selectAll(".legend")
                  .data(color.domain())
                  .enter()
                  .append("g")
                  .attr("class", "legend")
                  .attr("transform", function(d, i) {
                         return "translate(0," + i * 20 + ")";
                       });

      legend.append("rect")
            .attr("x", width)
            .attr("y", 100)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color)
            .style("stroke", "black");

      legend.append("text")
            .attr("x", width - 5)
            .attr("y", 110)
            .attr("dy", ".25em")
            .style("text-anchor", "end")
            .text(function(d){return names[d]});
}

function updateLine2(countryData){
  var width = 800;
  var height = 700;
  var margin = 100;
  /* Scale */
  console.log(countryData)
  var data = processData(countryData)
  console.log(data)
  /* Format Data */
  var parseDate = d3.timeParse("%Y");
  data.forEach(function(d) {
    d.values.forEach(function(d) {
      d.date = parseDate(d.date);
      d.value = +d.value;
    });
  });

  maxKill = d3.max(data[0].values, d => d.value)
  maxWound = d3.max(data[1].values, d => d.value)
  maxValue = maxWound
  if (maxKill > maxWound){
    maxValue = maxKill
  }



  var xScale = d3.scaleTime()
    .domain(d3.extent(data[0].values, d => d.date))
    .range([0, width-margin]);

  var yScale = d3.scaleLinear()
    .domain([0, maxValue])
    .range([height-margin, 0]);

    /* Add line into SVG */
    var line = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value));
      /* Add Axis into SVG */
      var xAxis = d3.axisBottom(xScale).ticks(10);
      var yAxis = d3.axisLeft(yScale).ticks(5);

  var svg = d3.select(".lineChart")
              .select("svg")
              .data(data)
  // Make the changes
        svg.selectAll(".line")
           .transition()        // change the line
            .duration(750)
            .attr('d', function(d) { console.log(d)
              return line(d.values)});
        svg.selectAll(".circle")
           .transition()        // change the line
           .duration(750)
           .attr("cx", function(d){ console.log(xScale(d.date))
             return xScale(d.date)})
           .attr("cy", d => yScale(d.value))
           .attr("r", 3);
        svg.select(".x.axis")
             .transition()     // change the x axis
            .duration(750)
            .call(xAxis);
        svg.select(".y.axis")
         .transition()      // change the y axis
            .duration(750)
            .call(yAxis);

}

function updateLine(response, countryData){
  d3.select('.lineChart')
  .select('svg')
  .remove();

  line(response, countryData)
}
