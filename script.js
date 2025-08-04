const locations = {
  VA: { name: "Falls Church", latitude: 38.8823, longitude: -77.1711 },
  AL: { name: "Huntsville", latitude: 34.7304, longitude: -86.5861 },
  CO: { name: "Niwot", latitude: 40.103, longitude: -105.1714 },
  CA: { name: "Northridge", latitude: 34.2381, longitude: -118.5301 },
  AZ: { name: "Tucson", latitude: 32.2226, longitude: -110.9747 },
  FL: { name: "Valparaiso", latitude: 30.5088, longitude: -86.5027 }
};

const forecastInfo = document.getElementById("forecastInfo");
const button = document.getElementById("retrieveForecast");

button.addEventListener("click", async () => {
  const selected = document.getElementById("officeSelect").value;

  if (!selected) {
    forecastInfo.innerHTML = `<p class="error">Please select a location before retrieving the forecast.</p>`;
    return;
  }

  const location = locations[selected];
  forecastInfo.innerHTML = `<p class="loading">Loading forecast for ${location.name}...</p>`;

  try {
    const pointRes = await fetch(`https://api.weather.gov/points/${location.latitude},${location.longitude}`);
    if (!pointRes.ok) throw new Error("Failed to fetch grid point data");

    const pointData = await pointRes.json();
    const { gridId, gridX, gridY } = pointData.properties;

    const forecastRes = await fetch(`https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/forecast`);
    if (!forecastRes.ok) throw new Error("Failed to fetch forecast");

    const forecastData = await forecastRes.json();
    const periods = forecastData.properties.periods;

    const dayForecasts = [];
    for (let i = 0; dayForecasts.length < 3 && i < periods.length; i++) {
      if (periods[i].isDaytime) {
        dayForecasts.push({
          name: periods[i].name,
          temperature: `${periods[i].temperature}°${periods[i].temperatureUnit}`,
          precip: periods[i].probabilityOfPrecipitation.value ?? 0,
          shortForecast: periods[i].shortForecast
        });
      }
    }

    forecastInfo.innerHTML = `
      <h2>3-Day Forecast for ${location.name}</h2>
      <div class="forecast-container">
        ${dayForecasts.map(day => `
          <div class="flip-card" onclick="toggleFlip(this)">
            <div class="flip-card-inner">
              <div class="flip-card-front">
                <h3>${day.name}</h3>
                <p>${day.shortForecast}</p>
                <p><strong>Temp:</strong> ${day.temperature}</p>
                <p><strong>Rain:</strong> ${day.precip}%</p>
              </div>
              <div class="flip-card-back">
                <h3>${day.name}</h3>
                <p>Forecast: ${day.shortForecast}</p>
                <p>${getAdvice(day.shortForecast)}</p>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  } catch (error) {
    forecastInfo.innerHTML = `<p class="error">Oops! ${error.message}</p>`;
    console.error(error);
  }
});

function toggleFlip(card) 
{
  card.querySelector(".flip-card-inner").classList.toggle("flipped");
}

const toggleBtn = document.getElementById("toggleDarkMode");
toggleBtn.addEventListener("click", () => {

  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  toggleBtn.textContent = isDark ? "🌞" : "🌙";
  toggleBtn.setAttribute("aria-label", isDark ? "Switch to Light Mode" : "Switch to Dark Mode");
});

function getAdvice(forecast) 
{
  const lower = forecast.toLowerCase();
  if (lower.includes("rain") || lower.includes("thunderstorm") || lower.includes("showers")) return "Don't forget your umbrella ☔️";
  if (lower.includes("sun") || lower.includes("clear")) return "Grab your sunglasses 😎";
  if (lower.includes("snow")) return "Bundle up — it might snow ❄️";
  if (lower.includes("cloud")) return "Cloudy skies ahead ☁️";
  if (lower.includes("wind")) return "Hold onto your hat 💨";
  return "Check the skies just in case 👀";
}

forecastInfo.innerHTML = `
  <div class="welcome-card">
    <h2>Forecast Preview</h2>
    <p>Get ready to explore the skies 🌤️</p>
    <img src="https://openweathermap.org/img/wn/02d@2x.png" alt="Placeholder Weather Icon" class="placeholder-icon" />
    <p class="placeholder-tip">Choose a city above and click "Get Forecast"</p>
  </div>
`;
