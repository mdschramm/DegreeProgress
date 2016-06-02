'use strict';
var data; // a global

d3.json("prereqs.json", function(error, json) {
	if (error) return console.warn(error);

	console.log(json);
	// Set up size
	var width = 750,
		height = width;

	// add another svg for legend
	var svg = d3.select("#chart").append("svg")
		.attr("width", width)
		.attr("height", height);

	svg.append("rect")
	          .attr("width", width)
	          .attr("height", height)
	          .attr("fill", "red");
});
