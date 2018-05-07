const GLASSDOOR_URL = "https://api.glassdoor.com/api/api.htm";
const GLASSDOOR_PARAMS = {
  v: "1",
  format: "json",
  "t.p": "213919",
  "t.k": "dckaIJmhJoa"
};

// search terms
let userCareerQuery;
let userCurrentCareer;

// Map totals -> percentage
let stateTotal = 0;
let nationTotal = 0;
let jobSum = 0;

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
  $("#location-search").submit(function(event) {
    event.preventDefault();
    userCareerQuery = $("#loc-query").val();
    $("#loc-query").val("");
    $("#home-page-header").addClass("no-display");
    $("#home-page").addClass("no-display");
    $("#loc-page").removeClass("no-display");
    addStateJobs(jobsData[userCareerQuery]);
    displayLocData(jobsData[userCareerQuery]);
  });

  $("#career-search").submit(function(event) {
    event.preventDefault();
    userCurrentCareer = $("#career-query").val();
    $("#career-query").val("");
    $("#home-page-header").addClass("no-display");
    $("#home-page").addClass("no-display");
    $("#progression-page").removeClass("no-display");
    retrieveJobProg(displayCareerProgression);
  });

  // Get you back to the landing page
  $(".new-search-button").on("click", function() {
    nationTotal = 0;
    stateCount = {};
    stateAbbreviation = {};
    citiesBarChart[0].values = [];
    jobsBarChart[0].values = [];
    salaryBarChart[0].values = [];
    $("#progression-page").addClass("no-display");
    $("#loc-page").addClass("no-display");
    $("#home-page-header").removeClass("no-display");
    $("#home-page").removeClass("no-display");
    $("#error-page").addClass("no-display");
    $("#svg-container").html(
      `<svg id="statesvg" role="graphics-datachart"><g id="canvas"></g></svg>`
    );
  });
});

function retrieveJobProg(callback) {
  const params = {
    action: "jobs-prog",
    jobTitle: userCurrentCareer,
    countryId: 1
  };
  requestData(params, "displayCareerProgression");
}

function requestData(params, callback) {
  $.ajax({
    url: "https://www.glassdoor.com/Job/api/json/search/jobProgression.htm",
    header: { "Content-Security-Policy": "upgrade-insecure-requests" },
    type: "GET",
    data: Object.assign(params, GLASSDOOR_PARAMS),
    dataType: "jsonp",
    jsonpCallback: callback
  });
}

function displayCareerProgression(results) {
  console.log(results);
  let jobs = results.response.results;
  if (!jobs.length) {
    $("#progression-page").addClass("no-display");
    $("#error-page").removeClass("no-display");
    $("#error-page h2").text(`Sorry, no results found for ${userCurrentCareer}.
          Please try searching again.`);
  } else {
    $("#progression-page h2").text(
      `Check out these career options related to ${capitalize(
        userCurrentCareer
      )}`
    );
    const jobsProg = [];
    for (let i = 0; i < 5; i++) {
      jobsProg.push(jobs[i]);
      jobsBarChart[0].values.push({
        date: jobs[i].nextJobTitle,
        value: jobs[i].nationalJobCount
      });
      salaryBarChart[0].values.push({
        date: jobs[i].nextJobTitle,
        value: jobs[i].medianSalary
      });
    }

    $("#jobs-chart-title").text("National Job Count");
    $("#salary-chart-title").text("Median Salary");

    renderJobsChart();
    renderSalaryChart();
    const jobsList = jobsProg.map((item, index) => renderJobProg(item));
    $("#jobs-list").html(jobsList);
  }
}

function renderJobProg(job) {
  return `
        <div class="related-job">
        <h3 class="${job.nextJobTitle}">${capitalize(job.nextJobTitle)}</h3>
        <li>Frequency of ${userCurrentCareer}s taking this job: ${Math.round(
    job.frequencyPercent * 100
  ) / 100}%</li>
        <li>Jobs available: ${job.nationalJobCount}</li>
        <li>Median Salary: $${job.medianSalary}</li>
        <a href="https://www.glassdoor.com/Job/jobs.htm?suggestCount=0&suggestChosen=false&clickSource=searchBtn&typedKeyword=teacher&sc.keyword=${
          job.nextJobTitle
        }" target="_blank"><button class="findJob">Find this Job</button></a>
        </div>
        `;
}

function renderJobsChart() {
  nv.addGraph(function() {
    var chart = nv.models
      .discreteBarChart()
      .x(function(d) {
        return d.date;
      })
      .y(function(d) {
        return d.value;
      })
      .staggerLabels(true)
      .tooltips(true)
      .showValues(false)
      .transitionDuration(250);

    chart.xAxis;
    chart.yAxis;

    d3
      .select("#jobs-chart svg")
      .datum(jobsBarChart)
      .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
}

function renderSalaryChart() {
  nv.addGraph(function() {
    var chart = nv.models
      .discreteBarChart()
      .x(function(d) {
        return d.date;
      })
      .y(function(d) {
        return d.value;
      })
      .staggerLabels(true)
      .tooltips(true)
      .showValues(false)
      .transitionDuration(250);

    chart.xAxis;
    chart.yAxis;

    d3
      .select("#salary-chart svg")
      .datum(salaryBarChart)
      .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**************************************************/
/******************Jobs Stats**********************/
/**************************************************/
function displayLocData(results) {
  console.log(results);
  let jobs = results;
  if (!jobs) {
    $("#loc-page").addClass("no-display");
    $("#error-page").removeClass("no-display");
    $("#error-page-header")
      .text(`Sorry, no results found for ${userCareerQuery}.
      Please try searching again.`);
  } else {
    $("#top-states-header").text(
      `Top 5 States for ${capitalize(userCareerQuery)}`
    );
    $("#top-cities-header").text(
      `How ${capitalize(userCareerQuery)} compares to other web fields`
    );

    const stateResults = results;
    let topFiveStates = Object.keys(stateResults).map(function(state) {
      return {
        stateName: states[state],
        jobs: this[state]
      };
    }, stateResults);
    topFiveStates.sort(function(state1, state2) {
      return state2.jobs - state1.jobs;
    });
    const statesTopFive = topFiveStates.slice(0, 5);
    const statesList = statesTopFive.map((item, index) =>
      renderStatesResults(item)
    );
    $("#states-list").html(statesList);

    for (let i = 0; i < statesTopFive.length; i++) {
      citiesBarChart[0].values.push({
        date: statesTopFive[i].stateName,
        value: statesTopFive[i].jobs
      });
    }
    renderCitiesChart();

    let jobTotals = {};
    let jobTypes = Object.keys(jobsData);
    jobTypes.forEach(type => {
      let jobTotal = 0;
      for (let state in jobsData[type]) {
        jobTotal += jobsData[type][state];
      }
      jobTotals[type] = jobTotal;
    });

    let fieldTotals = jobTypes.map(function(type) {
      return {
        field: type,
        jobs: jobTotals[type]
      };
    });

    for (let field in jobTotals) {
      jobSum += jobTotals[field];
    }

    renderStatesChart(fieldTotals);

    $("#states-chart-title").text("Number of Jobs by State");
    $("#cities-chart-title").text("Fields in Web Development");

    console.log(fieldTotals);
    const citiesList = fieldTotals.map((item, index) =>
      renderCitiesResults(item)
    );
    $("#cities-list").html(citiesList);
  }
}

function renderCitiesResults(job) {
  return `
      <li class="city-result">${capitalize(job.field)}</li>
      <li class="city-percent">${job.jobs} Jobs (${Math.round(
    job.jobs / jobSum * 100
  )}% of dev jobs)</li>
      `;
}

function renderStatesResults(state) {
  return `
      <li class="state-result">${state.stateName}</li>
      <li class="state-percent">${state.jobs} Jobs (${Math.round(
    state.jobs / nationTotal * 100
  )}% of nation)</li>
      `;
}

function addStateJobs(career) {
  console.log(career);
  for (let state in career) {
    stateCount[states[state]] = career[state];
    stateAbbreviation[state] = career[state];
    nationTotal += career[state];
  }

  uStates.draw(
    "#statesvg",
    calculateSampleData(stateAbbreviation),
    tooltipHtml
  );
  return stateCount;
}

function tooltipHtml(n, d) {
  /* function to create html content string in tooltip div. */
  return `<h4>${n}</h4><table>
        <tr><td>Jobs</td></tr>
        <tr><td>State</td><td>${stateCount[n]}</td></tr>
        <tr><td>National</td><td>${nationTotal}</td></tr>
        </table>`;
}

function calculateSampleData(stateTotals) {
  console.log(stateTotals);
  let sampleData = {};
  [
    "HI",
    "AK",
    "FL",
    "SC",
    "GA",
    "AL",
    "NC",
    "TN",
    "RI",
    "CT",
    "MA",
    "ME",
    "NH",
    "VT",
    "NY",
    "NJ",
    "PA",
    "DE",
    "MD",
    "WV",
    "KY",
    "OH",
    "MI",
    "WY",
    "MT",
    "ID",
    "WA",
    "DC",
    "TX",
    "CA",
    "AZ",
    "NV",
    "UT",
    "CO",
    "NM",
    "OR",
    "ND",
    "SD",
    "NE",
    "IA",
    "MS",
    "IN",
    "IL",
    "MN",
    "WI",
    "MO",
    "AR",
    "OK",
    "KS",
    "LA",
    "VA"
  ].forEach(function(state) {
    sampleData[state] = {
      color: d3.interpolate("#ffffcc", "#009999")(
        stateTotals[state] * 10 / nationTotal
      )
    };
  });
  return sampleData;
}

/* draw states on id #statesvg */
// uStates.draw('#statesvg', calculateSampleData(1), tooltipHtml);
d3.select(self.frameElement).style("height", "600px");

function renderCitiesChart() {
  nv.addGraph(function() {
    var chart = nv.models
      .discreteBarChart()
      .x(function(d) {
        return d.date;
      })
      .y(function(d) {
        return d.value;
      })
      .staggerLabels(true)
      .tooltips(true)
      .showValues(false)
      .transitionDuration(250);

    chart.xAxis;
    chart.yAxis;

    d3
      .select("#states-chart svg")
      .datum(citiesBarChart)
      .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
}

function topStates(states) {
  return {
    state: states.stateName,
    jobs: states.jobs
  };
}

function renderStatesChart(totals) {
  console.log(totals);
  nv.addGraph(function() {
    var chart = nv.models
      .pieChart()
      .x(function(d) {
        return d.field;
      })
      .y(function(d) {
        return d.jobs;
      })
      .showLabels(true);

    d3
      .select("#cities-chart svg")
      .datum(totals)
      .transition()
      .duration(350)
      .call(chart);

    return chart;
  });
}
