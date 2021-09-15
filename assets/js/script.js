// declared variables
var cityInput = document.querySelector('#city-input');
var searchBtn = document.querySelector('#search-btn');
var cityNameEl = document.querySelector('#city-name');
var cityArray = [];
var apiKey = '5f3d8e61f6ecd062e3ea0bfd4154ce1e';


var formHandler = function(event) {
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
    var weatherApi = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

    fetch(weatherApi).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                var lon = data.coord['lon'];
                var lat = data.coord['lat'];
                getForecast(city, lon, lat);

                // save the city to search list
                if (document.querySelector('.city-list')) {
                    document.querySelector('.city-list').remove();
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
    var currentIcon = forecast.current.weather[0].icon;
    weatherIconEl.setAttribute('src', `https://openweathermap.org/img/wn/${currentIcon}.png`);
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

// five day forecast function
var fiveDayForecast = function(forecast) {
    for (var i = 1; i < 6; i++) {
        var pDate = document.querySelector('#date-' + i);
        pDate.textContent = moment().add(i, 'days').format('MMM Do YYYY');

        // set 5 day forecast icons
        var iconImg = document.querySelector('#icon-' + i);
        var futureIcon = forecast.daily[i].weather[0].icon;
        iconImg.setAttribute('src', `https://openweathermap.org/img/wn/${futureIcon}.png`);
        iconImg.setAttribute('alt', forecast.daily[i].weather[0].main);

        // temperatures
        displayTemp('#temp-' + i, forecast.daily[i].temp.day);
        displayTemp('#high-' + i, forecast.daily[i].temp.max);
        displayTemp('#low-' + i, forecast.daily[i].temp.min);

        // humidity
        var pHumidity = document.querySelector('#humidity-' + i);
        pHumidity.textContent = forecast.daily[i].humidity;

        // wind speed
        var pWind = document.querySelector('#wind-' + i);
        pWind.textContent = forecast.daily[i].wind_speed;

    };
};

// save city searches to local storage
var saveSearch = function(city) {

    // prevents duplicate city from being saved and moves it to end of array
    for (var i = 0; i < cityArray.length; i++) {
        if (city === cityArray[i]) {
            cityArray.splice(i, 1);
        }
    }

    cityArray.push(city);
    localStorage.setItem('cities', JSON.stringify(cityArray));
};

// loads cities from local storage
var loadSearches = function() {
    cityArray = JSON.parse(localStorage.getItem('cities'));

    if (!cityArray) {
        cityArray = [];
        return false;
    } else if (cityArray.length > 5) {
        // saves only the five most recent cities
        cityArray.shift();
    }

    var recentCities = document.querySelector('#recent-searches');
    var cityListUl = document.createElement('ul');
    cityListUl.className = 'list-group list-group-flush city-list';
    recentCities.appendChild(cityListUl);

    for (var i = 0; i < cityArray.length; i++) {
        var cityListItem = document.createElement('button');
        cityListItem.setAttribute('type', 'button');
        cityListItem.className = 'list-group-item bg-transparent text-white font-weight-bold';
        cityListItem.setAttribute('value', cityArray[i]);
        cityListItem.textContent = cityArray[i];
        cityListUl.prepend(cityListItem);
    }

    var cityList = document.querySelector('.city-list');
    cityList.addEventListener('click', selectRecent)
}

// adds functionality to saved cities so if you click on them it searches them again
var selectRecent = function(e) {
    var clickedCityEl = e.target.getAttribute('value');

    getLocation(clickedCityEl);
};

loadSearches();
searchBtn.addEventListener('click', formHandler);
