'use strict';

// Draw stacked line chart
d3.json("courses.json", function(error, json) {
	d3.json("cs_unspecialized.json", function(cuerror, cujson) {
		console.log(cujson);
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

		var avgs = {};

		avgs['ger'] = ((geravg[0] === 0) ? 0: geravg[1]/geravg[0]).toFixed(2) ;
		avgs['maj'] = ((majoravg[0] === 0) ? 0: majoravg[1]/majoravg[0]).toFixed(2) ;
		avgs['oth'] = ((otheravg[0] === 0) ? 0: otheravg[1]/otheravg[0]).toFixed(2) ;

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
	  		.attr({x1:x(1),y1:y(180),x2:x(12),y2:y(180)});

	    var color = d3.scale.category20().domain(["ger","major", "other"]);
	    
	    var classTypes = ["ger", "maj", "oth"];
	    var verbose = {
	    	"ger": "GER",
	    	"maj": "Major Requirement",
	    	"oth": "Other"
	    }

	    function addIndex(arrs, idx) {
	    		var tots = 0;
	    		for(var i = 0; i < arrs.length; i++) {
	    			tots += arrs[i][idx];
	    		}
	    		return tots;
	    }

	    function redraw(arrays, names) {
	    	graph.selectAll(".removable").remove();
	    	var y0arrs = [];
	    	
	    	for(var i = 0; i < arrays.length; i++) {
	    		var area = d3.svg.area()
	    					.x(function(d,i) {return x(i+1);})
	    					.y0(function(d,i){return y(addIndex(y0arrs, i));})
	    					.y1(function(d,i){return y(addIndex(y0arrs, i) + d);});
	    		graph.append("path")
	    				.datum(arrays[i])
	    				.attr("d", area)
	    				.attr("class", names[i] + " area removable")
	    				.style("fill", color(names[i]))
	    		y0arrs.push(arrays[i]);
	    	}
	    	if(arrays.length === 3) {
	    		drawTotalProjection();
	    	}
	    	// Hover areas
		  	var tip = d3.tip()
			  .attr('class', 'd3-tip')
			  .direction('e')
			  .style('z-index', 100)
			  .offset([-10, 0])
			  .html(function(d) {
			    return "<div style='z-index:10'><span style='color:red'>" + verbose[d] + " GPA: " + avgs[d] + "</span></div>";
			  });

			graph.call(tip);

			svg.selectAll(".area")
			.data(names)
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);
	    }	


	    function drawTotalProjection() {
	    	var endy = addIndex([gerdata,majordata,otherdata],gerdata.length - 1);
	    	var endx = gerdata.length;
	    	var slope =  (endy - 
	    	addIndex([gerdata,majordata,otherdata],0)) / (endx - 1);
	    	graph.append("line")
	  		.attr("class", "projline removable")
	  		.style("stroke-dasharray", ("2, 2"))
	  		.attr({x1:x(endx),
	  			y1:y(endy),
	  			x2:x(12),
	  			y2:y(endy +
	  			slope*(12 - endx))
	  		});
	    }
	    redraw([gerdata, majordata, otherdata], classTypes);


	  	// filter listeners
	  	var gerShown = true;
	  	var majShown = true;
	  	var othShown = true;

	  	$('.filterall').click(function(e) {
	  		gerShown = true;
		  	majShown = true;
		  	othShown = true;
	    	redraw([gerdata, majordata, otherdata], classTypes);
	  	});
	  	$('.filterger').click(function(e) {
	  		gerShown = !gerShown;
	  		refilter();
	  	});
	  	$('.filtermaj').click(function(e) {
	  		majShown = !majShown;
	  		refilter();
	  	});
	  	$('.filteroth').click(function(e) {
	  		othShown = !othShown;
	  		refilter();
	  	});

	  	function refilter() {
	  		var datas = [];
	  		var names = [];
	  		if(gerShown) {
	  			datas.push(gerdata);
	  			names.push("ger")
	  		}
	  		if(majShown) {
	  			datas.push(majordata);
	  			names.push("maj")
	  		}
	  		if(othShown) {
	  			datas.push(otherdata);
	  			names.push("oth")
	  		}
	  		redraw(datas,names);
	  	}
	});
});
