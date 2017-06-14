$(document).ready(init);

var smallSubstance;
var smallTemp;
var smallVolume;
var showAnimations = true;
var zoomPlaying = false;

function init() {
	$("#zoomInBackdrop").hide();
	$("#zoomInfo").hide();
	$("#smallBeakerPour").detach();
	$("#eyedropper").hide();
	$("#dyeDrops").hide();
	$("#zoomLink").hide();
	$("#demoInstructions").hide();
	$("#experimentParameters").hide();
	$("#experimentResults").hide();
	$("#tryItButton").hide();
	$("#smallBeakerConcentration").hide();
	$("#smallBeakerConcentration").hide();
	$("#bigLiquid").hide();
	$("#smallLiquid").hide();
	
	generateZoomDots();
	
	$("#submitButton").live('click', questionAnswered);
	$("#tryItButton").live('click', mix);
	$("#smallBeakerSubstanceSelect").live('change', getSmallSubstance);
	$("#smallBeakerTempSelect").live('change', getSmallTemp);
	$("#toggleAnimations").live('click', toggleAnimations);
	$("#zoomLink").live('click', showZoom);
	$("#about").live('click', displayAboutInfo);
}

function questionAnswered(){
	var answer = $("#quiz:checked").val();
	var responseText;
		
	if(answer=="a")
		responseText = "You chose answer a) Higher.";
	else if (answer=="b")
		responseText = "You chose answer b) The same.";
	else if (answer=="c")
		responseText = "You chose answer c) Lower.";
	else if (answer=="d")
		responseText = "You chose answer d) Not enough information.";
	else
		return;
		
	
	$("#defaultSmallSubstance").attr("selected","selected");
	$("#defaultSmallTemp").attr("selected", "selected");
	resetExperiment();
	
	$("#startQuestion").hide();
	$("#responseText").html(responseText);
	$("#responseText").show();
	$("#demoInstructions").show();
	$("#experimentParameters").show();
	$("#tryItButton").show();
	$("#bigLiquid").show();
	$("#smallLiquid").show();
}

function resetExperiment() {
	$("#zoomLink").hide();
	$("#experimentResults").hide();
	$("#tryItButton").html("Try it!");
	$("#smallBeakerSubstanceSelect").removeAttr("disabled");
	getSmallSubstance();
	$("#eyedropper").hide();
	$("#bigLiquid").css("background", "url('bigLiquid.png') 0 0");
	$("#smallLiquid").show();
	$("#tryItTitle").show();
	$("#instructionsParagraph").html("Try mixing hot and cold water and see what happens to the entropy. You can also try mixing oil and water or dye and water.");
	
	if(zoomPlaying)
		showZoom();
}

/*
*************************************************************************
*								Event Handlers							*
*************************************************************************
*/

function displayAboutInfo(){
	alert("This program was created under the direction of Dr. Margot Vigeant at \n" +
		  "Bucknell University. It was developed in Flash by Gavin MacInnes in\n" +
		  "2006, and was adapted to Javascript by Emily Ehrenberger in 2011.\n\n" +
		  "The development of this program was funded by the National Science\n" +
		  "Foundation Grant DUE-0442234 (2009) and DUE-0717536 (2011).\n\n" +
		  "Address any questions or comments to mvigeant@bucknell.edu.\n\n" +
		  "                                                Copyright.");
	return false;
}

function getSmallSubstance() {
	smallSubstance = $("#smallBeakerSubstanceSelect").val();
	
	if(smallSubstance=="water") {
		$("#smallBeakerTempSelect").removeAttr("disabled");
		getSmallTemp();
		$("#smallLiquid").css("background", "url('smallLiquid.png') 0 0");
	}
	else {
		$("#defaultSmallTemp").attr("selected", "selected");
		$("#smallBeakerTempSelect").attr("disabled", "disabled");
		smallTemp = 25;
	}
	
	if(smallSubstance=="dye") {
		$("#smallBeakerConcentration").show();
		$("#smallBeakerVolume").html("1 mL");
		smallVolume = 1;
		$("#smallLiquid").css("background", "url('smallLiquid.png') 0 -59px");
	}
	else {
		$("#smallBeakerConcentration").hide();
		$("#smallBeakerVolume").html("100 mL");
		smallVolume = 100;
	}
	
	if(smallSubstance=="oil") {
		$("#smallLiquid").css("background", "url('smallLiquid.png') -60px 0");
	}
}

function getSmallTemp() {
	smallTemp = $("#smallBeakerTempSelect").val();
}

function toggleAnimations() {
	if(showAnimations){
		showAnimations = false;
		$("#toggleAnimations").html("Enable animations");
	}
	else {
		showAnimations = true;
		$("#toggleAnimations").html("Disable animations");
	}
	
	return false;
}

function mix() {
	
	if($("#tryItButton").html() == "Try it!") {
		
		$("#smallBeakerSubstanceSelect").attr("disabled", "disabled");
		$("#smallBeakerTempSelect").attr("disabled", "disabled");
		
		if(smallSubstance=="water") {
			if(showAnimations)
				animateWater();
			else {
				$("#smallLiquid").hide();
				$("#bigLiquid").css("background", "url('bigLiquid.png') 0 -65px");
				mixWater();
			}
		}
		else if(smallSubstance=="oil") {
			if(showAnimations)
				animateOil();
			else {
				$("#smallLiquid").hide();
				$("#bigLiquid").css("background", "url('bigLiquid.png') -91px 0");
				mixOil();
			}
		}
		else if(smallSubstance=="dye") {
			if(showAnimations)
				animateDye();
			else {
				$("#smallLiquid").hide();
				$("#bigLiquid").css("background", "url('bigLiquid.png') -91px -65px");
				mixDye();
			}
		}
	}
	else {
		$("#tryItTitle").html("Try it out!");
		resetExperiment();
	}
}

function mixWater() {
	// Change the water temperatures to Kelvin (small beaker is hot; big beaker is cold)
	var hot = (smallTemp*1) + 273.15;
	var cold = 25 + 273.15;
	var mixed = (hot + cold) / 2;
	var sum = hot + cold;
	
	var hotEntropyChange;
	var coldEntropyChange;
	var totalEntropyChange;
	
	if(hot==cold) {
		hotEntropyChange = (70.1*(-12.5) + 10*42)/298.15 * 1e-7;
		coldEntropyChange = (70.1*25)/298.15 * 1e-7;
		totalEntropyChange = hotEntropyChange + coldEntropyChange;
		mixed = mixed - 273.15; //convert mixed back to celsius
		mixed = mixed + totalEntropyChange*298.15/(4.18*200);
		
		$("#instructionsParagraph").html("The temperatures were the same, so the entropy does not change.  However, to be " +
										 "absolutely rigorous, even changing the surface area of the water causes a change " +
										 "in surface energy, which results in a small change in entropy.");
		$("#bigBeakerEntropyChange").val(coldEntropyChange.toExponential(2) + " J/K");
		$("#smallBeakerEntropyChange").val(hotEntropyChange.toExponential(2) + " J/K");
		$("#totalEntropyChange").val(totalEntropyChange.toExponential(2) + " J/K");
		$("#otherResult").show();
		$("#otherResult").val(mixed.toFixed(7) + " °C");
	}
	else {
		hotEntropyChange = 4.18 * 100 * Math.log(mixed/hot);
		coldEntropyChange = 4.18 * 100 * Math.log(mixed/cold);
		totalEntropyChange = hotEntropyChange + coldEntropyChange;
		
		$("#instructionsParagraph").html("The entropy change involved in a change in temperature is proportional to the " +
										 "natural log of the ratio of the final and initial temperatures.  The hot water " +
										 "loses less entropy than the cold water gains.");
		$("#bigBeakerEntropyChange").val(coldEntropyChange.toFixed(2) + " J/K");
		$("#smallBeakerEntropyChange").val(hotEntropyChange.toFixed(2) + " J/K");
		$("#totalEntropyChange").val(totalEntropyChange.toFixed(2) + " J/K");
		mixed = mixed  - 273.15; //convert mixed back to celsius
		$("#otherResult").show();
		$("#otherResult").val(mixed + " °C");
	}
	
	$("#bigBeakerEntropyChangeLabel").html("Cold Water<br />Entropy Change:");
	$("#smallBeakerEntropyChangeLabel").html("Hot Water<br />Entropy Change:");
	$("#otherResultLabel").show();
	$("#otherResultLabel").html("Final Temperature:");
	
	$("#zoomLink").html("Click here to see<br />how water mixes");
	$("#zoomLink").show();
	$("#responseText").hide();
	$("#tryItTitle").hide();
	$("#experimentResults").show();
	$("#tryItButton").removeAttr("disabled");
	$("#tryItButton").html("Do another!");
}

function mixOil() {
	var oilEntropyChange = (16.5 * -12.5 + 16.5 * 42)/298.15 * 1e-7;
	var waterEntropyChange = ((70.1-50) * 25)/298.15 * 1e-7;
	var totalEntropyChange = oilEntropyChange + waterEntropyChange;

	$("#bigBeakerEntropyChangeLabel").html("Water<br />Entropy Change:");
	$("#bigBeakerEntropyChange").val(waterEntropyChange.toExponential(2) + " J/K");
	$("#smallBeakerEntropyChangeLabel").html("Oil<br />Entropy Change:");
	$("#smallBeakerEntropyChange").val(oilEntropyChange.toExponential(2) + " J/K");
	$("#totalEntropyChange").val(totalEntropyChange.toExponential(2) + " J/K");
	$("#otherResultLabel").hide();
	$("#otherResult").hide();
	$("#instructionsParagraph").html("The oil and water do not mix, but there is a small amount of entropy involved " +
									 "in creating and destroying surface and interfacial boundaries.");
	
	$("#responseText").hide();
	$("#tryItTitle").hide();
	$("#experimentResults").show();
	$("#tryItButton").removeAttr("disabled");
	$("#tryItButton").html("Do another!");
}

function mixDye() {
	var dyeEntropyChange = -.001*8.314*Math.log(.001/(100/18.02+.001));
	var waterEntropyChange = -100/18.02*8.314*Math.log((100/18.02)/(100/18.02+.001));
	var totalEntropyChange = dyeEntropyChange + waterEntropyChange;
	
	$("#bigBeakerEntropyChangeLabel").html("Water<br />Entropy Change:");
	$("#bigBeakerEntropyChange").val(waterEntropyChange.toFixed(3) + " J/K");
	$("#smallBeakerEntropyChangeLabel").html("Dye<br />Entropy Change:");
	$("#smallBeakerEntropyChange").val(dyeEntropyChange.toFixed(3) + " J/K");
	$("#totalEntropyChange").val(totalEntropyChange.toFixed(3) + " J/K");
	$("#otherResultLabel").show();
	$("#otherResultLabel").html("Final Concentration:");
	$("#otherResult").show();
	$("#otherResult").val("0.01 M");
	$("#instructionsParagraph").html("When a dye is mixed with water, the change in concentration results in a change in entropy.");
	
	$("#zoomLink").html("Click here to see<br />how the dye mixes");
	$("#zoomLink").show();
	$("#responseText").hide();
	$("#tryItTitle").hide();
	$("#experimentResults").show();
	$("#tryItButton").removeAttr("disabled");
	$("#tryItButton").html("Do another!");
}

/*
*************************************************************************
*							Animation Functions							*
*************************************************************************
*/

function animateWater() {
	$("#tryItButton").attr("disabled", "disabled");
	moveWaterBeaker();
}

function moveWaterBeaker() {
	$("#smallBeaker").animate({top:"-90px", left:"295px"}, 1000, "linear");
	$("#smallLiquid").animate({top:"-67px", left:"302px"}, 1000, "linear", pourWater);
}

function pourWater() {
	$("#smallBeaker").hide();
	$("#smallLiquid").hide();
	$("#smallLiquid").after('<img id="smallBeakerPour" src="blank_img.png" />');
	$("#smallBeakerPour").css("background", "url('smallBeakerPour2.gif') -150px 0");
	$("#smallBeakerPour").animate({top:"-99px"}, 500, "linear", changeBigBeakerWater);
}

function changeBigBeakerWater() {
	$("#bigLiquid").css("background", "url('bigLiquid.png') 0 -65px");
	$("#smallBeakerPour").animate({top:"-99px"}, 1000, "linear", finishAnimateWater);
}

function finishAnimateWater() {
	$("#smallBeakerPour").detach();
	$("#smallBeaker").show();
	$("#smallLiquid").css({top:"83px", left:"372px"});
	$("#smallBeaker").animate({top:"60px", left:"365px"}, 1000, "linear", mixWater);
}

function animateOil() {
	$("#tryItButton").attr("disabled", "disabled");
	moveOilBeaker();
}

function moveOilBeaker() {
	$("#smallBeaker").animate({top:"-90px", left:"295px"}, 1000, "linear");
	$("#smallLiquid").animate({top:"-67px", left:"302px"}, 1000, "linear", pourOil);
}

function pourOil() {
	$("#smallBeaker").hide();
	$("#smallLiquid").hide();
	$("#smallLiquid").after('<img id="smallBeakerPour" src="blank_img.png" />');
	$("#smallBeakerPour").css("background", "url('smallBeakerPour2.gif') 0 0");
	$("#smallBeakerPour").animate({top:"-99px"}, 500, "linear", changeBigBeakerOil);
}

function changeBigBeakerOil() {
	$("#bigLiquid").css("background", "url('bigLiquid.png') -91px 0");
	$("#smallBeakerPour").animate({top:"-99px"}, 1000, "linear", finishAnimateOil);
}

function finishAnimateOil() {
	$("#smallBeakerPour").detach();
	$("#smallBeaker").show();
	$("#smallLiquid").css({top:"83px", left:"372px"});
	$("#smallBeaker").animate({top:"60px", left:"365px"}, 1000, "linear", mixOil);
}

function animateDye() {
	$("#tryItButton").attr("disabled", "disabled");
	$("#eyedropper").show();
	raiseEyedropper();
}

function raiseEyedropper() {
	$("#eyedropper").animate({top:"-45px", left:"380px"}, 300, "linear", moveEyedropperLeft);
}

function moveEyedropperLeft() {
	$("#eyedropper").animate({top:"-95px", left:"255px"}, 700, "linear", releaseDye);
}

function releaseDye() {
	$("#dyeDrops").show();
	$("#dyeDrops").animate({top:"68px", left:"263px"}, 600, "linear", changeBigBeakerDye);
}

function changeBigBeakerDye() {
	$("#bigLiquid").css("background", "url('bigLiquid.png') -91px -65px");
	$("#dyeDrops").animate({top:"100px", left:"263px"}, 200, "linear", moveEyedropperRight);
}

function moveEyedropperRight() {
	$("#eyedropper").animate({top:"-45px", left:"385px"}, 700, "linear", finishAnimateDye);
}

function finishAnimateDye() {
	$("#dyeDrops").hide();
	$("#dyeDrops").css({top:"-30px", left:"263px"});
	$("#eyedropper").animate({top:"20px", left:"395px"}, 300, "linear", mixDye);
}



function generateZoomDots() {
	var zoomHTML = '<div id="zoomDiv">';
	var coldHTML = '<img id="cold1" class="coldDot" src="blank_img.png" />';
	var hotHTML = '<img id="hot1" class="hotDot" src="blank_img.png" />';
	
	for(var i=2; i<=250; i++) {
		coldHTML += '<img id="' + "cold" + i + '" class="coldDot" src="blank_img.png" />';
		hotHTML += '<img id="' + "hot" + i + '" class="hotDot" src="blank_img.png" />';
	}
	
	zoomHTML += coldHTML + hotHTML + '</div>';
	$("#zoomInBackdrop").after(zoomHTML);
	$("#zoomDiv").hide();
}

function showZoom() {
	if(zoomPlaying) {
		$("#zoomInfo").hide();
		$("#zoomInBackdrop").hide();
		$("#zoomDiv").hide();
		zoomPlaying = false;
	}
	else {
		if(smallSubstance=="water") {
			$(".coldDot").css("background-color", "blue");
			$(".hotDot").css("background-color", "red");
			$("#cold1").css("top", "1px");
			$("#cold1").css("left", "-9px");
			$("#hot1").css("top", "1px");
			$("#hot1").css("left", "11px");
			$("#zoomInfo").val("The hot and cold water mixes through diffusion. Can diffusion unmix the water?");
			
			for (var i=2; i<=250; i++) {
				
				randomizeColdPosition("#cold" + i);
				randomizeHotPosition("#hot" + i);
			}
		}
		else if(smallSubstance=="dye") {
			$(".coldDot").css({"background-color":"green", left:"0px", top:"0px"});
			$(".hotDot").css({"background-color":"green", left:"0px", top:"0px"});
			$("#zoomInfo").val("The individual molecules of dye are mixed by Brownian (random) motion. Can the process be reversed?");
		}
		
		zoomPlaying = true;
		$("#zoomInfo").show();
		$("#zoomInBackdrop").show();
		$("#zoomDiv").show();
		animateZoomDots();
	}
	
	return false;
}

function randomizeColdPosition(name) {
	var x = 200;
	var y = 150;
	
	while( (Math.pow(x, 2)+Math.pow(y, 2)) > 4688) {
		x = -Math.random()*100;
		y = Math.random()*100;
		if (Math.random()>0.5) {
			y = y*-1;
		}
	}
	
	x = x + "px";
	y = y + "px";
	
	$(name).css("top", y);
	$(name).css("left", x);
}

function randomizeHotPosition(name) {
	var x = 200;
	var y = 150;
	
	while( (Math.pow(x, 2)+Math.pow(y, 2)) > 4688) {
		x = Math.random()*100;
		y = Math.random()*100;
		if (Math.random()>0.5) {
			y = y*-1;
		}
	}
	
	x = x + "px";
	y = y + "px";
	
	$(name).css("top", y);
	$(name).css("left", x);
}


function animateZoomDots() {
	if(!zoomPlaying)
		return;
	
	var x, y, xmove, ymove, name, ind;
	
	for(var i=1; i<=250; i++) {
		// Randomly move the "cold" dot
		name = "#cold" + i;
		x = $(name).css("left");
		ind = x.indexOf("p");
		x = x.substring(0, ind);
		
		y = $(name).css("top");
		ind = y.indexOf("p");
		y = y.substring(0, ind);
		
		xmove = (x*1) + determineXMove(x, y);
		ymove = (y*1) + determineYMove(x, y);
		xmove = xmove + "px";
		ymove = ymove + "px";
		$(name).css({left:xmove, top:ymove});
		
		// Randomly move the "hot" dot
		name = "#hot" + i;
		x = $(name).css("left");
		ind = x.indexOf("p");
		x = x.substring(0, ind);
		
		y = $(name).css("top");
		ind = y.indexOf("p");
		y = y.substring(0, ind);
		
		xmove = (x*1) + determineXMove(x, y);
		ymove = (y*1) + determineYMove(x, y);
		xmove = xmove + "px";
		ymove = ymove + "px";
		
		if(i==250) {
			
			$(name).animate({left:xmove, top:ymove}, 5, "linear", animateZoomDots);
		}
		else {		
			$(name).css({left:xmove, top:ymove});
		}
	}
}

function determineXMove(x, y) {
	var xmove;
	
	// If the dot is already at the edge of the circle, move it towards the
	// middle of the circle
	if (Math.pow((x), 2)+Math.pow((y), 2)>4688) {
		if(x > 0)
			xmove = -3;
		else
			xmove = 3;
	}
	// Otherwise, determine the move randomly
	else {
		xmove = Math.floor(4*Math.random());
		if (Math.random()>0.5) {
			xmove = xmove*-1;
		}
	}
	
	return xmove;
}

function determineYMove(x, y) {
	var ymove;
	
	// If the dot is already at the edge of the circle, move it towards the
	// middle of the circle
	if (Math.pow((x), 2)+Math.pow((y), 2)>4688) {
		if(y > 0)
			ymove = -3;
		else
			ymove = 3;
	}
	// Otherwise, determine the move randomly
	else {
		ymove = Math.floor(4*Math.random());
		if (Math.random()>0.5) {
			ymove = ymove*-1;
		}
	}
	
	return ymove;
}