
import fs from "fs"
import { v4 } from 'uuid';
//Completed  HistoryService class
class HistoryService {
  // Read method that reads from the db.json file
  async read() {
    const data = fs.readFileSync('db/db.json', "utf-8")
    return JSON.parse(data)
  }
  // addCity method that adds a city to the db.json file
  // npm v4 creates a unique id for each city
  async addCity(city: string) {
    const currentCities = await this.read()
    const matchingCity = currentCities.find((item: any) => item.name.toLowerCase() === city.toLowerCase())
    if (matchingCity) return
    const newCity = {
      name: city,
      id: v4()
    }
    console.log(newCity)
    // method that writes the current cities array to the db.json file
    currentCities.push(newCity)
    fs.writeFileSync("db/db.json", JSON.stringify(currentCities))
  }
  //removeCity method that removes a city from the db.json file
  async removeCity(id: string) {
    const currentCities = await this.read();
    const index = currentCities.findIndex((item: any) => item.id === id);
    //remove the city with that id from the array
    currentCities.splice(index, 1);
    //writes the existing cities back in the db.json
    fs.writeFileSync("db/db.json", JSON.stringify(currentCities));
  }
}

export default new HistoryService();
