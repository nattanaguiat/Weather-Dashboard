import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

//POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  console.log(req.body)

  const weatherService = new WeatherService(req.body.cityName)

  weatherService.getWeatherForCity(req.body.cityName)
    .then(data => {
      HistoryService.addCity(req.body.cityName)
      return res.json(data)
    })

})

// GET search history
router.get('/history', async (_req, res) => {
  HistoryService.read()
    .then(data => {
      console.log(data)
      return res.json(data)
    })
});

// * BONUS: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  const {id}= req.params;
  await HistoryService.removeCity(id);
  const response = await HistoryService.read();
  return res.json(response);
})


export default router;
