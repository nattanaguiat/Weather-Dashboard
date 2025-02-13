import dotenv from 'dotenv';
dotenv.config();

interface Coordinates {
  name: string;
  lat: number;
  lon: number;
}

class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  constructor(
    city: string,
    date: string,
    tempF: number,
    icon: string,
    iconDescription: string,
    windSpeed: number,
    humidity: number,
  ) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

class WeatherService {
  private baseURL?: string;
  private apiKey?: string;
  private city = '';

  constructor(city: string) {
    this.city = city;
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';

    // console.log('Constructor - API_BASE_URL:', this.baseURL);
    // console.log('Constructor - API_KEY:', this.apiKey);

    if (!this.baseURL || !this.apiKey) {
      //console.error('Missing environment variables:');
      //console.error('API_BASE_URL:', this.baseURL);
      //console.error('API_KEY:', this.apiKey);
    }
  }

  private async fetchLocationData(query: string) {
    try {
      if (!this.baseURL || !this.apiKey) {
        console.error('Environment variables not loaded:');
        console.error('baseURL:', this.baseURL);
        console.error('apiKey:', this.apiKey);
        throw new Error('Missing API_BASE_URL or API_KEY');
      }

      const response = await fetch(query);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error Fetching Location Data:', error);
      throw error;
    }
  }

  private destructureLocationData(locationData: any): Coordinates {
    if (!locationData || !locationData.lat || !locationData.lon) {
      console.error('Invalid locationData:', locationData);
      throw new Error('Location Data does not contain coordinates');
    }

    return {
      name: locationData.city,
      lat: locationData.lat,
      lon: locationData.lon,
    };
  }

  private buildGeocodeQuery(): string {
    // console.log(`Building Geocode Query with city: "${this.city}"`);
    return `${this.baseURL}geo/1.0/direct?q=${encodeURIComponent(this.city)}&limit=5&appid=${this.apiKey}`;
  }

  private buildWeatherQuery(_coordinates: Coordinates): string {
    return `${this.baseURL}data/2.5/forecast?lat=${_coordinates.lat}&lon=${_coordinates.lon}&exclude=minutely,hourly&units=imperial&appid=${this.apiKey}`;
  }

  private async fetchAndDestructureLocationData() {
    const query = this.buildGeocodeQuery();
    // console.log('Geocode Query:', query);
    const locationData = await this.fetchLocationData(query);
    // console.log('Location Data:', locationData);

    if (!Array.isArray(locationData) || locationData.length === 0) {
      console.error(`No location data found for city: ${this.city}`, locationData);
      throw new Error(`No location data found for city: ${this.city}`);
    }

    return this.destructureLocationData(locationData[0]);
  }

  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const weatherQuery = this.buildWeatherQuery(coordinates);
      console.log('Weather Query:', weatherQuery);
      const response = await fetch(weatherQuery);

      if (!response.ok) {
        throw new Error('Missing Weather Data');
      }

      const weatherData = await response.json();
      const currentWeather = this.parseCurrentWeather(weatherData);
      const forecastArray = this.buildForecastArray(currentWeather, weatherData.list);
      return { currentWeather, forecastArray };
    } catch (error) {
      console.error('Error Fetching Weather Data', error);
      throw error;
    }
  }

  private parseCurrentWeather(response: any) {
    if (!response.list || !Array.isArray(response.list)) {
      console.error('API response does not contain valid weather data:', response);
      throw new Error('API response does not contain valid weather data');
    }

    const currentWeather = response.list[0];

    // Add null checks for nested properties
    if (!currentWeather?.main?.temp ||
      !currentWeather?.weather?.[0]?.description ||
      !currentWeather?.main?.humidity ||
      !currentWeather?.weather?.[0]?.icon ||
      !currentWeather?.dt_txt) {
      throw new Error('Weather data is missing required properties');
    }
    const weather = new Weather(
      this.city,
      new Date(currentWeather.dt_txt).toLocaleDateString(),
      currentWeather.main.temp,
      currentWeather.weather[0].icon,
      currentWeather.weather[0].description,
      currentWeather.wind?.speed || 0,
      currentWeather.main.humidity
    );

    console.log('Parsed Weather:', weather); // Debug log
    return weather;
  }


  private buildForecastArray(_currentWeather: Weather, weatherData: any[]) {
    // Get one forecast per day (every 8th item)
    const dailyForecasts = weatherData.filter((_: any, index: number) => index % 8 === 0).slice(0, 5);

    return dailyForecasts.map((weather) => {
      return {
        date: new Date(weather.dt_txt).toLocaleDateString(),
        tempF: weather.main.temp,
        description: weather.weather[0].description,
        humidity: weather.main.humidity,
        icon: weather.weather[0].icon,
        wind: weather.wind?.speed || 0
      };
    });
  }

  async getWeatherForCity(city: string) {
    console.log(`getWeatherForCity called with city: "${city}"`);
    if (!city || typeof city !== 'string' || city.trim() === '') {
      console.error('Invalid or empty city name provided.');
      throw new Error('A valid city name must be provided.');
    }

    this.city = city.trim();
    const coordinates = await this.fetchAndDestructureLocationData();
    return await this.fetchWeatherData(coordinates);
  }
}

export default WeatherService;