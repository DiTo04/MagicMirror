Module.register("SlModule", {

    // Define module defaults
    defaults: {
        maximumEntries: 3, // Total Maximum Entries
        fetchInterval: 0.5 * 60 * 1000, // Update every 5 minutes.
        animationSpeed: 100,
        urgency: 7,
        timeFormat: "relative",
        getRelative: 6,
        colored: false,
        broadcastEvents: true,
        displaySymbol: false
    },

    // Define required scripts.
    getStyles: function () {
        return ["sl.css", "font-awesome.css"];
    },

    // Define required scripts.
    getScripts: function () {
        return ["moment.js"];
    },

    // Define required translations.
    getTranslations: function () {
        // The translations for the default modules are defined in the core translation files.
        // Therefor we can just return false. Otherwise we should have returned a dictionary.
        // If you're trying to build your own module including translations, check out the documentation.
        return false;
    },

    // Override start method.
    start: function () {
        Log.log("Starting module: " + this.name);
        // Set locale.
        moment.locale(config.language);
        this.startSL("Abrehamsberg");
        this.departures = [];
        this.loaded = false;
        var self = this;
        setInterval(function() {
            self.updateDom(self.config.animationSpeed);
        }, 1000);
    },

    // Override socket notification handler.
    socketNotificationReceived: function (notification, payload) {
        if (notification === "SL_TIMES") {
            Log.log("Got SL_TIMES notification.");
            this.departures = payload.departures;
            this.loaded = true;
        } else if (notification === "FETCH_ERROR") {
            Log.error("Calendar Error. Could not fetch SL info: " + payload.station)
        } else {
            Log.log("Calendar received an unknown socket notification: " + notification);
        }
        this.updateDom(this.config.animationSpeed);
    },

    // Override dom generator.
    getDom: function () {
        var wrapper = document.createElement("table");
        wrapper.className = "small";

        if (this.departures.length === 0) {
            wrapper.innerHTML = (this.loaded) ? this.translate("EMPTY") : this.translate("LOADING");
            wrapper.className = "small dimmed";
            return wrapper;
        }

        for (var d in this.departures) {
            var departure = this.departures[d];
            var eventWrapper = document.createElement("tr");

            if (this.config.colored) {
                eventWrapper.style.cssText = "color:" + this.colorForUrl(event.url);
            }

            eventWrapper.className = "normal";
            if (this.config.displaySymbol) {
                var symbolWrapper = document.createElement("td");
                symbolWrapper.className = "symbol align-right";
                var symbols = ["train"];

                for(var i = 0; i < symbols.length; i++) {
                    var symbol = document.createElement("span");
                    symbol.className = "fa fa-" + symbols[i];
                    if(i > 0){
                        symbol.style.paddingLeft = "5px";
                    }
                    symbolWrapper.appendChild(symbol);
                }
                eventWrapper.appendChild(symbolWrapper);
            }

            var departureWrapper = document.createElement("td");
            departureWrapper.innerHTML = this.titleTransform(departure.Destination);

            departureWrapper.className = "title bright";
            eventWrapper.appendChild(departureWrapper);

            var timeWrapper = document.createElement("td");
            var departureTime = null;
            if(departure.ExpectedDateTime == null) {
                departureTime = moment(departure.TimeTabledDateTime);
            } else {
                departureTime = moment(departure.ExpectedDateTime);
            }
            //console.log(event.today);
            var now = moment();
            // Define second, minute, hour, and day variables
            if (departureTime >= now) {
                timeWrapper.innerHTML = this.capFirst(moment(departureTime, "x").fromNow());  
            } else {
                timeWrapper.innerHTML = "Now!";
            }
            //timeWrapper.innerHTML += ' - '+ moment(event.startDate,'x').format('lll');
            //console.log(event);
            timeWrapper.className = "time light";
            eventWrapper.appendChild(timeWrapper);

            wrapper.appendChild(eventWrapper);
        }
        Log.log("Created SL module.")
        return wrapper;
    },

    /* createEventList(url)
     * Requests node helper to add calendar url.
     *
     * argument url string - Url to add.
     */
    startSL: function (station) {
        Log.log("Sending: START_SL!");
        this.sendSocketNotification("START_SL", {
            maximumEntries: this.config.maximumEntries,
            fetchInterval: this.config.fetchInterval,
            station: station,
            keys: this.config.keys
        });
    },

    /* shorten(string, maxLength)
     * Shortens a string if it's longer than maxLength.
     * Adds an ellipsis to the end.
     *
     * argument string string - The string to shorten.
     * argument maxLength number - The max length of the string.
     *
     * return string - The shortened string.
     */
    shorten: function (string, maxLength) {
        if (string.length > maxLength) {
            return string.slice(0, maxLength) + "&hellip;";
        }

        return string;
    },

    /* capFirst(string)
     * Capitalize the first letter of a string
     * Return capitalized string
     */

    capFirst: function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    /* titleTransform(title)
     * Transforms the title of an event for usage.
     * Replaces parts of the text as defined in config.titleReplace.
     * Shortens title based on config.maxTitleLength
     *
     * argument title string - The title to transform.
     *
     * return string - The transformed title.
     */
    titleTransform: function (title) {
        for (var needle in this.config.titleReplace) {
            var replacement = this.config.titleReplace[needle];

            var regParts = needle.match(/^\/(.+)\/([gim]*)$/);
            if (regParts) {
              // the parsed pattern is a regexp.
              needle = new RegExp(regParts[1], regParts[2]);
            }

            title = title.replace(needle, replacement);
        }

        title = this.shorten(title, this.config.maxTitleLength);
        return title;
    }
});