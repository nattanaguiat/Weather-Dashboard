import fs from 'fs/promises';
import path, { resolve } from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define searchHistoryPath for reading/writing JSON
const searchHistoryPath = resolve(__dirname, '../../db/searchHistory.json');

class HistoryService {
  // Method to read the search history
  async readHistory(): Promise<string[]> {
    try {
      console.log('Reading data from:', searchHistoryPath); // Logging file path for debugging
      const data = await fs.readFile(searchHistoryPath, 'utf-8');
      return JSON.parse(data || '[]'); // Parse data or return an empty array if the file is empty
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error reading history file:', error.message);
      } else {
        console.error('Unknown error reading history file:', error);
      }
      return []; // Return an empty array on error
    }
  }

  // Method to write to the search history
  async writeHistory(cities: string[]): Promise<void> {
    try {
      await fs.writeFile(searchHistoryPath, JSON.stringify(cities, null, 2));
      console.log('Saving data to searchHistory.json:', JSON.stringify(cities)); // Log saved data
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error writing to history file:', error.message);
      } else {
        console.error('Unknown error writing to history file:', error);
      }
    }
  }

  // Method to add a new city to the search history
  async addCity(city: string): Promise<void> {
    const cities = await this.readHistory();
    if (!cities.includes(city)) {
      cities.push(city);
      await this.writeHistory(cities);
      console.log(`City "${city}" added to search history.`);
    } else {
      console.log(`City "${city}" already exists in search history.`);
    }
  }

  // Method to retrieve the list of cities
  async getCities(): Promise<string[]> {
    try {
      console.log('Retrieving cities from search history...');
      return await this.readHistory();
    } catch (error) {
      console.error('Error retrieving cities:', error);
      return [];
    }
  }

  // Method to remove a city from the search history
  async removeCity(city: string): Promise<void> {
    const cities = await this.readHistory();
    const updatedCities = cities.filter((c: string) => c !== city);
    if (cities.length !== updatedCities.length) {
      await this.writeHistory(updatedCities);
      console.log(`City "${city}" removed from search history.`);
    } else {
      console.log(`City "${city}" was not found in search history.`);
    }
  }
}

export default HistoryService;
