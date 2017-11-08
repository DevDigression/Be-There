const GLASSDOOR_URL = "https://api.glassdoor.com/api/api.htm";


// search terms
let userCareerQuery;
let userCurrentCareer;

// Map totals -> percentage
let stateTotal = 0;
let nationTotal = 0;

let stateCount = {};
let stateAbbreviation = {};

let citiesBarChart = [
  {
    key: "Cumulative Return",
    values: []
  }
];

let jobsBarChart = [
  {
    key: "Cumulative Return",
    values: []
  }
];

let salaryBarChart = [
  {
    key: "Cumulative Return",
    values: []
  }
];

////////////////////////////// DOC READY ENDS/////////////////////////////

$(function() {

  // Type into landing form  [Map]
  $('#loc-search').submit(function(event) {
    event.preventDefault();
    userCareerQuery = $('#loc-query').val();
    $('#loc-query').val("");
    $('#home-page-header').addClass('no-display');
    $('#home-page').addClass('no-display');
    $('#loc-page').removeClass('no-display');
    retrieveJobStats(displayLocData);
    retrieveRelatedCareers(displayRelatedCareers);

    // Get you back to the landing page
    $('.new-search-button').on('click', function(){
      clearValues()
      $('#progression-page').addClass('no-display');
      $('#loc-page').addClass('no-display');
      $('#home-page-header').removeClass('no-display');
      $('#home-page').removeClass('no-display');
    });

    function clearValues(){
      nationTotal = 0;
      stateCount = {};
      stateAbbreviation = {};
      citiesBarChart[0].values = [];
      jobsBarChart[0].values = [];
      salaryBarChart[0].values = [];
    }


    $('#re-search button').on('click', function(){
      clearValues()
      $('#loc-page').addClass('no-display');
      $('#progression-page').addClass('no-display');
      $('#error-page').addClass('no-display');
      $('#home-page-header').removeClass('no-display');
      $('#home-page').removeClass('no-display');
    });
  });

  $('#career-search').submit(function(event) {
    event.preventDefault();
    userCurrentCareer = $('#career-query').val();
    $('#career-query').val("");
    $('#home-page-header').addClass('no-display');
    $('#home-page').addClass('no-display');
    $('#progression-page').removeClass('no-display');
    retrieveJobProg(displayCareerProgression);

    $('#jobs-list').on('click', 'button', function(event){
      userCareerQuery = $(this).closest('.related-job').find('h3').attr('class');
      $('#progression-page').addClass('no-display');
      $('#loc-page').removeClass('no-display');
      retrieveJobStats(displayLocData);
      retrieveRelatedCareers(displayRelatedCareers);
    });

    $('#re-search button').on('click', function(){
      clearValues()
      $('#loc-page').addClass('no-display');
      $('#progression-page').addClass('no-display');
      $('#error-page').addClass('no-display');
      $('#home-page-header').removeClass('no-display');
      $('#home-page').removeClass('no-display');
    });
  });

});

////////////////////////////// DOC READY ENDS/////////////////////////////







function retrieveJobStats (callback) {
  const params = {
    v: "1",
    format: "json",
    "t.p": "213919",
    "t.k": "dckaIJmhJoa",
    action: "jobs-stats",
    // Optional params below
    q: userCareerQuery,
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

// TODO:
// Check arguments - callback

function retrieveRelatedCareers (callback) {
  const params = {
    v: "1",
    format: "json",
    "t.p": "213919",
    "t.k": "dckaIJmhJoa",
    action: "jobs-stats",
    // Optional params below
    q: userCareerQuery,
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
  let jobs = results.response.jobTitles;

  if (!jobs.length) {
    $('#loc-page').addClass('no-display');
    $('#error-page').removeClass('no-display');
    $('#error-page h2').text(`Sorry, no results found for ${userCareerQuery}.
      Please try searching again.`);
    } else {
      $('#top-states-header').text(`Top 5 States for ${capitalize(userCareerQuery)}`);
      $('#top-cities-header').text(`Top 5 Cities for ${capitalize(userCareerQuery)}`);

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

        const topFiveStatesList = statesTopFive.map((item, index) => topStates(item));
        renderStatesChart(topFiveStatesList);

        let cities = results.response.cities;
        const citiesTopFive = [];
        for (let i = 0; i < 5; i++) {
          citiesTopFive.push(cities[i]);
          citiesBarChart[0].values.push({
            'date': cities[i].name,
            'value': cities[i].numJobs
          });
        }
        renderCitiesChart();

        $('#states-chart-title').text("Number of Jobs by State");
        $('#cities-chart-title').text("Number of Jobs by City");

        const citiesList = citiesTopFive.map((item, index) => renderCitiesResults(item));
        $('#cities-list').html(citiesList);
      }
    }

    function renderCitiesResults(city) {
      let cityState = city.stateName;
      return `
      <li class="city-result">${city.name}</li>
      <li class="city-percent">${city.numJobs} Jobs (${Math.round((city.numJobs/stateCount[cityState])*100)}% of ${cityState})</li>
      `
    }

    function renderStatesResults(state) {
      return `
      <li class="state-result">${state.stateName}</li>
      <li class="state-percent">${state.jobs} Jobs (${Math.round((state.jobs/nationTotal)*100)}% of nation)</li>
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

      for (let state of statesList) {
        if (!stateCount[state.stateName] && !stateAbbreviation[state.stateAbbreviationreviation]) {
          stateCount[state.stateName] = state.numJobs;
          stateAbbreviation[state.stateAbbreviation] = state.numJobs;
        } else {
          stateCount[state.stateName] += state.numJobs;
          stateAbbreviation[state.stateAbbreviation] += state.numJobs;
        }
        nationTotal += state.numJobs;
      }

      uStates.draw('#statesvg', calculateSampleData(stateAbbreviation), tooltipHtml);
      return stateCount;
    }

    function displayCareerProgression (results) {
      let jobs = results.response.results;
      if (!jobs.length) {
        $('#progression-page').addClass('no-display');
        $('#error-page').removeClass('no-display');
        $('#error-page h2').text(`Sorry, no results found for ${userCurrentCareer}.
          Please try searching again.`);
        } else {
          $('#progression-page h2').text(`Check out these career options related to ${capitalize(userCurrentCareer)}`);
          const jobsProg = [];
          for (let i = 0; i < 5; i++) {
            jobsProg.push(jobs[i]);
            jobsBarChart[0].values.push({
              'date': jobs[i].nextJobTitle,
              'value': jobs[i].nationalJobCount
            });
            salaryBarChart[0].values.push({
              'date': jobs[i].nextJobTitle,
              'value': jobs[i].medianSalary
            });
          }

          $('#jobs-chart-title').text("National Job Count");
          $('#salary-chart-title').text("Median Salary");

          renderJobsChart();
          renderSalaryChart();
          const jobsList = jobsProg.map((item, index) => renderJobProg(item));
          $('#jobs-list').html(jobsList);
        }
      }

      function renderJobProg(job) {
        return `
        <div class="related-job">
        <h3 class="${job.nextJobTitle}">${capitalize(job.nextJobTitle)}</h3>
        <li>Frequency of ${userCurrentCareer}s taking this job: ${Math.round(job.frequencyPercent*100)/100}%</li>
        <li>Jobs available: ${job.nationalJobCount}</li>
        <li>Median Salary: $${job.medianSalary}</li>
        <button class="findJob">Find this Job</button>
        </div>
        `
      }

      function capitalize (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

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



      function renderCitiesChart() {
        nv.addGraph(function() {
          var chart = nv.models.discreteBarChart()
          .x(function(d) { return d.date })
          .y(function(d) { return d.value })
          .staggerLabels(true)
          .tooltips(true)
          .showValues(false)
          .transitionDuration(250);

          chart.xAxis

          chart.yAxis

          d3.select('#cities-chart svg')
          .datum(citiesBarChart)
          .call(chart);

          nv.utils.windowResize(chart.update);

          return chart;
        });
      }


      function topStates(states) {
        return  {
          "state": states.stateName,
          "jobs" : states.jobs
        }
      }

      function renderStatesChart(topFiveStates) {
        nv.addGraph(function() {
          var chart = nv.models.pieChart()
          .x(function(d) { return d.state })
          .y(function(d) { return d.jobs })
          .showLabels(true);

          d3.select("#states-chart svg")
          .datum(topFiveStates)
          .transition().duration(350)
          .call(chart);

          return chart;
        });
      }

      function renderJobsChart() {
        nv.addGraph(function() {
          var chart = nv.models.discreteBarChart()
          .x(function(d) { return d.date })
          .y(function(d) { return d.value })
          .staggerLabels(true)
          .tooltips(true)
          .showValues(false)
          .transitionDuration(250);

          chart.xAxis

          chart.yAxis

          d3.select('#jobs-chart svg')
          .datum(jobsBarChart)
          .call(chart);

          nv.utils.windowResize(chart.update);

          return chart;
        });
      }

      function renderSalaryChart() {
        nv.addGraph(function() {
          var chart = nv.models.discreteBarChart()
          .x(function(d) { return d.date })
          .y(function(d) { return d.value })
          .staggerLabels(true)
          .tooltips(true)
          .showValues(false)
          .transitionDuration(250);

          chart.xAxis

          chart.yAxis

          d3.select('#salary-chart svg')
          .datum(salaryBarChart)
          .call(chart);

          nv.utils.windowResize(chart.update);

          return chart;
        });
      }
