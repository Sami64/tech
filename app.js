require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { Client } = require("memjs");
const { promisify } = require("util");

// redis client
const memcached = Client.create("127.0.0.1:11211");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/current", async (req, res) => {
	try {
		const city = req.query.city;

		memcached.get("currentWeather", async (error, data) => {
			if (error) throw error;
			console.log("cache data", data);
			if (data != null) {
				console.log("cache");
				return res.json(JSON.parse(data));
			} else {
				// retrieve weather data
				const { data } = await axios.get(
					`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.API_KEY}`
				);

				// convert wind degrees to direction
				const direction = toDirection(data.wind.deg);
				const result = {
					city: data.name,
					temperature: data.main.temp,
					weatherCondition: {
						type: data.weather[0].main,
						pressure: data.main.pressure,
						humidity: data.main.humidity,
					},
					wind: {
						speed: data.wind.speed,
						direction,
					},
				};

				memcached.set("currentWeather", JSON.stringify(result), {
					expires: 60,
				});

				return res.json(data);
			}
		});
	} catch (error) {
		console.log("err");
		console.log(error);
		res.json({ error: error });
	}
});

app.listen(3000);

const toDirection = (degrees) => {
	const val = Math.floor(degrees / 22.5 + 0.5);
	const arr = [
		"N",
		"NNE",
		"NE",
		"ENE",
		"E",
		"ESE",
		"SE",
		"SSE",
		"S",
		"SSW",
		"SW",
		"WSW",
		"W",
		"WNW",
		"NW",
		"NNW",
	];
	return arr[val % 16];
};
