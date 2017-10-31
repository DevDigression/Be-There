const GLASSDOOR_URL = "http://api.glassdoor.com/api/api.htm";

let userCareer;
let userCity;
let userState;
let stateTotal = 1;
let nationTotal = 1;

$(function() {
	$('#city-search').submit(function(event) {
		event.preventDefault();
		userCareer = $('#city-query').val();
		$('#city-query').val("");
		// userCity = $('#city').val();
		// userState = $('#state').val();
		// userRadius = $('#radius').val();
		$('#home-page').addClass('no-display');
		$('#loc-page').removeClass('no-display');
		retrieveJobStats(displayLocData);
		retrieveRelatedCareers(displayRelatedCareers);
	});
	$('#career-search').submit(function(event) {
		event.preventDefault();
		userCareer = $('#career-query').val();
		$('#career-query').val("");
		// userCity = $('#city').val();
		// userState = $('#state').val();
		// userRadius = $('#radius').val();
		$('#home-page').addClass('no-display');
		$('#loc-page').removeClass('no-display');
		retrieveJobProg(displayCareerData);
	});
});

function retrieveJobStats (callback) {
	const params = {
		v: "1",
		format: "json",
		"t.p": "213919",
		"t.k": "dckaIJmhJoa",
		action: "jobs-stats",
		// Optional params below
		q: userCareer,
		city: userCity,
		state: userState,
		returnCities: true,
		returnJobTitles: true
		// returnStates: true,
		// admLevelRequested: 1
	}

	$.ajax({
			url: GLASSDOOR_URL,
			type: "GET",
			data: params,
			dataType: "jsonp",
			jsonpCallback: "displayLocData"
	});
}

function retrieveRelatedCareers (callback) {
	const params = {
		v: "1",
		format: "json",
		"t.p": "213919",
		"t.k": "dckaIJmhJoa",
		action: "jobs-stats",
		// Optional params below
		q: userCareer,
		city: userCity,
		state: userState,
		returnCities: true,
		returnJobTitles: true
		// returnStates: true,
		// admLevelRequested: 1
	}

	$.ajax({
			url: GLASSDOOR_URL,
			type: "GET",
			data: params,
			dataType: "jsonp",
			jsonpCallback: "displayRelatedCareers"
	});
}

function retrieveJobProg (callback) {
	const params = {
		v: "1",
		format: "json",
		"t.p": "213919",
		"t.k": "dckaIJmhJoa",
		action: "jobs-prog",
		jobTitle: userJobQuery,
		countryId: 1
	}

	$.ajax({
			url: GLASSDOOR_URL,
			type: "GET",
			data: params,
			dataType: "jsonp",
			jsonpCallback: "displayCareerData"
	});
}

function displayLocData (results) {
console.log(results);
	let cities = results.response.cities;
	const citiesTopFive = [];
	for (let i = 0; i < 5; i++) {
		citiesTopFive.push(cities[i]);
	}
	const citiesList = citiesTopFive.map((item, index) => renderCitiesResults(item));
		$('#cities-list').html(citiesList);

	const statesTopFive = [];
	for (let i = 0; i < 5; i++) {
		statesTopFive.push(addStateJobs(results));
	}
	const statesList = statesTopFive.map((item, index) => renderStatesResults(item));
		$('#states-list').html(statesList);
}

function renderCitiesResults(city) {
	return `
		<li>${city.name}</li>
		`
}

function renderStatesResults(state) {
	return `
		<li>${state.stateName}</li>
		`
}

function displayRelatedCareers (results) {
	console.log(results);
	let careers = results.response.jobTitles;
	
	const careersList = careers.map((item, index) => renderRelatedCareers(item));
		$('#related-careers-list').html(careersList);
}

function renderRelatedCareers(result) {
	return `
		<li><a href="https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${result.jobTitle}" target="_blank">${result.jobTitle}</a> (${result.numJobs} Jobs)</li>
		`
}

function addStateJobs(results) {
	let statesList = results.response.cities;
	let stateCount = {};
	let stateAbb = {};
	if (userCity == "" && userState == "") {
			for (let state of statesList) {
    		if (!stateCount[state.stateName] && !stateAbb[state.stateAbbreviation]) {
      		stateCount[state.stateName] = state.numJobs;
      		stateAbb[state.stateAbbreviation] = state.numJobs;
    		} else {
      		stateCount[state.stateName] += state.numJobs;
      		stateAbb[state.stateAbbreviation] += state.numJobs;
    		}
    		nationTotal += state.numJobs;
		}	
	} else {
  		for (let state of statesList) {
    		if (!stateCount[state.stateName]) {
      		stateCount[state.stateName] = state.numJobs;
      		stateAbb[state.stateAbbreviation] = state.numJobs;
    		} else {
      		stateCount[state.stateName] += state.numJobs;
      		stateAbb[state.stateAbbreviation] += state.numJobs;
    		}
    		nationTotal += state.numJobs;
  	}
  }

  	// uStates.draw('#statesvg', calculateSampleData(stateAbb), tooltipHtml);
   	return stateCount;
}