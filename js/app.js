const GLASSDOOR_URL = "https://api.glassdoor.com/api/api.htm";

let userCareerQuery;
let userCurrentCareer;
let userCity;
let userState;
let stateTotal = 1;
let nationTotal = 1;
let stateCount = {};

$(function() {
	$('#loc-search').submit(function(event) {
		event.preventDefault();
		userCareerQuery = $('#loc-query').val();
		$('#loc-query').val("");
		$('#home-page-header').addClass('no-display');
		$('#home-page').addClass('no-display');
		$('#loc-page').removeClass('no-display');
		retrieveJobStats(displayLocData);
		retrieveRelatedCareers(displayRelatedCareers);
	});

	$('#career-search').submit(function(event) {
		event.preventDefault();

		userCurrentCareer = $('#career-query').val();
		console.log(userCurrentCareer);
		$('#career-query').val("");
		$('#home-page-header').addClass('no-display');
		$('#home-page').addClass('no-display');
		$('#progression-page').removeClass('no-display');
		retrieveJobProg(displayCareerProgression);

		$('#jobs-list').on('click', 'button', function(event){
		userCareerQuery = $(this).closest('.related-job').find('h3').attr('class');
		console.log(userCareerQuery);
		$('#progression-page').addClass('no-display');
		$('#loc-page').removeClass('no-display');
		retrieveJobStats(displayLocData);
		retrieveRelatedCareers(displayRelatedCareers);
	});
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
		q: userCareerQuery,
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
		q: userCareerQuery,
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
		jobTitle: userCurrentCareer,
		countryId: 1
	}

	$.ajax({
			url: GLASSDOOR_URL,
			type: "GET",
			data: params,
			dataType: "jsonp",
			jsonpCallback: "displayCareerProgression"
	});
}

function displayLocData (results) {
	$('#top-states h3').text(`Top 5 States for ${capitalize(userCareerQuery)}`);
	$('#top-cities h3').text(`Top 5 Cities for ${capitalize(userCareerQuery)}`);
	
	const stateResults = addStateJobs(results);
	let topFiveStates = Object.keys(stateResults).map(function(state) {
  		return { 
  			stateName: state, 
  			jobs: this[state] };
		}, stateResults);
		topFiveStates.sort(function(state1, state2) { 
		return state2.jobs - state1.jobs; 
	});
	const statesTopFive = topFiveStates.slice(0, 5);
	const statesList = statesTopFive.map((item, index) => renderStatesResults(item));
		$('#states-list').html(statesList);

	let cities = results.response.cities;
	const citiesTopFive = [];
	for (let i = 0; i < 5; i++) {
		citiesTopFive.push(cities[i]);
	}
	const citiesList = citiesTopFive.map((item, index) => renderCitiesResults(item));
		$('#cities-list').html(citiesList);
}

function renderCitiesResults(city) {
	let cityState = city.stateName;
	return `
		<li class="city-result">${city.name} - ${city.numJobs} Jobs 
		(${Math.round((city.numJobs/stateCount[cityState])*100)}% of ${cityState})</li>
		`
}

function renderStatesResults(state) {
	return `
		<li class="state-result">${state.stateName} - ${state.jobs} Jobs 
		(${Math.round((state.jobs/nationTotal)*100)}%)</li>
		`
}

function displayRelatedCareers (results) {
	$('#related-careers h3').text("Jobs related to " + userCareerQuery);
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
  	
  uStates.draw('#statesvg', calculateSampleData(stateAbb), tooltipHtml);

   	return stateCount;
}

function displayCareerProgression (results) {
	$('#progression-page h2').text(`Check out these career options related to ${capitalize(userCurrentCareer)}`);
	let jobs = results.response.results;
	const jobsProg = [];
	for (let i = 0; i < 5; i++) {
		console.log(jobs[i]);
		jobsProg.push(jobs[i]);
	}
	const jobsList = jobsProg.map((item, index) => renderJobProg(item));
	$('#jobs-list').html(jobsList);
}

function renderJobProg(job) {
	return `
		<div class="related-job">
		<h3 class="${job.nextJobTitle}">${capitalize(job.nextJobTitle)}</h3>
		<li>Frequency of ${userCurrentCareer}s taking this job: ${Math.round(job.frequencyPercent*100)/100}%</li>
		<li>Jobs available: ${job.nationalJobCount}</li>
		<li>Median Salary: $${job.medianSalary}</li>
		<button class="findJob">Find this Job</button>
		<hr>
		</div>
		`
}

function capitalize (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// window.setTimeout(function(){
// 	stateTotal = 4000;
// 	uStates.draw('#statesvg', calculateSampleData(), tooltipHtml);
// 	d3.select(self.frameElement).style('height', '600px'); 
// }, 3000);

function tooltipHtml(n, d) {	/* function to create html content string in tooltip div. */
	return `<h4>${n}</h4><table>
			<tr><td>Jobs</td></tr>
			<tr><td>State</td><td>${stateCount[n]}</td></tr>
			<tr><td>National</td><td>${nationTotal}</td></tr>
			</table>`;
}

function calculateSampleData (stateTotals) {
let sampleData = {};	
	["HI", "AK", "FL", "SC", "GA", "AL", "NC", "TN", "RI", "CT", "MA",
	"ME", "NH", "VT", "NY", "NJ", "PA", "DE", "MD", "WV", "KY", "OH", 
	"MI", "WY", "MT", "ID", "WA", "DC", "TX", "CA", "AZ", "NV", "UT", 
	"CO", "NM", "OR", "ND", "SD", "NE", "IA", "MS", "IN", "IL", "MN",
	"WI", "MO", "AR", "OK", "KS", "LA", "VA"]
		.forEach(function(state) { 
			sampleData[state] = {
				color: d3.interpolate('#ffffcc', '#009999')((stateTotals[state]*10) / nationTotal)
			}; 
	});
		return sampleData;
}
	
/* draw states on id #statesvg */	
// uStates.draw('#statesvg', calculateSampleData(1), tooltipHtml);	
d3.select(self.frameElement).style('height', '600px'); 