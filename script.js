var $searchForm = document.querySelector("#city-search");
var $searchInput = document.querySelector("#search-input");
var $weatherCard = document.querySelector("#current-weather");
var $weatherBody = document.querySelector("#weather-body");
var $forecastSection = document.querySelector("#forecast-section");
var $fivedayDiv = document.querySelector("#five-day");
var $historyCard = document.querySelector("#history-card");
var $searchHistory = document.querySelector("#search-history");
var $errorMsg = document.querySelector("#error-message");
// variables for APIs
var APIkey = "5f627cd76ea4710ec0c37266c24bd00f";
var urlStart = "https://api.openweathermap.org/data/2.5/";

//search history array which is mirrored in local storage
var searchHistory = [];

/* ----- FUNCTIONS ----- */
function landingDisplay(){
  //on page load we want to display most recent search forecast
  if (localStorage.getItem("searchHistory")) {
    updateHistory();
    searchHandler(searchHistory[searchHistory.length - 1]);
  }
}

//add search term to history [] & local storage
function addTerm(searchTerm){
  //if there's local storage, 
  if(localStorage.getItem("searchHistory")){
    //get items from local storage and add them to searchHistory[]
    searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
  }
searchHistory.push(searchTerm);

if(searchHistory.length > 5){
  searchHistory.shift();
}

//then store the updated searchHistory[] in local storage
localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

//call the function to update search history display
updateHistory();
}

//update search history display from local storage
function updateHistory(){
  //clear searchHistory div
  $searchHistory.textContent = "";
  //console.log(searchHistory);
  searchHistory = JSON.parse(localStorage.getItem("searchHistory"));

  for (var j = searchHistory.length - 1; j >= 0; j --){
    //console.log(searchHistory[j]);
    var $pastSearch = document.createElement("li");
    $pastSearch.textContent = searchHistory[j];
    $pastSearch.classList.add("list-group-item");
    $pastSearch.setAttribute("data-value", searchHistory[j]);

    $searchHistory.appendChild($pastSearch);
  }
  $historyCard.classList.remove("hide");
}

function searchHandler(searchTerm) {
  $errorMsg.classList.add("hide");
  $weatherCard.classList.add("hide");
  $forecastSection.classList.add("hide");
  //clear results divs:
  $weatherBody.textContent = "";
  $fivedayDiv.textContent="";
  //call currentweather & UV AJAX request:
  currentweatherSearch(searchTerm);
  //call 5Day AJAX request:
  fivedaySearch(searchTerm);
}

//call current weather API
function currentweatherSearch(searchTerm) {
  //how should we handle returning false?
  var cityCoords;
  var weatherUrl = urlStart + "weather?q=" + searchTerm + "&units=imperial&APPID=" + APIkey;

  $.ajax({
    url: weatherUrl,
    method: "GET"
    // error: handleError()
  }).then(function (weatherResponse) {

    //call function to create html elements showing response:
    displayCurrentweather(weatherResponse);

    //send coordinates to UV search for API call
    cityCoords = weatherResponse.coord;
    currentUVSearch(cityCoords);
  });  
}