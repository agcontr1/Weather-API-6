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

//call current UV API
function currentUVSearch(cityCoords) {
    //create string of coords to use as parameters for UV API call
    var searchCoords = "lat=" + cityCoords.lat + "&lon=" + cityCoords.lon;
  
    var uvUrl = urlStart + "uvi?" + searchCoords + "&APPID=" + APIkey;
  
    $.ajax({
      url: uvUrl,
      method: "GET"
    }).then(function(uvResponse){
      //call function to create html element for uv response:
      displayCurrentUV(uvResponse);
    });
  
  }
  
  //call forecast API
  function fivedaySearch(searchTerm) {
  
    var forecastUrl = urlStart + "forecast?q=" + searchTerm + "&units=imperial&APPID=" + APIkey;
  
    $.ajax({
      url: forecastUrl,
      method: "GET"
    }).then(function(forecastResponse){
      //call function to create html elements for forecast response:
      displayForecast(forecastResponse);
    });
  
  }
  
  //add current weather response to page:
  function displayCurrentweather(weatherResponse){
    //console.log(weatherResponse);
  
    var $weatherHeader = document.createElement("h1");
  
    var timeNow = moment();
    var currentDate = "(" + timeNow.format("MM/DD/YYYY") + ")";
  
    $weatherHeader.textContent = weatherResponse.name + " " + currentDate;
    
    //set up img to display weather icon
    var $weatherIcon = document.createElement("img");
    $weatherIcon.setAttribute("src", "https://openweathermap.org/img/w/" + weatherResponse.weather[0].icon + ".png")
    $weatherIcon.setAttribute("alt", weatherResponse.weather[0].main + " - " + weatherResponse.weather[0].description);
  
    //set up div for temp
    var $weatherTemp = document.createElement("div");
    $weatherTemp.textContent = "Temperature: " + (weatherResponse.main.temp) + " F°";
  
    //set up div for humidity
    var $weatherHumid = document.createElement("div");
    $weatherHumid.textContent = "Humidity: " + (weatherResponse.main.humidity) + "%";
  
    //set up div for wind
    var $weatherWind = document.createElement("div");
    $weatherWind.textContent = "Wind Speed: " + (weatherResponse.wind.speed) + " MPH";
  
    //add icon to header
    $weatherHeader.appendChild($weatherIcon);
  
    //add everything to card
    $weatherBody.appendChild($weatherHeader);
    $weatherBody.appendChild($weatherTemp);
    $weatherBody.appendChild($weatherHumid);
    $weatherBody.appendChild($weatherWind);
  }
  
  //add UV index response to page:
  function displayCurrentUV(uvResponse){
    //set up div for uv
    var $weatherUV = document.createElement("div");
    $weatherUV.textContent = "UV Index: " + (uvResponse.value);
  
    //add uv to card
    $weatherBody.appendChild($weatherUV);
    //show current weather card since last element has been added:
    $weatherCard.classList.remove("hide");
  
  }
  
  //add 5Day forecast response to page:
  function displayForecast(forecastResponse){
    
    for (var i = 0; i < forecastResponse.cnt; i ++) {
      var responseRef = forecastResponse.list[i];
  
      var responseDate = moment(responseRef.dt_txt);
  
      if (parseInt(responseDate.format("HH")) == 12){
  
        var $forecastCard = document.createElement("div");
        $forecastCard.classList.add( "card", "bg-blob", "col-10", "col-lg-2", "p-0", "mx-auto", "mt-3");
  
        var $cardBody = document.createElement("div");
        $cardBody.classList.add("card-body", "text-light", "p-2");
  
        var $forecastTitle = document.createElement("h5");
        $forecastTitle.classList.add("card-title");
        $forecastTitle.textContent = responseDate.format("MM/DD/YYYY");
  
        var $forecastIcon = document.createElement("img");
        $forecastIcon.setAttribute("src", "https://openweathermap.org/img/w/" + responseRef.weather[0].icon + ".png");
        $forecastIcon.setAttribute("alt", responseRef.weather[0].main + " - " + responseRef.weather[0].description);
  
        var $forecastTemp = document.createElement("div");
        $forecastTemp.textContent = "Temp: " + (responseRef.main.temp) + " F°";
  
        var $forecastHumid = document.createElement("div");
        $forecastHumid.textContent = "Humidity: " + (responseRef.main.humidity) + "%"; 
  
        //adding everything to cardbody
        $cardBody.appendChild($forecastTitle);
        $cardBody.appendChild($forecastIcon);
        $cardBody.appendChild($forecastTemp);
        $cardBody.appendChild($forecastHumid);
  
        $forecastCard.appendChild($cardBody);
        $fivedayDiv.appendChild($forecastCard);
      }
    }
    $forecastSection.classList.remove("hide");
  }
  
  landingDisplay();
  
  /* ----- EVENT LISTENERS ----- */
  $searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var searchTerm = $searchInput.value.trim();
    if (!searchTerm) {
      return false;
    }
    //console.log(searchTerm);
    //first: send it to search weather API
    searchHandler(searchTerm);
  
    $searchInput.value = "";
  
    //then: add term to history []
    addTerm(searchTerm);
  
    //finally: update history display - is done thru addTerm
  });
  
  $searchHistory.addEventListener("click", function(event){
    event.preventDefault();
    var itemClicked = event.target;
    if(itemClicked.matches("li")){
      var clickSearch = itemClicked.getAttribute("data-value");
      //run a search with the term clicked
      searchHandler(clickSearch);
      addTerm(clickSearch);
    }
  });