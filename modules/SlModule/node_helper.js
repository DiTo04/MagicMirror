/* Magic Mirror
 * Node Helper: Calendar
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var SLFetcher = require("./SLFetcher.js");

module.exports = NodeHelper.create({
	// Override start method.
	start: function() {
		var events = [];
		this.fetcher;
		console.log("Starting node helper for: " + this.name);
	},

	// Override socketNotificationReceived method.
	socketNotificationReceived: function(notification, payload) {
		console.log("Got notification on SL stream")
		if (notification === "START_SL") {
			console.log("Starting SL fetching.")
			this.createFetcher( payload.station, payload.fetchInterval, payload.maximumEntries, payload.keys);
		}
	},

	/* createFetcher(url, reloadInterval)
	 * Creates a fetcher for a new url if it doesn't exist yet.
	 * Otherwise it reuses the existing one.
	 *
	 * attribute url string - URL of the news feed.
	 * attribute reloadInterval number - Reload interval in milliseconds.
	 */

	createFetcher: function(station, fetchInterval, maximumEntries, keys) {
		var self = this;
		var fetcher;
		if (typeof self.fetcher === "undefined") {
			console.log("Create new SL fetcher for " + station + "with Interval: " + fetchInterval);
			fetcher = new SLFetcher(station, fetchInterval, maximumEntries,keys);

			fetcher.onReceive(function(fetcher) {
				self.sendSocketNotification("SL_TIMES", {
					departures: fetcher.departures()
				});
			});

			fetcher.onError(function(fetcher, error) {
				self.sendSocketNotification("FETCH_ERROR", {
					error: error
				});
			});

			self.fetcher = fetcher;
		} else {
			//console.log('Use existing news fetcher for url: ' + url);
			fetcher = self.fetcher;
			fetcher.broadcastEvents();
		}
		fetcher.startFetch();
	}
});
