const Observable = require('../utils/Observable');



class Person extends Observable {
    constructor (house, name) {
        super()
        this.house = house;             // reference to the house
        this.name = name;               // non-observable
        this.set('in_room', 'bedroom')  // observable
        // this.observe( 'in_room', v => console.log(this.name, 'moved to', v) )    // observe
    }
    moveTo (to) {
        if ( this.house.rooms[this.in_room].doors_to.includes(to) ) { // for object: to in this.house.rooms[this.in_room].doors_to

            console.log(this.name, '\t moved from', this.in_room, 'to', to)
            this.in_room = to
            return true
        }
        else {
            console.log(this.name, '\t failed moving from', this.in_room, 'to', to)
            return false
        }
    }
    postpreferences(fridge){
        let food = ["cabbage","broccoli","tomato", "cucumber", "beans", "onion","eggplant","bell_pepper","carrots", "ribs", "sausage", "hamburger", "steak","bacon","tartarre","pork_belly"]
        let preferences = [`included ${food[Math.floor(Math.random() * food.length)]}`,`scheduled monday ${food[Math.floor(Math.random() * food.length)]}`]
        console.log(`${this.name} has submitted food preferences to ${fridge.name}`)
        fridge.postrequests(preferences);

}
}



module.exports = Person