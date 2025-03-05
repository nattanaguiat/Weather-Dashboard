import dotenv from 'dotenv';
dotenv.config();
//Creation of Weather class
class Weather {
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  city: string;

  constructor(
    date: string,
    icon: string,
    iconDescription: string,
    tempF: number,
    windSpeed: number,
    humidity: number,
    city: string,

  ) {
    this.date = date
    this.icon = icon
    this.iconDescription = iconDescription
    this.tempF = tempF
    this.windSpeed = windSpeed
    this.humidity = humidity
    this.city = city
  }
}
// Creation of WeatherService Class
class WeatherService {

  cityName: string

  constructor(
    cityName: string

  ) {
    this.cityName = cityName
  }

  //Uses getWeatherforCity to fetch the data for the correct city
  async getWeatherForCity(city: string) {
    const weatherUrl = `${process.env.API_BASE_URL}/data/2.5/forecast?q=${city}&units=imperial&appid=${process.env.API_KEY}`
    //fetches the data here
    const response = await fetch(weatherUrl)
    //once fetch is complete thanks to await, the response is populated
    const data = await response.json()


    //filter method is used with specific indexs to create a 5-day forecast
    const filteredData = data.list.filter((_item: any, index: any) => index === 0 || index === 7 || index === 15 || index === 23 || index === 31 || index === 39)
    console.log('filtered data', filteredData)


    //Converts the date from the API into user friendly style 
    const restructeredData = filteredData.map((item: any) => {
      //dt is used by the API to provide date information in Unix timestamp format
      //first convert to milliseconds
      const date = new Date(parseInt(item.dt) * 1000)
      //formatting 
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return new Weather(formattedDate, item.weather[0].icon, item.weather[0].description, item.main.temp, item.wind.speed, item.main.humidity, data.city.name)
    })
    //return restructeredData so the fomattedDate and the weather forcast will both be present
    return restructeredData
  }
}

export default WeatherService;