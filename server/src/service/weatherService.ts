import dotenv from 'dotenv';
dotenv.config();

//Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}
// Removed the unused Weather class

// Complete the WeatherService class
class WeatherService {
  private baseURL: string = process.env.BASE_URL || 'https://api.openweathermap.org/data/2.5';
  private apiKey: string = process.env.API_KEY || '';

  private async fetchLocationData(query: string) {
    const response = await fetch(`${this.baseURL}/weather?q=${query}&appid=${this.apiKey}`);
    if (!response.ok) {
      throw new Error('Error fetching location data');
    }
    return await response.json();
  }

  private destructureLocationData(locationData: any) {
    return {
      lat: locationData.coord.lat,
      lon: locationData.coord.lon,
    };
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
  }

  private async fetchWeatherData(coordinates: Coordinates) {
    const query = this.buildWeatherQuery(coordinates);
    const response = await fetch(query);
    if (!response.ok) {
      throw new Error('Error fetching weather data');
    }
    return await response.json();
  }

  private parseCurrentWeather(response: any) {
    return {
      temperature: response.current.temp,
      description: response.current.weather[0].description,
      icon: response.current.weather[0].icon,
    };
  }

  private buildForecastArray(weatherData: any[]) {
    return weatherData.map((day) => ({
      date: day.dt,
      temp: day.temp.day,
      weather: day.weather[0].description,
      icon: day.weather[0].icon,
    }));
  }

  public async getWeatherForCity(city: string) {
    const locationData = await this.fetchLocationData(city);
    const coordinates = this.destructureLocationData(locationData);
    const weatherData = await this.fetchWeatherData(coordinates);
    return {
      current: this.parseCurrentWeather(weatherData),
      forecast: this.buildForecastArray(weatherData.daily),
    };
  }
}

export default new WeatherService();