'use strict';

// test json object for degree requirement
console.log(requirements);

// d3.json("prereqs.json", function(error, json) {
// Draw stacked line chart
d3.json("courses.json", function(error, json) {
	if (error) return console.warn(error);
	//process data
	var gerdata = [0,0,0,0,0,0];
	var majordata= [0,0,0,0,0,0];
	var otherdata = [0,0,0,0,0,0];

	var geravg = [0,0];
	var majoravg = [0,0];
	var otheravg = [0,0];


	for(var quarter=0; quarter < json.length; quarter++){
		var ger = 0;
		var maj = 0;
		var oth = 0;
		for(var course=0; course< json[quarter].length; course++) {
			var info = json[quarter][course];
			var fulf = info[1];
			var units = info[2];
			var grade = info[3];
			if(fulf === "ger") {
				if(grade !== "cr/ncr") {
					geravg[0]++;
					geravg[1]+=grade;
					ger += units;
				}
			} else if(fulf === "major") {
				if(grade !== "cr/ncr") {
					majoravg[0]++;
					majoravg[1]+=grade;
					maj += units;
				}
			} else { // other
				if(grade !== "cr/ncr") {
					otheravg[0]++;
					otheravg[1]+=grade;
					oth += units;
				}
			}
		}
		gerdata[quarter] = (quarter === 0) ? ger : gerdata[quarter-1] + ger;
		majordata[quarter] = (quarter === 0) ? maj : majordata[quarter-1] + maj; 
		otherdata[quarter] = (quarter === 0) ? oth : otherdata[quarter-1] + oth; 

	}

	geravg = (geravg[0] === 0) ? 0: geravg[1]/geravg[0] ;
	majoravg = (majoravg[0] === 0) ? 0: majoravg[1]/majoravg[0] ;
	otheravg = (otheravg[0] === 0) ? 0: otheravg[1]/otheravg[0] ;

	// Set up margin stuff
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

	var graph = svg.append("g")
					.attr("class", "tehgraph")
      				.attr("transform", "translate("+ margin.left + "," + margin.top + ")")



	graph.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

	graph.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    var color = d3.scale.category20().domain(["ger","major", "other"]);
    
    var gerarea = d3.svg.area()
    				.x(function(d, i) {return x(i+1);})
    				.y0(height)
    				.y1(function(d) {return y(d);});

    var majorarea = d3.svg.area()
    				.x(function(d, i) {return x(i+1);})
    				.y0(function(d,i) {return y(gerdata[i]);})
    				.y1(function(d,i) {return y(gerdata[i] + d);});

    var otherarea = d3.svg.area()
    				.x(function(d, i) {return x(i+1);})
    				.y0(function(d,i) {return y(gerdata[i] + majordata[i]);})
    				.y1(function(d,i) {return y(gerdata[i] + majordata[i] + d);});

    graph.append("path")
    	.datum(gerdata)
    	.attr("d", gerarea)
    	.attr("class","gerarea")
    	.style("fill", color("ger"));

   	graph.append("path")
    	.datum(majordata)
    	.attr("d", majorarea)
    	.attr("class","majorarea")
    	.style("fill", color("major"));

   	graph.append("path")
    	.datum(otherdata)
    	.attr("d", otherarea)
    	.attr("class","otherarea")
    	.style("fill", color("other"));

    // X label
    graph.append("text")
  			.text("Quarter")
  			.attr("text-anchor", "middle")
  			.attr("transform", "translate(" + width/2 + "," + (height + margin.bottom) + ")");

  	graph.append("text")
  			.text("Unit Total")
  			.attr("text-anchor", "middle")
  			.attr("x",-height/2)
  			.attr("y", -margin.left + 10)
  			.attr("transform", "rotate(270)");

  	// Dotted line goal
  	graph.append("line")
  		.attr("class", "goalline")
  		.style("stroke-dasharray", ("3, 3"))
  		.attr({x1:x(1),y1:y(180),x2:x(12),y2:y(180)})
  		.attr("");


  	// CR/NR BAR!!

  	//first make the labels

	function createMultiBar(container, Shape, optsArray) {
	    return optsArray.map(function(opts) {
	        return new Shape(container, opts);
	    });
	}

	var bars = createMultiBar(
	    '#container',
	    ProgressBar.Line,
	    [
	        {color: '#FCB03C', strokeWidth: 3, trailColor: 'LightGrey', trailWidth: 1.2},
			{color: 'blue', strokeWidth: 3}
		]
	);
	// svg.append("line")
	// var $container = $("#labels1");
	// $container.append("<line x1='0' y1='0' x2='0' y2='10' stroke='black' stroke-width='5'/>");

	[0.2, 0.05].forEach(function(val, index) {
		var duration = 800;
		if (index == 0) {
			bars[index].animate(val, {
	    		duration: 1000,
	    		easing: 'easeInOut'
	    	});
		} else {
			bars[index].animate(val, {
	    		duration: duration,
	    		easing: 'easeInOut',
	    	});
		}
	});





});
