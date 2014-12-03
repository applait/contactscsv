window.addEventListener("DOMContentLoaded", function () {

    app({
        path: "home",
        root: $("body"),
        topnav: "#topnav",
        bottomnav: "#bottomnav",
        searchbtn: "#searchbtn",
        debug: true
    }).load("home");

    // Trigger search
    app().search();

});
