# ToDoList-with-Minimum-Temperatures-Server-Side-HTTP-Requests
A simple "To Do List" app with minimum temperature requirements to demonstrate server side HTTP requests (using Nodejs and Express). Also demonstrates the use of express "sessions" for tracking individual user data, such that the To Do list should be stored for any given user (so long as the server is not reset and the user's cookies are not cleared). The user's list should be available between site visits accordingly. (Note that the sample app given in the link below is running on a server that will "sleep" after a period of inactivity, which will reset the session data.)

User inputs "To Do" items along with a city and minimum temperature. A server side HTTP GET request gathers weather data (from openweathermap.com) using a server-side HTTP request for each item's city and compares this data to the user's input for minimum temperature. If the minimum temperature as input by the user exceeds the current city temperature as provided by openweathermap.com via the server-side HTTP request, the "To Do" item cannot be marked complete.

There is also a server-side POST reqeust to httpbin.org which displays the user's input back to the user. 

Uses Nodejs and Express.
