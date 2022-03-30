var AWS = require("aws-sdk"),
	region = "us-east-2",
	secretName =
		"arn:aws:secretsmanager:us-east-2:837991222522:secret:openweatherkey-9jrwrt",
	secret,
	decodedBinarySecret;

var client = new AWS.SecretsManager({ region: region });

class SecretsManager {
	static retrieveKey = async () => {
		let secretValue = await client
			.getSecretValue({ SecretId: secretName })
			.promise();
		try {
			if ("SecretString" in secretValue) {
				return JSON.parse((secret = secretValue.SecretString));
			} else {
				let buff = new Buffer.fromString(secretValue.SecretBinary, "base64");
				return (decodedBinarySecret = buff.toString("ascii"));
			}
		} catch (err) {
			if (err.code === "DecryptionFailureException")
				// Secrets Manager can't decrypt the protected secret text using the provided KMS key.
				// Deal with the exception here, and/or rethrow at your discretion.
				throw new Error("internal server error");
			else if (err.code === "InternalServiceErrorException")
				// An error occurred on the server side.
				// Deal with the exception here, and/or rethrow at your discretion.
				throw new Error("internal server error");
			else if (err.code === "InvalidParameterException")
				// You provided an invalid value for a parameter.
				// Deal with the exception here, and/or rethrow at your discretion.
				throw new Error("internal server error");
			else if (err.code === "InvalidRequestException")
				// You provided a parameter value that is not valid for the current state of the resource.
				// Deal with the exception here, and/or rethrow at your discretion.
				throw new Error("internal server error");
			else if (err.code === "ResourceNotFoundException")
				// We can't find the resource that you asked for.
				// Deal with the exception here, and/or rethrow at your discretion.
				throw new Error("internal server error");
		}
	};
}

module.exports = SecretsManager;
