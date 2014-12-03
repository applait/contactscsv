(function () {

    app(function (api) {

        /**
         * Callback for each row parsed
         */
        var parsestep = function (result, handle) {
            console.log("step", result.data, result.meta, result.errors);
        };

        /**
         * Callback after CSV has completed parsing
         */
        var parsecomplete = function () {
            console.log("complete");
        };

        /**
         * Callback for errors in parsing CSV
         */
        var parseerror = function (error) {
            console.log("error", error);
        };

        // Start parsing CSV on view load
        api.on("load:parse", function (path) {
            var csvfile = path.split("/")[1] && api.searchresults[path.split("/")[1]];

            Papa.parse(csvfile.file, {
                header: true,
                step: parsestep,
                complete: parsecomplete,
                error: parseerror,
                skipEmptyLines: true,
                worker: true
            });
        });

    });

})();
