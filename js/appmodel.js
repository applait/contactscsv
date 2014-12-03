'use strict';

/**
 * App Model - Main model that forms the API
 *
 * @constructor
 */
var AppModel = function (arg) {

    // Assign `this` through `riot.observable()`
    var self = riot.observable(this);

    // Store args
    self.args = arg || {};

    // Store current view id. Default "home".
    self.view = "home";

    // Store history
    self.history = [];

    // Toggle state for deciding whether to push history
    self.pushhistory = true;

    /**
     * Reset all internals
     */
    self.reset = function () {
        self.history = [];
    };

    /**
     * Provide a generic "load" method for routing
     */
    self.load = function (path) {
        self.pushhistory && self.history[self.history.length - 1] !== self.view && self.history.push(self.view);
        self.trigger("before:load", path);
        self.trigger("load:" + path.split("/")[0], path);
        self.view = path;
    };

};
