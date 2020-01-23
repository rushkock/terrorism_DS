var barPadding = 5;
var margin = {top: 20, right: 0, bottom: 70, left: 200};
var w = 700 - margin.left - margin.right;
var h = 2500 - margin.top - margin.bottom;

// this function makes the barchart
function makeBar (response) {
  var data = processDate(response[1], 2016);

  // I chose to remove the values that are smaller than 1 because 0.something
  // suicides does not give a lot of information but it is very hard
  // to see because the height of the bar is very small (almost invisible see process report)
  data = sorting(data);
  data = removeZeros(data);

  var color = getColor(data);

  // make SVG
  var svg =   d3.select('.barChart')
                .append('svg')
                .attr('class', 'chart')
                .attr('width', w + margin.left + margin.right)
                .attr('height', h + margin.top + margin.bottom);
  // write text on y axis
  var country = svg.append('text')
                   .attr('transform', 'rotate(-90)')
                   .attr('y', 15)
                   .attr('x', -300)
                   .style('font-size', '20px')
                   .text('Country');
  // write text on x axis
  var suicides = svg.append('text')
                    .attr('y', 20)
                    .attr('x', (w + margin.left + margin.right) / 2 - 80)
                    .style('font-size', '20px')
                    .text('Number of terrorist attacks');

  // make a line down the average
  svg.append('line')
     .style('stroke', 'black')
     .attr('x1', (w + margin.left + margin.right) / 2 + 50)
     .attr('y1', 50)
     .attr('x2', (w + margin.left + margin.right) / 2 + 50)
     .attr('y2', h + margin.bottom);

  // make the bars
  var rect = svg.selectAll('rect')
                .data(data)
                .enter()
                .append('rect');

  // make rects with right height and width, add mouseover, and make axis
  makeRects(data, rect, color);
  barMouseOver(data, color);
  makeAxes(data);
}

// this function updates the data
function updateBar (data, color) {
  // sort data and remove zeros
  data = sorting(data);
  data = removeZeros(data);

 // update the rects with the right data
  var rect = d3.select('.barChart')
               .select('.chart')
               .selectAll('rect')
               .data(data);

  rect.enter()
      .append('rect')
      .merge(rect);

  makeRects(data, rect, color);

  rect.exit()
      .remove();

  // remove the x and y axis and make a new one
  d3.select('.xAxis')
    .remove();

  d3.select('.yAxis')
    .remove();

  makeAxes(data);
  // add tooltip
  barMouseOver(data, color);
}

// this function adds the bars with the right height and width
function makeRects (data, rect, color) {
  var yScale = d3.scaleBand()
                 .range([0, h])
                 .padding(0.1)
                 .domain(data.map(function (d) { return d.country; }));

  var xScale = d3.scaleLinear()
                 .domain([0, d3.max(data, function (d) { return d.success; })])
                 .range([0, w]);

  function makeY (d, i) { return yScale(d.country) + 50; }
  function makeX (d, i) { return 180; }
  function widthRect (d) { return xScale(d.success); }
  function heightRect (d) { return yScale.bandwidth(); }
  function makeColor (d) { return color(d.success); }

  // rect
  rect.attr('x', makeX)
      .transition()
      .duration(500)
      .attr('y', makeY)
      .attr('width', widthRect)
      .attr('height', heightRect)
      .attr('fill', makeColor);
}

// this function makes the x and y axis
function makeAxes (data) {
  var yScale = d3.scaleBand()
                 .range([0, h])
                 .padding(0.1)
                 .domain(data.map(function (d) { return d.country; }));

  var xScale = d3.scaleLinear()
                 .domain([0, d3.max(data, function (d) { return d.success; })])
                 .range([0, w]);

  svg = d3.select('.barChart')
          .select('svg');

  // make xAxis
  var xAxis = d3.axisTop()
                .scale(xScale);
  svg.append('g')
     .attr('class', 'xAxis')
     .attr('transform', 'translate(180, 50)')
     .call(xAxis);

  var yAxis = d3.axisLeft()
                .scale(yScale);
  svg.append('g')
     .attr('class', 'yAxis')
     .attr('transform', 'translate(180, 50)')
     .call(yAxis);
}

// this function adds a tooltip and color to each bar
function barMouseOver (data, color) {
  var myTool = d3.select('body')
                 .append('div')
                 .attr('class', 'mytooltip')
                 .style('display', 'none');

  var rect = d3.select('.barChart')
               .select('.chart')
               .selectAll('rect')
               .data(data);

  rect.attr('fill', function (d) { return color(d.success); })
      .on('mouseover', function (d) {
            // bars
            d3.select(this)
              .transition()
              .duration(10)
              .attr('fill', function (d) { return 'orange';} );
            // text
            myTool.transition()
                  .duration(10)
                  .style('display', 'block');

            myTool.html('<div id="thumbnail"><span>' + d.country + ': ' +
                         Math.round(d.success) + '</span></div>')
                  .style('left', (d3.event.pageX) + 20 + 'px')
                  .style('top', (d3.event.pageY)  - 10 + 'px');
            })
            .on('mouseout', function (d) {
                d3.select(this)
                  .transition()
                  .duration(10)
                  .attr('fill', function(d) { return color(d.success); });
                myTool.transition()
                      .duration(10)
                      .style('display', 'none');
            });
}


function removeZeros (data) {
  var dataNoZero = [];
  for (var i in data) {
    if (data[i].success > 1) {
      dataNoZero.push(data[i]);
    }
  }
  return dataNoZero;
}
