const Observable =  require('../utils/Observable')
const Clock =  require('../utils/Clock')
const Agent = require('../bdi/Agent')
const Person = require('./Person')
const Light = require('../devices/Light')
const {AlarmGoal, AlarmIntention} = require('../devices/Alarm')
const  Greenhouse = require('../devices/Greenhouse')
const  {SenseGreenhouseGoal,SenseGreenhouseIntention, ReactiveRegulationGoal, ReactiveRegulationIntention} = require('../implementedagents/GreenhouseSensor')
const {LightsGoal, MovementSensingGoal, MovementSensingIntention, SwitchLightIntention} = require('../implementedagents/LightActuator')
const {DaylightSensorGoal, DaylightSensorIntention} = require("../implementedagents/DaylightSensor")
const Smartfridge =  require('../devices/Fridge')
const ChefAgent = require("../implementedagents/ChefAgent")
const GardnerAgent = require("../implementedagents/GardenerAgent")
const SolarPanel = require('../devices/Solarpanel')
const {SolarGoal, SolarIntention} = require("../implementedagents/SolarActuator")




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

// Agents
var houseAgent = new Agent('houseAgent')
houseAgent.intentions.push(AlarmIntention)



houseAgent.intentions.push(MovementSensingIntention, SwitchLightIntention, DaylightSensorIntention, SolarIntention)

houseAgent.postSubGoal(new DaylightSensorGoal(Clock.global))
houseAgent.postSubGoal(new MovementSensingGoal([myHouse.people.karl, myHouse.people.rosa]))
houseAgent.postSubGoal( new LightsGoal( [myHouse.devices.kitchen_light, myHouse.devices.garage_light,
    myHouse.devices.corridor_light, myHouse.devices.bedroom_light,myHouse.devices.living_light, myHouse.devices.laundry_light, myHouse.devices.bathroom_light ], [myHouse.people.karl, myHouse.people.rosa] ) )

houseAgent.postSubGoal(new SolarGoal(myHouse.devices.solarpanel))

var gardner = new GardnerAgent(myHouse.devices.greenhouse,'GardnerAgent')
gardner.intentions.push(SenseGreenhouseIntention, ReactiveRegulationIntention)
gardner.postSubGoal( new SenseGreenhouseGoal(myHouse.devices.greenhouse) )
gardner.postSubGoal( new ReactiveRegulationGoal(myHouse.devices.greenhouse) )


var chef = new ChefAgent(myHouse.devices.smartfridge,"chef")


// Simulated Daily/Weekly schedule

houseAgent.postSubGoal( new AlarmGoal({hh:6, mm:0}) )

Clock.global.observe('mm', (mm) => {
    var time = Clock.global
        if(time.hh==7 && time.mm==0 && time.dd == 0) {
        gardner.PlantOrder( myHouse.devices.smartfridge)
        chef.PlanWeekAndIngredients()
        myHouse.people.karl.postpreferences(myHouse.devices.smartfridge)
    }
    if(time.hh==7 && time.mm==0){
        myHouse.people.karl.moveTo('corridor')
        myHouse.people.rosa.moveTo('corridor')
        setTimeout(myHouse.people.karl.moveTo.bind(myHouse.people.karl), 1, 'living' )
        setTimeout(myHouse.people.rosa.moveTo.bind(myHouse.people.rosa), 1, 'living' )
        setTimeout(myHouse.people.karl.moveTo.bind(myHouse.people.karl), 2, 'kitchen' )
        setTimeout(myHouse.people.rosa.moveTo.bind(myHouse.people.rosa), 2, 'kitchen' )
       }

    if(time.hh==7 && time.mm==30){
        myHouse.people.rosa.moveTo('living')
        setTimeout(myHouse.people.rosa.moveTo.bind(myHouse.people.rosa), 1, 'corridor' )
        setTimeout(myHouse.people.rosa.moveTo.bind(myHouse.people.rosa), 2, 'laundry' )
        setTimeout(myHouse.people.rosa.moveTo.bind(myHouse.people.rosa), 3, 'bathroom' )
         }

    if(time.hh==8 && time.mm==15) {
        myHouse.people.karl.moveTo("kitchen")
        setTimeout(myHouse.people.karl.moveTo.bind(myHouse.people.karl), 1, 'living')
        setTimeout(myHouse.people.karl.moveTo.bind(myHouse.people.karl), 2, 'corridor')
        setTimeout(myHouse.people.karl.moveTo.bind(myHouse.people.karl), 3, 'garage')
        setTimeout(myHouse.people.karl.moveTo.bind(myHouse.people.karl), 4, 'outside')
        myHouse.people.rosa.moveTo('laundry')
        setTimeout(myHouse.people.rosa.moveTo.bind(myHouse.people.rosa), 1, 'corridor' )
        setTimeout(myHouse.people.rosa.moveTo.bind(myHouse.people.rosa), 2, 'living' )
    }

    if(time.hh==13 && time.mm==30) {
        myHouse.people.rosa.moveTo('kitchen')
    }


    if(time.hh==15 && time.mm==0){
        myHouse.people.rosa.moveTo('living')
      }

    if(time.hh==20 && time.mm==0){
        myHouse.people.karl.moveTo('garage')
        setTimeout(myHouse.people.karl.moveTo.bind(myHouse.people.karl), 1, 'corridor' )
        setTimeout(myHouse.people.karl.moveTo.bind(myHouse.people.karl), 2, 'living' )
        setTimeout(myHouse.people.karl.moveTo.bind(myHouse.people.karl), 3, 'kitchen' )
        myHouse.people.rosa.moveTo('kitchen')
    }

    if(time.hh==22 && time.mm==0){
        myHouse.people.karl.moveTo('living')
        myHouse.people.rosa.moveTo('living')
        setTimeout(myHouse.people.karl.moveTo.bind(myHouse.people.karl), 1, 'corridor' )
        setTimeout(myHouse.people.rosa.moveTo.bind(myHouse.people.rosa), 1, 'corridor' )
        setTimeout(myHouse.people.karl.moveTo.bind(myHouse.people.karl), 2, 'bedroom' )
        setTimeout(myHouse.people.rosa.moveTo.bind(myHouse.people.rosa), 2, 'bedroom' )
        houseAgent.postSubGoal( new AlarmGoal({hh:6, mm:0}) )
        myHouse.devices.greenhouse.cycle()}
})


//Clock.global.observe('mm', (mm) => {
    //var time = Clock.global
    //if(time.hh==7 && time.mm==0 && time.dd == 0) {
        //gardner.PlantOrder( myHouse.devices.smartfridge)
        //chef.PlanWeekAndIngredients()
        //setTimeout(console.log,6300,time.dd)
       //myHouse.devices.smartfridge.postrequests(["included ribs", "scheduled wednesday cabbage"])
        // console.log(myHouse.devices.smartfridge.requests)
        // myHouse.people.karl.moveTo('corridor')
        // myHouse.people.rosa.moveTo('corridor')
        // setTimeout(myHouse.people.karl.moveTo.bind(myHouse.people.karl), 1, 'garage' )
        // setTimeout(myHouse.people.rosa.moveTo.bind(myHouse.people.rosa), 1, 'kitchen' )
         //myHouse.devices.greenhouse.cycle()
    //     myHouse.devices.greenhouse.plant("cabbage")
    //
    //
    //}
    // if(time.hh==19 && time.mm==0) {
    //      //myHouse.devices.greenhouse.harvest()
    //     myHouse.people.karl.moveTo('corridor')
    //     myHouse.people.rosa.moveTo('corridor')
    //     setTimeout(myHouse.people.karl.moveTo.bind(myHouse.people.karl), 1, 'bedroom' )
    //     setTimeout(myHouse.people.rosa.moveTo.bind(myHouse.people.rosa), 1, 'bedroom' )
    // }
    //  if(time.hh==19 && time.mm==15) {
    //     myHouse.devices.greenhouse.clean()
    //}
//})
// Start clock
Clock.startTimer()