Scraper = {
	base: 'http://en.wikipedia.org/w/api.php?format=json&callback=?',

	parsePage: function() {
		//wgCrossSiteAJAXdomains = ['*']];

		var articleName = document.getElementById('urlForm').value;

		var payload = {
			action: 'query',
			prop: 'extracts',
			titles: articleName,
		};

		$.getJSON(this.base, payload, function(data) {
			debugger;
			pages = data['query']['pages'];
			pars = {};

			for(var key in pages) {
				if(pages.hasOwnProperty(key)) {
					pars[pages[key]['title']] = pages[key]['extract'];
				}
			}

			for (var title in pars) {
				$('#output').html(pars[title]);
			}
		});
	}
};