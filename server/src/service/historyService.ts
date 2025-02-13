import fs from 'node:fs/promises';

class City {
  name: string;
  id: string;
  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}

// TO DO: Complete the HistoryService class
class HistoryService {
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile('db/db.json', 'utf-8');
      const cities: City[] = JSON.parse(data);
      return cities;
    } catch (error) {
      console.error('Error reading search history:', error);
      throw error; 
    }
  }

  private async write(cities: City[]): Promise<void> {
    try {
      await fs.writeFile('db/db.json', JSON.stringify(cities, null, 2));
    } catch (error) {
      console.error('Error writing search history:', error);
      throw error; // Rethrow the error for handling in the calling function
    }
  }

  async getCities(): Promise<City[]> {
    const cities = await this.read();
    return cities;
  }

  async addCity(city: string): Promise<void> {
    const cities = await this.read();
    const newCity = new City(city, (cities.length + 1).toString());
    cities.push(newCity);
    await this.write(cities);
  }

  async removeCity(id: string): Promise<void> {
    const cities = await this.read();
    const updatedCities = cities.filter((city: City) => city.id !== id);
    await this.write(updatedCities);
  }
}

export default new HistoryService();
