// this function makes the world map
function makeMap (response) {
  // pooledData is the data set where all values for one year is summed
  // (No male/ female or age groups. Just one value for 2016 for each country)
  // filterData is the data set where all values are still present for one year
  // (With male/ female or age groups, 12 values for 2016 for each country )
  var noFilterData = processDate(response[1], 2016);
  var filterData = processDate(response[2], 2016);

  var tooltip = d3.select('.worldMap')
                  .append('div')
                  .attr('class', 'tooltip')
                  .style('opacity', 0);

  // make svg
  var margin = {top: 50, right: 0, bottom: 0, left: 0},
              width = 960 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;

  var svg = d3.select('.worldMap')
              .append('svg')
              .attr('width', width)
              .attr('height', height)
              .append('g')
              .attr('class', 'map');

  var color = getColor(noFilterData);
  var min = d3.min(noFilterData, function (d) { return d.success; });
  var max = d3.max(noFilterData, function (d) { return d.success; });

  var year = makeSlider(response, color, tooltip);
  onClick(response, noFilterData, filterData, color, tooltip, year);
  var projection = d3.geoMercator()
                     .scale(130)
                     .translate([width / 2, height / 1.5]);

  path = d3.geoPath()
           .projection(projection);

  // make the map
  svg.append('g')
     .attr('class', 'countries')
     .selectAll('path')
     .data(response[0].features)
     .enter()
     .append('path')
     .attr('d', path)
     .style('opacity', 0.8)
     .style('stroke', 'white')
     .style('stroke-width', 0.3);

     svg.append("g")
           .append("text")
           .attr("x", (width / 2))
           .attr("y", 0)
           .attr("text-anchor", "middle")
           .style("font-size", "30px")
           .text("Worldmap");

  mouseOver(response, noFilterData, color, tooltip);
  makeLegend('.legendDiv', color, min, max, 15, '#fee8c8', '#7f0000');
  noData ();
  onClickDonut(noFilterData, response, 2016, value)
}

// this functions makes the legends and writes the text
// source : https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient.html
function makeLegend (select, color, min, max, ticks, start, stop) {
  var width = 200;
  var height = 550;
  var defs = d3.select(select)
               .append('defs');

  var svg = defs.append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('class', 'legend');


  var linearGradient = svg.append('linearGradient')
                          .attr('id', 'linear-gradient' + stop);

  // chosen horizontal gradient
  linearGradient
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  // set the color for the start
  linearGradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', start);

  // set the color for the end
  linearGradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', stop);

  // draw the rectangle and fill with gradient
  svg.append('rect')
     .attr('width', 20)
     .attr('x', 50)
     .attr('y', 15)
     .attr('height', height)
     .style('fill', 'url(#linear-gradient' + stop + ')');

  //Set scale for x-axis
  var xScale = d3.scaleLinear()
  	             .range([0, height - 10])
  	             .domain([Math.round(min), Math.round(max)]);

  // make xAxis
  var xAxis = d3.axisLeft(xScale)
                .ticks(ticks);

  svg.append('g')
     .attr('class', 'x axis')
     .attr('transform', 'translate('+ 50 + ',' + 15 + ')')
     .call(xAxis);
}


// this function updates the data of the map, changes the colors and the tooltip
function update (response, newData, filtered, color, tooltip, year, dataVar) {
  var data = [];
  if (value === 'all') {
    data = newData;
  } else {
    data = filtered;
  }

  mouseOver(response, data, color, tooltip);
  onClickDonut(data, response, year, dataVar)
}

// this function fills the color and adds a tooltip on mouseover
function mouseOver (response, data, color, tooltip) {
  var countries = d3.select('.countries')
                    .selectAll('path')
                    .data(response[0].features)
                    .style('fill', function (d) {
                            var foundColor = '';
                            data.forEach(function (t) {
                              if (t.country === d.properties.name) {
                                foundColor = color(t.success);
                              }

                            });
                            return foundColor;
                    });

    countries.on('mouseover', function (d) {
              tooltip.transition()
                     .duration(10)
                     .style('opacity', 1)
                     .style('stroke', 'black')
                     .style('stroke-width', 5);

              // get the country the user is hovering over
              var selectedCountry = getSelectedCountry(d, data, 'country', 'properties', 'name');
              subBoxMap(selectedCountry);
              if (selectedCountry === '') {
                  tooltip.html('<div id="thumbnail"><span> No Data')
                         .style('left', (d3.event.pageX) + 'px')
                         .style('top', (d3.event.pageY) + 'px');
              } else {
                d3.select('.subBoxMap')
                  .selectAll('*')
                  .style('visibility', 'visible');

                tooltip.html('<div id="thumbnail"><span> Country: ' +
                             selectedCountry.country + '<br> Terrorist attacks: ' +
                             Math.round(selectedCountry.success))
                       .style('left', (d3.event.pageX) + 'px')
                       .style('top', (d3.event.pageY)  + 'px');
                }

                d3.select(this)
                  .style('opacity', 1)
                  .style('stroke', 'white')
                  .style('stroke-width', 3);
     })
    .on('mouseout', function (d) {
        d3.select('.subBoxMap')
          .selectAll('*')
          .style('visibility', 'hidden');

        tooltip.transition()
               .duration(500)
               .style('stroke', 'white')
               .style('opacity', 0);

        d3.select(this)
          .style('opacity', 0.8)
          .style('stroke', 'white')
          .style('stroke-width', 0.3);
    });
}



// this function makes the slider for the years and it also returns which year is chosen
// source: https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
function makeSlider (response, color, tooltip) {
  var dataTime = d3.range(0, 30).map(function (d) {
    return new Date(1987 + d, 1, 1);
  });

  var sliderTime = d3.sliderBottom()
                     .min(d3.min(dataTime))
                     .max(d3.max(dataTime))
                     .step(1000 * 60 * 60 * 24 * 365)
                     .width(900)
                     .tickFormat(d3.timeFormat('%Y'))
                     .tickValues(dataTime)
                     .default(new Date(2016, 10, 3))
                     .on('onchange', function(val){
                       d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
                       var year = d3.timeFormat('%Y')(sliderTime.value());

                       // get the data for the correct year and call all the
                       // functions to make the visualizations for the right year
                       var newData = processDate(response[1], year);
                       var filteredData = processDate(response[2], year);
                       var ageFiltered = filter(response, newData, filteredData, color, tooltip);

                       var min = d3.min(ageFiltered, function (d) { return d.success; });
                       var max = d3.max(ageFiltered, function (d) { return d.success; });

                       // remove the old legend and make a new one
                       // also remove the noData legend as not to keep making a new one
                       d3.select('.legendDiv')
                       .select('defs')
                       .remove();
                       makeLegend('.legendDiv', color, min, max, 15, '#fee8c8', '#7f0000');
                       //filterSunburst(newData, filteredData, sunburstValue, year);
                       update(response, newData, ageFiltered, color, tooltip, year, value);
                       updateBar(newData, color);
                       onClick(response, newData, filteredData, color, tooltip);
                      });

  var gTime = d3.select('div#slider-time')
                .append('svg')
                .attr('width', 1100)
                .attr('height', 100)
                .append('g')
                .attr('transform', 'translate(30, 30)');

  gTime.call(sliderTime);
  year = d3.timeFormat('%Y')(sliderTime.value());
  d3.select('p#value-time').text(year);
  return year;
}

// this function writes the text in the subBox (small box with borders on the right of the page)
function subBoxMap (data) {
    var box = d3.select('.subBoxMap');
    if (data != '') {
    d3.select('.subBoxMapCountry')
      .select('h1')
      .text(data.country);
    d3.select('.subBoxMapSuicidesPer10000')
      .text(Math.round(data.success));
   }
}

// this function adds a black rectangle with the label no data
function noData () {
 var svg = d3.select('.noData')
             .append('svg')
             .attr('width', 60)
             .attr('height', 50)
             .attr('class', 'noDataLegend');

    svg.append('rect')
       .attr('width', 20)
       .attr('x', 20)
       .attr('y', 10)
       .attr('height', 20)
       .style('fill', 'black');

    svg.append("text")
       .attr("x", 0)
       .attr("y", 45)
       .text("No Data");
}

///////////////////////////////////////////////////////////////////////////////
/////////////////        Functions that process data    //////////////////////
//////////////////////////////////////////////////////////////////////////////

// global variables
var dropCountry  = '';
var value = 'attack_type';
var idCheck = '';
var id = '';

// when one of the dropdowns are clicked this function determines
// what should happen
function onClick (response, allData, filteredData, color, tooltip, year) {
 d3.selectAll('.dropdown-item')
   .on('click', function(){
      // check which dropdown was chosen, get the right value,
      // write the text and set the id. Call the filter function
      idCheck = this.getAttribute('id');

      if (idCheck === 'drop_country') {
        dropCountry = this.getAttribute('value');
        id = "drop_country"
        d3.select('.sunburstFilter')
          .text('Top ' + dropCountry);
      }
      else if (idCheck === 'donut') {
        value = this.getAttribute('value');
        id = 'donut';
        country  = d3.select('.selectedCountry')
                      .attr('id');
        if (value === "gname"){
          chosenFilter = "Terrorist group name"
        }
        else if (value === "attack_type"){
          chosenFilter = "Attack type"
        }
        else{
          chosenFilter = "Target type"
        }
        d3.select('.filter')
          .text(chosenFilter + ' for ' + country);
      }
      filter(response, allData, filteredData, color, tooltip);
   });
}

// this function filters the data when user choses an age
function filter (response, allData, filteredData, color, tooltip) {
    var formatData = [];
    // if a filter was chosen and the id is gender or age then filter data
    if (value != 'all' && id != '' && id != 'drop_country') {
      update(response, allData, filteredData, color, tooltip, 2016, value);
    }
    else if (id === "drop_country") {
      divSelectedCountry  = d3.select('.selectedCountry')
                              .attr('id', dropCountry);
      update(response, allData, filteredData, color, tooltip, 2016, value);
      lineData = processCountry(response[6], dropCountry)
      updateLine(response, lineData)
    }
    else{
      update(response, allData, filteredData, color, tooltip, 2016, value);
    }
    // when I actually filter return the filtered data set but for now to fix the bug !!
    return allData;
}
