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

        /**
         * Show list of CSVs when results are found
         */
        api.on("resultsFound", function () {
            var itemtmpl = $("#tmpl-searchresult-item").innerHTML.trim(),
                listtmpl = $("#tmpl-searchresults").innerHTML.trim(),
                searchresults = "";

            api.searchresults.forEach(function (item, idx) {
                searchresults += riot.render(itemtmpl, {
                    i: idx,
                    name: item.fileinfo.name
                });
            });

            $("#home section").innerHTML = riot.render(listtmpl, {
                filecount: api.finder.filematchcount,
                searchkey: api.finder.searchkey,
                searchresults: searchresults
            });

            // Memory cleanup
            itemtmpl = listtmpl = searchresults = null;
        });

    });

})();
