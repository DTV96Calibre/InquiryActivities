/*
 * File: snowMelt.js
 * Purpose: To provide the animations and interactivity for the Light Radiation Activity
 * Author: Daniel Prudente (September 2012)
 *		   Under the supervision of Margot Vigeant, Bucknell University
 * (c) Margot Vigeant 2012
*/


/*
 * This file makes use of the JQuery libraries (http://jquery.com/)
*/


$(document).ready(init);

// Constants
var graphHeight = 214;
var graphWidth = 380;
var CtoKelvin = 273;
var Cinit = 20;
var Cice = 0;
var h = 100; // Free water convection (Wm^-2K^-1)
var hfusion = 334;
var joulesPerCal = 4.184;
var massWaterInit = 200; //g
var lengthCube = 1.75; //cm
var maxTemp = 20; //C
var timeStep = 75; //s
var numGraphPts = 190;
var numDataPts = 2 * numGraphPts;

var numCubes;
var gridArray;
var numEdges;
var firstX;
var firstY;
var currentStep;

var userBottom;
var userTop;
var autoBottom;
var amountRise;
var stringRise;
var userIceRise;
var iceRise;

var iceMassOrig;
var iceMass;
var iceMassOld;
var waterMass;
var iceMelt;
var tempT;
var Qmelt;
var surfArea;
var waterT;
var meltStep;

var iceMassOrig2;
var iceMass2;
var iceMassOld2;
var waterMass2;
var iceMelt2;
var tempT2;
var Qmelt2;
var surfArea2;
var waterT2;
var meltStep2;

/*
*************************************************************************
*						Initialization Functions*
*************************************************************************
*/

/*
 * Function: init
 * Sets up the page when it is loaded, hiding elements that aren't supposed to be visible right away, and
 * attaching event handlers. Also initializes input values, both in the program and in the display.
*/
function init() {
	numCubes = 0;
	numEdges = 0;
	
	// Creates an input grid to know whether or not there is a cube
	gridArray = new Array(6);
	for (var i = 0; i < 6; i++) {
		gridArray[i] = new Array(6);
		for (var j = 0; j < 6; j++) {
			gridArray [i][j] = false;	
		}
	}
	
	// Creates a copy of the grid to determine if there is more than 1 group
	copyArray = new Array(6);
	for (var i = 0; i < 6; i++) {
		copyArray[i] = new Array(6);
		for (var j = 0; j < 6; j++) {
			copyArray [i][j] = false;	
		}
	}
	
	// Makes sure that the input grid is empty
	var temp;
	for (var y = 0; y < 6; y++) {
		for (var x = 0; x < 6; x++) {
			temp = "#mark_" + y + "_" + x;
			$(temp).hide();
		}
	}
	// Makes sure that the automated grid is empty
	for (var x = 1; x <= 18; x++) {
		temp = "#mark" + x;
		$(temp).hide();	
	}
	
	$("#help").live('click', displayAboutInfo);
	$("#graph").hide();
	generateGraphPoints();
}

/*
 * Function: generateGraphPoints
 * Generates the graph points for graph to make the HTML more consise
*/
function generateGraphPoints() {
	var sit1HTML = "";
	var sit2HTML = "";
	
	for(var i=1; i<=numGraphPts; i++) {
		sit1HTML += '<img id="sit1Point' + i + '" class="sit1Point" src="blank_img.png" />';
		sit2HTML += '<img id="sit2Point' + i + '" class="sit2Point" src="blank_img.png" />';
	}
	
	$("#graph").after('<div id="graphPointsDiv">' + sit1HTML + sit2HTML + '</div>');
}

/*
 * Function: gridClick
 * Creates functionality of the grid by making each grid clickable. If the grid doesn't have a cube in it,
 * it will add a cube. If the grid square already has a cube in it, it will remove a cube. Both ways will
 * update the count of cubes in the graph.
*/
function gridClick(y, x) {
	//alert(y + ", " + x);
	if (gridArray[y][x] == false) {
		if (numCubes+1 > 13) {
			alert("Too much mass");
			return;	
		}
		gridArray[y][x] = true;
		numCubes++;
		var coordinate = "#mark_" + y + "_" + x;
		$(coordinate).show();	
		updateGrid(true);
	} else {
		gridArray[y][x] = false;
		numCubes--;
		var coordinate = "#mark_" + y + "_" + x;
		$(coordinate).hide();
		updateGrid(false);
	}
	return;
}

/*
 * Function: updateGrid
 * Helper function of gridClick. Updates the right side grid, which is the automated grid.
*/
function updateGrid(add) {
	var cube;
	if (add) {
		cube = "#mark" + numCubes;
		$(cube).show();
	} else {
		cube = "#mark" + (numCubes + 1);
		$(cube).hide();	
	}
	return;
}

/* 
 * Function: createSnowball
 * Creates a snowball based on what parts the grid has bits in them
 * x and y coordinates are switched due to the nature of how the arrays were created....
*/
function createSnowball() {
	var edge1;
	var edge2;
	var edge3;
	var edge4;
	var temp;
	
	if(numCubes==0) {
		alert("You need to make a snowball");
		return;	
	}
	
	// Copy grid into copy array
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			copyArray [i][j] = gridArray[i][j];	
		}
	}
	
	// Checks to see if the ice is in more than 1 group
	if (!determineCube()) {
		alert("You cannot have a broken up cube");
		return;
	}
	
	for (var y = 0; y < 6; y++) {
		for (var x = 0; x < 6; x++) {
			if (gridArray[y][x]) {
				//checks if there is a block above
				if (y == 0) edge1 = false;
				else edge1 = gridArray[y-1][x];
				//checks if there is a block below
				if (y == 5) edge3 = false;
				else edge3 = gridArray[y+1][x];
				//checks if there is a block to the left
				if (x == 0) edge4 = false;
				else edge4 = gridArray[y][x-1];				
				//checks if there is a block to the right
				if (x == 5) edge2 = false;
				else edge2 = gridArray[y][x+1];
				
				//Updates the image to the correct number of edges depending on what is next to it
				temp = "mark_" + y + "_" + x;
				if (edge1&&edge2&&edge3&&edge4) {
					document.getElementById(temp).setAttribute('src', "Cube-0.png");
				} else if ((!edge1)&&edge2&&edge3&&edge4) {
					document.getElementById(temp).setAttribute('src', "Cube-1.png");
					numEdges = numEdges + 1;	
				} else if ((!edge1)&&(!edge2)&&edge3&&edge4) {
					document.getElementById(temp).setAttribute('src', "Cube-1-2.png");
					numEdges = numEdges + 2;
				} else if ((!edge1)&&(!edge2)&&(!edge3)&&edge4) {
					document.getElementById(temp).setAttribute('src', "Cube-1-2-3.png");
					numEdges = numEdges + 3;	
				} else if ((!edge1)&&(!edge2)&&(!edge3)&&(!edge4)) {
					document.getElementById(temp).setAttribute('src', "Cube-1-2-3-4.png");
					numEdges = numEdges + 4;
				} else if ((!edge1)&&(!edge2)&&edge3&&(!edge4)) {
					document.getElementById(temp).setAttribute('src', "Cube-1-2-4.png");
					numEdges = numEdges + 3;	
				} else if ((!edge1)&&edge2&&(!edge3)&&edge4) {
					document.getElementById(temp).setAttribute('src', "Cube-1-3.png");
					numEdges = numEdges + 2;	
				} else if ((!edge1)&&edge2&&(!edge3)&&(!edge4)) {
					document.getElementById(temp).setAttribute('src', "Cube-1-3-4.png");
					numEdges = numEdges + 3;	
				} else if ((!edge1)&&edge2&&edge3&&(!edge4)) {
					document.getElementById(temp).setAttribute('src', "Cube-1-4.png");
					numEdges = numEdges + 2;	
				} else if (edge1&&(!edge2)&&edge3&&edge4) {
					document.getElementById(temp).setAttribute('src', "Cube-2.png");
					numEdges = numEdges + 1;	
				} else if (edge1&&(!edge2)&&(!edge3)&&edge4) {
					document.getElementById(temp).setAttribute('src', "Cube-2-3.png");
					numEdges = numEdges + 2;	
				} else if (edge1&&(!edge2)&&(!edge3)&&(!edge4)) {
					document.getElementById(temp).setAttribute('src', "Cube-2-3-4.png");
					numEdges = numEdges + 3;	
				} else if (edge1&&(!edge2)&&edge3&&(!edge4)) {
					document.getElementById(temp).setAttribute('src', "Cube-2-4.png");
					numEdges = numEdges + 2;	
				} else if (edge1&&edge2&&(!edge3)&&edge4) {
					document.getElementById(temp).setAttribute('src', "Cube-3.png");
					numEdges = numEdges + 1;	
				} else if (edge1&&edge2&&(!edge3)&&(!edge4)) {
					document.getElementById(temp).setAttribute('src', "Cube-3-4.png");
					numEdges = numEdges + 2;	
				} else {
					document.getElementById(temp).setAttribute('src', "Cube-4.png");
					numEdges = numEdges + 1;	
				}
			}
		}
	}
	// Disables the user grid so they cannot add any more blocks
	var temp;
	for (var y = 0; y < 6; y++) {
		for (var x = 0; x < 6; x++) {
			temp = "#grid_" + y + "_" + x;
			$(temp).attr("disabled", "disabled");
		}
	}
	$("#startButton").attr("disabled", "disabled");
	$("#resetButton").attr("disabled", "disabled");
	dropSnowballs();
	return;
}

/* Function: dropSnowballs
 * Run when the user clicks the "Create Snowball" button. Calculates how much the water should rise and
 * the timing of the drop of the cubes and the rise of water. Also starts the measuring simulation
*/
function dropSnowballs() {
	//alert(" ");
	findMeltingTime();
	//alert(meltStep + "  " + meltStep2);
	
	// Finds the bottom of both cubes to know when to start to raise the water level
	userBottom = findBottom(true);
	userTop = findTop();
	autoBottom = findBottom(false);
	// Converts the bottom to a delay time in milliseconds
	userBottom = 400 - 50 * userBottom;
	autoBottom = 400 - 50 * autoBottom;
	
	$("#grid1").fadeOut(100);
	$("#grid2").fadeOut(100);
	$("#graph").show();
	amountRise = (550 - (numCubes*6));
	userIceRise = (amountRise - 14) - (userTop * 42) + "px";
	iceRise = (amountRise - 14) + "px";
	stringRise = amountRise + "px";
	//alert(" amountRise: " + amountRise + " userIceRise: " + userIceRise + " stringRise: " + stringRise);

	$("#grid2Components").animate({top:"530px"}, 500, "easeOutSine", function() {
		$("#grid2Components").animate({top:iceRise}, 600, "linear");
		autoIceRise(iceRise);
	});
	$("#grid1Components").animate({top:"530px"}, 500, "easeOutSine", function() {
		$("#grid1Components").animate({top:userIceRise}, 600, "linear")
	});
	setTimeout(function(){$("#waterfill1").animate({top:stringRise}, 300, "linear", function() {
			setTimeout(function(){
				//if (meltStep == -1) $("#grid1Components").fadeTo((190*20), iceMass/iceMassOrig,"easeOutQuad");
				//else $("#grid1Components").fadeOut(meltStep*20,"easeOutQuad");
				$("#grid1Components").fadeOut(meltStep*20,"easeOutQuad");
			},600);
	})},userBottom);
	setTimeout(function(){$("#waterfill2").animate({top:stringRise}, 300, "linear", function() {
			setTimeout(function(){
				//if (meltStep2 == -1) $("#grid2Components").fadeTo((190*20), iceMass2/iceMassOrig2,"easeOutQuad");
				//else $("#grid2Components").fadeOut(meltStep2*20,"easeOutQuad");
				$("#grid2Components").fadeOut(meltStep2*20,"easeOutQuad");	
			},600);
	})},autoBottom);
	measureSimulation();
	return;
}

/*
 * Function: autoIceRise
 * Helper function of dropSnowballs. Helps make the right side cubes rise more realistically.
*/
function autoIceRise(iceRise) {
	if (numCubes > 3) {
		$("#mark4").animate({top:"0px"}, 600, "linear");
		$("#mark5").animate({top:"0px"}, 600, "linear");
		$("#mark6").animate({top:"0px"}, 600, "linear");
	}
	if (numCubes > 6) {
		$("#mark1").animate({top:"0px", left:"-40px"}, 600, "linear");
		$("#mark2").animate({top:"0px"}, 600, "linear");
		$("#mark3").animate({top:"0px", left:"250px"}, 600, "linear");	
		$("#mark7").animate({top:"15px", left:"-10px"}, 600, "linear");
		$("#mark8").animate({top:"15px", left:"60px"}, 600, "linear");
		$("#mark9").animate({top:"15px", left:"200px"}, 600, "linear");
	}
	if (numCubes > 9) {
		$("#mark10").animate({top:"15px"}, 600, "linear");
		$("#mark11").animate({top:"15px"}, 600, "linear");
		$("#mark12").animate({top:"15px"}, 600, "linear");
	}
	if (numCubes > 12) {
		$("#mark13").animate({top:"30px"}, 600, "linear");
		$("#mark14").animate({top:"30px"}, 600, "linear");
		$("#mark15").animate({top:"30px"}, 600, "linear");
	}
	if (numCubes > 15) {
		$("#mark16").animate({top:"30px",left:"-30px"}, 600, "linear");
		$("#mark17").animate({top:"30px",left:"-10px"}, 600, "linear");
		$("#mark18").animate({top:"30px",left:"250px"}, 600, "linear");
	}
}

/*
 * Function: findBottom
 * Helper function of dropSnowballs. Finds the bottom-most cube of a grid.
*/
function findBottom(user) {
	var bottom = 0;
	if (user) {
		for (var y = 0; y < 6; y++) {
			for (var x = 0; x < 6; x++) {
				if (gridArray[y][x]) {
					if (y > bottom) bottom = y;
				}
			}
		}
	} else {
		if (numCubes <= 3) bottom = 0;
		else if (numCubes <= 6)	bottom = 1;
		else if (numCubes <= 9) bottom = 2;
		else if (numCubes <= 12) bottom = 3;
		else if (numCubes <= 15) bottom = 4;
		else bottom = 5;
	}
	return bottom;
}

/*
 * Function: findTop
 * Helper function of dropSnowballs. Finds the top-most cube of a grid.
*/
function findTop() {
	for (var y = 0; y < 6; y++) {
		for (var x = 0; x < 6; x++) {
			if (gridArray[y][x]) {
				if (y < 5) return y;
			}
		}
	}
	return 5;
}

/*
 * Function: resetSnowball
 * Resets the simulation.
*/
function resetSnowball() {
	var temp;
	numCubes=0;
	numEdges=0;
	// Resets user grid
	for (var y = 0; y < 6; y++) {
		for (var x = 0; x < 6; x++) {
			temp = "mark_" + y + "_" + x;
			document.getElementById(temp).setAttribute('src', "Cube-Grid-Filler.png");
			gridArray[y][x] = false;
			temp = "#mark_" + y + "_" + x;
			$(temp).hide();
		}
	}
	// Shows grids
	$("#grid1").show();
	$("#grid2").show();
	$("#grid1Components").css("top", "0px");
	$("#grid2Components").css("top", "0px");
	//Reset Water Table
	$("#waterfill1").css("top", "550px");
	$("#waterfill2").css("top", "550px");
	resetAutoGrid();
	// Enables the user grid so they can add blocks
	for (var y = 0; y < 6; y++) {
		for (var x = 0; x < 6; x++) {
			temp = "#grid_" + y + "_" + x;
			$(temp).removeAttr("disabled");
		}
	}
	// Resets automated grid
	for (var x = 1; x <= 18; x++) {
		temp = "#mark" + x;
		$(temp).hide();	
	}
	//Hides the graph and the points
	$("#graph").hide();
	$(".sit1Point").hide();
	$(".sit2Point").hide();
	$("#startButton").removeAttr("disabled");
	
	//Shows the ice cubes again
	$("#grid1Components").show();
	$("#grid2Components").show();
	
	return;
}

/*
 * Function: determineCube
 * Finds whether or not the user side grid consists of more than one "snowball."
*/
function determineCube() {
	var firstX = 6;
	var firstY = 6;
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			if (gridArray[i][j] == true && firstX == 6 && firstY == 6) {
					firstX = i;
					firstY = j;
			}
		}
	}
	deleteGrid(firstX, firstY);
	
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			if (copyArray[i][j] == true) {
				return false;
			}
		}
	}
	return true;
}

/*
 * Function: deleteGrid
 * Helper function of determineCube. Makes a grid from true to false and any grid cube
 * next to the selected grid cube false.
*/
function deleteGrid(X,Y) {
	copyArray[X][Y] = false;
	if (X != 5 && copyArray[X+1][Y] == true) deleteGrid(X+1,Y);
	if (Y != 5 && copyArray[X][Y+1] == true) deleteGrid(X,Y+1);
	if (X != 0 && copyArray[X-1][Y] == true) deleteGrid(X-1,Y);
	if (Y != 0 && copyArray[X][Y-1] == true) deleteGrid(X,Y-1);
	return;
}

/*
 * Function: simulationSetup
 * Sets up constants needed for measuring the simulation
*/
function simulationSetup() {
	waterT = Cinit+CtoKelvin;
	//alert("waterT: " + waterT);
	iceMass = lengthCube*lengthCube*lengthCube*numCubes;
	//alert("iceMass: " + iceMass);
	surfArea = (lengthCube*lengthCube*numCubes*2+lengthCube*lengthCube*numEdges)/10000;
	//alert("surfArea: " + surfArea);
	waterMass = massWaterInit;
	//alert("waterMass: " + waterMass);
	
	waterT2 = waterT;
	iceMass2 = iceMass;
	surfArea2 = (lengthCube*lengthCube*numCubes*6)/10000;
	waterMass2 = waterMass;
	currentStep = 0;
	
	iceMassOrig = iceMass;
	iceMassOrig2 = iceMass;
}

/*
 * Function: findMeltingTime
 * Finds the melting time for the cubes in each beaker to set up the animation fade time
*/
function findMeltingTime() {
	simulationSetup();
	findMeltStep();
	simulationSetup();
	findMeltStep2();
	simulationSetup();	
}

/*
 * Function: measureSimulation
 * The actual simulation. Calculates temperature and plots it.
*/
function measureSimulation() {
	if (currentStep < numDataPts) {
		Qmelt = (waterT-(Cice+CtoKelvin))*h*surfArea*timeStep;
		//alert("Qmelt: " + Qmelt);
		iceMelt = Qmelt/hfusion;
		//alert("iceMelt: " + iceMelt);
		iceMassOld = iceMass;
		iceMass = iceMassOld - iceMelt;
		//alert("iceMass: " + iceMass);
		if (iceMass > 0.1) {
			tempT = waterT - Qmelt/((iceMelt+waterMass)*joulesPerCal);
			//alert("tempT: " + tempT);
			waterT = (waterMass*tempT + iceMelt*(Cice+CtoKelvin))/(iceMelt+waterMass);
			//alert("waterT: " + waterT);
			waterMass = waterMass + iceMelt;
			//alert("waterMass: " + waterMass);
			surfArea = iceMass/iceMassOld*surfArea;
		}
		
		Qmelt2 = (waterT2-(Cice+CtoKelvin))*h*surfArea2*timeStep;
		iceMelt2 = Qmelt2/hfusion;
		iceMassOld2 = iceMass2;
		iceMass2 = iceMass2 - iceMelt2;
		if (iceMass2 > 0.1) {
			tempT2 = waterT2 - Qmelt2/((iceMelt2+waterMass2)*joulesPerCal);
			waterT2 = (waterMass2*tempT2 + iceMelt2*(Cice+CtoKelvin))/(iceMelt2+waterMass2);
			waterMass2 = waterMass2 + iceMelt2;
			surfArea2 = iceMass2/iceMassOld2*surfArea2;
		}
		
		// Plots every other data point
		if (currentStep % 2 == 0) {
			x1 = 38 + currentStep + "px";
			x2 = 39 + currentStep + "px";
			
			y1 = (graphHeight - (waterT-CtoKelvin)*(graphHeight/maxTemp) + 68); + "px";
			y2 = (graphHeight - (waterT2-CtoKelvin)*(graphHeight/maxTemp) + 68); + "px";

			if ((y2-y1) < 1.5) {
				y2 = y2 + "px";
				y1 = y2;	
			} else {
				y1 = y1 + "px";
				y2 = y2 + "px";
			}
			
			//alert(y1 + "    " + y2);
			
			var dot1 = "#sit1Point" + (currentStep/2);
			var dot2 = "#sit2Point" + (currentStep/2);
			$(dot1).css({top:y1, left:x1});
			$(dot2).css({top:y2, left:x2});
			$(dot1).show();
			$(dot2).show();
		}
				
		currentStep++;
		setTimeout(measureSimulation, 40);
	} else {
		$("#resetButton").removeAttr("disabled");	
	}
}

/*
 * Function: findMeltStep
 * Helper function of findMeltingTime. Finds the melting time for the cubes in the user grid.
*/
function findMeltStep() {
	if (currentStep < numDataPts) {
		Qmelt = (waterT-(Cice+CtoKelvin))*h*surfArea*timeStep;
		iceMelt = Qmelt/hfusion;
		iceMassOld = iceMass;
		iceMass = iceMass - iceMelt;
		if (iceMass > 0.1) {
			tempT = waterT - Qmelt/((iceMelt+waterMass)*joulesPerCal);
			waterT = (waterMass*tempT + iceMelt*(Cice+CtoKelvin))/(iceMelt+waterMass);
			waterMass = waterMass + iceMelt;
			surfArea = iceMass/iceMassOld*surfArea;
		} else {
			meltStep = currentStep;
			//alert(currentStep);
			return;
		}
		currentStep++;
		findMeltStep();
	} else {
		//meltStep = -1;
		meltStep = currentStep;
		return;
	}
}

/*
 * Function: findMeltStep2
 * Helper function of findMeltingTime. Finds the melting time for the cubes in the automated grid.
*/
function findMeltStep2() {
	if (currentStep < numDataPts) {
		Qmelt2 = (waterT2-(Cice+CtoKelvin))*h*surfArea2*timeStep;
		iceMelt2 = Qmelt2/hfusion;
		iceMassOld2 = iceMass2;
		iceMass2 = iceMass2 - iceMelt2;
		if (iceMass2 > 0.1) {
			tempT2 = waterT2 - Qmelt2/((iceMelt2+waterMass2)*joulesPerCal);
			waterT2 = (waterMass2*tempT2 + iceMelt2*(Cice+CtoKelvin))/(iceMelt2+waterMass2);
			waterMass2 = waterMass2 + iceMelt2;
			surfArea2 = iceMass2/iceMassOld2*surfArea2;
		} else {
			meltStep2 = currentStep;	
			return;
		}
		currentStep++;
		findMeltStep2();
	} else {
		//meltStep2 = -1;
		meltStep2 = currentStep;
		return;
	}
}

/*
 * Function: resetAutoGrid
 * Resets the cubes in the automated grid to their correct positions.
*/
function resetAutoGrid() {
	$("#mark1").css("top", "0px");
	$("#mark2").css("top", "0px");
	$("#mark3").css("top", "0px");
	$("#mark4").css("top", "42px");
	$("#mark5").css("top", "42px");
	$("#mark6").css("top", "42px");
	$("#mark7").css("top", "84px");
	$("#mark8").css("top", "84px");
	$("#mark9").css("top", "84px");
	$("#mark10").css("top", "126px");
	$("#mark11").css("top", "126px");
	$("#mark12").css("top", "126px");
	$("#mark13").css("top", "168px");
	$("#mark14").css("top", "168px");
	$("#mark15").css("top", "168px");
	$("#mark16").css("top", "210px");
	$("#mark17").css("top", "210px");
	$("#mark18").css("top", "210px");
	
	$("#mark1").css("left", "1px");
	$("#mark2").css("left", "85px");
	$("#mark3").css("left", "169px");
	$("#mark4").css("left", "43px");
	$("#mark5").css("left", "127px");
	$("#mark6").css("left", "211px");
	$("#mark7").css("left", "1px");
	$("#mark8").css("left", "85px");
	$("#mark9").css("left", "169px");
	$("#mark10").css("left", "43px");
	$("#mark11").css("left", "127px");
	$("#mark12").css("left", "211px");
	$("#mark13").css("left", "1px");
	$("#mark14").css("left", "85px");
	$("#mark15").css("left", "169px");
	$("#mark16").css("left", "43px");
	$("#mark17").css("left", "127px");
	$("#mark18").css("left", "211px");
}

/*
 * Function: displayAboutInfo
 * Alerts information about the program.
*/
function displayAboutInfo() {
	alert("Click on the grid squares on the left grid to create " +
		"a \"snowball\" made of packed ice cubes formed into a single " +
		"unit to be put into Beaker 1. Each cube must connected to at " +
		"minimum one other cube either vertically or horizontally. " +
		"Beaker 2 will have ice chips of equal mass of the \"snowball\" " +
		"that will be put into Beaker 1. Additionally, both beakers are in " +
		"a closed environment where no energy enters or leaves the system.");
	return false;
}