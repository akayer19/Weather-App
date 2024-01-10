// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    // Store the API key for OpenWeatherMap API
    const apiKey = '6b7e84ac645512e9524f0cd62a24521e'; // Replace with your actual API key

    // Get references to various elements on the page
    const searchForm = document.getElementById('searchForm'); // The form element for city search
    const cityInput = document.getElementById('cityInput'); // The input field for the city name
    const searchHistory = document.getElementById('searchHistory'); // The container for search history
    const currentWeather = document.getElementById('currentWeather'); // The container for displaying current weather
    const futureWeather = document.getElementById('futureWeather'); // The container for displaying the 5-day forecast

    // Attach an event listener to the search form to handle the submit event
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the form from submitting in the traditional way
        const cityName = cityInput.value.trim(); // Get and trim the city name from the input field
        if (cityName !== '') {
            searchWeather(cityName); // Initiate a weather search for the entered city name
        }
    });

    // Function to search weather by city name
    function searchWeather(cityName) {
        // Fetch the geographical coordinates for the given city name
        fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`)
            .then(response => response.json()) // Parse the response as JSON
            .then(data => {
                const { lat, lon } = data[0]; // Destructure latitude and longitude from the response
                // Fetch weather data using the obtained latitude and longitude
                return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`);
            })
            .then(response => response.json()) // Parse the second response as JSON
            .then(data => {
                displayWeather(data); // Display the weather data on the page
                addToSearchHistory(cityName); // Add the city to the search history
            })
            .catch(error => {
                console.error('Error fetching weather data:', error); // Log any errors to the console
            });
    }

    // Function to convert temperature from Celsius to Fahrenheit
    function celsiusToFahrenheit(celsius) {
        return (celsius * 9/5) + 32; // Conversion formula
    }

    // Function to display weather information on the page
    function displayWeather(weatherData) {
        const currentConditions = weatherData.list[0]; // Get the current weather conditions
        const currentTempFahrenheit = celsiusToFahrenheit(currentConditions.main.temp); // Convert the temperature to Fahrenheit
        const weatherIconCode = currentConditions.weather[0].icon; // Get the icon code for the current weather
        const weatherIconUrl = `http://openweathermap.org/img/wn/${weatherIconCode}.png`; // Construct the URL for the weather icon

        // Update the inner HTML of the currentWeather element to display the current weather
        currentWeather.innerHTML = `
            <div class="current-weather-header">
                <h2>${weatherData.city.name}</h2>
                <p>${new Date(currentConditions.dt * 1000).toLocaleDateString()}</p>
                <img src="${weatherIconUrl}" alt="Weather Icon">
            </div>
            <div class="current-weather-details">
                <p>Temperature: ${currentTempFahrenheit.toFixed(2)} °F</p>
                <p>Humidity: ${currentConditions.main.humidity}%</p>
                <p>Wind Speed: ${currentConditions.wind.speed} m/s</p>
            </div>
        `;

        // Prepare the container for the 5-day forecast
        futureWeather.innerHTML = '<h3>5-Day Forecast:</h3><div class="forecast-container"></div>';
        const forecastContainer = futureWeather.querySelector('.forecast-container');

        let dayCount = 0; // Counter to track the number of days processed
        const dateSet = new Set(); // Set to store unique dates

        for (let i = 0; i < weatherData.list.length && dayCount < 5; i++) {
            const forecast = weatherData.list[i];
            const forecastDate = new Date(forecast.dt_txt).toLocaleDateString(); // Format the date

            if (!dateSet.has(forecastDate)) { // Check if this date is already processed
                dateSet.add(forecastDate); // Add the date to the set
                dayCount++; // Increment the count of unique days

                const forecastTempFahrenheit = celsiusToFahrenheit(forecast.main.temp); // Convert the temperature
                const forecastIconCode = forecast.weather[0].icon; // Get the icon code
                const forecastIconUrl = `http://openweathermap.org/img/wn/${forecastIconCode}.png`; // Construct the icon URL

                // Create a div element for the forecast and set its content
                const dayBox = document.createElement('div');
                dayBox.className = 'dayBox';
                dayBox.innerHTML = `
                    <p>${forecastDate}</p>
                    <img src="${forecastIconUrl}" alt="Weather Icon">
                    <p>Temperature: ${forecastTempFahrenheit.toFixed(2)} °F</p>
                    <p>Humidity: ${forecast.main.humidity}%</p>
                    <p>Wind Speed: ${forecast.wind.speed} m/s</p>
                `;
                forecastContainer.appendChild(dayBox); // Append the forecast box to the container
            }
        }
    }

    // Function to add a city to the search history
    function addToSearchHistory(cityName) {
        // Check if the city is already in the search history to avoid duplication
        const existingCity = Array.from(searchHistory.children).find(item => item.textContent === cityName);
        if (!existingCity) { // If the city is not already in the history
            const historyItem = document.createElement('div'); // Create a new div for the history item
            historyItem.textContent = cityName; // Set the text content to the city name
            historyItem.addEventListener('click', () => { // Add a click event listener
                searchWeather(cityName); // Re-search the weather for this city when clicked
            });
            searchHistory.appendChild(historyItem); // Append the new history item to the search history container
        }
    }
});
