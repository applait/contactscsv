(function () {

    app(function (api) {

        // Load stock home on first app load
        api.one("load:home", function () {
            $("#home section").innerHTML = riot.render($("#tmpl-home-stock").innerHTML.trim());
        });

        /**
         * Show noresults if no results are found
         */
        api.on("noResults", function () {
            $("#home section").innerHTML = riot.render($("#tmpl-error").innerHTML.trim(), {
                message: "No CSV files found for importing."
            });
        });

    });

})();
