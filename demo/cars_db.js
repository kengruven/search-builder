// MINIATURE JAVASCRIPT DATABASE!  In real life, you'd send the
// searchbuilder query to your server (as JSON), translate it to your
// database query language, and run the query.  But for a little demo
// page, I don't have a server (and I don't care about letting you
// update the data from the webpage), so I'll fake it with a little
// Javascript.

// For a real web app, you need something that converts a JSON search
// into your query language -- SQL, ActiveRecord, whatever.  This
// probably depends on your exact data model.  This definitely needs
// to be validated and sanitized.  I don't know how to do that for
// you.

var country_flags = {US: "🇺🇸", DE: "🇩🇪", JP: "🇯🇵", IT: "🇮🇹", UK: "🇬🇧"};
var country_names = {US: "USA", DE: "Germany", JP: "Japan", IT: "Italy", UK: "UK"};

var cars = [
    {make: "Jaguar",        model: "E-Type",    introduced: 1961, country_code: "UK", layout: "FR",  engine: "I6",  wikipedia: "Jaguar_E-Type"},
    {make: "Ferrari",       model: "250 GTO",   introduced: 1962, country_code: "IT", layout: "FR",  engine: "V12", wikipedia: "Ferrari_250_GTO"},
    {make: "Triumph",       model: "Spitfire",  introduced: 1962, country_code: "UK", layout: "FR",  engine: "I4",  wikipedia: "Triumph_Spitfire"},
    {make: "Porsche",       model: "911",       introduced: 1963, country_code: "DE", layout: "RR",  engine: "H6",  wikipedia: "Porsche_911"},
    {make: "Mercedes-Benz", model: "W113",      introduced: 1963, country_code: "DE", layout: "FR",  engine: "I6",  wikipedia: "Mercedes-Benz_W113"},
    {make: "Ford",          model: "Mustang",   introduced: 1964, country_code: "US", layout: "FR",  engine: "I6",  wikipedia: "Ford_Mustang"},  // or V8...
    {make: "Pontiac",       model: "GTO",       introduced: 1964, country_code: "US", layout: "FR",  engine: "V8",  wikipedia: "Pontiac_GTO"},
    {make: "Ford",          model: "GT40",      introduced: 1964, country_code: "US", layout: "RMR", engine: "V8",  wikipedia: "Ford_GT40"},
    {make: "Nissan",        model: "Silvia",    introduced: 1964, country_code: "JP", layout: "FR",  engine: "I4",  wikipedia: "Nissan_Silvia"},
    {make: "Aston Martin",  model: "DB6",       introduced: 1965, country_code: "UK", layout: "FR",  engine: "I6",  wikipedia: "Aston_Martin_DB6"},
    {make: "Lotus",         model: "Elan",      introduced: 1966, country_code: "UK", layout: "FR",  engine: "I4",  wikipedia: "Lotus_Elan"},
    {make: "Dodge",         model: "Charger",   introduced: 1966, country_code: "US", layout: "FR",  engine: "V8",  wikipedia: "Dodge_Charger"},
    {make: "Audi",          model: "80",        introduced: 1966, country_code: "DE", layout: "FF",  engine: "I4",  wikipedia: "Audi_80"},
    {make: "Toyota",        model: "2000GT",    introduced: 1967, country_code: "JP", layout: "FMR", engine: "I6",  wikipedia: "Toyota_2000GT"},
    {make: "Ferrari",       model: "365 GTB/4", introduced: 1968, country_code: "IT", layout: "FR",  engine: "V12", wikipedia: "Ferrari_Daytona"},
    {make: "BMW",           model: "E9",        introduced: 1968, country_code: "DE", layout: "FR",  engine: "I6",  wikipedia: "BMW_E9"},
    {make: "Nissan",        model: "S30",       introduced: 1969, country_code: "JP", layout: "FR",  engine: "I6",  wikipedia: "Nissan_S30"},
    {make: "Triumph",       model: "TR6",       introduced: 1969, country_code: "UK", layout: "FR",  engine: "I6",  wikipedia: "Triumph_TR6"},
];

$.each(cars, function(i, car) {
    car.country_name = country_names[car.country_code];
    car.country_label = country_flags[car.country_code] + " " + car.country_name;
});

// polyfills, from <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith>
// and <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith>.
// only FF17+ has this so far!
if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function (searchString, position) {
      position = position || 0;
      return this.indexOf(searchString, position) === position;
    }
  });
}
if (!String.prototype.endsWith) {
    Object.defineProperty(String.prototype, 'endsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (searchString, position) {
            position = position || this.length;
            position = position - searchString.length;
            var lastIndex = this.lastIndexOf(searchString);
            return lastIndex !== -1 && lastIndex === position;
        }
    });
}

// run a search against one record
function carMatchesSearch(search, car) {
    if (search.key === 'and' || search.key === 'or' || search.key === 'not') {
        if (search.children.length == 0) {
            return true;  // no criteria => everything matches
        }

        var childResults = $.map(search.children, function(child, i) {
            return carMatchesSearch(child, car);
        });

        switch (search.key) {
        case 'and': return childResults.reduce(function(prev, cur, i, arr) { return prev && cur; });
        case 'or': return childResults.reduce(function(prev, cur, i, arr) { return prev || cur; });
        case 'not': return !childResults.reduce(function(prev, cur, i, arr) { return prev || cur; });
        }
    }

    var lhs = car[search.key];
    var rhs = search.value;
    if (search.case_sensitive === false) {
        lhs = lhs.toLowerCase();
        rhs = rhs.toLowerCase();
    }

    switch (search.comparison) {
    // numbers
    case "eq": return car[search.key] === parseInt(search.value);
    case "ne": return car[search.key] !== parseInt(search.value);
    case "gt": return car[search.key] > parseInt(search.value);
    case "ge": return car[search.key] >= parseInt(search.value);
    case "lt": return car[search.key] < parseInt(search.value);
    case "le": return car[search.key] <= parseInt(search.value);

    // strings
    case "contains": return lhs.search(rhs) != -1;
    case "starts": return lhs.startsWith(rhs);
    case "ends": return lhs.endsWith(rhs);
    case "exactly": return lhs === rhs;

    // enums -- KLUGE: using undefined (!!) to check for enum!  in practice, the server would know the type.
    case undefined: return car[search.key] === search.value;
    }
}

// given a query, return the records from 'cars' that match it.
function carsForSearch(search) {
    return cars.filter(function(car) {
        return carMatchesSearch(search, car);
    });
}
