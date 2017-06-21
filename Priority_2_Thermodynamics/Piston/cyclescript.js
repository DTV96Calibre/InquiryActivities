/*
 * File: cyclescript.js
 * Purpose: 
 * Author: Emily Ehrenberger (August 2011)
 *		   Under the supervision of Margot Vigeant, Bucknell University
 *		   Based on Flash simulation by Gavin MacInnes
 * (c) Margot Vigeant 2011
*/

/*
 * This file makes use of the following libraries:
 * JQuery libraries (http://jquery.com/)
 * JQuery UI plugin (http://jqueryui.com/), used here to support "draggable" objects in ordinary browsers
 * Drag Drop Library from gotProject (http://www.gotproject.com/blog/post2.html), used to support "draggable" objects on the iPad
 * Libraries from Raphael (http://raphaeljs.com) and gRaphael (http://g.raphaeljs.com), used for graphing functionality
*/

$(document).ready(init);

var R = 83.143; // (cm^3 * bar) / (mol * K)
var Cp = (7/2)*R; // (cm^3 * bar) / (mol * K)
var Cv = (5/2)*R; // (cm^3 * bar) / (mol * K)
var CrossSection = 609.334; // cm^2
var INITIAL_TEMP = 293; // K
var INITIAL_PISTON = 40; // cm
var INITIAL_PRESSURE = 1; // bar
var INITIAL_ENTROPY = 0;
var ARROW_MAX_WIDTH = 30;

var temp;
var pressure;
var pistonPosition;
var volume;
var entropy;
var stepType;

var oldTemp;
var oldPressure;
var oldVolume;
var oldEntropy;

var savedSteps;

var PVgraphBase;
var PVgraph;
var Ppoints;
var Vpoints;
var TSgraphBase;
var TSgraph;
var Tpoints;
var Spoints;
var dotPreviewed;
var isiPad = false;
var slidingPistoniPad;


/*
*************************************************************************************************************************
*													Initialization														*
*************************************************************************************************************************
*/

function init() {
	$("#simulationDiv").hide();
	
	detectiPad();
	
	$("#continueLink").on('click', openSim);
	$("#pistonPosition").on('change', positionTextFieldChanged);
	// Set up drag-and-drop for normal browsers. If the user is on an iPad this will not detect anything (but won't break anything either)
	$("#slidingPiston").draggable( {containment:'parent', drag:pistonDragged, stop:pistonDragged} );
	
	if(isiPad) {
		// Set up drag-and-drop for iPad browsers. If the user is on a computer this will not detect anything (but won't break anything either)
		slidingPistoniPad = new webkit_draggable('slidingPiston', {onMove:pistonDraggediPad, onEnd:pistonDraggediPad});
	}
	
	$("#heatSourceTemp").on('change', getHeatSourceTemp);
	$(".stepType").on('click', getStepType);
	$("#saveStepButton").on('click', saveStep);
	$("#resetButton").on('click', resetAll);
	$("#finishCycleButton").on('click', closeCyclePressed);
	$("#about").on('click', displayAboutInfo);
	$("#instructions").on('click', displayInstructions);
	$("#toggleTooltips").on('click', toggleTooltips);
}


function detectiPad() {
	// Check whether the platform index for "iPad" is undefined (equal to -1). If so, this is NOT an iPad.
	isiPad = !(navigator.platform.indexOf("iPad") == -1);
	
	if(isiPad){
		$(".container").css("width", "95%");
	}
}

function openSim() {
	$("#introDiv").hide();
	$("#simulationDiv").show();
	
	initializeGraphs();
	resetAll();
	
	return false;
}

function initializeGraphs() {
	PVgraphBase = Raphael('PVgraphDiv');
	TSgraphBase = Raphael('TSgraphDiv');
}

function resetAll() {
	// Reset internal variables
	temp = INITIAL_TEMP;
	pressure = INITIAL_PRESSURE;
	pistonPosition = INITIAL_PISTON;
	volume = pistonPosToVolume(INITIAL_PISTON);
	entropy = INITIAL_ENTROPY;
	stepType = "Adiabatic";
	
	oldTemp = temp;
	oldPressure = pressure;
	oldVolume = volume;
	oldEntropy = entropy;
	savedSteps = new Array();
	
	// Reset input fields / gas displays
	$("#heatSourceTemp").val(temp);
	$("#gasTemp").html(temp);
	$("#gasPressure").html(pressure);
	$("#pistonPosition").val(pistonPosition);
	movePistonTo(pistonPosition);
	$(".stepType").attr("checked", false);
	$("#stepType[value=Adiabatic]").attr("checked", true);
	
	// Reset the piston insulation in the picture (shows the gray insulation)
	$("#jacket").show();
	$("#blue").hide();
	$("#red").hide();
	
	// Reset the text areas containing cycle data and other info
	$("#cycleSteps").val("Initial State: " + pressure + " bar, " + temp + " K, " + pistonPosition + " cm extension");
	$("#cycleInfo").val("");
	
	// Reset the graphs
	Ppoints = new Array();
	Ppoints[0] = INITIAL_PRESSURE;
	Vpoints = new Array();
	Vpoints[0] = pistonPosToVolume(INITIAL_PISTON);
	PVgraphBase.clear();
	PVgraph = PVgraphBase.g.linechart(10,10,190,160, Vpoints, Ppoints, {"axis":"0 0 0 0"});
	Tpoints = new Array();
	Tpoints[0] = INITIAL_TEMP;
	Spoints = new Array();
	Spoints[0] = INITIAL_ENTROPY;
	TSgraphBase.clear();
	TSgraph = TSgraphBase.g.linechart(10,10,190,160, Spoints, Tpoints, {"axis":"0 0 0 0"});
	dotPreviewed = false;
	
	scaleHeatInArrow(66);
	scaleHeatOutArrow(66);
	scaleWorkArrow(66);
	$("#workArrow").attr("src", "workOutArrow.png");
	$("#heatInLabel").html("");
	$("#heatOutLabel").html("");
	$("#netWorkLabel").html("");
	$("#heatSourceLabel").html("");
	$("#heatSinkLabel").html("");
}

/*
*************************************************************************************************************************
*													Event Handlers														*
*************************************************************************************************************************
*/

function pistonDragged(event, ui) {
	pistonPosition = pixelsToPistonPos(ui.position.top);
	processNewPosition();
}

function pistonDraggediPad() {
	// stop the piston from being dragged sideways (the gotProject library doesn't have a way to do this automatically)
	$("#slidingPiston").css("left", "0px");
	
	// read in the piston's new position
	pistonPosition = pixelsToPistonPos($("#slidingPiston").css("top"));
	
	// make sure piston is not out of range vertically (again, the jqueryui library for ordinary browswers does this
	// automatically, but the gotProject library for the iPad does not)
	if(pistonPosition > 100) {
		pistonPosition = 100;
		movePistonTo(100);
	}
	else if(pistonPosition < 10) {
		pistonPosition = 10;
		movePistonTo(10);
	}
	
	processNewPosition();
}

function positionTextFieldChanged() {
	//alert("positionTextFieldChanged");
	var newPos = $("#pistonPosition").val();
	if(newPos=="") newPos = NaN;
	
	// make sure the value entered is actually a number within range before processing
	if(isNaN(newPos)) {
		$("#pistonPosition").val(pistonPosition);
	}
	else {
		if(newPos < 10) {
			newPos = 10;
			$("#pistonPosition").val(newPos);
		}
		else if(newPos > 100) {
			newPos = 100;
			$("#pistonPosition").val(newPos);
		}
		
		pistonPosition = newPos*1; // make sure Javascript knows it's  a number, not a string
		processNewPosition();
	}
}

function getHeatSourceTemp() {
	//alert("getHeatSourceTemp");
	var newTemp = $("#heatSourceTemp").val();
	if(newTemp=="") newTemp = NaN;
	
	if(isNaN(newTemp)) {
		$("#heatSourceTemp").val(temp);
	}
	else {
		if(newTemp < 1) {
			newTemp = 1;
			$("#heatSourceTemp").val(newTemp);
		}
		temp = newTemp*1; // make sure Javascript knows it's  a number, not a string
		processNewTemp();
	}
}

function getStepType() {
	//alert("getStepType");
	stepType = $("input[name='stepType']:checked").val(); // read in the selected value from the radio buttons
	processNewStepType();
}

function closeCyclePressed() {
	var cycleCloses = closeCycle();
	if(cycleCloses) {
		calculateCycleStats();
	}
}

function displayInstructions() {
	alert("Instructions:\n\n" +
		  "Try to create an engine (or heat pump) step by step. See how " +
		  "efficient you can be!\n\n" +
		  "For each step in the cycle, choose a thermodynamic process and adjust " +
		  "the temperature and volume of the system by typing into the input " +
		  "boxes or dragging the piston. Once you have finished changing the " +
		  "state of the system, click \"Save Step\" to record the state change and " +
		  "add that step to the cycle. Look in the box to the left of the buttons " +
		  "to see the steps in your cycle so far.\n\n" +
		  "Once you have completed a cycle and returned the system to its " +
		  "initial state, click the \"Finish Cycle\" button to calculate the cycle " +
		  "efficiency. If you click \"Finish Cycle\" when at least one of the " +
		  "parameters (pressure, entropy, temperature, volume) has returned to its " +
		  "starting value, the simulation will calculate the last step of the cycle " +
		  "automatically.\n\n" +
		  "Click the \"Reset\" button to clear your cycle and start over.");
	
	return false;
}


function toggleTooltips() {
	return false;	
}

/*
 * Event Handler Function: displayAboutInfo
 * Displays a dialog box containing information about the program when the user clicks the link labeled "About this program"
*/
function displayAboutInfo(){
	alert("This program was created under the direction of Dr. Margot Vigeant at " +
		  "Bucknell University. It was initially developed in Flash by Gavin " +
		  "MacInnes, and was adapted to Javascript by Emily Ehrenberger in 2011.\n\n" +
		  "The development of this program was funded by the National Science " +
		  "Foundation Grant DUE-0442234 (2009) and DUE-0717536 (2011).\n\n" +
		  "Address any questions or comments to mvigeant@bucknell.edu.\n\n" +
		  "\u00A9 Margot Vigeant 2011");
	return false;
}


/*
*************************************************************************************************************************
*													Updating Display													*
*************************************************************************************************************************
*/

function movePistonTo(newPos) {
	//alert("movePistonTo");
	var newPosFromTop = 200 - (2 * newPos);
	newPosFromTop = Math.floor(newPosFromTop); // truncate decimal places because not all browsers can process a
												// fractional value for number of pixels
	newPosFromTop = newPosFromTop + "px";
	$("#slidingPiston").css("top", newPosFromTop);
}


function changeInsulationType() {
	//alert("changeInsulationType");
	if(stepType=="")
		return;
	
	if(stepType == "Adiabatic") {
		$("#jacket").show();
		$("#red").hide();
		$("#blue").hide();
	}
	else {
		$("#jacket").hide();
		$("#red").show();
		$("#blue").show();
		
		var redOpacity = temp / 6;
		$("#red").css("opacity", (redOpacity/100));
		$("#red").css("filter", "alpha(opacity=" + Math.floor(redOpacity) + ")");
		
		var blueOpacity = (600-temp) / 6;
		$("#blue").css("opacity", blueOpacity/100);
		$("#blue").css("filter", "alpha(opacity=" + Math.floor(blueOpacity) + ")");
	}
}

function displayPressure() {
	var pString;
	if(pressure >= 100) {
		pString = Math.round(pressure) + "";
	}
	else if(pressure >= 10) {
		pString = pressure.toFixed(1);
	}
	else {
		pString = pressure.toFixed(2);
	}
	
	$("#gasPressure").html(pString);
}

function displayTemp() {
	var tString;
	if(temp >= 10) {
		tString = Math.round(temp) + "";
	}
	else {
		tString = temp.toFixed(1);
	}
	$("#heatSourceTemp").val(tString);
	$("#gasTemp").html(tString);
}

function displayPistonPos() {
	movePistonTo(pistonPosition);
	var pistonString;
	if(pistonPosition >= 100) {
		pistonString = Math.round(pistonPosition) + "";
	}
	else {
		pistonString = pistonPosition.toFixed(1);
	}
	
	$("#pistonPosition").val(pistonString);
}

function displayStepType() {
	var stepTypeSelector = "#stepType[value=" + stepType + "]";
	
	$(".stepType").attr("checked", false);
	$(stepTypeSelector).attr("checked", true);
}

/*
*************************************************************************************************************************
*													Processing Input													*
*************************************************************************************************************************
*/

function processNewPosition() {
	switch(stepType) {
	case "Adiabatic":
		  volume = pistonPosToVolume(pistonPosition);
		  pressure = oldPressure * Math.pow((oldVolume / volume), (Cp/Cv));
		  temp = oldTemp * (volume/oldVolume) * (pressure/oldPressure);
		  entropy = oldEntropy;
		  displayPressure();
		  displayTemp();
		  break;
	case "Isothermal":
		  volume = pistonPosToVolume(pistonPosition);
		  pressure = R * temp / volume;
		  entropy = oldEntropy + R * Math.log(volume/oldVolume); // Math.log actually means ln (natural log)
		  displayPressure();
		  break;
	case "Isobaric":
		  volume = pistonPosToVolume(pistonPosition);
		  temp = volume * pressure / R;
		  entropy  = oldEntropy + Cp * Math.log(temp/oldTemp); // Math.log actually means ln (natural log)
		  displayTemp();
		  break;
	case "Isochoric": // the piston isn't allowed to move if it's isochoric, so undo the move
		  volume = oldVolume;
		  pistonPosition = volumeToPistonPos(volume);
		  break;
	default: volume = pistonPosToVolume(pistonPosition);
		  break;
	}
	
	// Make sure both the displayed number and the visual position of the piston are consistent with the current value of pistonPosition
	displayPistonPos();
	// Clear the "cycle info" text area
	$("#cycleInfo").val("");
	graphPreviewDot();
	changeInsulationType();
}

function processNewTemp() {
	//alert("processNewTemp");
	
	switch(stepType) {
	case "Adiabatic":
		  pressure = oldPressure * Math.pow((temp/oldTemp), (Cp/R));
		  volume = temp * R / pressure;
		  pistonPosition = volumeToPistonPos(volume);
		  entropy - oldEntropy;
		  if(pistonPosition > 100) {
			  pistonPosition = 100;
			  processNewPosition();
		  }
		  else if(pistonPosition < 10) {
			  pistonPosition = 10;
			  processNewPosition();
		  }
		  else {
			  displayPistonPos();
			  displayPressure();
			  displayTemp();
		  }
		  break;
	case "Isothermal": // the temperature is not allowed to change if it's isothermal, so undo the change
		  temp = oldTemp;
		  displayTemp();
		  break;
	case "Isobaric":
		  volume = R * temp / pressure;
		  pistonPosition = volumeToPistonPos(volume);
		  entropy = oldEntropy + Cp * Math.log(temp/oldTemp); // Math.log actually means ln (natural log)
		  if(pistonPosition > 100) {
			  pistonPosition = 100;
			  processNewPosition();
		  }
		  else if(pistonPosition < 10) {
			  pistonPosition = 10;
			  processNewPosition();
		  }
		  else {
			  displayPistonPos();
			  displayTemp();
		  }
		  break;
	case "Isochoric":
		  pressure = R * temp / volume;
		  entropy = oldEntropy + Cv * Math.log(temp/oldTemp); // Math.log actually means ln (natural log)
		  displayPressure();
		  displayTemp();
		  break;
	default:
		  displayTemp();
		  break;
	}
	
	// Clear the "cycle info" text area
	$("#cycleInfo").val("");
	graphPreviewDot();
	changeInsulationType();
}

function processNewStepType() {
	switch(stepType) {
	case "Adiabatic":
		 if(entropy != oldEntropy) {
			 if(volume != oldVolume) {
				processNewPosition();
			 }
			 else {
				processNewTemp();
			 }
		 }
		 break;
	case "Isothermal":
		  if(temp != oldTemp) {
			  temp = oldTemp;
			  displayTemp();
			  processNewPosition();
		  }
		  break;
	case "Isobaric":
		  if(pressure != oldPressure) {
			  pressure = oldPressure;
			  if(volume != oldVolume) {
				processNewPosition();
			  }
			 else {
				processNewTemp();
			 }
			 displayPressure();
		  }
		  break;
	case "Isochoric":
		  if(volume != oldVolume) {
			  volume = oldVolume;
			  pistonPosition = volumeToPistonPos(volume);
			  displayPistonPos();
			  processNewTemp();
		  }
		  break;
	}
	
	// Clear the "cycle info" text area
	$("#cycleInfo").val("");
	graphPreviewDot();
	changeInsulationType();
}

/*
*************************************************************************************************************************
*														Saving a Step													*
*************************************************************************************************************************
*/

function saveStep() {
	var W; // work done
	var Q; // heat transfer
	var deltaU; // change in internal energy of the gas (used to calculate Q and/or W)
	var changeType; // whether the step represents an expansion, a compression, heating, or cooling

	switch(stepType) {
	case "Adiabatic":
		  deltaU = Cv * (temp-oldTemp);
		  Q = 0;
		  W = deltaU - Q;
		  if(volume > oldVolume) {
		  	changeType = "expansion";
		  }
		  else {
		  	changeType = "compression";
		  }
		  break;
	case "Isothermal":
		  deltaU = 0;
		  W = -R * temp * Math.log(volume/oldVolume); // Math.log actually means ln (natural log)
		  Q = deltaU - W;
		  if(volume > oldVolume) {
		  	changeType = "expansion";
		  }
		  else {
		  	changeType = "compression";
		  }
		  break;
	case "Isobaric":
		  deltaU = Cv * (temp-oldTemp);
		  W = pressure * (volume - oldVolume);
		  Q = deltaU - W;
		  if(volume > oldVolume) {
		  	changeType = "expansion";
		  }
		  else {
		  	changeType = "compression";
		  }
		  break;
	case "Isochoric":
		  deltaU = Cv * (temp-oldTemp);
		  W = 0;
		  Q = deltaU - W;
		  if(temp > oldTemp) {
		  	changeType = "heating";
		  }
		  else {
		  	changeType = "cooling";
		  }
		  break;
	default:
		$("#cycleInfo").val("Please choose a thermodynamic process type.");
		return;
	}
	
	if(stepType != "Adiabatic") {
		var deltaS = entropy - oldEntropy;
		var stuff = deltaS - Q/temp;
		
		if(stepType == "Isobaric" && (deltaS - Q/temp) < 0) {
			$("#cycleInfo").val("Step is invalid. Steps must obey the thermodynamic law that deltaS - Q/T >= 0.\n\ndeltaS = " + deltaS.toFixed(4) + 
								"\nQ = " + Q.toFixed(4) + " cm^3 * bar\nT = " + temp.toFixed(4) + " K\n\ndeltaS - Q/T = " + (deltaS - Q/temp).toFixed(4));
			alert("Step not saved.");
			return false;
		}
	}
	
	$("#cycleSteps").val($("#cycleSteps").val() + "\n" + stepType + " " + changeType + " to " + pressure.toFixed(3) + " bar at " + temp.toFixed(0) + " K, " + pistonPosition.toFixed(1) + " cm\n" + " Entropy is: " + entropy.toFixed(3) + "\nWork is: " + W.toFixed(1) + " cm^3 * bar   =   " + toKiloJoules(W).toFixed(1) + " kJ\nQ is: " + Q.toFixed(1) + " cm^3 * bar   =   " + toKiloJoules(Q).toFixed(3) + " kJ");
	
	// graph the step
	graph();
	
	// create an empty object to act as an associative array containing the properties of this step
	var step = {};
	// store the thermodynamic properties in the step object
	step["stepType"] = stepType;
	step["W"] = W;
	step["Q"] = Q;
	step["T"] = temp;
	
	// save the step object by adding it to an array of all the steps
	savedSteps.push(step);
	
	// save the current state so it may be used for calculations/comparisons as the user creates the next step
	oldTemp = temp;
	oldPressure = pressure;
	oldVolume = volume;
	oldEntropy = entropy;
	dotPreviewed = false;
	
	// If nothing went wrong
	return true;
}

/*
*************************************************************************************************************************
*															Graphing													*
*************************************************************************************************************************
*/

function graph() {
	var points = generateGraphPoints();
	//Ppoints.pop();
	Ppoints = Ppoints.concat(points["P"]);
	
	//Vpoints.pop();
	Vpoints = Vpoints.concat(points["V"]);
	
	//Tpoints.pop();
	Tpoints = Tpoints.concat(points["T"]);
	
	//Spoints.pop();
	Spoints = Spoints.concat(points["S"]);
	
	PVgraphBase.clear();
	PVgraph = PVgraphBase.g.linechart(10,10,190,160, Vpoints, Ppoints, {"axis":"0 0 0 0"});
	TSgraphBase.clear();
	TSgraph = TSgraphBase.g.linechart(10,10,190,160, Spoints, Tpoints, {"axis":"0 0 0 0"});
}

function graphPreviewDot() {
	/*if(dotPreviewed) {
		Vpoints[Vpoints.length - 1] = volume;
		Ppoints[Ppoints.length - 1] = pressure;
		Tpoints[Tpoints.length - 1] = temp;
		Spoints[Spoints.length - 1] = entropy;
	}
	else {
		Vpoints.push(volume);
		Ppoints.push(pressure);
		Tpoints.push(temp);
		Spoints.push(entropy);
	}*/
	
	
	var points = generateGraphPoints();

	PVgraphBase.clear();
	PVgraph = PVgraphBase.g.linechart(10,10,190,160, Vpoints.concat(points["V"]), Ppoints.concat(points["P"]), {"axis":"0 0 0 0"});
	
	TSgraphBase.clear();
	TSgraph = TSgraphBase.g.linechart(10,10,190,160, Spoints.concat(points["S"]), Tpoints.concat(points["T"]), {"axis":"0 0 0 0"});

	dotPreviewed = true;
	//alert("Tpoints = " + Tpoints);
	//alert("Spoints = " + Spoints);
}

function generateGraphPoints() {

	// Create an empty object to act as an associative array containing the sets of point values for P, V, T, and S
	var points = {};
	points["P"] = new Array();
	points["V"] = new Array();
	points["T"] = new Array();
	points["S"] = new Array();
	
	// if the step is adiabatic, must simulate a curve (rather than a straight line) for the PV graph
	if(stepType=="Adiabatic") {
		// The coordinate arrays for pressure and volume already contain the endpoint because it was previewed for
		// the user. Remove the endpoint so we can easily push intermediate coordinates on the array
		//Ppoints.pop();
		//Vpoints.pop();
		
		var P = oldPressure;
		var V = oldVolume;
		var oldP = oldPressure;
		var oldV = oldVolume;
		
		var Vstep = (volume - oldVolume) / 50;
		
		// simulate a curve with 100 intermediate points (technically 99 intermediate points plus the endpoint)
		for(var i=1; i<=50; i++) {
			oldV = V;
			oldP = P;
			V += Vstep;
			
			P = oldP * Math.pow((oldV / V), (Cp / Cv));
			
			//Ppoints.push(P);
			//Vpoints.push(V);
			points["P"].push(P);
			points["V"].push(V);
		}
		
		points["T"].push(temp);
		points["S"].push(entropy);
		
		// refresh the PV graph with the new points
		//PVgraphBase.clear();
		//PVgraph = PVgraphBase.g.linechart(10,10,190,160, Vpoints, Ppoints, {"axis":"0 0 0 0"});
	}
	
	// If the step is not adiabatic, then there is no need to simulate a curve for the PV graph,
	// because that graph should be a straight line, which graphael does automatically
	
	
	// If the step is isobaric or isochoric, must simulate a curve for the TS graph
	else if(stepType=="Isobaric") {
		//Tpoints.pop();
		//Spoints.pop();
		
		var T = oldTemp;
		var S = oldEntropy;
		var oldT = oldTemp;
		var oldS = oldEntropy;
		
		var Sstep = (entropy - oldEntropy) / 50;
		
		// simulate a curve with 100 intermediate points (technically 99 intermediate points plus the endpoint)
		for(var i=1; i<=50; i++) {
			oldS = S;
			oldT = T;
			S += Sstep;
			
			T = oldT * Math.exp((S - oldS)/Cp);
			
			//Tpoints.push(T);
			//Spoints.push(S);
			points["T"].push(T);
			points["S"].push(S);
		}
		
		points["P"].push(pressure);
		points["V"].push(volume);
		// refresh the TS graph with the new points
		//TSgraphBase.clear();
		//TSgraph = TSgraphBase.g.linechart(10,10,190,160, Spoints, Tpoints, {"axis":"0 0 0 0"});
	}
	else if(stepType=="Isochoric") {
		Tpoints.pop();
		Spoints.pop();
		
		var T = oldTemp;
		var S = oldEntropy;
		var oldT = oldTemp;
		var oldS = oldEntropy;
		
		var Sstep = (entropy - oldEntropy) / 50;
		
		// simulate a curve with 100 intermediate points (technically 99 intermediate points plus the endpoint)
		for(var i=1; i<=50; i++) {
			oldS = S;
			oldT = T;
			S += Sstep;
			
			T = oldT * Math.exp((S - oldS)/Cv);
			
			//Tpoints.push(T);
			//Spoints.push(S);
			points["T"].push(T);
			points["S"].push(S);
		}
		
		points["P"].push(pressure);
		points["V"].push(volume);
		
		// refresh the TS graph with the new points
		//TSgraphBase.clear();
		//TSgraph = TSgraphBase.g.linechart(10,10,190,160, Spoints, Tpoints, {"axis":"0 0 0 0"});
	}
	
	// If the step is isothermal, there is no need to interpolate because both graphs will be straight lines
	else {
		points["P"].push(pressure);
		points["V"].push(volume);
		points["T"].push(temp);
		points["S"].push(entropy);
	}
	
	return points;
}

/*
*************************************************************************************************************************
*														Closing Cycle													*
*************************************************************************************************************************
*/

function closeCycle() {
	var percent;
	var pressCloses;
	var volCloses;
	var tempCloses;
	var entCloses;
	
	// Check against the last SAVED pressure, not whatever pressure the simulation happens to currently have
	percent = Math.abs(INITIAL_PRESSURE - oldPressure) / INITIAL_PRESSURE;
	percent = percent.toFixed(3) * 1;
	pressCloses = (percent <= 0.001);
	
	percent = Math.abs(pistonPosToVolume(INITIAL_PISTON) - oldVolume) / pistonPosToVolume(INITIAL_PISTON);
	percent = percent.toFixed(3) * 1;
	volCloses = (percent <= 0.001);
	
	percent = Math.abs(INITIAL_TEMP - oldTemp) / INITIAL_TEMP;
	percent = percent.toFixed(3) * 1;
	tempCloses = (percent <= 0.001);
	
	percent = Math.abs(INITIAL_ENTROPY - oldEntropy);  // would be / INITIAL_ENTROPY like the others, but INITIAL_ENTROPY is 0
	percent = percent.toFixed(3) * 1;
	entCloses = (percent <= 0.001);
	
	// Check whether the cycle is closeable
	
	if(pressCloses && volCloses && tempCloses && entCloses) {
		// cycle is already closed; no action is necessary to close it
		return true;
	}
	else if(pressCloses){
		stepType = "Isobaric";
		temp = INITIAL_TEMP;
		pistonPosition = INITIAL_PISTON;
		volume = pistonPosToVolume(INITIAL_PISTON);
		entropy = INITIAL_ENTROPY;
		displayTemp();
		displayPistonPos();
		displayStepType();
		$("#cycleInfo").val("Closing the cycle with an isobaric step...\n");
		
		var success = saveStep();
		
		if(success) {
			return true;
		}
		else {
			$("#cycleInfo").val("Attempting to close cycle with an isobaric step...\n\n" + $("#cycleInfo").val());
			return false;
		}

	}
	else if(volCloses) {
		stepType = "Isochoric";
		temp = INITIAL_TEMP;
		pressure = INITIAL_PRESSURE;
		entropy = INITIAL_ENTROPY;
		displayTemp();
		displayPressure();
		displayStepType();
		$("#cycleInfo").val("Closing the cycle with an isochoric step...\n");
		
		var success = saveStep();
		
		if(success) {
			return true;
		}
		else {
			$("#cycleInfo").val("Attempting to close cycle with an isochoric step...\n\n" + $("#cycleInfo").val());
			return false;
		}

	}
	else if(tempCloses) {
		stepType = "Isothermal";
		pressure = INITIAL_PRESSURE;
		pistonPosition = INITIAL_PISTON;
		volume = pistonPosToVolume(INITIAL_PISTON);
		entropy = INITIAL_ENTROPY;
		displayPressure();
		displayPistonPos();
		displayStepType();
		$("#cycleInfo").val("Closing the cycle with an isothermal step...\n");
		
		var success = saveStep();
		
		if(success) {
			return true;
		}
		else {
			$("#cycleInfo").val("Attempting to close cycle with an isothermal step...\n\n" + $("#cycleInfo").val());
			return false;
		}

	}
	else if(entCloses) {
		stepType = "Adiabatic";
		pressure = INITIAL_PRESSURE;
		temp = INITIAL_TEMP;
		piston = INITIAL_PISTON;
		volume = pistonPosToVolume(INITIAL_PISTON);
		displayPressure();
		displayTemp();
		displayPistonPos();
		displayStepType();
		$("#cycleInfo").val("Closing the cycle with an adiabatic step...\n");
		
		var success = saveStep();
		
		if(success) {
			return true;
		}
		else {
			$("#cycleInfo").val("Attempting to close cycle with an adiabatic step...\n\n" + $("#cycleInfo").val());
			return false;
		}
	}
	else {
		$("#cycleInfo").val("Cycle does not close. Try to make one of the variables (pressure, volume, temperature, or entropy) return to its initial value.");
		alert("pressure = " + pressure);
		return false;
	}	
}

function calculateCycleStats() {
	var efficiencyString;
	var engineType;
	var cycleType;
	var heatSourceTemp;
	var heatSinkTemp;
	
	var netWork = 0;
	var heatIn = 0;
	var heatOut = 0;
	var efficiency;
	var maxTemp = NaN;
	var minTemp = NaN;
	
	for (var i=0; i<savedSteps.length; i++) {
		netWork += savedSteps[i]["W"];
		
		if(savedSteps[i]["Q"] > 0) {
			heatIn += savedSteps[i]["Q"];
		}
		else {
			heatOut += savedSteps[i]["Q"];
		}
			
		if(isNaN(maxTemp)) {
			maxTemp = savedSteps[i]["T"];
		}
		else if(maxTemp < savedSteps[i]["T"]) {
			maxTemp = savedSteps[i]["T"];
		}
		
		if(isNaN(minTemp)) {
			minTemp = savedSteps[i]["T"];
		}
		else if(minTemp > savedSteps[i]["T"]) {
			minTemp = savedSteps[i]["T"];
		}
	}
	efficiency = -netWork / heatIn;
	
	// if the cycle requires work to be done on it to run
	if(netWork > 0.001) {
		engineType = "heat pump";

		var COP = heatIn / netWork;
		var CarnotCOP = 1 /( (maxTemp/minTemp) - 1);
		
		efficiencyString = "Cycle COP: " + COP.toFixed(4) + "\nCarnot COP: " + CarnotCOP.toFixed(4);
		/*scaleHeatOutArrow(66);
		scaleHeatInArrow(Math.abs(efficiency) * 66);
		scaleWorkArrow(1 - Math.abs(efficiency)*66);*/
		scaleArrows(heatIn, heatOut, netWork);
		$("#workArrow").attr("src", "workInArrow.png");
		heatSourceTemp = minTemp;
		heatSinkTemp = maxTemp;
		
		cycleType = determineHeatPumpType();
	}
	else if(netWork < -0.001) {
		engineType = "engine";
		var CarnotEfficiency = 1 - minTemp/maxTemp;
		efficiencyString = "Cycle Efficiency: " + efficiency.toFixed(4) + "\nCarnot Efficiency: " + CarnotEfficiency.toFixed(4);
		/*scaleHeatOutArrow(1 - Math.abs(efficiency)*66);
		scaleHeatInArrow(66);
		scaleWorkArrow(Math.abs(efficiency) * 66);*/
		scaleArrows(heatIn, heatOut, netWork);
		$("#workArrow").attr("src", "workOutArrow.png");
		heatSourceTemp = maxTemp;
		heatSinkTemp = minTemp;
		
		cycleType = determineEngineType();
	}
	else {
		$("#cycleInfo").val($("#cycleInfo").val() + "You've created an engine with a net work of 0! Your engine does nothing.\n");
		return;
	}
	
	$("#heatInLabel").html(toKiloJoules(heatIn).toFixed(1) + " kJ/mol");
	$("#heatOutLabel").html(toKiloJoules(heatOut).toFixed(1) + " kJ/mol");
	$("#netWorkLabel").html(toKiloJoules(netWork).toFixed(1) + " kJ/mol");
	$("#heatSourceLabel").html(heatSourceTemp.toFixed(1) + " K");
	$("#heatSinkLabel").html(heatSinkTemp.toFixed(1) + " K");
	if(cycleType=="other") {
		$("#cycleInfo").val($("#cycleInfo").val() + "You've created a new " + engineType + "!\nNet work = " + toKiloJoules(netWork).toFixed(1) + " kJ\n" + efficiencyString);
	}
	else {
		if(engineType=="heat pump") {
			engineType = "a heat pump";
		}
		else {
			engineType = "an engine";
		}
			
		$("#cycleInfo").val($("#cycleInfo").val() + "You've created " + engineType + " running on the " + cycleType + " cycle!\n" + efficiencyString);
	}
}

function determineHeatPumpType() {
	//alert("determineHeatPumpType");
	if(savedSteps.length == 4) {
		if(savedSteps[0]["stepType"] == "Adiabatic" && savedSteps[1]["stepType"] == "Isothermal" && savedSteps[2]["stepType"] == "Adiabatic" &&
				savedSteps[3]["stepType"] == "Isothermal") {
			return "Carnot";
		}
		else if(savedSteps[0]["stepType"] == "Isothermal" && savedSteps[1]["stepType"] == "Adiabatic" && savedSteps[2]["stepType"] == "Isothermal" &&
				savedSteps[3]["stepType"] == "Adiabatic") {
			return "Carnot";
		}
	}

	return "other";
}

function determineEngineType() {
	//alert("determineEngineType");
	if(savedSteps.length == 4) {
		
		// Check for Carnot cycle
		if(savedSteps[0]["stepType"] == "Adiabatic" && savedSteps[1]["stepType"] == "Isothermal" && savedSteps[2]["stepType"] == "Adiabatic" &&
					savedSteps[3]["stepType"] == "Isothermal") {
			return "Carnot";
		}
		else if(savedSteps[0]["stepType"] == "Isothermal" && savedSteps[1]["stepType"] == "Adiabatic" && savedSteps[2]["stepType"] == "Isothermal" &&
					savedSteps[3]["stepType"] == "Adiabatic") {
			return "Carnot";
		}
		
		
		// Check for Otto cyle
		else if(savedSteps[0]["stepType"] == "Adiabatic" && savedSteps[1]["stepType"] == "Isochoric" && savedSteps[2]["stepType"] == "Adiabatic" &&
					savedSteps[3]["stepType"] == "Isochoric") {
			return "Otto";
		}
		else if(savedSteps[0]["stepType"] == "Isochoric" && savedSteps[1]["stepType"] == "Adiabatic" && savedSteps[2]["stepType"] == "Isochoric" &&
					savedSteps[3]["stepType"] == "Adiabatic") {
			return "Otto";
		}
		
		
		// Check for Rankine cycle
		else if(savedSteps[0]["stepType"] == "Adiabatic" && savedSteps[1]["stepType"] == "Isobaric" && savedSteps[2]["stepType"] == "Adiabatic" &&
					savedSteps[3]["stepType"] == "Isobaric") {
			return "Rankine";
		}
		else if(savedSteps[0]["stepType"] == "Isobaric" && savedSteps[1]["stepType"] == "Adiabatic" && savedSteps[2]["stepType"] == "Isobaric" &&
					savedSteps[3]["stepType"] == "Adiabatic") {
			return "Rankine";
		}
		
		
		// Check for Diesel cycle
		else if(savedSteps[0]["stepType"] == "Adiabatic" && savedSteps[1]["stepType"] == "Isobaric" && savedSteps[2]["stepType"] == "Adiabatic" &&
					savedSteps[3]["stepType"] == "Isochoric") {
			return "Diesel";
		}
		else if(savedSteps[0]["stepType"] == "Isobaric" && savedSteps[1]["stepType"] == "Adiabatic" && savedSteps[2]["stepType"] == "Isochoric" &&
					savedSteps[3]["stepType"] == "Adiabatic") {
			return "Diesel";
		}
		else if(savedSteps[0]["stepType"] == "Adiabatic" && savedSteps[1]["stepType"] == "Isochoric" && savedSteps[2]["stepType"] == "Adiabatic" &&
					savedSteps[3]["stepType"] == "Isobaric") {
			return "Diesel";
		}
		else if(savedSteps[0]["stepType"] == "Isochoric" && savedSteps[1]["stepType"] == "Adiabatic" && savedSteps[2]["stepType"] == "Isobaric" &&
					savedSteps[3]["stepType"] == "Adiabatic") {
			return "Diesel";
		}
		
		
		// Check for Stirling cycle
		else if(savedSteps[0]["stepType"] == "Isothermal" && savedSteps[1]["stepType"] == "Isochoric" && savedSteps[2]["stepType"] == "Isothermal" &&
					savedSteps[3]["stepType"] == "Isochoric") {
			return "Stirling";
		}
		else if(savedSteps[0]["stepType"] == "Isochoric" && savedSteps[1]["stepType"] == "Isothermal" && savedSteps[2]["stepType"] == "Isochoric" &&
					savedSteps[3]["stepType"] == "Isothermal") {
			return "Stirling";
		}
	}
	
	return "other";
}


/*
*************************************************************************************************************************
*												Conversions and Calculations											*
*************************************************************************************************************************
*/

function scaleArrows(heatIn, heatOut, netWork) {
	var mean = (Math.abs(heatIn) + Math.abs(heatOut) + Math.abs(netWork)) / 3;
	var stdDev = Math.sqrt((Math.pow((heatIn - mean), 2) + Math.pow((heatOut - mean), 2) + Math.pow((netWork - mean), 2)) / 3);
	var z_heatIn = Math.abs(Math.abs(heatIn) - mean) / (2*stdDev) + 0.5;
	var z_heatOut = Math.abs(Math.abs(heatOut) - mean) / (2*stdDev) + 0.5;
	var z_netWork = Math.abs(Math.abs(netWork) - mean) / (2*stdDev) + 0.5;
	
	scaleHeatInArrow(z_heatIn * 100);
	scaleHeatOutArrow(z_heatOut * 100);
	scaleWorkArrow(z_netWork * 100);
}

function scaleHeatInArrow(percent) {
	var newWidth = percent / 100 * ARROW_MAX_WIDTH;
	newWidth = Math.round(newWidth);
	$("#heatInArrow").css({height:"31px", width:(newWidth+"px")});
	
	var difference = ARROW_MAX_WIDTH - newWidth;
	var leftCoord = Math.round(500 + (difference / 2));
	$("#heatInArrow").css("left", leftCoord + "px");
}

function scaleHeatOutArrow(percent) {
	var newWidth = percent / 100 * ARROW_MAX_WIDTH;
	newWidth = Math.round(newWidth);
	$("#heatOutArrow").css({height:"31px", width:(newWidth+"px")});
	
	var difference = ARROW_MAX_WIDTH - newWidth;
	var leftCoord = Math.round(500 + (difference / 2));
	$("#heatOutArrow").css("left", leftCoord + "px");
}

function scaleWorkArrow(percent) {
	var newWidth = percent / 100 * ARROW_MAX_WIDTH;
	newWidth = Math.round(newWidth);
	$("#workArrow").css({height:(newWidth+"px"), width:"31px"});
	
	var difference = ARROW_MAX_WIDTH - newWidth;
	var topCoord = Math.round(90 + (difference / 2));
	$("#workArrow").css("top", topCoord + "px");
}

function pistonPosToVolume(pistonPos) {
	//alert("pistonPosToVolume");
	return pistonPos * CrossSection;
}

function volumeToPistonPos(vol) {
	//alert("volumeToPistonPos");
	return vol / CrossSection;
}

function pistonPosToPixels(pos) {
	//alert("pistonPosToPixels");
	var pixels = 200 - (2 * pos);
	// truncate decimal places because not all browsers can process a fractional value for number of pixels
	pixels = Math.floor(pixels);
	pixels += "px";
	return pixels;
}

function pixelsToPistonPos(pixels) {
	
	// Ensure Javascript sees pixels as a string; otherwise the code to remove "px" will break
	pixels = pixels + "";
	
	// Remove "px" from the end of the "pixels" value in case "pixels" contains a raw CSS value, to ensure it contains just a number
	var ind = pixels.indexOf('p');
	if(ind > -1)
		pixels = pixels.substring(0, ind);
		
	return (200 - pixels) / 2;
}

/*
 * Function: toKiloJoules
 * Purpose: Converts energy values, like work and heat, from our units of (cm^3 * bar) to kJ
 * The conversion is the following:
 *
 * (1cm)^3 * (1 bar) = ( (1/100) m)^3 * (100,000 Pa)
 *					 = (1/10) (m^3 * Pa)
 *					 = (1/10) J
 *
 * So 10 (cm^3 * bar) = 1 J
 */
function toKiloJoules(energy) {
	return 10*energy/1000;
}