'use strict';

// Draw stacked line chart
d3.json("courses.json", function(error, json) {
	if (error) return console.warn(error);
	//process data
	var gerarea = [0,0,0,0,0,0];
	var majorarea = [0,0,0,0,0,0];
	var otherarea = [0,0,0,0,0,0];

	var geravg = [0,0];
	var majorravg = [0,0];
	var otheravg = [0,0];


	for(var quarter=0; quarter < json.length; quarter++){
		for(var course=0; course< json[quarter].length; course++) {
			var info = json[quarter][course];
			var fulf = info[1];
			var units = info[2];
			var grade = info[3];
			if(fulf === "ger") {
				if(quarter === 0) {
					gerarea[quarter] = units;
				} else {
					gerarea[quarter] = gerarea[quarter -1] + units
				}
				if(grade !== "cr/ncr") {
					geravg[0]++;
					geravg[1]+=grade;
				}
			} else if(fulf === "major") {
				if(quarter === 0) {
					majorarea[quarter] = units;
				} else {
					majorarea[quarter] = majorarea[quarter -1] + units
				}
				if(grade !== "cr/ncr") {
					majoravg[0]++;
					majoravg[1]+=grade;
				}
			} else { // other
				if(quarter === 0) {
					otherarea[quarter] = units;
				} else {
					otherarea[quarter] = otherarea[quarter -1] + units
				}
				if(grade !== "cr/ncr") {
					otheravg[0]++;
					otheravg[1]+=grade;
				}
			}
		}
	}

	geravg = geravg[1]/geravg[0];
	majoravg = majoravg[1]/majoravg[0];
	otheravg = otheravg[1]/otheravg[0];


	// Set up size
	var margin = {top: 60, right: 30, bottom: 30, left: 60},
	width = 750 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

	// add another svg for legend
	var svg = d3.select("#chart").append("svg")
		.attr("width", width + margin.left + margin.right) 
		.attr("height", height + margin.top + margin.bottom);

	var x = d3.scale.linear()
				.domain([1, 12])
				.range([0,width]);

	var maxUnits = 240;//12 20 unit quarters
	var y = d3.scale.linear()
		.domain([0, maxUnits])
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");

	svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate("+ margin.left + "," + (height + margin.top) + ")")
      .call(xAxis);

	svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(yAxis);

});
