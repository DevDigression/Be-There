# Be There - For Your Career

## Thinkful Frontend Capstone Project

![alt text](https://github.com/DevDigression/Be-There/blob/master/img/Be%20There%20Banner.png "Be There - For Your Career")

**Be There** is designed to help users plan their next career move by obtaining useful information regarding job trends
across the United States.
The **Glassdoor API** is utilized for job statistics.

**Be There** has two main search functions which users can take advantage of:

![alt text](https://github.com/DevDigression/Be-There/blob/master/img/Be%20There%20Homepage%20Form.png "Be There Landing Page Form")

### Job Locations
- Users can search for a career field and obtain location data for cities and states with the most jobs in that field
- Users will also receive a list of the specific job titles within this field; clicking one of the job titles 
will bring the user to glassdoor.com with the job title pre-filled for search

![alt text](https://github.com/DevDigression/Be-There/blob/master/img/Be%20There%20Map.gif "Be There Data Map")

![alt text](https://github.com/DevDigression/Be-There/blob/master/img/Be%20There%20States.png "Be There States Chart")

![alt text](https://github.com/DevDigression/Be-There/blob/master/img/Be%20There%20Cities.png "Be There Cities Chart")

![alt text](https://github.com/DevDigression/Be-There/blob/master/img/Be%20There%20Related%20Jobs.png "Be There Related Jobs")

### Jobs Progression
- Users can search for jobs related to their current position and obtain information about these career fields
- Users will be given a list of the top five most commonly held positions by others with that current career;
clicking the 'Find This Job' button will perform a 'Job Locations' search for that specific job

![alt text](https://github.com/DevDigression/Be-There/blob/master/img/Be%20There%20Jobs%20Progression.gif "Be There Jobs Progression")

## Technologies

This app comprehensively utilizes the frontend technologies of **HTML5**, **CSS3**, and **Javascript**, with the addition of
**jQuery** for ease of functionality

**d3.js** brings together this functionality by displaying the data retrieved in meaningful ways to the user. 
 - An SVG map is used to display job density throughout the country. The map also offers specific statistics for 
the total number of jobs in each state as well as the nation as a whole
 - SVG charts and graphs are rendered with job-related information which aids users by offering a visual aid as well as
a form of visual comparison
(for example, seeing the number of jobs available as well as the median salary for that job as compared to others
in the field)