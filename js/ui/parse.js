(function () {

    app(function (api) {

        /**
         * Callback for each row parsed
         */
        var parsestep = function (result) {
            console.log("step", result.data, result.meta, result.errors);
        };

        /**
         * Callback after CSV has completed parsing
         */
        var parsecomplete = function (results) {
            console.log("complete", results);
        };

        // Start parsing CSV on view load
        api.on("load:parse", function (path) {
            var csvfile = path.split("/")[1] && api.searchresults[path.split("/")[1]];

            Papa.parse(csvfile.file, {
                header: true,
                step: parsestep,
                complete: parsecomplete,
                skipEmptyLines: true
            });
        });

    });

})();
