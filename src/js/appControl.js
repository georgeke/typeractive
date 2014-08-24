function toggleArrow(el) {
	$(el).toggleClass("downArrow");
	$(el).toggleClass("upArrow");
}

function onElementOver(el) {
	debugger;
	if ($(el).hasClass("choice")) {
		$(el).css('background-color', 'Gold');
	} else if ($(el).hasClass("menu")) {
		$(el).css('color', 'yellow');
	}/* else if ($(el).hasClass("downArrow")) {
		$(el).css('border-top', '12px solid yellow');
	} else if ($(el).hasClass("upArrow")) {
		$(el).css('border-bottom', '12px solid yellow');
	}*/
}

function onElementOut(el) {
	if ($(el).hasClass("choice")) {
		$(el).css('background-color', 'orange');
	} else if ($(el).hasClass("menu")) {
		$(el).css('color', 'Gold');
	}/* else if ($(el).hasClass("downArrow")) {
		$(el).css('border-top', '12px solid Gold');
	} else if ($(el).hasClass("upArrow")) {
		$(el).css('border-bottom', '12px solid Gold');
	}*/
}