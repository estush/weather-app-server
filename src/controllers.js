
import axios from 'axios';

// Function to get weather data for a specified city
export const getWeather = async (req, res) => {
  const city = req.query.city;
  
  // Check if city parameter is provided
  if (!city) {
    return res.status(400).json({ message: 'City query parameter is required' });
  }

  try {
    const apiKey = process.env.API_KEY;
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&hours=24`; 

    const response = await axios.get(url);

    // Check if API responded with a 404 status or another error
    if (response.status === 200) {
      const weatherData = response.data.forecast.forecastday[0].hour;
      const locationData = response.data.location;

      // Function to format full date and time
      const formatFullDateTime = (dateTime) => {
        const date = new Date(dateTime);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} at ${hours}:${minutes}`;
      };

      // Function to format only hour
      const formatHour = (dateTime) => {
        const date = new Date(dateTime);
        return date.getHours().toString().padStart(2, '0') + ':00'; // Only hours in HH:00 format
      };

      // Get current time
      const now = new Date();
      const currentHour = now.getHours();

      // Define the range of hours needed
      const startHour = new Date(now.getTime() - 3 * 60 * 60 * 1000); // Three hours ago
      const endHour = new Date(now.getTime() + 60 * 60 * 1000); // One hour ahead

      // Extract temperature data for specific hours
      const getTemperatures = () => {
        const temperatures = [];
        for (let i = 0; i < weatherData.length; i++) {
          const hourData = weatherData[i];
          const hourTime = new Date(hourData.time);
          
          // If the hour is within the required range
          if (hourTime >= startHour && hourTime <= endHour) {
            temperatures.push({
              time: formatHour(hourData.time),
              temperature: Math.round(hourData.temp_c) // Round temperature
            });
          }
        }
        return temperatures;
      };

      return res.status(200).send({
        temperature: Math.round(weatherData[0].temp_c), // Round the first temperature in the response
        condition: weatherData[0].condition.text, // Weather condition (e.g., "Cloudy")
        humidity: weatherData[0].humidity, // Humidity (from the first hour)
        wind: weatherData[0].wind_kph, // Wind speed in kilometers per hour (from the first hour)
        city: locationData.name, // City name
        country: locationData.country, // Country name
        precipitation: weatherData[0].precip_mm || 0, // Precipitation amount (from the first hour)
        dateTime: formatFullDateTime(locationData.localtime), // Full date and time
        temperatures: getTemperatures() // Array of temperatures for the specified hours
      });
    } else {
      // If response status is not 200, treat it as not found
      return res.status(404).json({ message: 'City not found. Please try again.' });
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);

    // Check for specific error response from API if available
    if (error.response) {
      // Handle known error status codes from the API
      const status = error.response.status;
      if (status === 400) {
        return res.status(400).json({ message: 'Bad request. Please check the query parameters.' });
      } else if (status === 403) {
        return res.status(403).json({ message: 'Forbidden. Check your API key and permissions.' });
      } else if (status === 404) {
        return res.status(404).json({ message: 'City not found. Please try again.' });
      }
    }

    // General error handler
    return res.status(500).json({ message: 'Failed to fetch weather data' });
  }
};
