const Observable = require('../utils/Observable');
const chalk = require("chalk");

class SolarPanel extends Observable{

    constructor (house, name) {
        super()
        this.house = house;         // reference to the house
        this.name = name;           // non-observable
        this.set('status', 'off')   // observable
        this.degree = -1             // -1 degrees is a placeholder value for the resting position
    }
    turn(degrees){
        this.degree = degrees
        console.log(chalk["whiteBright"](`${this.name} rotated to ${this.degree}° degrees`))
    }

    switchon(){
        this.status = "on"
        this.house.utilities.electricity.consumption -= 1
        console.log(chalk["whiteBright"](`${this.name} has been switched on`))
    }

    switchoff(){
        this.status = "off"
        this.house.utilities.electricity.consumption += 1
        console.log(chalk["whiteBright"](`${this.name} has been switched off and set to resting position`))
    }



}

module.exports = SolarPanel