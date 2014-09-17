var MAX_CHARS = 400;
var MAX_REROLL = 50;
var paused = true;
var timer;
var catLoaded = false;
var cat;
var test;
var mistakes = 0;
var charsTyped = 0;
var seconds = 0;

// General
function resetGame() {
    this.mistakes = 0;
    this.charsTyped = 0;
    this.seconds = 0;
    this.paused = true;
    $("#content").html("");
    $("#input").val("");
    $("#wpm").html("0");
    $("#time").html("0:00");
    $("#acc").html("100%");
}

function setup() {
    $('#menu').show();

    // Prevent image ghost drag.
    var imgs = $('img');
    for (var i = 0; i < imgs.length; i++) {
        imgs[i].onmousedown =  function(e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
        };
    }
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
            top:  64
        });
    }
}

function pauseMenu() {
    pauseTimer();
    $('#main').hide();
    $('#pause').show();
    $('#input').blur();
}

    // Timer
function updateTimer() {
    var time = $("#time").html();
    var m = time.split(":")[0];
    var s = time.split(":")[1];

    this.seconds++;
    s++;
    if (s>=60) {
        s-=60;
        m++;
    }
    if (s<10) {
        s = "0"+s;
    }
    $("#time").html(m+":"+s);
    this.timer = setTimeout(function(){updateTimer();}, 1000);
}

function startTimer() {
    updateTimer();
}

function pauseTimer() {
    clearTimeout(this.timer);
}

function getEndMessage(wpm) {
    if (wpm <= 20) {
        return "Nice try...";
    } else if (wpm <= 35) {
        return "Keep practicing!";
    } else if (wpm <= 50) {
        return "Good!";
    } else if (wpm <= 70) {
        return getRandomMessage(
            ["Not bad!", "Go get it!", "Sauve!", "Cool!"]
        );  
    } else if (wpm <= 80) {
        return getRandomMessage(
            ["Legit!", "Nice!", "You rock!", "Tell em'!", "That's it!"]
        );  
    } else if (wpm <= 98) {
        return getRandomMessage(
            ["Astounding!", "Teach me!", "Showstopper!", "Nice one!", "Grrrrrreat", "Nice nice nice", "Super!", "Solid."]
        );  
    } else if (wpm === 99) {
        return "Almost to 100!";
    } else if (wpm === 100) {
        return "0 to 100, real quick.";
    } else if (wpm <= 120) {
        return getRandomMessage(
            ["Amazing!!", "Unstoppable!!", "Tip top!!", "Beast Mode: ON"]
        );  
    } else {
        return getRandomMessage(
            ["You're a MONSTER!", "Are you human??", "Cowabunga~"]
        );
    }
}

function getRandomMessage(msgs) {
    var roll = Math.floor(Math.random() * msgs.length);
    for (var i = 0 ; i < msgs.length ; i++) {
        if (roll===i) {
            return msgs[i];
        }
    }
}

    // During the test
function updateTest(input) {
    // input !== "": When placeholder is set, IE triggers the oninput... nice.
    if (this.paused && input !== "") {
        this.paused = false;
        this.startTimer();
    }

    var numCorrect = 0;
    for (var i = 0 ; i < input.length ; i++) {
        if (input.charAt(i) === test.charAt(i)) {
            numCorrect = i;
            $('#letter'+i).css('background-color', 'orange');

            // Ending the game.
            if (i===test.length-1) {
                // Or else you cen keep typing...
                $('#input').blur();

                clearTimeout(timer);

                var wpm = ($('#wpm').html()).split(" ")[0];
                var acc = $('#acc').html();
                var time = $('#time').html();

                $('#endMessage').html(getEndMessage(wpm));
                $('#endWPM').html(wpm);
                $('#endAcc').html(acc);
                $('#endTime').html(time);

                $('#end').show();
                $('#main').hide();
                this.resetGame();
            }

            // Set cursor to next letter and clear everything after.
            if (i===input.length-1) {
                this.charsTyped++;
                if (test.charAt(i+1)) {
                    $('#letter'+(i+1)).css('background-color', 'gray');
                }
                for (var j = i+2 ; j < test.length ; j++) {
                    $('#letter'+j).css('background-color', 'white');
                }
            }
        } else {
            $('#letter'+i).css('background-color', 'red');
            this.mistakes++;
            // Reset letters after that are coloured.
            for (var j = i+1 ; j < test.length ; j++) {
                $('#letter'+j).css('background-color', 'white');
            }
            break;
        }
    }

    // A word is counted as 5 characters typed correctly.
    var wpm = Math.ceil(((numCorrect/5) / (this.seconds/60)));
    if (!isFinite(wpm)) {
        wpm = 0;
    }
    $('#wpm').html(wpm);

    // Accuracy: Mistakes / Net chars typed
    var acc = (100 - (this.mistakes/this.charsTyped)).toFixed(1);
    if (!isFinite(acc) || acc === 100) {
        acc = 100;
    }
    $('#acc').html(acc+"%");
}

// Menu
function playRandom(cats) {
    cat = cats[Math.floor(Math.random() * cats.length)];
    // readDB initializes the test and resets the game ASYNC
    Reader.readDB(cat);

    $('#main').show();
    $('#menu').hide();
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
}

function restart() {
    Reader.readDB(this.cat);

    $('#main').show();
    $('#pause').hide();
    $('#input').blur();
}

// Cat
function catToMenu() {
    $('#categories').hide();
}

function showCategories(cats) {
    var newHTML = "";
    cats.sort();

    for (var i = 0 ; i < cats.length ; i++) {
        var cat = cats[i];

        // Simpler to do this than to parse DOM elements.
        var item = "";
        item += '<div class="cat" id="cat'+i+'" onmouseenter="$(\'#playArrow'+i+'\').show();" onmouseleave="$(\'#playArrow'+i+'\').hide();">';
        item += '<div class="catName">'+cat.replace(/_/g, " ")+'</div>';
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
    this.cat = cat;

    $('#main').show();
    $('#categories').hide();
    $('#menu').hide();
}

// Game
function startGame(paras) {
    this.resetGame();

    var sentences = [];
    for (var i = 0 ; i < paras.length ; i++) {
        // [^A-Z\s.!?][^\s.!?]:     Ignores things like A. or G.
        // ["'\)]?:                 Match chars such as " after the period.
        var re = /([^A-Z\s.!?][^\s.!?][.!?]["'\)]*?)\s/gi;

        // Some paragraphs have trailing whitespace.
        paras[i] = paras[i].trim();
        var result = paras[i].split(re);

        // The split has the capturing group result after each split in the array, so we need to append them.
        for (var j = 0 ; j < result.length; j+=2) {
            var sentence = result[j];
            if (j+1 < result.length) {
                sentence += result[j+1];
            }
            
            sentence = sentence.trim();
            sentences.push(sentence);
        }
    }

    // In case of infinite loop, set max re-roll.
    var iterations = 0;
    do {
        iterations++;

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
    } while (test.length < 0.75*MAX_CHARS && iterations <= MAX_REROLL);

    test = test.trim();
    test = test.replace("/&nbsp;/g", " ");
    test = test.replace("/\s/g", "");

    this.test = test;

    // Need to convert each letter of this test string into a seperate span for styling.
    var newHTML = "";

    for (var i = 0 ; i < test.length ; i++) {
        newHTML+= "<span class='letter' id='letter"+i+"'>"+test.charAt(i)+"</span>";
    }

    $('#content').html(newHTML);
}

// End
function endToMenu() {
    $('#end').hide();
    $('#main').hide();
    $('#menu').show();
}

function retry() {
    Reader.readDB(cat);

    $('#main').show();
    $('#end').hide();
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}