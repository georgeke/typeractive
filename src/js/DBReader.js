Reader  = {
	paras: [],

	readDB: function() {
		var articleName = $('#urlForm').val();
		var payload = {
			collection: articleName
		};

		$.getJSON("res/dbFunc.php", payload, function(data) {
			var text = "";
			for (key in data) {
				text += data[key] + "<br /><br />";
				paras.push(data[key]);
			}
			$('#output').html(text);
		});
	}
}