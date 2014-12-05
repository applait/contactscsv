(function () {

    app(function (api) {

        var contactlist = [];

        /**
         * Callback for each row parsed
         */
        var parsestep = function (results, handle) {
            var contactinstance = new ContactModel(results.data[0]);

            contactlist.push({ contact: contactinstance.create(), import: true });

            $("#contactcount").innerHTML = contactlist.length;

        };

        /**
         * Callback after CSV has completed parsing
         */
        var parsecomplete = function () {
            console.log("complete", contactlist);
            contactlist = [];
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

            contactlist = [];

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
