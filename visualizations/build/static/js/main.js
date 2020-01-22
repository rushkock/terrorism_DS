window.onload = function()
{
  var requests = [d3.json('static/data/world_countries.json'),
                  d3.json('static/data/attacks.json'),
                  d3.json('static/data/attacks.json'),
                  d3.json('static/data/attacks_type.json'),
                  d3.json('static/data/gname.json'),
                  d3.json('static/data/target_type.json'),
                  d3.json('static/data/nkill_and_nwound.json'),
                  d3.json('https://gist.githubusercontent.com/mbostock/4348373/raw/85f18ac90409caa5529b32156aa6e71cf985263f/flare.json')];

  Promise.all(requests).then(function(response) {
     makeMap(response);
     allData = processDate(response[1], 2016);
     data = processDate(response[2], 2016);
     //filterSunburst(allData, data, '10');
     country = processCountry (response[6], "Netherlands")
     divSelectedCountry  = d3.select('.selectedCountry')
                             .attr('id', "Netherlands");
     onClickDonut(data, response, 2016, "attack_type")
     makeBar(response);
     line(response, country);
  }).catch(function(e) {
      throw(e);
  });
};

// this function returns the data for the chosen year
function processDate (data, year) {
  var date = [];
  var yearF = parseFloat(year);
  for (var i in data){
    if (data[i].year === yearF) {
      date.push(data[i]);
    }
  }
  return date;
}

// this function returns the data for the chosen year
function processCountry (data, chosen_country) {
  var country = [];
  for (var i in data){
    if (data[i].country === chosen_country) {
      country.push(data[i]);
    }
  }
  return country;
}


// this functions gets the states that the mouse is hovering over
function getSelectedCountry (d, pooledData, country, property, property2) {
  var selectedState = '';
  var element = '';
  if (country === 'country') {
    element = d[property][property2];
  } else {
    element = d[property];
  }

  // note intentional use of == and not ===
  pooledData.forEach(function (e) { if (e[country] == element) { selectedState = e; }});
  return selectedState;
}

function sorting (data) {
  var sortedData = data.sort(function (a, b) { return b.success - a.success; });
  return sortedData;
}

// color function for barchart and map
function getColor (data) {
  var min = d3.min(data, function (d) { return d.success; });
  var max = d3.max(data, function (d) { return d.success; });
  var seventh = (max - min) / 7;

  var color = d3.scaleLinear()
                .domain([min, min + seventh, min + seventh * 2, min + seventh * 3,
                         min + seventh * 4, min + seventh * 5, min + seventh * 6, max])
                //.range(['#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0',
                //        '#045a8d', '#023858']);
                .range(['#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000'])
  return color;
}
