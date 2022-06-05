const Observable = require('../utils/Observable');

class Smartfridge extends Observable {

    constructor(house, name) {
        super()
        this.house = house;         // reference to the house
        this.name = name;           // non-observable

        this.set('requests', [])   // observable
        this.set('ingredients', [])   // observable
    }

    postrequests(requests){
        this.requests = requests
    }

    postingredients(plantable,others){
        this.ingredients={
            "plantable_ingredients": plantable,
            "other_ingredients": others
        }
        console.log(`ingredients have been uploaded on ${this.name}`)
    }
    display(){

    }
}


module.exports = Smartfridge