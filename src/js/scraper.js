Scraper = {
    base: 'http://en.wikipedia.org/w/api.php?format=json&callback=?&redirects',
    catToParagraphs: {},
    numArticlesParsed: 0,
    numArticles: 0,

    /***
     * Runs readWiki on each article name in the input field
     */
    parseInput: function() {
        const input = $('#urlForm').val().trim();
        const articleNames = input.split(/\s+/);
        this.numArticles = articleNames.length

        for (let article of articleNames) {
            this.readWiki(article);
        }
    },

    /***
     * Extracts information from articleName by sending a MediaWiki API request
     */
    readWiki: function(articleName) {
        const payload = {
            action: 'query',
            prop: 'extracts',
            titles: articleName
        };

        // Get array of all paragraphs
        // TODO: A cookie associated with a cross-site resource at https://en.wikipedia.org/ was set without
        // the `SameSite` attribute. A future release of Chrome will only deliver cookies with cross-site requests
        // if they are set with `SameSite=None` and `Secure`. You can review cookies in developer tools under
        // Application>Storage>Cookies and see more details at https://www.chromestatus.com/feature/5088147346030592
        // and https://www.chromestatus.com/feature/5633521622188032.
        $.getJSON(this.base, payload, this.parseWikiData.bind(this, articleName));
    },

    /***
     * Parse the API response data into a list of paragraphs
     *
     * Sample response:
     *
     * batchcomplete: ""
     *   query:
     *     pages:
     *       34513:
     *         extract: "<p class="mw-empty-elt">↵</p>↵<p><b>0</b> (<b>zero..."
     *         ns: 0
     *         pageid: 34513
     *         title: "0"
     */
    parseWikiData: function(articleName, data) {
        const pages = data['query']['pages'];
        let rawTextList = [];

        for (let key in pages) {
            if (pages.hasOwnProperty(key)) {
                rawTextList.push(pages[key]['extract']);
            }
        }

        let paragraphs = [];
        for (let rawText of rawTextList) {
            const htmlElementObjs = $.parseHTML(rawText);

            if (!htmlElementObjs) {
                console.log(`Failed to fetch article: ${articleName}`)
                continue;
            }

            for (let htmlElement of htmlElementObjs) {
                // Get text from all paragraphs that have a period in them.
                let innerText = htmlElement['textContent'];
                // Thanks IE...
                if (innerText === undefined) {
                    innerText = htmlElement['innerText'];
                }
                if (htmlElement['tagName'] === 'P' && innerText.indexOf('.') > -1) {
                    paragraphs.push(innerText);
                }
            }
        }

        this.catToParagraphs[articleName] = paragraphs;
        this.numArticlesParsed++;
        $('#output').html(`${this.numArticlesParsed}/${this.numArticles} articles parsed`);

        if (this.numArticlesParsed === this.numArticles) {
            this.numArticlesParsed = 0;
        }
    },

    displayJSON: function() {
        $('#output').html(JSON.stringify(this.catToParagraphs));
    },

    // https://stackoverflow.com/questions/52722696/network-error-on-generated-download-in-chrome
    downloadJSON: function() {
        const text = JSON.stringify(this.catToParagraphs)
        let uriContent = URL.createObjectURL(new Blob([text], {type : 'text/plain'}));

        let link = document.createElement('a');
        link.setAttribute('href', uriContent);
        link.setAttribute('download', "db.json");

        let event = new MouseEvent('click');
        link.dispatchEvent(event);
        document.body.removeChild(element);
    }
};