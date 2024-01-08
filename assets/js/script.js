// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    // OpenWeatherMap API key for making requests
    const apiKey = '6b7e84ac645512e9524f0cd62a24521e';

    // Get references to HTML elements using their IDs
    const searchForm = document.getElementById('searchForm'); // Form element
    const cityInput = document.getElementById('cityInput'); // Input field
    const searchHistory = document.getElementById('searchHistory'); // Search history element
    const currentWeather = document.getElementById('currentWeather');   // Current weather element
    const futureWeather = document.getElementById('futureWeather'); // Future weather element

    // Event listener for form submission
    searchForm.addEventListener('submit', (event) => {  
        event.preventDefault(); 
        // Get the trimmed value of the input field
        const cityName = cityInput.value.trim(); 
        // Check if the city name is not empty
        if (cityName !== '') {
            // Call the searchWeather function with the city name
            searchWeather(cityName);
        }
    });

    // Function to search weather by city name
    function searchWeather(cityName) {
        // Use OpenWeatherMap Geo API to get latitude and longitude
        fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const { lat, lon } = data[0];
                // Use latitude and longitude to get current and future weather
                return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`);
            })
            .then(response => response.json())
            .then(data => {
                // Call the displayWeather function with the fetched data
                displayWeather(data);
                // Add the city to the search history
                addToSearchHistory(cityName);
                addToSearchHistory(data.city.name)
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
            });
    }

// Function to display weather information
// Function to convert Celsius to Fahrenheit
function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

// Function to display weather information
function displayWeather(weatherData) {
    // Display current weather
    const currentConditions = weatherData.list[0];
    // Convert the current temperature from Celsius to Fahrenheit
    const currentTempFahrenheit = celsiusToFahrenheit(currentConditions.main.temp);
    
    // Extract the icon code from the current weather conditions
    const weatherIconCode = currentConditions.weather[0].icon;

    // Construct the URL for the weather icon
    const weatherIconUrl = `http://openweathermap.org/img/wn/${weatherIconCode}.png`;

    // Update the HTML content of the currentWeather element with weather information and icon
    currentWeather.innerHTML = `<h2>${weatherData.city.name}</h2>
                                 <p>Date: ${currentConditions.dt_txt}</p>
                                    <img src="${weatherIconUrl}" alt="Weather Icon">
                                 <p>Temperature: ${currentTempFahrenheit.toFixed(2)} °F</p>
                                 <p>Humidity: ${currentConditions.main.humidity}%</p>
                                 <p>Wind Speed: ${currentConditions.wind.speed} m/s</p>`;

    // Display future weather (5-day forecast)
    futureWeather.innerHTML = '<h3>5-Day Forecast</h3>';

    // Keep track of distinct days to avoid duplicates
    const displayedDays = new Set();

    // Iterate over all forecast entries
    for (let i = 1; i < weatherData.list.length; i++) {
        const forecast = weatherData.list[i];
        const forecastDate = new Date(forecast.dt_txt).toLocaleDateString();
        // Convert the forecast temperature from Celsius to Fahrenheit
        const forecastTempFahrenheit = celsiusToFahrenheit(forecast.main.temp);

        // Extract the icon code from the forecast weather conditions
        const forecastIconCode = forecast.weather[0].icon;

        // Construct the URL for the forecast weather icon
        const forecastIconUrl = `http://openweathermap.org/img/wn/${forecastIconCode}.png`;

        // Check if the forecast date has not been displayed yet
        if (!displayedDays.has(forecastDate)) {
            // Update the HTML content with weather information for the distinct day and icon
            futureWeather.innerHTML += `<div>
                                           <p>Date: ${forecast.dt_txt}</p>
                                           <img src="${forecastIconUrl}" alt="Weather Icon">
                                        <p>Temperature: ${forecastTempFahrenheit.toFixed(2)} °F</p>
                                           <p>Humidity: ${forecast.main.humidity}%</p>
                                           <p>Wind Speed: ${forecast.wind.speed} m/s</p>
                                       </div>`;
            // Add the forecast date to the set of displayed days
            displayedDays.add(forecastDate);
        }
    }
}
    // Function to add city to search history
    function addToSearchHistory(cityName) {
        // Check if the city already exists in the search history
        const existingCity = Array.from(searchHistory.children).find(item => item.textContent === cityName);

        if (!existingCity) {
            // City does not exist, add it to the search history
            const historyItem = document.createElement('div');
            historyItem.textContent = cityName;
            historyItem.addEventListener('click', () => {
                // When history item is clicked, search for weather for that city
                searchWeather(cityName);
            });
            searchHistory.appendChild(historyItem);
        }
    }
});