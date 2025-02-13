import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

router.post('/', async (req: Request, res: Response) => {
  try {

    const { cityName } = req.body;
    console.log('Received request for city:', cityName);

    const weather = new WeatherService(cityName);
    const weatherData = await weather.getWeatherForCity(cityName);

    console.log('Sending weather data:', weatherData);

    res.json({
      currentWeather: weatherData.currentWeather,
      forecast: weatherData.forecastArray
    });

    await HistoryService.addCity(cityName);

  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
});

router.get('/history', async (_req: Request, res: Response) => {
  const history = await HistoryService.getCities();
  res.json(history);
});

router.delete('/history/:id', async (req, res) => {
  await HistoryService.removeCity(req.params.id);
  res.status(200).send('City removed');
});

export default router;
