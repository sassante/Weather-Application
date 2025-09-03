const API_KEY = "c3cd4cee8880b1b9c35ab2e8a1a9a032" // Replace with your actual OpenWeatherMap API key
let currentUnit = "metric" // 'metric' for Celsius, 'imperial' for Fahrenheit
let currentCity = null // Set to null initially instead of a default city

// Weather icon mapping with emojis
const weatherIcons = {
  "01d": "☀️", // clear sky day
  "01n": "🌙", // clear sky night
  "02d": "⛅", // few clouds day
  "02n": "☁️", // few clouds night
  "03d": "☁️", // scattered clouds
  "03n": "☁️", // scattered clouds
  "04d": "☁️", // broken clouds
  "04n": "☁️", // broken clouds
  "09d": "🌧️", // shower rain
  "09n": "🌧️", // shower rain
  "10d": "🌦️", // rain day
  "10n": "🌧️", // rain night
  "11d": "⛈️", // thunderstorm
  "11n": "⛈️", // thunderstorm
  "13d": "❄️", // snow
  "13n": "❄️", // snow
  "50d": "🌫️", // mist
  "50n": "🌫️", // mist
}

// Background class mapping
const backgroundClasses = {
  clear: "sunny",
  clouds: "cloudy",
  rain: "rainy",
  drizzle: "rainy",
  thunderstorm: "thunderstorm",
  snow: "snowy",
  mist: "mist",
  smoke: "mist",
  haze: "mist",
  dust: "mist",
  fog: "mist",
  sand: "mist",
  ash: "mist",
  squall: "thunderstorm",
  tornado: "thunderstorm",
}

async function fetchWeatherData(city) {
  try {
    const trimmedApiKey = API_KEY.trim()
    if (!trimmedApiKey || trimmedApiKey === "YOUR_API_KEY_HERE" || trimmedApiKey.length < 10) {
      console.log("[v0] API Key check failed:", {
        apiKey: API_KEY,
        trimmed: trimmedApiKey,
        length: trimmedApiKey.length,
      })
      throw new Error(
        "Please add your OpenWeatherMap API key to make the app work. Make sure to replace 'YOUR_API_KEY_HERE' with your actual API key.",
      )
    }

    console.log("[v0] Making API request with key length:", trimmedApiKey.length)

    // Fetch current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${trimmedApiKey}&units=${currentUnit}`,
    )

    if (!currentResponse.ok) {
      console.log("[v0] API response error:", currentResponse.status, currentResponse.statusText)
      if (currentResponse.status === 404) {
        throw new Error("City not found. Please check the spelling and try again.")
      } else if (currentResponse.status === 401) {
        throw new Error("Invalid API key. Please check your OpenWeatherMap API key.")
      } else {
        throw new Error("Failed to fetch weather data. Please try again.")
      }
    }

    const currentData = await currentResponse.json()
    console.log("[v0] Current weather data received:", currentData.name)

    // Fetch 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${trimmedApiKey}&units=${currentUnit}`,
    )

    if (!forecastResponse.ok) {
      throw new Error("Failed to fetch forecast data")
    }

    const forecastData = await forecastResponse.json()

    // Process forecast data to get one entry per day (every 8th entry = 24 hours)
    const dailyForecast = []
    for (let i = 0; i < forecastData.list.length; i += 8) {
      if (dailyForecast.length < 5) {
        dailyForecast.push(forecastData.list[i])
      }
    }

    return {
      current: currentData,
      forecast: dailyForecast,
    }
  } catch (error) {
    console.log("[v0] Error in fetchWeatherData:", error.message)
    throw error
  }
}

async function fetchWeatherByCoords(lat, lon) {
  try {
    const trimmedApiKey = API_KEY.trim()
    if (!trimmedApiKey || trimmedApiKey === "YOUR_API_KEY_HERE" || trimmedApiKey.length < 10) {
      throw new Error(
        "Please add your OpenWeatherMap API key to make the app work. Make sure to replace 'YOUR_API_KEY_HERE' with your actual API key.",
      )
    }

    // Fetch current weather by coordinates
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${trimmedApiKey}&units=${currentUnit}`,
    )

    if (!currentResponse.ok) {
      throw new Error("Failed to fetch weather data for your location")
    }

    const currentData = await currentResponse.json()

    // Fetch 5-day forecast by coordinates
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${trimmedApiKey}&units=${currentUnit}`,
    )

    if (!forecastResponse.ok) {
      throw new Error("Failed to fetch forecast data")
    }

    const forecastData = await forecastResponse.json()

    // Process forecast data
    const dailyForecast = []
    for (let i = 0; i < forecastData.list.length; i += 8) {
      if (dailyForecast.length < 5) {
        dailyForecast.push(forecastData.list[i])
      }
    }

    return {
      current: currentData,
      forecast: dailyForecast,
    }
  } catch (error) {
    throw error
  }
}

function updateBackground(weatherMain) {
  const body = document.body
  // Remove all weather classes
  Object.values(backgroundClasses).forEach((cls) => body.classList.remove(cls))

  // Add appropriate weather class
  const weatherClass = backgroundClasses[weatherMain.toLowerCase()] || "sunny"
  body.classList.add(weatherClass)
}

function displayWeatherData(data) {
  const { current, forecast } = data

  // Update background
  updateBackground(current.weather[0].main)

  const weatherEmoji = weatherIcons[current.weather[0].icon] || "☀️"

  const content = `
        <div class="main-content">
            <div class="current-weather">
                <div class="weather-icon">${weatherEmoji}</div>
                <div class="temperature">${Math.round(current.main.temp)}°${currentUnit === "metric" ? "C" : "F"}</div>
                <div class="description">${current.weather[0].description}</div>
                <div class="location">
                    <i class="fas fa-location-dot"></i> ${current.name}, ${current.sys.country}
                </div>
                <div class="feels-like">
                    Feels like ${Math.round(current.main.feels_like)}°${currentUnit === "metric" ? "C" : "F"}
                </div>
            </div>

            <div class="weather-details">
                <h3><i class="fas fa-info-circle"></i> Weather Details</h3>
                <div class="detail-item">
                    <span><i class="fas fa-droplet"></i> Humidity</span>
                    <span>${current.main.humidity}%</span>
                </div>
                <div class="detail-item">
                    <span><i class="fas fa-gauge"></i> Pressure</span>
                    <span>${current.main.pressure} hPa</span>
                </div>
                <div class="detail-item">
                    <span><i class="fas fa-wind"></i> Wind Speed</span>
                    <span>${current.wind.speed} ${currentUnit === "metric" ? "m/s" : "mph"}</span>
                </div>
                <div class="detail-item">
                    <span><i class="fas fa-eye"></i> Visibility</span>
                    <span>${(current.visibility / 1000).toFixed(1)} km</span>
                </div>
                <div class="detail-item">
                    <span><i class="fas fa-sunrise"></i> Sunrise</span>
                    <span>${new Date(current.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div class="detail-item">
                    <span><i class="fas fa-sunset"></i> Sunset</span>
                    <span>${new Date(current.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
            </div>
        </div>

        <div class="forecast-container">
            <h3><i class="fas fa-calendar-days"></i> 5-Day Forecast</h3>
            <div class="forecast-grid">
                ${forecast
                  .map(
                    (item) => `
                    <div class="forecast-item">
                        <div class="forecast-day">${new Date(item.dt * 1000).toLocaleDateString([], { weekday: "short" })}</div>
                        <div class="forecast-icon">${weatherIcons[item.weather[0].icon] || "☀️"}</div>
                        <div class="forecast-temps">
                            <span>${Math.round(item.main.temp_max)}°</span>
                            <span style="opacity: 0.7">${Math.round(item.main.temp_min)}°</span>
                        </div>
                        <div style="font-size: 0.8rem; margin-top: 5px; text-transform: capitalize;">
                            ${item.weather[0].description}
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </div>
    `

  document.getElementById("weatherContent").innerHTML = content
}

function displayError(message) {
  document.getElementById("weatherContent").innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `
}

function showLoading() {
  document.getElementById("weatherContent").innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    `
}

function showInitialMessage() {
  document.getElementById("weatherContent").innerHTML = `
        <div class="loading">
            <i class="fas fa-cloud-sun" style="font-size: 4rem; margin-bottom: 20px;"></i>
            <h3>Welcome to Weather App</h3>
            <p>Search for a city or use your current location to get started!</p>
        </div>
    `
}

async function searchWeather() {
  const cityInput = document.getElementById("cityInput")
  const city = cityInput.value.trim()

  if (!city) {
    alert("Please enter a city name")
    return
  }

  currentCity = city
  await loadWeatherData(city)
}

async function loadWeatherData(city) {
  showLoading()

  try {
    const data = await fetchWeatherData(city)
    displayWeatherData(data)
  } catch (error) {
    displayError(error.message)
  }
}

async function getCurrentLocation() {
  if (navigator.geolocation) {
    showLoading()
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const data = await fetchWeatherByCoords(latitude, longitude)
          currentCity = data.current.name
          displayWeatherData(data)
        } catch (error) {
          displayError(error.message)
        }
      },
      (error) => {
        let errorMessage = "Unable to get your location. "
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Location access denied by user."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information unavailable."
            break
          case error.TIMEOUT:
            errorMessage += "Location request timed out."
            break
          default:
            errorMessage += "An unknown error occurred."
            break
        }
        displayError(errorMessage + " Please search for a city manually.")
      },
    )
  } else {
    displayError("Geolocation is not supported by this browser. Please search for a city manually.")
  }
}

async function toggleUnits() {
  currentUnit = currentUnit === "metric" ? "imperial" : "metric"
  document.getElementById("unitToggle").textContent = currentUnit === "metric" ? "°F" : "°C"

  // Only reload if we have a current city
  if (currentCity) {
    await loadWeatherData(currentCity)
  }
}

// Event listeners
document.getElementById("cityInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchWeather()
  }
})

window.addEventListener("load", () => {
  showInitialMessage()
})
