var MAX_CHARS = 300;
var MAX_REROLL = 50;
var paused = true;
var timer;
var catLoaded = false;
var cat;
var test;
var mistakes = 0;
var charsTyped = 0;
var seconds = 0;
// index of current choice on category screen
var choiceIndex = -1;
var choices = [];
var catNameList = [];
var catFilterList = [];

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
    Reader.loadDB();

    // Binding key shortcuts
    $(document).keydown(keyBindFunc);

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

function keyBindFunc(e) {
    var key = e.keyCode ? e.keyCode : e.which;

    // Prevent backspace default if not inputting
    if ($('#searchInput').is(':not(:focus)') && $('#input').is(':not(:focus)') && key === 8) {
        e.preventDefault();
    }

    if ($('#loading').is(':not(:visible)')) {
        if ($('#main').is(':not(:hidden)')) {
            // Main: Bind ESC to pause game
            if (key === 27) {
                pauseMenu();
            }
        } else if ($('#menu').is(':not(:hidden)')) {
            // Menu: R and C
            if (key === 82) {
                Reader.getCats();
            } else if (key === 67) {
                goToCat();
            }
        } else if ($('#pause').is(':not(:hidden)')) {
            // Pause: R, E, Q, ESC
            if (key === 82) {
                restart();
            } else if (key === 69 || key === 27) {
                resume();
            } else if (key === 81) {
                pauseToMenu();
            }
        } else if ($('#end').is(':not(:hidden)')) {
            // End: R, M
            if (key === 82) {
                retry();
            } else if (key === 77) {
                endToMenu();
            }
        } else if($('#categories').is(':not(:hidden)')) {
            // Cats: ESC, Up, Down, Enter, Tab
            if (key === 27) {
                catToMenu();
            } else if (key === 38) {
                e.preventDefault();
                if (choiceIndex > 0) {
                    onLeaveCat(choices[choiceIndex]);
                    choiceIndex--;
                    onHoverCat(choices[choiceIndex]);

                    document.getElementById("catList").scrollTop -= 50;
                }
            } else if (key === 40) {
                e.preventDefault();
                if (choiceIndex < choices.length-1) {
                    if (choiceIndex === -1) {
                        document.getElementById("catList").scrollTop = 0;
                    }

                    onLeaveCat(choices[choiceIndex]);
                    choiceIndex++;
                    onHoverCat(choices[choiceIndex]);

                    // Scroll down if overflow
                    if (choiceIndex > 7) {
                        document.getElementById("catList").scrollTop += 50;
                    }
                }
            } else if (key === 13) {
                if (choiceIndex >= 0) {
                    if ($('#searchInput').val() != "") {
                        startCat(catFilterList[choiceIndex]);
                    } else {
                        startCat(catNameList[choiceIndex]);
                    }
                }
            } else if (key === 9) {
                e.preventDefault();
                if ($('#searchInput').is(':focus')) {
                    $('#searchInput').blur();
                } else {
                    $('#searchInput').focus();
                }
            }
        }
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
            ["Quick!", "Legit!", "Nice!", "You rock!", "Tell em'!", "That's it!"]
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
            ["You're a MONSTER!", "Are you human??", "Cowabunga~", "<(^o^*)>"]
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
                // Or else you can keep typing...
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
    $('#menu').hide();
    if (!catLoaded) {
        catLoaded = true;
        Reader.loadCats();
    }
}

// Pause
function pauseToMenu() {
    $('#menu').show();
    $('#pause').hide();
    resetGame();
}

function resume() {
    // Only start timer it was previously started already
    if ($('#time').html() !== "0:00") {
        startTimer();
    }
    $('#pause').hide();
    $('#main').show();
    $('#input').focus();
}

function restart() {
    Reader.readDB(this.cat);

    $('#main').show();
    $('#pause').hide();
    $('#input').focus();
}

// Cat
function catToMenu() {
    $('#categories').hide();
    $('#menu').show();
}

function showCategories(cats) {
    var newHTML = "";
    cats.sort();
    this.catNameList = cats;
    // Compile an array of the ids of each choice being displayed.
    this.choices = [];

    for (var i = 0 ; i < cats.length ; i++) {
        var cat = cats[i];

        // Simpler to do this than to parse DOM elements.
        var item = "";
        item += '<div class="cat" id="cat'+i+'" onmouseenter="onHoverCat('+i+');" onmouseleave="onLeaveCat('+i+');$(\'#cat\'+choices[choiceIndex]).removeClass(\'catHover\');$(\'#playArrow\'+choices[choiceIndex]).hide();choiceIndex=-1;" onclick="startCat(\''+cat+'\')">';
        item += '<div class="catName">'+cat.replace(/_/g, " ")+'</div>';
        item += '<div class="playArrow" id="playArrow'+i+'" onmouseenter="$(\'#play'+i+'\').show();" onmouseleave="$(\'#play'+i+'\').hide();"></div>';
        item += '<div class="catName play" id="play'+i+'">Play</div>';
        item += '</div>';
        newHTML += item;

        choices.push(i);
    }

    $('#catList').html(newHTML);
}

function onHoverCat(i) {
    // Remove highlight of previous cat
    $('#cat'+choices[choiceIndex]).removeClass('catHover');
    $('#playArrow'+choices[choiceIndex]).hide();

    if ($('#searchInput').val() === "") {
        this.choiceIndex = i;
    }

    $('#playArrow'+i).show();
    $('#cat'+i).addClass('catHover');
}

function onLeaveCat(i) {
    $('#cat'+choiceIndex).removeClass('catHover');
    $('#playArrow'+choiceIndex).hide();

    $('#playArrow'+i).hide();
    $('#cat'+i).removeClass('catHover');
}

function filterCats(val) {
    // Remove cat highlighting and choice index
    $('#cat'+choiceIndex).removeClass('catHover');
    $('#playArrow'+choiceIndex).hide();
    this.choiceIndex = -1;

    var items = $.parseHTML($('#catList').html());
    var catId = 0;
    // Get a list of cat names for Enter shortcut to start game
    this.catFilterList = [];

    // Update array of choice ids based on filter
    this.choices = [];

    // Loop through all divs with class cat and hide them if their name doesn't match the input.
    for (var i = 0 ; i < items.length ; i++) {
        if (items[i].className === 'cat') {
            var divs = items[i]['children'];

            // Finding the children with class name catName
            for (var j = 0 ; j < divs.length ; j++) {
                if (divs[j].className === 'catName' && (divs[j].innerText.toLowerCase()).indexOf(val.toLowerCase()) === 0) {
                    $('#cat'+catId).show();
                    this.choices.push(catId);
                    this.catFilterList.push(catNameList[i]);
                    break;
                } else {
                    $('#cat'+catId).hide();
                }
            }

            // Using separate count in case items have other random elements.
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
        // [a-z][^\s.!?]:           Matches non-capital char, then any char
        //                          This filters Sr., G., (c. ), etc.
        // ["'\)]?:                 Match chars such as " after the period.
        var re = /([a-z][^\s.!?][.!?]["'\)]*?)\s/g;

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

        // Adding a skip flag to generate some 'randomness'
        // There is a 50% chance that even if a sentence fits, it will be skipped
        // Creates more variety
        var skip;

        // start to end
        for (var i = start ; i < sentences.length ; i++) {
            skip = Math.random() >= 0.5;

            // +1 to account for space between sentences.
            if (test.length + sentences[i].length + 1 <= MAX_CHARS && !skip) {
                test+=" "+sentences[i];
            }
        }

        // beginning of sentences to start
        for (var i = 0 ; i < start ; i++) {
            skip = Math.random() >= 0.5;

            if (test.length + sentences[i].length + 1 <= MAX_CHARS && !skip) {
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
    $('#input').focus();
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