/**
 * Contact Model layer. Performs logic for creation of MozContacts objects
 *
 * @constructor
 * @param {object} data - An object with key value pairs of raw contact info. This would
 * correspond to `results.data[0]` of each step parsed by PapaParse.
 * @param {string} type - One of the known types
 */
var ContactModel = function (data) {

    var self = riot.observable(this);

    self.data = data;
};


/**
 * Get field mapping based on selected type
 *
 * As we discover more and more mappings, we need to add these here for each key.
 */
ContactModel.prototype.fieldmap = {
    givenName: ["First Name"],
    familyName: ["Last Name"],
    email: ["E-mail Address", "E-mail 2 Address", "E-mail 3 Address", "General email", "Business email"],
    tel: ["Mobile Phone", "Home Phone", "Business Phone", "Other Phone", "General mobile", "General phone"]
};


/**
 * Prepare contact options
 */
ContactModel.prototype.getoptions = function () {

    var self = this,
        options = {
            givenName: [],
            familyName: [],
            name: [],
            email: [],
            tel: []
        };

    self.fieldmap.givenName.forEach(function (key) {
        self.data[key] && options.givenName.push(self.data[key]);
    });

    self.fieldmap.familyName.forEach(function (key) {
        self.data[key] && options.familyName.push(self.data[key]);
    });

    self.fieldmap.email.forEach(function (key) {
        self.data[key] && options.email.push({ value: self.data[key] });
    });

    self.fieldmap.tel.forEach(function (key) {
        self.data[key] && options.tel.push({ value: self.data[key] });
    });

    if (options.givenName.length && options.familyName.length) {
        options.name = [ options.givenName[0] + " " + options.familyName[0] ];
    } else if (options.givenName.length) {
        options.name = [ options.givenName[0] ];
    }

    return options;
};


/**
 * Method that should be triggered to create return a MozContact object
 *
 * @return {object|null} - Returns a mozContact object or returns null
 */
ContactModel.prototype.create = function () {

    var options = this.getoptions();

    if (options) {
        var item = new mozContact(options);
        if ("init" in item) {
            item.init(options);
        }

        return item;
    }

    return null;
};
