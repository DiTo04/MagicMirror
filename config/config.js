/* Magic Mirror Config Sample
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

var config = {
	port: 8080,
	ipWhitelist: [], // Set [] to allow all IP addresses.

	language: "sv",
	timeFormat: 24,
	units: "metric",

	modules: [
		{
			module: "alert",
		},
		{
			module: "updatenotification",
			position: "top_bar"
		},
		{
			module: "currentweather",
			position: "top_right",
			config: {
				location: "Stockholm",
				locationID: "2673730",  //ID from http://www.openweathermap.org/help/city_list.txt
				appid: "da743601074443eaddb365d4b535405d"
			}
		},
		{
			module:"SlModule",
			position: "top_right",
			header: "Avgångar",
			config: {
				keys: {
					realtimeInformation: "26cf755433554c2c9a91b141d5fa96d9",
					disturbanceInformation: "e679c32b21fe46d2b20f3cd8a496e37f",
					locationLookup: "50803ae16ba64a0daa6408096b911da2"
				}
			}
		},
		/*{
			module:"CircleWeather",
			position: "bottom_right",
			header: "Väder",
			config: {
				location: "Stockholm",
				locationID: "2673730",  //ID from http://www.openweathermap.org/help/city_list.txt
				appid: "da743601074443eaddb365d4b535405d",
				maxDegree: 30,
				circleSize: 80,
				circleAnimationSpeed: 1
			}
		},*/
	]

};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {module.exports = config;}
