Reader = {
	readDB: function(cat) {
		if (cat) {
			var articleName = cat;
		} else {
			var articleName = $('#urlForm').val();
		}

		var payload = {
			collection: articleName
		};

		$.getJSON("res/dbFunc.php", payload, function(data) {
			var text = "";
			var paras = [];
			for (key in data) {
				text += data[key] + "<br /><br />";
				paras.push(data[key]);
			}
			if (cat) {
				startGame(paras);
			} else {
				$('#output').html(text);
			}
		});
	},

	loadCats: function() {
		$.getJSON("res/dbFunc.php", "all=1", function(data) {
			showCategories(data);
		});
	},

	getCats: function() {
		$.getJSON("res/dbFunc.php", "all=1", function(data) {
			playRandom(data);
		});
	}
}