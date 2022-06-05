const Observable =  require('../utils/Observable')
const Person = require('./Person')
const Light = require('../devices/Light')
const  Greenhouse = require('../devices/Greenhouse')
const Smartfridge =  require('../devices/Fridge')
const ChefAgent = require("../implementedagents/ChefAgent")
const GardnerAgent = require("../implementedagents/GardenerAgent")
const SolarPanel = require('../devices/Solarpanel')




class House {
    constructor () {
        this.people = { karl: new Person(this, 'Karl'),
            rosa: new Person(this, 'Rosa') }
        this.rooms = {
            kitchen: { name: 'kitchen', doors_to: ['living'] },
            living: { name: 'living', doors_to: ['corridor',"kitchen"] },
            corridor: { name: 'corridor', doors_to: ['living', 'garage', "bedroom", "laundry", "outside"] },
            garage: { name: 'garage', doors_to: ['corridor', "outside"] },
            bedroom: { name: 'bedroom', doors_to: ['corridor']},
            laundry: { name: 'laundry', doors_to: ['corridor', "bathroom"]},
            bathroom: { name: 'bathroom', doors_to: ["laundry"]},
            outside: { name: 'outside', doors_to: ["corridor", "garage"]}
        }
        this.devices = {
            kitchen_light: new Light(this, 'kitchen'),
            garage_light: new Light(this, 'garage'),
            corridor_light: new Light(this, 'corridor'),
            bedroom_light: new Light(this, 'bedroom'),
            living_light: new Light(this, 'living'),
            laundry_light: new Light(this, 'laundry'),
            bathroom_light: new Light(this, 'bathroom'),
            greenhouse: new Greenhouse(this, "greenhouse"),
            smartfridge: new Smartfridge(this, "smartfridge"),
            solarpanel: new SolarPanel(this, "solar panel")
        }
        this.utilities = {
            electricity: new Observable( { consumption: 0 } )
        }
    }
}



// House, which includes rooms and devices
var myHouse = new House()

var gardner = new GardnerAgent(myHouse.devices.greenhouse,'GardnerAgent')
var chef = new ChefAgent(myHouse.devices.smartfridge,"chef")
new Promise(resolve => (setTimeout(resolve, 1))).then(()=>{
chef.PlanWeekAndIngredients()
gardner.PlantOrder(myHouse.devices.smartfridge)
myHouse.people.karl.postpreferences(myHouse.devices.smartfridge)})
