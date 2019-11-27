Scraper = {
    base: 'http://en.wikipedia.org/w/api.php?format=json&callback=?&redirects',
    catToParagraphs: {},
    curArticleName: '',
    numArticlesParsed: 0,
    numArticles: 0,

    /***
     * Runs readWiki on each article name in the input field
     */
    parseInput: function() {
        const input = $('#urlForm').val().trim();
        const articleNames = input.split(/\s+/);
        this.numArticles = articleNames.length

        for (let i = 0 ; i < this.numArticles ; i++) {
            this.readWiki(articleNames[i]);
        }
    },

    /***
     * Extracts information from articleName and sends AJAX request to mongoDB
     */
    readWiki: function(articleName) {
        const payload = {
            action: 'query',
            prop: 'extracts',
            titles: articleName
        };
        this.curArticleName = articleName

        // Get array of all paragraphs
        // TODO: A cookie associated with a cross-site resource at https://en.wikipedia.org/ was set without
        // the `SameSite` attribute. A future release of Chrome will only deliver cookies with cross-site requests
        // if they are set with `SameSite=None` and `Secure`. You can review cookies in developer tools under
        // Application>Storage>Cookies and see more details at https://www.chromestatus.com/feature/5088147346030592
        // and https://www.chromestatus.com/feature/5633521622188032.
        $.getJSON(this.base, payload, this.parseWikiData.bind(this));
    },

    parseWikiData: function(data) {
        const pages = data['query']['pages'];
        let text = {};

        for (let key in pages) {
            if (pages.hasOwnProperty(key)) {
                text[pages[key]['title']] = pages[key]['extract'];
            }
        }

        let paras = [];
        for (let title in text) {
            const textObj = $.parseHTML(text[title]);

            for (let i = 0 ; i < textObj.length ; ++i) {
                // Get text from all paragraphs that have a period in them.
                const innerText = textObj[i]['textContent'];
                // Thanks IE...
                if (innerText === undefined) {
                    innerText = textObj[i]['innerText'];
                }
                if (textObj[i]['tagName'] === 'P' && innerText.indexOf('.') > -1) {
                    paras.push(innerText);
                }
            }
        }

        this.catToParagraphs[this.curArticleName] = paras;
        this.numArticlesParsed++;
        $('#output').html(`${this.numArticlesParsed}/${this.numArticles} articles parsed`);

        if (this.numArticlesParsed === this.numArticles) {
            this.numArticlesParsed = 0
        }
    },

    displayJSON: function() {
        $('#output').html(JSON.stringify(this.catToParagraphs));
    }
};