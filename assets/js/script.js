// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '6b7e84ac645512e9524f0cd62a24521e';

    const searchForm = document.getElementById('searchForm');
    const cityInput = document.getElementById('cityInput');
    const searchHistory = document.getElementById('searchHistory');
    const currentWeather = document.getElementById('currentWeather');
    const futureWeather = document.getElementById('futureWeather');

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const cityName = cityInput.value.trim();
        if (cityName !== '') {
            searchWeather(cityName);
        } else {
            console.log('Please enter a city name.');
        }
    });

    function searchWeather(cityName) {
        fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Geo API request failed with status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const { lat, lon } = data[0];
                return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`);
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Weather API request failed with status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                displayWeather(data);
                addToSearchHistory(cityName);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error.message);
            });
    }

    function celsiusToFahrenheit(celsius) {
        return (celsius * 9/5) + 32;
    }

    function displayWeather(weatherData) {
        const currentConditions = weatherData.list[0];
        const currentTempFahrenheit = celsiusToFahrenheit(currentConditions.main.temp);

        currentWeather.innerHTML = `<h2>${weatherData.city.name}</h2>
                                     <p>Date: ${currentConditions.dt_txt}</p>
                                     <p>Temperature: ${currentTempFahrenheit.toFixed(2)} °F</p>
                                     <p>Humidity: ${currentConditions.main.humidity}%</p>
                                   
