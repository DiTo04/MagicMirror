var SL = require("sl-api");
var SLFetcher = function(station, fetchInterval, maximumEntries, keys) {
    var self = this;
    var departures = [];
    var eventsReceivedCallback = function() {};
    var fetchFailedCallback = function(){};
    var reloadTimer = null;

    var sl = new SL(keys);
    var fetchDepartures = function() {
        sl.locationLookup({searchstring: station})
            .then((data)=> {
                console.log("Got starionID: " + data[0].SiteId)
                return sl.realtimeInformation({siteid: data[0].SiteId});
            })
            .then((data)=> {
                departures = data.Metros.slice(0,maximumEntries);
                console.log("Found: " + departures[0].Destination)
            })
            .fail((error) => {
                fetchFailedCallback(error);
                console.error(error);
            })
            .done();
        self.broadcastEvents();
        scheduleTimer();
    }

        /* scheduleTimer()
     * Schedule the timer for the next update.
     */
    var scheduleTimer = function() {
        //console.log('Schedule update timer.');
        clearTimeout(reloadTimer);
        reloadTimer = setTimeout(function() {
            fetchDepartures();
        }, fetchInterval);
    };

    this.departures = function() {
        return departures;
    };

    /* public methods */

    /* startFetch()
     * Initiate fetchCalendar();
     */
    this.startFetch = function() {
        fetchDepartures();
    };

    /* broadcastItems()
     * Broadcast the existing events.
     */
    this.broadcastEvents = function() {
        //console.log('Broadcasting ' + events.length + ' events.');
        eventsReceivedCallback(self);
    };

    /* onReceive(callback)
     * Sets the on success callback
     *
     * argument callback function - The on success callback.
     */
    this.onReceive = function(callback) {
        eventsReceivedCallback = callback;
    };

    /* onError(callback)
     * Sets the on error callback
     *
     * argument callback function - The on error callback.
     */
    this.onError = function(callback) {
        fetchFailedCallback = callback;
    };

}

module.exports = SLFetcher;