Scraper = {
	base: 'http://en.wikipedia.org/w/api.php?format=json&callback=?',

	parsePage: function() {
		debugger;
		//wgCrossSiteAJAXdomains = ['*']];

		var articleName = document.getElementById('urlForm').value;

		var payload = {
			action: 'query',
			prop: 'extracts',
			titles: articleName,
		};

		$.getJSON(this.base, payload, function(data) {
			debugger;
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
					var innerText = textObj[i]['innerText']
					if (textObj[i]['tagName'] === "P" && innerText.indexOf(".") > -1) {
						all += innerText;
						paras.push(innerText);
					}
				}
				$('#output').html(all);
			}
		});
	}
};