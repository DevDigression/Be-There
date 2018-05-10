const express = require("express");
const morgan = require("morgan");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

app.use(morgan("common"));
app.use(express.static("public"));

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
	res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
	if (req.method === "OPTIONS") {
		return res.send(204);
	}
	next();
});

const jobsRouter = require("./jobsRouter");

app.use("/", jobsRouter);

app.listen(process.env.PORT || 8080, () => {
	console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});
