(function () {

    // Add behaviour for option buttons
    app(function (api) {

        /**
         * Actions to perform when search button is clicked
         */
        var searchbtn_action = function () {
            api.reset();
            $("#home section").innerHTML = riot.render($("#tmpl-home-stock").innerHTML.trim());
            api.search();
        };

        /**
         * Bind delegated listeners for elements in bottomnav
         */
        $(api.args.bottomnav).addEventListener("click", function (e) {

            if (e.target && e.target.id) {

                switch ("#" + e.target.id) {

                case api.args.searchbtn:
                    searchbtn_action();
                    break;

                }
            }

        }, false);

        /**
         * Handle error actions
         */
        api.finder.on("error", function () {
            $("#home section").innerHTML = riot.render($("#tmpl-error").innerHTML.trim(), {
                message: "Looks like your device does not support searching for files."
            });
        });

        api.finder.on("empty", function () {
            $("#home section").innerHTML = riot.render($("#tmpl-error").innerHTML.trim(), {
                message: "Your device does not have any storage to search from."
            });
        });

    });
})();
