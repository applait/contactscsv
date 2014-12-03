/**
 * @file
 * File picker and finder for device storages on Firefox OS devices
 *
 * This library provides an easy-to-use asynchronous interface for other Firefox OS apps to search for files
 * on Firefox OS devices. The library is based on an event-based architecture, letting developers build
 * beautiful asynchronous API for their apps.
 *
 * The `Finder` library is best used by developers looking to pick a file from the `sdcard` for their apps.
 *
 * This library depends on [EventEmitter](https://github.com/Wolfy87/EventEmitter) by Wolfy87, included with the
 * package.
 *
 * @version 1.1.2
 * @license The MIT License (MIT)
 * @author Applait Technologies LLP
 * @copyright Copyright (c) 2014 Applait Technologies LLP
 */

/**
 * Core Applait namespace for Applait libraries.
 *
 * @namespace
 */
var Applait = Applait || {};

/**
 * Core `Finder` class. Provides the constructor for applications to instantiate.
 *
 * @memberOf Applait
 * @constructor
 *
 * @property {object} options - Easy access to `options` passed in constructor argument.
 * @property {string} type - The type of DeviceStorage specified.
 * @property {boolean} hidden - Boolean specifying whether hidden files will be included in search or not.
 * @property {boolean} casesensitive - Boolean specifying whether searches will be case sensitive or not.
 * @property {boolean} debugmode - Boolean activating or deactivating debug mode.
 * @property {array} storages - Array of device storage cursors based on `this.type`.
 * @property {number} searchcompletecount - Number of device storages searched through in latest search.
 * @property {number} filematchcount - Number of files found in latest search
 * @property {string} searchkey - Search term used in last search
 *
 * @param {object=} options - Default options for the `Finder` constructor. It can include any of the following
 * properties:
 *
 * - `type` : `{string}` : Can be one of `sdcard`, `music`, `pictures`, `videos`. Defaults to `sdcard`.
 * - `minSearchLength`: `{number}` : The minimum length of search string without which search will not be triggered.
 * Defaults to `3`.
 * - `hidden`: `{boolean}` : If set to `true`, searches hidden files as well. Defaults to `false`.
 * - `caseSensitive` : `{boolean}` : If set to `true`, searches will be case sensitive. Defaults to `false`.
 * - `debugMode`: `{boolean}` : If `true`, enables debug mode which logs all messages to the browser console. This
 * should be disabled in production mode to reduce memory footprint.
 *
 * @example
 * var finder = new Applait.Finder({ type: "sdcard", debugMode: true });
 */
Applait.Finder = function (options) {

    this.options = options || {};

    this.type = this.options.type || "sdcard";

    this.hidden = this.options.hidden || false;

    this.casesensitive = this.options.caseSensitive || false;

    this.minsearchlength = (this.options.minSearchLength && typeof this.options.minSearchLength === "number") ?
        options.minSearchLength : 3;

    this.debugmode = this.options.debugMode ? true : false;

    this.storages = navigator.getDeviceStorages && navigator.getDeviceStorages(this.type);

    this.searchcompletecount = 0;

    this.filematchcount = 0;

    this.searchkey = "";
};


/**
 * Make `Applait.Finder` inherit the `EventEmitter` prototype chain.
 */
Applait.Finder.prototype = new EventEmitter();


/**
 * Match hidden files based on settings
 *
 * @param {string} filename - The filename to test
 * @return {boolean} - `true` if file is a hidden file and if `hidden`
 * is `true` in constructor options.
 */
Applait.Finder.prototype.checkhidden = function (filename) {
    if ((filename.indexOf(".") === 0) && this.hidden !== true) {
        return false;
    }
    return true;
};


/**
 * Instantiate search
 *
 * @memberOf Applait.Finder
 * @param {string} needle - The string to match file names from the device storage.
 * @return {null} - Only if `needle` length is less than `minsearchlength` or if no DeviceStorages are found.
 */
Applait.Finder.prototype.search = function (needle) {

    var self = this;

    self.reset();
    self.searchkey = !self.casesensitive ? needle.trim().toLowerCase() : needle.trim();

    if (self.searchkey.length < self.minsearchlength) {
        self.log("searchCancelled",
                 ["Search string should be at least " + self.minsearchlength + " characters"]);
        self.emitEvent("searchCancelled",
                       ["Search string should be at least " + self.minsearchlength + " characters"]);
        return null;
    }

    if (self.storagecount() < 1) {
        self.log("empty", [self.searchkey]);
        self.emitEvent("empty", [self.searchkey]);
        return null;
    }

    self.log("searchBegin", [self.searchkey]);
    self.emitEvent("searchBegin", [self.searchkey]);

    self.storages.forEach(function (storage) {

        var cursor = storage.enumerate();

        self.log("storageSearchBegin", [storage.storageName, self.searchkey]);
        self.emitEvent("storageSearchBegin", [storage.storageName, self.searchkey]);

        cursor.onsuccess = function () {

            if (this.result) {

                var file = this.result;
                var fileinfo = self.splitname(file.name);

                if (self.matchname(fileinfo.name)) {
                    self.filematchcount++;
                    self.log("fileFound", [file, fileinfo, storage.storageName]);
                    self.emitEvent("fileFound", [file, fileinfo, storage.storageName]);
                }
                if (!this.done) {
                    this.continue();
                } else {
                    self.searchcompletecount++;
                    self.log("storageSearchComplete", [storage.storageName, self.searchkey]);
                    self.emitEvent("storageSearchComplete", [storage.storageName, self.searchkey]);
                }
            } else {
                self.searchcompletecount++;
                self.log("storageSearchComplete", [storage.storageName, self.searchkey]);
                self.emitEvent("storageSearchComplete", [storage.storageName, self.searchkey]);
            }

            if (self.searchcompletecount === self.storagecount()) {
                self.log("searchComplete", [self.searchkey, self.filematchcount]);
                self.emitEvent("searchComplete", [self.searchkey, self.filematchcount]);
            }

        };

        cursor.onerror = function () {
            self.log("error", ["Error accessing device storage '" + storage.storageName + "'", this.error]);
            self.emitEvent("error", ["Error accessing device storage '" + storage.storageName + "'",
                                     this.error]);
        };

    });
};


/**
 * Splits full file path into basename and path to directory.
 *
 * @memberOf Applait.Finder
 * @param {string} filename - Filename obtained for `File.filename`
 * @return {object} - An object with two keys:
 *
 * - `name` - the basename of the file with extension
 * - `path` - path to the file's directory.
 */
Applait.Finder.prototype.splitname = function (filename) {
    filename = filename.split(/[\\/]/);

    return { "name": filename.pop(), "path": filename.join("/") };
};


/**
 * Return the number of storages being used
 *
 * @memberOf Applait.Finder
 * @return {number} - The length of storages
 */
Applait.Finder.prototype.storagecount = function () {
    return this.storages && this.storages.length ? this.storages.length : 0;
};


/**
 * Reset internals
 *
 * @memberOf Applait.Finder
 */
Applait.Finder.prototype.reset = function () {
    this.filematchcount = 0;
    this.searchcompletecount = 0;
    this.searchkey = "";
};


/**
 * Generic logging method, dependent on debugMode
 *
 * @memberOf Applait.Finder
 * @param {string} message - A string identifying this log
 * @param {array} args - An array of stuff to print
 */
Applait.Finder.prototype.log = function (message, args) {
    if (this.debugmode) {
        console.log(message, args);
    }
};


/**
 * Match name
 *
 * @memberOf Applait.Finder
 * @param {string} name - Filename
 * @return {boolean}
 */
Applait.Finder.prototype.matchname = function (name) {
    name = !this.casesensitive ? name.trim().toLowerCase() : name.trim();
    return (name.indexOf(this.searchkey) > -1 && this.checkhidden(name));
};
