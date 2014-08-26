var timer;

// General
function resetGame() {

}

// Main
function toggleArrow(el) {
	$(el).toggleClass("downArrow");
	$(el).toggleClass("upArrow");
	
	if ($(el).hasClass("downArrow")) {
		$('#topBar').css("position", "relative").animate({
		    top:  0
		});
	} else {
		$('#topBar').css("position", "relative").animate({
		    top:  58
		});
	}
}

	// Timer
function updateTimer() {
	var time = $("#time").html();
	var m = time.split(":")[0];
	var s = time.split(":")[1];

	s++;
	if (s>60) {
		s-=60;
		m++;
	}
	if (s<10) {
		s = "0"+s;
	}
	$("#time").html(m+":"+s)
	timer = setTimeout(function(){updateTimer();}, 1000);
}

function startTimer() {
	updateTimer();
}

function pauseTimer() {
	clearTimeout(timer);
}

// Menu
function resume() {
	$('#pause').hide();
	$('#main').show();
	$('#input').focus();
	startTimer();
}

function playRandom() {
	$('#main').show();
	$('#menu').hide();
	$('#input').focus();
	startTimer();
}

function pauseMenu() {
	pauseTimer();
	$('#main').hide();
	$('#pause').show();
}

function goToCat() {
	$('#categories').show();
	//$('#searchInput').focus();
}

//Pause
function pauseToMenu() {
	$('#menu').show();
	$('#pause').hide();
	resetGame();
}

// Cat
function catToMenu() {
	$('#categories').hide();
}

function showCategories() {

}
