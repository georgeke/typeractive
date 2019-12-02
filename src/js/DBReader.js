Reader = {
    data: {},

    loadDB: function() {
        $('#loading').show();
        $.getJSON("res/db.json", function(data) {
            this.data = data;
            $('#loading').hide();
        }.bind(this));
    },

    readDB: function(cat) {
        $('#loading').show();

        if (cat) {
            var articleName = cat;
        } else {
            var articleName = $('#urlForm').val();
        }

        $('#loading').show();
        var text = "";
        var paras = this.data[articleName];
        for (let para of paras) {
            text += para + "<br /><br />";
        }
        if (cat) {
            startGame(paras);
        } else {
            $('#output').html(text);
        }
        $('#loading').hide();
    },

    loadCats: function() {
        $('#loading').show();
        showCategories(Object.keys(this.data));
        $('#loading').hide();
    },

    getCats: function() {
        $('#loading').show();
        playRandom(Object.keys(this.data));
        $('#loading').hide();
    }
}