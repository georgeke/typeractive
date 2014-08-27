var timer;
var catLoaded = false;
var MAX_CHARS = 400;
var cat;

// General
function resetGame() {

}

function setup() {
	$('#menu').show(); 
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
function playRandom(cats) {
	cat = cats[Math.floor(Math.random() * cats.length)];
	Reader.readDB(cat);

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
	if (!catLoaded) {
		catLoaded = true;
		Reader.loadCats();
	}
}

//Pause
function pauseToMenu() {
	$('#menu').show();
	$('#pause').hide();
	resetGame();
}

function resume() {
	$('#pause').hide();
	$('#main').show();
	$('#input').focus();
	startTimer();
}

function restart() {
	Reader.readDB(cat);

	$('#main').show();
	$('#pause').hide();
	$('#input').focus();
	startTimer();	
}

// Cat
function catToMenu() {
	$('#categories').hide();
}

function showCategories(cats) {
	var newHTML = "";
	cats.sort();

	for (var i = 0 ; i < cats.length ; i++) {
		var cat = cats[i].replace("_", " ");

		// Simpler to do this than to parse DOM elements.
		var item = "";
		item += '<div class="cat" id="cat'+i+'" onmouseenter="$(\'#playArrow'+i+'\').show();" onmouseleave="$(\'#playArrow'+i+'\').hide();">';
		item += '<div class="catName">'+cat+'</div>';
		item += '<div class="playArrow" id="playArrow'+i+'" onmouseenter="$(\'#play'+i+'\').show();" onmouseleave="$(\'#play'+i+'\').hide();" onclick="startCat(\''+cat+'\')"></div>';
		item += '<div class="catName play" id="play'+i+'">Play</div>';
		item += '</div>';
		newHTML += item;
	}

	$('#catList').html(newHTML);
}

function filterCats(val) {
	var items = $.parseHTML($('#catList').html());
	var catId = 0;

	// Loop through all divs with class cat and hide them if their name doesn't match the input.
	for (var i = 0 ; i < items.length ; i++) {
		if (items[i].className === 'cat') {
			var divs = items[i]['children'];

			// Finding the children with class name catName
			for (var j = 0 ; j < divs.length ; j++) {
				if (divs[j].className === 'catName' && (divs[j].innerText.toLowerCase()).indexOf(val.toLowerCase()) === 0) {
					$('#cat'+catId).show();
					break;
				} else {
					$('#cat'+catId).hide();
				}
			}

			// Using separate count in case items has other random elements.
			catId++;
		}
	}
}

function startCat(cat) {
	Reader.readDB(cat);

	$('#main').show();
	$('#categories').hide();
	$('#menu').hide();
	$('#input').focus();
	startTimer();
}

// Game
function startGame(paras) {
	resetGame();

	var sentences = [];
	for (var i = 0 ; i < paras.length ; i++) {
		// [^\s.!?]{2,}?: Ignores things like A.
		var re = /([^\s.!?]{2,}?[.!?])\s/gi;

		var result = paras[i].split(re);

		// The split has the capturing group result after each split in the array, so we need to append them.
		for (var j = 0 ; j < result.length; j+=2) {
			var sentence = result[j];
			if (j+1 < result.length) {
				sentence += result[j+1];
			}
			
			sentences.push(sentence);
		}
	}

	do {
		// Random sentence index to start building with.
		var start = Math.floor(Math.random() * sentences.length);
		var test = "";

		// start to end
		for (var i = start ; i < sentences.length ; i++) {
			// +1 account for space between sentences.
			if (test.length + sentences[i].length + 1 <= MAX_CHARS) {
				test+=" "+sentences[i];
			}
		}

		// beginning of sentences to start
		for (var i = 0 ; i < start ; i++) {
			if (test.length + sentences[i].length + 1 <= MAX_CHARS) {
				test+=" "+sentences[i];
			}
		}
	// If test built is too short, reroll.
	} while (test.length < 0.75*MAX_CHARS);

	test = test.trim();
	$('#content').html(test);
}