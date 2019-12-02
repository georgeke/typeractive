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
        this.numArticles = articleNames.length;
        this.numArticlesParsed = 0;
        this.catToParagraphs = {};

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
                    paragraphs.push(this.cleanString(innerText));
                }
            }
        }

        this.catToParagraphs[articleName] = paragraphs;
        this.numArticlesParsed++;
        $('#output').html(`${this.numArticlesParsed}/${this.numArticles} articles parsed`);
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
    },

    cleanString: (text) => {
        // transliterate & make dashes the same
        const replacementMap = {'–': '--', '—': '--', 'á': 'a', 'Á': 'A', 'à': 'a', 'À': 'A', 'ă': 'a', 'Ă': 'A', 'â': 'a', 'Â': 'A', 'å': 'a', 'Å': 'A', 'ã': 'a', 'Ã': 'A', 'ą': 'a', 'Ą': 'A', 'ā': 'a', 'Ā': 'A', 'ä': 'ae', 'Ä': 'AE', 'æ': 'ae', 'Æ': 'AE', 'ḃ': 'b', 'Ḃ': 'B', 'ć': 'c', 'Ć': 'C', 'ĉ': 'c', 'Ĉ': 'C', 'č': 'c', 'Č': 'C', 'ċ': 'c', 'Ċ': 'C', 'ç': 'c', 'Ç': 'C', 'ď': 'd', 'Ď': 'D', 'ḋ': 'd', 'Ḋ': 'D', 'đ': 'd', 'Đ': 'D', 'ð': 'dh', 'Ð': 'Dh', 'é': 'e', 'É': 'E', 'è': 'e', 'È': 'E', 'ĕ': 'e', 'Ĕ': 'E', 'ê': 'e', 'Ê': 'E', 'ě': 'e', 'Ě': 'E', 'ë': 'e', 'Ë': 'E', 'ė': 'e', 'Ė': 'E', 'ę': 'e', 'Ę': 'E', 'ē': 'e', 'Ē': 'E', 'ḟ': 'f', 'Ḟ': 'F', 'ƒ': 'f', 'Ƒ': 'F', 'ğ': 'g', 'Ğ': 'G', 'ĝ': 'g', 'Ĝ': 'G', 'ġ': 'g', 'Ġ': 'G', 'ģ': 'g', 'Ģ': 'G', 'ĥ': 'h', 'Ĥ': 'H', 'ħ': 'h', 'Ħ': 'H', 'í': 'i', 'Í': 'I', 'ì': 'i', 'Ì': 'I', 'î': 'i', 'Î': 'I', 'ï': 'i', 'Ï': 'I', 'ĩ': 'i', 'Ĩ': 'I', 'į': 'i', 'Į': 'I', 'ī': 'i', 'Ī': 'I', 'ĵ': 'j', 'Ĵ': 'J', 'ķ': 'k', 'Ķ': 'K', 'ĺ': 'l', 'Ĺ': 'L', 'ľ': 'l', 'Ľ': 'L', 'ļ': 'l', 'Ļ': 'L', 'ł': 'l', 'Ł': 'L', 'ṁ': 'm', 'Ṁ': 'M', 'ń': 'n', 'Ń': 'N', 'ň': 'n', 'Ň': 'N', 'ñ': 'n', 'Ñ': 'N', 'ņ': 'n', 'Ņ': 'N', 'ó': 'o', 'Ó': 'O', 'ò': 'o', 'Ò': 'O', 'ô': 'o', 'Ô': 'O', 'ő': 'o', 'Ő': 'O', 'õ': 'o', 'Õ': 'O', 'ø': 'oe', 'Ø': 'OE', 'ō': 'o', 'Ō': 'O', 'ơ': 'o', 'Ơ': 'O', 'ö': 'oe', 'Ö': 'OE', 'ṗ': 'p', 'Ṗ': 'P', 'ŕ': 'r', 'Ŕ': 'R', 'ř': 'r', 'Ř': 'R', 'ŗ': 'r', 'Ŗ': 'R', 'ś': 's', 'Ś': 'S', 'ŝ': 's', 'Ŝ': 'S', 'š': 's', 'Š': 'S', 'ṡ': 's', 'Ṡ': 'S', 'ş': 's', 'Ş': 'S', 'ș': 's', 'Ș': 'S', 'ß': 'SS', 'ť': 't', 'Ť': 'T', 'ṫ': 't', 'Ṫ': 'T', 'ţ': 't', 'Ţ': 'T', 'ț': 't', 'Ț': 'T', 'ŧ': 't', 'Ŧ': 'T', 'ú': 'u', 'Ú': 'U', 'ù': 'u', 'Ù': 'U', 'ŭ': 'u', 'Ŭ': 'U', 'û': 'u', 'Û': 'U', 'ů': 'u', 'Ů': 'U', 'ű': 'u', 'Ű': 'U', 'ũ': 'u', 'Ũ': 'U', 'ų': 'u', 'Ų': 'U', 'ū': 'u', 'Ū': 'U', 'ư': 'u', 'Ư': 'U', 'ü': 'ue', 'Ü': 'UE', 'ẃ': 'w', 'Ẃ': 'W', 'ẁ': 'w', 'Ẁ': 'W', 'ŵ': 'w', 'Ŵ': 'W', 'ẅ': 'w', 'Ẅ': 'W', 'ý': 'y', 'Ý': 'Y', 'ỳ': 'y', 'Ỳ': 'Y', 'ŷ': 'y', 'Ŷ': 'Y', 'ÿ': 'y', 'Ÿ': 'Y', 'ź': 'z', 'Ź': 'Z', 'ž': 'z', 'Ž': 'Z', 'ż': 'z', 'Ż': 'Z', 'þ': 'th', 'Þ': 'Th', 'µ': 'u', 'а': 'a', 'А': 'a', 'б': 'b', 'Б': 'b', 'в': 'v', 'В': 'v', 'г': 'g', 'Г': 'g', 'д': 'd', 'Д': 'd', 'е': 'e', 'Е': 'E', 'ё': 'e', 'Ё': 'E', 'ж': 'zh', 'Ж': 'zh', 'з': 'z', 'З': 'z', 'и': 'i', 'И': 'i', 'й': 'j', 'Й': 'j', 'к': 'k', 'К': 'k', 'л': 'l', 'Л': 'l', 'м': 'm', 'М': 'm', 'н': 'n', 'Н': 'n', 'о': 'o', 'О': 'o', 'п': 'p', 'П': 'p', 'р': 'r', 'Р': 'r', 'с': 's', 'С': 's', 'т': 't', 'Т': 't', 'у': 'u', 'У': 'u', 'ф': 'f', 'Ф': 'f', 'х': 'h', 'Х': 'h', 'ц': 'c', 'Ц': 'c', 'ч': 'ch', 'Ч': 'ch', 'ш': 'sh', 'Ш': 'sh', 'щ': 'sch', 'Щ': 'sch', 'ъ': '', 'Ъ': '', 'ы': 'y', 'Ы': 'y', 'ь': '', 'Ь': '', 'э': 'e', 'Э': 'e', 'ю': 'ju', 'Ю': 'ju', 'я': 'ja', 'Я': 'ja'}
        text = text.split('').map((char) => { 
            return replacementMap[char] || char; 
        }).join('');

        // delete any string with at least 1 non-print char and the whitespace before the brackets
        text = text.replace(/(\s*?\()[^\(]*[^ -~]+?[^\)]*(\))/g, '');

        // for LATEX formulas
        text = text.replace(/\{.*\}/g, '');

        // any string of multiple white spaces
        text = text.replace(/\s{2,}/g, ' ');

        // delete all non-print characters
        text = text.replace(/[^ -~]*/g, '');

        return text;
    },
};