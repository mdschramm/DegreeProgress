'use strict';

// Draw stacked line chart
d3.json("courses.json", function(error, json) {
	d3.json("cs_unspecialized.json", function(cuerror, cujson) {
	d3.json("prereqs.json", function(preerror, prejson) {
		if (error) return console.warn(error);
		//process data
		var gerdata = [0,0,0,0,0,0];
		var majordata= [0,0,0,0,0,0];
		var otherdata = [0,0,0,0,0,0];

		var geravg = [0,0];
		var majoravg = [0,0];
		var otheravg = [0,0];

		var takenList = [];
		for(var quarter=0; quarter < json.length; quarter++){
			var ger = 0;
			var maj = 0;
			var oth = 0;
			for(var course=0; course< json[quarter].length; course++) {
				var info = json[quarter][course];
				takenList.push(info);
				var fulf = info[1];
				var units = info[2];
				var grade = info[3];
				if(fulf === "ger") {
						geravg[0]++;
						geravg[1]+=grade;
						ger += units;
				} else if(fulf === "major") {
						majoravg[0]++;
						majoravg[1]+=grade;
						maj += units;
				} else { // other
						otheravg[0]++;
						otheravg[1]+=grade;
						oth += units;
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
		// width = 750 - margin.left - margin.right,
		// height = 500 - margin.top - margin.bottom;

		//try with NEW HEIGHTS
		width = 500 - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom;

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
	  	var goallineColor = function(unitsLeft, totalUnits) {
			// color picker for pace line
			var colors = ["#6EFF00", "#C4FF00", "#FFEB00", "#FF8900", "#FF1000"];
			var numQuarters = json.length;
			var numUnitsTaken = 0;
			var countUnits = function() {
				for (var i = 0; i < numQuarters; i++) {
					var curQuarter = json[i]; //units
					for (var j = 0; j < curQuarter.length; j++) {
						var units = curQuarter[j][2];
						numUnitsTaken += units;
					}
				}
			}
			countUnits();
			var isAll = false;
			if (unitsLeft == undefined) {
				unitsLeft = 180 - numUnitsTaken;
				isAll = true;
			}

			if (totalUnits == undefined) {
				totalUnits = 180;
			}
			var quartersLeft = 12 - numQuarters;
			var paceLeft = unitsLeft/quartersLeft;
			var pickColor = function(isAll) {
				var pickedColor = null;
				
				if (isAll) {
					if (paceLeft <= 14) {
						pickedColor = colors[0];
						console.log(pickedColor);
					} else if (paceLeft <= 15) {
						pickedColor = colors[1];
					} else if (paceLeft <= 16) {
						pickedColor = colors[2];
					} else if (paceLeft <= 17) {
						pickedColor = colors[3];
					} else { //greater than 17, in trouble!
						pickedColor = colors[4];
					}
					console.log("PICKED!: " + pickedColor);
				} else { //for major
					if (paceLeft <= 5) {
						pickedColor = colors[0];
						console.log(pickedColor);
					} else if (paceLeft <= 6.5) {
						pickedColor = colors[1];
					} else if (paceLeft <= 8.4) {
						pickedColor = colors[2];
					} else if (paceLeft <= 10) {
						pickedColor = colors[3];
					} else { //greater than 17, in trouble!
						pickedColor = colors[4];
					}
					console.log("not all: " + pickedColor);
				}
				//now we have color, pick saturation
				// quartersLeft = 9;
				var sat = ((quartersLeft/12)-0.08333)*100;
				var colorObj = tinycolor(pickedColor);
				var finalColor = colorObj.desaturate(sat).toString();
				// $("#TEST").css('background-color', finalColor);
				return finalColor;

			}
			return pickColor(isAll);
		};

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
	    		drawTotalProjection([gerdata,majordata,otherdata]);
	    		graph.append("line")
			  		.attr("class", "goalline removable")
			  		.style("stroke-dasharray", ("3, 3"))
	  				.attr({x1:x(1),y1:y(180),x2:x(12),y2:y(180)});
	    	} else if(majShown && !gerShown && !othShown) {
	    		drawTotalProjection([majordata]);
	    		graph.append("line")
			  		.attr("class", "goalline removable")
			  		.style("stroke-dasharray", ("3, 3"))
	  				.attr({x1:x(1),y1:y(100),x2:x(12),y2:y(100)});
	    	}

	    	$('.area')
	    	.on('mouseover', highlight)
	    	.on('mouseout', unHighlight);

	    	function highlight(e) {
	    		$('.area').each(function(idx, element) {
	    			$(element).css('opacity', 0.3);
	    		});
	    		$(e.target).css("opacity", 1);
	    	}

	    	function unHighlight(e) {
	    		$('.area').each(function(idx, element) {
	    			$(element).css('opacity', 1);
	    		});
	    	}
	    	//Hover areas
		  	var tip = d3.tip()
			  .attr('class', 'd3-tip')
			  .direction('e')
			  .style('z-index', 100)
			  .style('margin-bottom', '30px')
			  .offset([-5, 0])
			  .html(function(d) {
			  	var gpa = avgs[d];
			  	console.log(gpa);
			  	if (gpa == "NaN") {
			  		gpa = "No classes taken for credit yet";
			  	} 
			    return "<div style='z-index:10'><span style='color:white'>" + verbose[d] + " GPA: " + gpa + "</span></div>";
			  });

			graph.call(tip);

			svg.selectAll(".area")
			.data(names)
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);
			
			/**** SAVE DO AFTER POSTER!!! ***/
			// var majText = "Major GPA: " + avgs.maj;
			// // console.log(avgs);
			// Tipped.create('.maj', majText, {
			// 	position: 'right',
			// 	title: "Major Requirments",
			// 	size: "large",
			// 	skin: 'light',
			// 	onShow: function(content, element) {
			// 		// $(element).addClass('highlight');
			// 		var toptip = $(content).parent().parent().parent().parent().parent();
			// 		console.log(toptip[0]);
			// 		var pixels = json.length * 30;//quarter * certain amount of pixels
			// 		toptip.css('left', ""+pixels+"px");
			// 		toptip.css('position', 'relative');
			// 	},
			// 	afterHide: function(content, element) {
			// 		// $(element).removeClass('highlight');
			// 	}
			// });
			// console.log($(".tpd-tooltip")[0]);
			// $(".tpd-tooltip").css('left', "1000px");
			// Tipped.create('.ger', 'gerdata');
	    }	


	    function drawTotalProjection(arrays) {
	    	var len = arrays.length; //if 1, then major, else everything
	    	var endy = addIndex(arrays,gerdata.length - 1);
	    	var endx = gerdata.length;
	    	var slope =  (endy - 
	    	addIndex(arrays,0)) / (endx - 1);
	    	var rightColor = null;
	    	if (len == 1) { //units left\
	    		console.log("HDKASHDKAHSDFK");
	    		var totalUnits = 100;
	    		var majorUnits = 0;
	    		for (var i = 0; i < json.length; i++) {
	    			var curQuarter = json[i];
	    			for (var j = 0; j < curQuarter.length; j++) {
	    				var curClass = curQuarter[j];
	    				// ["CS 106A", "major", 5,3.7]
	    				if (curClass[1] == "major") {
	    					majorUnits += curClass[2];
	    				}
	    			}
	    		}
	    		console.log(majorUnits);
	    		var unitsLeft = 100 - majorUnits;
	    		var quartersLeft = 12 - json.length;
	    		// var pace = unitsLeft/quartersLeft;
	    		// console.log("PACE");
	    		// console.log(pace);
	    		rightColor = goallineColor(unitsLeft, totalUnits);
	    	}
	    	else rightColor = goallineColor();
	    	graph.append("line")
	  		.attr("class", "projline removable")
	  		.style("stroke-dasharray", ("2, 2"))
	  		.style("stroke", rightColor)
	  		.style("stroke-width", 1.5)
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

	  	// $('#toggleAll').change(function() {
	  	// 	// alert("Got em");
	  	// 	$('#toggleGER').bootstrapToggle('on');
	  	// 	$('#toggleMajor').bootstrapToggle('on');
	  	// 	$('#toggleOther').bootstrapToggle('on');
	  	// 	gerShown = true;
		  // 	majShown = true;
		  // 	othShown = true;
	   // 		redraw([gerdata, majordata, otherdata], classTypes);
	  	// });

	  	$('#toggleGER').change(function() {
	  		// alert("Got em");
	  		gerShown = !gerShown;
	  		// if (gerShown && majShown && othShown) {
	  		// 	$('#toggleAll').bootstrapToggle('on');
	  		// } else {
	  		// 	$('#toggleAll').bootstrapToggle('off');
	  		// }
	  		refilter();
	  	});

	  	$('#toggleMajor').change(function() {
	  		majShown = !majShown;
	  		// if (gerShown && majShown && othShown) {
	  		// 	$('#toggleAll').bootstrapToggle('on');
	  		// } else {
	  		// 	$('#toggleAll').bootstrapToggle('off');
	  		// }
	  		refilter();
	  	});

	  	$('#toggleOther').change(function() {
	  		othShown = !othShown;
	  		// if (gerShown && majShown && othShown) {
	  		// 	$('#toggleAll').bootstrapToggle('on');
	  		// } else {
	  		// 	$('#toggleAll').bootstrapToggle('off');
	  		// }
	  		refilter();
	  	});

	  	// $('.filterall').click(function(e) {
	  	// 	gerShown = true;
		  // 	majShown = true;
		  // 	othShown = true;
	   //  	redraw([gerdata, majordata, otherdata], classTypes);
	  	// });
	  	// $('.filterger').click(function(e) {
	  	// 	gerShown = !gerShown;
	  	// 	refilter();
	  	// });
	  	// $('.filtermaj').click(function(e) {
	  	// 	majShown = !majShown;
	  	// 	refilter();
	  	// });
	  	// $('.filteroth').click(function(e) {
	  	// 	othShown = !othShown;
	  	// 	refilter();
	  	// });
// new toggle


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

	  	  	// CR/NR BAR!!
	  	  // get data
	  	var creditUnits = 0;
	  	var activityUnits = 0;
	  	for (var i = 0; i < json.length; i++) {
	  		var quarter = json[i];
	  		for (var j = 0; j < quarter.length; j++) {
	  			var curClass = quarter[j];
	  			if (curClass[3] == "cr/ncr") { // add to credit list
	  				creditUnits += curClass[2];
	  				console.log("adding " + curClass[0]);
	  				if (curClass[1] == "act") {
	  					activityUnits += curClass[2];
	  					console.log("adding act " + curClass[0]);
	  				}
	  			}
	  		}
	  	}
	  	if (creditUnits < 10) {
	  		creditUnits = "0"+creditUnits;
	  	}
	  	creditUnits =16;
	  	$("#actunits").text(""+activityUnits+"/8");
	  	$("#creditunits").text(""+creditUnits+"/36");
	  	var percentCredit = creditUnits/36;
	  	var percentAct = activityUnits/36;
	  	//first make the labels

		function createMultiBar(container, Shape, optsArray) {
		    return optsArray.map(function(opts) {
		        return new Shape(container, opts);
		    });
		}

		var bars = createMultiBar(
		    '#container2',
		    ProgressBar.Line,
		    [
		        {color: '#FCB03C', strokeWidth: 3, trailColor: 'LightGrey', trailWidth: 1.2},
				{color: 'blue', strokeWidth: 3}
			]
		);
		// svg.append("line")
		// var $container = $("#labels1");
		// $container.append("<line x1='0' y1='0' x2='0' y2='10' stroke='black' stroke-width='5'/>");

		[percentCredit, percentAct].forEach(function(val, index) {
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

		// Now let's do the major %/total left meter
		var percent = 0.97;

		var bar = new ProgressBar.Circle("#majorPercent", {
		  color: '#aaa',
		  // This has to be the same size as the maximum width to
		  // prevent clipping
		  strokeWidth: 7,
		  trailWidth: 3,
		  easing: 'easeInOut',
		  duration: 1300,
		  text: {
		    autoStyleContainer: false
		  },
		  from: { color: '#FFEA82', width: 2 },
		  to: { color: '#ED6A5A', width: 7 },
		  // Set default step function for all animate calls
		  step: function(state, circle) {
		    circle.path.setAttribute('stroke', state.color);
		    circle.path.setAttribute('stroke-width', state.width);

		    var value = Math.round(circle.value() * 100);
		    if (value === 0) {
		      circle.setText('');
		    } else {
		      circle.setText(value+"%");
		    }

		  }
		});
		bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
		bar.text.style.fontSize = '2.5rem';

		bar.animate(percent);

		//classList

		function flatten() {
		    var flat = [];
		    for (var i = 0; i < arguments.length; i++) {
		        if (arguments[i] instanceof Array) {
		            flat.push.apply(flat, flatten.apply(this, arguments[i]));
		        } else {
		            flat.push(arguments[i]);
		        }
		    }
		    return flat;
		}

		function drawNodes(unfulfilled) {
			var nodesets = [];
			var edgesets = [];
			var flattened = flatten(unfulfilled);
			for (var i = 0; i < flattened.length; i++) {
				var course = flattened[i];
				if(course.type === "class") {
					var toTake = [course.number];
					var taken = [];
					var edges = [];
					var prs = prereq(course.number);
					makeClassList(toTake,taken, prs, edges, null);
					nodesets.push(toTake.concat(taken));
					edgesets.push(edges);
				} else if(course.type === "elective") {
					console.log("SHIT!");
				}
			};
			//figure out how to pick
			for (var i = 0; i < nodesets.length; i++) {
				var nodes = nodesets[i];
				var uniqueNodes = [];
				$.each(nodes, function(i, el){
				    if($.inArray(el, uniqueNodes) === -1) uniqueNodes.push(el);
				});
				var edges = edgesets[i];
				makeNodesAndLinks(uniqueNodes, edges);
				break;
			};
		}

		function makeNodesAndLinks(nodes, edges) {
			var nodeMap = {};
			for (var i = 0; i < nodes.length; i++) {
				nodeMap[nodes[i]] = i;
			};
			var links = [];
			for (var i = 0; i < edges.length; i++) {
				var src = nodeMap[edges[i][1]];
				var dest = nodeMap[edges[i][0]];
				console.log(edges[i], nodeMap);
				console.log(src, dest);
				if(src && dest){
					links.push({"source":src,"target":dest});
				}
			};

			console.log(nodes,edges,links);

			var w = 500;
			var h = 250;
			var force = d3.layout.force()
				.charge(-120)
			    .linkDistance(30)
			    .size([w, h]);

			var gsvg = d3.select("#nodearea").append("svg")
				    .attr("width", w)
				    .attr("height", h);

			force
				.nodes(nodes)
				.links(links)
				.start();

			var link = gsvg.selectAll('.link')
			    .data(links)
			    .enter().append('line')
			    .attr('class', 'link')
			    .style("stroke-width",1);

			// Now it's the nodes turn. Each node is drawn as a circle.

			var node = gsvg.selectAll('.node')
			    .data(nodes)
			    .enter().append('circle')
			    .attr('class', 'node')
			    .attr("r", 20)
			    .attr("fill", "none")
			    .attr("stroke", "black")
			    .call(force.drag);
			
			node.append("title")
			.text(function(d) {return d;});

			force.on("tick", function() {
			    link.attr("x1", function(d) { console.log(d.source.x);return d.source.x; })
			        .attr("y1", function(d) { return d.source.y; })
			        .attr("x2", function(d) { return d.target.x; })
			        .attr("y2", function(d) { return d.target.y; });

			    node.attr("cx", function(d) { return d.x; })
			        .attr("cy", function(d) { return d.y; });
  			});

			
		}


		function makeClassList(toTake, taken, prs, edges,parent) {
			var kays = Object.keys(prs);
			for(var i =0; i < kays.length; i++) {
				edges.push([parent, kays[i]]);
				if(typeof prs[kays[i]] === "string") {
					if(prs[kays[i]] === "end") {
						toTake.push(kays[i]);
					} else {
						taken.push(kays[i]);
					}
				} else {
					makeClassList(toTake,taken, prs[kays[i]], edges, kays[i]);
				}
			}
		}
		

		function addRowHover(className, remUnits, unfulfilled) {
			d3.select("#classList > tbody > ."+className).append("td").html(remUnits);
			d3.select("#classList > tbody > ."+className).on('click', function() {
				drawNodes(unfulfilled);
			}).on('mouseover', function() {
				$(this).css({"background-color":"LightGray", "cursor":"pointer"});
			}).on('mouseout', function() {
				$(this).css("background-color", "white");
			});
		}

		var remClasses = takenList.slice();
		// console.log(remClasses);
		var electives = cujson["Elective Classes"];

		function checkFulf(requirement, remClasses, fulfillType, remUnits) {
			switch(fulfillType) {
				case "all":
					if(requirement.units) { //top level
						remUnits[0] = requirement.units;
					}
					var courses = requirement.classes;
					var unfulfilled = [];
					for(var i = 0; i < courses.length;i++) {
						var innerUnfulf = checkFulf(courses[i], remClasses, courses[i].type,remUnits);
						if(innerUnfulf.length > 0) {
							unfulfilled.push(innerUnfulf);
						}
					}
					return unfulfilled;
				case "or":
					var courses = requirement.classes;
					var unfulfilled = [];
					for(var i = 0; i < courses.length;i++) {
						var innerUnfulf = checkFulf(courses[i], remClasses, courses[i].type,remUnits);
						if(innerUnfulf.length > 0) {
							unfulfilled.push(innerUnfulf);
						} else {
							return [];
						}
					}
					return unfulfilled;
				case "class":
					for(var i=0; i<remClasses.length; i++) {
						if (remClasses[i][0] === requirement.number) {
							remUnits[0] -= remClasses[i][2];
							remClasses.splice(i,1);
							return [];							
						}
					}
					return [requirement];
				case "elective":
					var name = requirement.electives;
					for(var i=0; i<remClasses.length; i++) {
						for(var j=0; j < electives[name].length; j++) {
							if(remClasses[i][0] === electives[name][j]) {
							remUnits[0] -= remClasses[i][2];
							remClasses.splice(i,1);
							return [];
							}
						}
					}
					return [requirement];
				case "AP":
					return [];
			}
		}
		for(var req in cujson.Requirements) {
			var remUnits = [0];
			var unfulfilled = checkFulf(cujson.Requirements[req], remClasses, "all", remUnits);
			req = req.replace(/\s/g, '\_');
			if (remUnits[0] > 0) {
				d3.select('#classList > tbody')
				.append("tr")
				.attr("class", req)
				.append("td")
				.html(req.replace(/\_/g, ' '));
				addRowHover(req, remUnits[0], unfulfilled);
			}
		}

		var hasTaken = function(curClass) {
			for (var i = 0; i < takenList.length; i++) {
				var cur = takenList[i][0]; //gets name
				if (curClass == cur) return true;
			}
			return false;
		}

		var specialOrs = {
			"CS 106B": "CS 106X",
			"CS 106X": "CS 106B"
		};
		var tree = [];
		// takenList is available
		var prereqRec = function(curClass) {
			// class is the name of the class
			var tree = {};
			var result = $.grep(prejson, function(e){
				return e.code == curClass;
			});
			if(result.length === 0) return "end";
			var prereqArr = result[0].prereq;
			if (prereqArr.length == 0) return "end";
			// has array of classes for prereqs
			var innerTree = {};
			var sameSet = {};
			for (var i = 0; i < prereqArr.length; i++) {
				var cur = prereqArr[i];
				//part of taken list
				if (hasTaken(cur)) {
					sameSet[cur] = true;
					innerTree[cur] = "taken";
					continue;
				}
				var special = specialOrs[cur];
				if (special != undefined && sameSet[special]) { // copy already in here
					// remove and combine
					console.log(special);
					var otherTree = innerTree[special];
					console.log(otherTree);
					delete innerTree[special];
					var newName = special + " or " + cur;
					innerTree[newName] = otherTree;
					sameSet[cur] = true;
					continue;
				}
				sameSet[cur] = true;
				var prereqTree = prereqRec(cur); // for this specific class
				innerTree[cur] = prereqTree;
			}
			return innerTree;
			//can check for ors here and make note of it
			//takenList
		};

		// console.log(takenList);

		var prereq = function(curClass) {
			var tree = {};
			var nodes = prereqRec(curClass);
			// console.log(nodes);
			tree[curClass] = nodes;
			return tree;
			// return at end
		};
		// color picker for pace line
		var colors = ["#6EFF00", "#C4FF00", "#FFEB00", "#FF8900", "#FF1000"];
		// var colors = ["rgb(110, 255, 0)", "rgb(196, 255, 0)", "rgb(255, 235, 0)", "rgb(255, 137, 0)", "rgb(255, 16, 0)"];
		var numQuarters = json.length;
		var numUnitsTaken = 0;
		var countUnits = function() {
			for (var i = 0; i < numQuarters; i++) {
				var curQuarter = json[i]; //units
				for (var j = 0; j < curQuarter.length; j++) {
					var units = curQuarter[j][2];
					numUnitsTaken += units;
				}
			}
		}
		countUnits();
		console.log(numUnitsTaken);
		var unitsLeft = 180 - numUnitsTaken;
		var quartersLeft = 12 - numQuarters;
		var paceLeft = 18;//unitsLeft/quartersLeft;
		console.log(unitsLeft);
		console.log(quartersLeft);
		console.log(paceLeft);
		var pickColor = function() {
			var pickedColor = null;
			console.log(paceLeft);
			if (paceLeft <= 14) {
				pickedColor = colors[0];
				console.log(pickedColor);
			} else if (paceLeft <= 15) {
				pickedColor = colors[1];
			} else if (paceLeft <= 16) {
				pickedColor = colors[2];
			} else if (paceLeft <= 17) {
				pickedColor = colors[3];
			} else { //greater than 17, in trouble!
				pickedColor = colors[4];
			}
			//now we have color, pick saturation
			quartersLeft = 9;
			var sat = ((quartersLeft/12)-0.08333)*100;
			console.log(sat);
			console.log(pickedColor);
			var colorObj = tinycolor(pickedColor);
			var finalColor = colorObj.desaturate(sat).toString();
			// var finalColor = colorObj.rgbArray();
			// var colorString = "rgb("
			// for (var k = 0; k < finalColor.length; k++) {
			// 	if (k == (finalColor.length-1)) {
			// 		colorString += finalColor[k];
			// 	} else {
			// 		colorString += finalColor[k] + ",";
			// 	}
			// }
			// colorString += ")"
			// console.log(colorString);
			$("#TEST").css('background-color', finalColor);

			}
		pickColor();
	});
	});
});
