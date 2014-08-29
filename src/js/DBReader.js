Reader = {
	readDB: function(cat) {
		$('#loading').show();

		if (cat) {
			var articleName = cat;
		} else {
			var articleName = $('#urlForm').val();
		}

		var payload = {
			collection: articleName
		};

		$('#loading').show();
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
			$('#loading').hide();
		});
	},

	loadCats: function() {
		$('#loading').show();
		$.getJSON("res/dbFunc.php", "all=1", function(data) {
			showCategories(data);
			$('#loading').hide();
		});
	},

	getCats: function() {
		$('#loading').show();
		$.getJSON("res/dbFunc.php", "all=1", function(data) {
			playRandom(data);
			$('#loading').hide();
		});
	}
}