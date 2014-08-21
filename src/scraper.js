Scraper = {
	base: 'http://en.wikipedia.org/w/api.php?format=json&callback=?',
	paras: null,

	parsePage: function() {
		var articleName = $('#urlForm').val();
		var payload = {
			action: 'query',
			prop: 'extracts',
			titles: articleName
		};

		// Get array of all paragraphs, placed in paras
		$.getJSON(this.base, payload, function(data) {
			var pages = data['query']['pages'];
			var text = {};

			for(var key in pages) {
				if(pages.hasOwnProperty(key)) {
					text[pages[key]['title']] = pages[key]['extract'];
				}
			}

			for (var title in text) {
				var textObj = $.parseHTML(text[title]);
				var paras = [];
				var all = '';
				for (var i=0 ; i<textObj.length ; ++i) {
					// Get text from all paragraphs that have a period in them.
					var innerText = textObj[i]['innerText'];
					if (textObj[i]['tagName'] === "P" && innerText.indexOf(".") > -1) {
						all += innerText;
						paras.push(innerText);
					}
				}
				//$('#output').html(all);
				Scraper.paras = paras;
			}

			// Send post request to database
			var allData = {'collection':articleName};
			for (var i = 0 ; i < Scraper.paras.length ; ++i) {
				allData['p'+i] = Scraper.paras[i];
			}
			$.ajax({
				url: "http://localhost/typeractive/dbFunc.php",
				type: "POST",
				data: allData,
				success: function(data, text) {
					$("#msg").html(data);
				}
			});
		});
	},

	readDB: function() {
		var articleName = $('#urlForm').val();
		var payload = {
			collection: articleName
		};

		$.getJSON("http://localhost/typeractive/dbFunc.php", payload, function(data) {
			var text = "";
			debugger;
			for (key in data) {
				text += data[key] + "<br /><br />";
			}
			$('#output').html(text);
		});
	}
};