// declared variables
var time = moment();
var cityInput = document.querySelector('#city-input');
var searchBtn = document.querySelector('#search-btn');
var cityNameEl = document.querySelector('#city-name');
var cityArray = [];
var apiKey = '5f3d8e61f6ecd062e3ea0bfd4154ce1e';


var formHandler = function(e) {
    var selectedCity = cityInput
        .value
        .trim()
        .toLowerCase()
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
    
    if(selectedCity) {
        getLocation(selectedCity);
        cityInput.value = '';
    } else {
        alert('Please enter a valid city')
    };
};

var getLocation = function(city) {
    var weatherApi = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

    fetch(weatherApi).then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                var lon = data.coord['lon'];
                var lat = data.coord['lat'];
                getForecast(city, lon, lat);

                // save the city to search list
                if (document.querySelector('.search-list')) {
                    document.querySelector('.search-list').remove();
                };

                saveSearch(city);
                loadSearches();
            });
        } else {
            alert(`Error: ${response.statusText}`)
        }
    }).catch(function(error){
        alert('Oops! Something went wrong.');
        console.log('Error');
    });
};

var getForecast = function(city, lon, lat) {
    var oneCallApi = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly,alerts&appid=${apiKey}`;
    fetch(oneCallApi).then(function(response){
        if(response.ok) {
            response.json().then(function(data) {
                // pulls city name and date from data
                cityNameEl.textContent = `${city} (${moment().format("dddd, MMMM Do YYYY h:mm a")})`;

                console.log(data);

                currentForecast(data);
                fiveDayForecast(data);
            });
        };
    });
};

// rounds the temperature to the nearest whole number
var displayTemp = function(element, temperature) {
    var tempEl = document.querySelector(element);
    var elementText = Math.round(temperature);
    tempEl.textContent = elementText;
}

//current forecast function
var currentForecast = function(forecast) {
    var forecastEl = document.querySelector('.city-forecast');
    forecastEl.classList.remove('hide');

    // sets weather icon based on forecast
    var weatherIconEl = document.querySelector('#today-icon');
    var currentICon = forecast.current.weather[0].icon;
    weatherIconEl.setAttribute('src', `http://openweathermap.org/img/wn/${currentIcon}.png`);
    weatherIconEl.setAttribute('alt', forecast.current.weather[0].main);

    // display temperatures
    displayTemp('#current-temp', forecast.current['temp']);
    displayTemp('#feels-like', forecast.current['feels_like']);
    displayTemp('#current-high', forecast.daily[0].temp.max);
    displayTemp('#current-low', forecast.daily[0].temp.min);

    // display current condition
    var currentConditionEl = document.querySelector('#current-condition');
    currentConditionEl.textContent = forecast.current.weather[0].description
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');

    // display current humidity
    var currentHumidityEl = document.querySelector('#current-humidity');
    currentHumidityEl.textContent = forecast.current['humidity'];

    // display current wind speed
    var currentWindEl = document.querySelector('#current-wind');
    currentWindEl.textContent = forecast.current['wind_speed'];

    // display current UV index
    var uvEl = document.querySelector('#current-uv');
    var currentUv = forecast.current['uvi'];
    uvEl.textContent = currentUv;

    // styles the UV index based on the number
    switch (true) {
        case (currentUv <= 2):
            uvEl.className = 'badge badge-success';
            break;
        case (currentUv <= 5):
            uvEl.className = 'badge badge-warning';
            break;
        case (currentUv <= 7):
            uvEl.className = 'badge badge-danger';
            break;
        default:
            uvEl.className = 'badge badge-info';
    };

}

// TODO: five day forecast function

// TODO: save city searches to local storage

// TODO: load cities from local storage to search list

// TODO: add event listener to saved cities so if you click on them it searches them again