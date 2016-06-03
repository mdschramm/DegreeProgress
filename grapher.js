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
	    		drawTotalProjection([gerdata,majordata,otherdata]);
	    	} else if(majShown && !gerShown && !othShown) {
	    		drawTotalProjection([majordata]);
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
		 //  	var tip = d3.tip()
			//   .attr('class', 'd3-tip')
			//   .direction('e')
			//   .style('z-index', 100)
			//   .offset([-5, 0])
			//   .html(function(d) {
			//     return "<div style='z-index:10'><span style='color:white'>" + verbose[d] + " GPA: " + avgs[d] + "</span></div>";
			//   });

			// graph.call(tip);

			// svg.selectAll(".area")
			// .data(names)
			// .on('mouseover', tip.show)
			// .on('mouseout', tip.hide);
			
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
	    	var endy = addIndex(arrays,gerdata.length - 1);
	    	var endx = gerdata.length;
	    	var slope =  (endy - 
	    	addIndex(arrays,0)) / (endx - 1);
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
		var percent = 0.75;
		var bar = new ProgressBar.Circle("#majorPercent", {
		  color: '#aaa',
		  // This has to be the same size as the maximum width to
		  // prevent clipping
		  strokeWidth: 6,
		  trailWidth: 2,
		  easing: 'easeInOut',
		  duration: 1300,
		  text: {
		    autoStyleContainer: false
		  },
		  from: { color: '#FFEA82', width: 1 },
		  to: { color: '#ED6A5A', width: 4 },
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
		bar.text.style.fontSize = '6rem';

		bar.animate(percent);

		//classList
		console.log(cujson); // class,or,all,elective,ap
		

		function addRowHover(className, remUnits, unfulfilled) {
			d3.select("#classList > tbody > ."+className).append("td").html(remUnits);
			d3.select("#classList > tbody > ."+className).on('click', function() {
				console.log(unfulfilled);
			}).on('mouseover', function() {
				$(this).css({"background-color":"LightGray", "cursor":"pointer"});
			}).on('mouseout', function() {
				$(this).css("background-color", "white");
			});
		}

		var remClasses = takenList.slice();
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
				.html(req.replace(/\_/, ' '));
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
			// console.log(result[0].code);
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

	});
	});
});
