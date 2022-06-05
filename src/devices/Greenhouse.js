const Observable = require('../utils/Observable');
const chalk = require("chalk");

const delay = (ms) => {
  const startPoint = new Date().getTime()
  while (new Date().getTime() - startPoint <= ms) {/* wait */}
}

class Greenhouse extends Observable {
    constructor (house, name) {
        super()
        this.house = house;         // reference to the house
        this.name = name;           // non-observable
        this.ph_counter = 0
        this.nutrient_counter = 0
        this.set('status', 'off')   // observable
        this.set('ph', 'low_ph')   // observable
        this.set('nutrients', 'low_nutrients')   // observable
        this.set('crop', 'empty')   // observable
    }
    plant (crop) {
        if(this.status == "off"){
            this.status = 'on'
            this.crop = crop
            this.house.utilities.electricity.consumption += 152;
            // Include some messages logged on the console!
            console.log(chalk["green"](crop, "has been planted in ", this.name))

        }
        else {
            console.log(this.name+" is already in use")
        }
    }
     harvest() {
        //await new Promise( res => setTimeout(res, 6300))
        this.status = 'off'
        this.house.utilities.electricity.consumption -= 152;

        // Include some messages logged on the console!
        console.log(chalk["green"](this.crop, "has been harvested\n"+ this.name, ' turned off'))
        if (Math.random()<0.25){
            this.crop = "dirty"
            console.log(chalk["green"]`${this.name} is dirty after harvest`)
        }
        else {
            this.crop = "empty"
        }

    }
    clean(){
        this.crop = "empty"
        console.log(chalk["green"]`${this.name} has been cleaned`)
    }
    adjustph(){
        if(this.ph == 'low_ph'){
            this.ph = 'opt_ph'
            this.ph_counter = 0
            console.log(chalk["green"]("optimal ph has been restored for " +this.name))
        }

    }

    adjustnutrients() {
        if (this.nutrients == 'low_nutrients') {
            this.nutrients = 'opt_nutrients'
            this.nutrient_counter = 0
            console.log(chalk["green"]("optimal nutrients have been restored for " + this.name))
        }
    }
    cycle(){
        if( this.status == "on"){
            this.nutrient_counter++
            this.ph_counter++
            this.growth_counter++
        }
        if (this.nutrient_counter > 1){
            this.nutrients = 'low_nutrients'
            console.log(chalk["green"]("nutrients level for " +this.name+" "+this.crop+" have dropped below optimal levels"))
        }
        if (this.ph_counter > 2){
            this.ph = 'low_ph'
            console.log(chalk["green"]("ph level for " +this.name+" "+this.crop+" have dropped below optimal levels"))
        }

    }
}



module.exports = Greenhouse
