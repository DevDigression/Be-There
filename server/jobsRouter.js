const fetch = require("node-fetch");

const express = require("express");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const GLASSDOOR_URL =
	"https://www.glassdoor.com/Job/api/json/search/jobProgression.htm?";

router.get("/", (req, res) => {
	let params = {
		v: "1",
		format: "json",
		"t.p": "213919",
		"t.k": "dckaIJmhJoa",
		action: "jobs-prog",
		jobTitle: "teacher",
		countryId: 1
	};

	let esc = encodeURIComponent;
	let query = Object.keys(params)
		.map(k => esc(k) + "=" + esc(params[k]))
		.join("&");

	let url = GLASSDOOR_URL + query;

	fetch(url)
		.then(res => res.json())
		.then(data => res.send(data))
		.catch(function(error) {
			console.log("request failed", error);
		});
});

module.exports = router;
