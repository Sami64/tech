const SecretsManager = require("./secretsManager");
const Redis = require("redis");
const axios = require("axios");

const redisClient = Redis.createClient(
	"redis://tech-redis-ro.eq8loa.ng.0001.use2.cache.amazonaws.com:6379"
);

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

const main = async (event) => {
	try {
		await redisClient.connect();
		const apikey = await SecretsManager.retrieveKey();
		//const city = event.queryStringParameters.city;
		const city = 'kumasi'
		const results = await redisClient.get("currentWeather");
		if (results == null) {
			const { data } = await axios.get(
				`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey.openweatherkey}`
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

			await redisClient.set("currentWeather", JSON.stringify(result), {
				EX: 60,
			});
			return {
				statusCode: 200,
				body: JSON.stringify(result),
			};
		}

		return {
			statusCode: 200,
			body: results,
		};
	} catch (err) {
		console.log(err);
		return {
			statusCode: 400,
			body: JSON.stringify({ message: err }),
		};
	}
};

exports.handler = main;
