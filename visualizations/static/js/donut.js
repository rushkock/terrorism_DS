function donut(data, value){
  var text = data[0]["country"];


  var thickness = 50;
  var duration = 750;
  var margin = {top: 10, right: 10, bottom: 10, left: 10},
              width = 700 - margin.left - margin.right,
              height = 700 - margin.top - margin.bottom;

  var radius = Math.min(width, height) / 2;
  var color = d3.scaleOrdinal(d3.schemeSet1);

  var svg = d3.select("#donutChart")
  .append('svg')
  .attr('class', 'pie')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom);

  var g = svg.append('g')
             .attr('transform', 'translate(' + (width/2) + ',' + (height/2) + ')');

  var arc = d3.arc()
  .innerRadius(radius - thickness)
  .outerRadius(radius);

  var pie = d3.pie()
  .value(function(d) { return d.success; })
  .sort(null);

  var total = d3.sum(data, function(d) {
            return d.success;
        });

  var path = g.selectAll('path')
  .data(pie(data))
  .enter()
  .append("g")
  .on("mouseover", function(d) {
    let g = d3.select(this)
    .style("cursor", "pointer")
    .style("fill", "black")
    .append("g")
    .attr("class", "text-group");

    g.append("text")
    .attr("class", "name-text")
    .text(`${d.data.success + " " + d.data[value] }`)
    .attr('text-anchor', 'middle')
    .attr('dy', '-1.2em');

    g.append("text")
    .attr("class", "value-text")
    .text(`${Math.round((d.endAngle - d.startAngle)/(2*Math.PI)*100)+"%"}`)
    .attr('text-anchor', 'middle')
    .attr('dy', '.6em');

    g.append("text")
    .attr("class", "name-text")
    .text(`${total + " total number of attacks"}`)
    .attr('text-anchor', 'middle')
    .attr('dy', '-2.5em');

  })
  .on("mouseout", function(d) {
    d3.select(this)
    .style("cursor", "none")
    .style("fill", color(this._current))
    .select(".text-group").remove();
  })
  .append('path')
  .attr('d', arc)
  .attr('fill', (d,i) => color(i))
  .on("mouseover", function(d) {
    d3.select(this)
    .style("cursor", "pointer")
    .style("opacity", "0.5");
  })
  .on("mouseout", function(d) {
    d3.select(this)
    .style("cursor", "none")
    .style("opacity", "1.0");
  })
  .each(function(d, i) { this._current = i; });


  g.append('text')
  .attr('text-anchor', 'middle')
  .attr('dy', '-1.5em')
  .text(text)
  .attr('class', 'donutCountryText');

  divSelectedCountry  = d3.select('.selectedCountry')
                          .attr('id')
  if (divSelectedCountry === null){
    title = "No Data available"
  }
  else {
    title = "Attack type for " + divSelectedCountry
  }

  svg.append("g")
        .append("text")
        .attr("x", (width / 2))
        .attr("y", 0- (margin.top /2))
        .attr("text-anchor", "middle")
        .style("font-size", "30px")
        .text(title);
}


function onClickDonut (data, response, year, dataVar){
  // check which datavariable user wants to see in the donut chart
  // options are attack type, group name and target type
  if (dataVar === "attack_type"){
    chosenResponse = response[3]
    chosenFilter = "Attack type"
  }
  else if (dataVar === "gname"){
    chosenResponse = response[4]
    chosenFilter = "Terrorist group name"
  }
  else{
    chosenResponse = response[5]
    chosenFilter = "Target type"
  }
  var countries = d3.select('.countries')
                    .selectAll('path')
                    .data(response[0].features)

  countries.on('click', function (d) {
    // get the country the user is hovering over
    var selectedCountry = getSelectedCountry(d, data, 'country', 'properties', 'name');
    var attack_type = processDate(chosenResponse, selectedCountry["year"])
    var country = processCountry(attack_type, selectedCountry["country"])

    // keep track of the country that was selected by updating the id of the div in html
    divSelectedCountry  = d3.select('.selectedCountry')
                            .attr('id', selectedCountry["country"]);

    updateDonut(country, dataVar)
    lineData = processCountry(response[6], selectedCountry["country"])
    updateLine(response, lineData)
    d3.select('.filter')
      .text(chosenFilter + ' for ' + divSelectedCountry);
  })
  divSelectedCountry  = d3.select('.selectedCountry')
                          .attr('id')
  var attack_type = processDate(chosenResponse, year)
  var country = processCountry(attack_type, divSelectedCountry)
  updateDonut(country, dataVar)
  d3.select('.filter')
    .text(chosenFilter + ' for ' + divSelectedCountry);
}

function updateDonut(country, dataVar){
  if (country != undefined && country.length > 0 && country[0]["success"] != 0){
    d3.select('.donutChart')
    .select('svg')
    .remove();

    donut(country, value);
  }
  else{
    d3.select('.donutChart')
    .select('svg')
    .remove();

    divSelectedCountry  = d3.select('.selectedCountry')
                            .attr('id')
    if (divSelectedCountry === null){
      donutCountryText = "No Data available"
      countryName = ''
    }
    else {
      donutCountryText = "No data for "
      countryName = divSelectedCountry
    }

    d3.select(".donutChart")
    .append('svg')
    .attr('class', 'pie')
    .attr('width', 500)
    .attr('height', 500)
    .append('g')
    .attr('transform', 'translate(' + (500/2) + ',' + (500/2) + ')')
    .append("svg:text")
    .style('font-size', '30px')
    .append("svg:tspan")
    .attr('x', 0)
    .attr('dy', 30)
    .text(donutCountryText)
    .append('svg:tspan')
    .attr('x', 0)
    .attr('dy', 30)
    .text(countryName);
  }
}
