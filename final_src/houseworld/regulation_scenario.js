const Observable =  require('../utils/Observable')
const Person = require('./Person')
const Light = require('../devices/Light')
const Greenhouse = require('../devices/Greenhouse')
const Smartfridge =  require('../devices/Fridge')
const ChefAgent = require("../implementedagents/ChefAgent")
const GardnerAgent = require("../implementedagents/GardenerAgent")
const SolarPanel = require('../devices/Solarpanel')
const {
    SenseGreenhouseIntention,
    ReactiveRegulationIntention,
    SenseGreenhouseGoal,
    ReactiveRegulationGoal
} = require("../implementedagents/GreenhouseSensor");

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
gardner.intentions.push(SenseGreenhouseIntention, ReactiveRegulationIntention)
gardner.postSubGoal( new SenseGreenhouseGoal(myHouse.devices.greenhouse) )
gardner.postSubGoal( new ReactiveRegulationGoal(myHouse.devices.greenhouse) )
myHouse.devices.greenhouse.plant("carrots")
setTimeout(()=>{
    console.log("cycle 1")
    myHouse.devices.greenhouse.cycle()}, 2000)
setTimeout(()=>{
    console.log("cycle 2")
    myHouse.devices.greenhouse.cycle()}, 2000)
setTimeout(()=>{
    console.log("cycle 3")
    myHouse.devices.greenhouse.cycle()}, 2000)
setTimeout(()=>{
    console.log("cycle 4")
    myHouse.devices.greenhouse.cycle()}, 2000)