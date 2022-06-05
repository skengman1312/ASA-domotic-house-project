const pddlActionIntention = require('../pddl/actions/pddlActionIntention')
const Agent = require('../bdi/Agent')
const Goal = require('../bdi/Goal')
const Intention = require('../bdi/Intention')
const PlanningGoal = require('../pddl/PlanningGoal')
const  Greenhouse = require('../devices/Greenhouse')
const Observable = require("../utils/Observable");






class GardnerAgent extends Agent {
    constructor(greenhouse,name) {
        super(name);
        this.greenhouse = greenhouse //in order to get the GardenerAgent to work properly as a module we need to pass him
                                     //the green house in which he has to operate as PDDLactionintentions do not allow for
                                     //extra parameters during planning
    }

    async PlantOrder(smartfridge){
        let ingredients = await smartfridge.notifyChange("ingredients") //sensing the ingredients posted by the chef agent
                                                                            //into the smart fridge
        let seeds = ingredients["plantable_ingredients"]
        this.beliefs.declare('empty greenhouse')
        seeds.forEach(item => this.beliefs.declare(`crop ${item}`));
        let {OnlinePlanning} = require('../pddl/OnlinePlanner')([Plant, Harvest, Clean])
        this.intentions.push(OnlinePlanning)
        this.intentions.push(PlantIntention)
        this.intentions.push(ReplanningIntention)
        let allgoals = seeds.map((item) => `harvested ${item}`)
        return this.postSubGoal( new PlantGoal({ goal: new PlanningGoal( { goal: allgoals } ) } ) )

    }



}




class GardnerAction extends pddlActionIntention {

        // constructor (agent, parameters) {
        //     this.agent = agent
        //     this.parameters = parameters
        // }

        // get precondition () {
        //     return pddlActionIntention.ground(this.constructor.precondition, this.parameters)
        // }
        //
        // checkPrecondition () {
        //     return this.agent.beliefs.check(...this.precondition);
        // }
        //
        // get effect () {
        //     return pddlActionIntention.ground(this.constructor.effect, this.parameters)
        // }
        //
        // applyEffect () {
        //     for ( let b of this.effect )
        //         this.agent.beliefs.apply(b)
        // }


        async checkPreconditionAndApplyEffect () {
            if ( this.checkPrecondition() ) {
                this.applyEffect()
                await new Promise(res=>setTimeout(res,1000))
            }
            else
                throw new Error('pddl precondition not valid'); //Promise is rejected!
        }

    }

    class Plant extends GardnerAction {
        static parameters = ['croptype', 'greenhouse']
        static precondition = [ ['empty', 'greenhouse'], ["crop", "croptype"]]
        static effect = [ ['planted', 'croptype', 'greenhouse'], ['not empty', 'greenhouse'] ] ;
        applyEffect () {
             for ( let b of this.effect )
                this.agent.beliefs.apply(b)
         }

        *exec ({croptype,greenhouse}=parameters) {
            if (this.checkPrecondition()) {
                let status = this.agent.greenhouse.notifyChange("crop").then((value) => {
                    //sensing the effect of the action before applying the effect to the beliefs set
                    //console.log(value);
                    this.applyEffect();
                })
                this.agent.greenhouse.plant(croptype)
                yield}
            else {
               throw new Error('pddl precondition not valid');
            }
        }
    }
    class Harvest extends GardnerAction {
        static parameters = ['croptype', 'greenhouse'];
        static precondition = [ ['planted', "croptype", 'greenhouse']];
        static effect = [ ['harvested', 'croptype',], ['empty', 'greenhouse'], ['not planted', "croptype", 'greenhouse'] ];
        applyEffect () {
             for ( let b of this.effect )
                this.agent.beliefs.apply(b)
         }
         *exec ({croptype,greenhouse}=parameters) {
                this.checkPrecondition()

                let status =  this.agent.greenhouse.notifyChange("crop").then((value) => {
                    //sensing the effect of the action before applying the effect to the beliefs set
                    this.applyEffect();
                    if (value == "dirty"){ //sensing if the harvest left the greenhouse dirty or not and updating the belief set accordingly
                        this.agent.beliefs.undeclare("empty greenhouse")
                        this.agent.beliefs.declare("dirty greenhouse")
                    }

                })

                this.agent.greenhouse.harvest()
                yield




        }
    }
    class Clean extends GardnerAction {
        static parameters = ['greenhouse'];
        static precondition = [["dirty", 'greenhouse']];
        static effect = [["not dirty", 'greenhouse'],["empty", 'greenhouse'] ];
        applyEffect () {
             for ( let b of this.effect )
                this.agent.beliefs.apply(b)
         }
        *exec ({croptype,greenhouse}=parameters) {
            this.agent.greenhouse.clean()
            yield this.checkPreconditionAndApplyEffect()
        }
    }




    class ReplanningIntention extends Intention {
        static applicable (goal) {
            return goal instanceof PlanningGoal
        }
        *exec (parameters) {
            yield new Promise(res=>setTimeout(res,1100))
            yield this.agent.postSubGoal( new PlanningGoal(parameters) )
        }
    }
    class PlantGoal extends Goal {
        //
        // constructor(greenhouse) {
        //     super();
        //     this.greenhouse = greenhouse;
        // }
    }
    class PlantIntention extends Intention {
        static applicable (goal) {
            return goal instanceof PlantGoal
        }
        *exec ({goal}=parameters) {

            let goalAchieved = yield this.agent.postSubGoal( goal )
            if (goalAchieved)
                return;

        }
    }


class House {
    constructor () {
        this.rooms = {
            kitchen: { name: 'kitchen', doors_to: ['corridor'] },
            corridor: { name: 'corridor', doors_to: ['kitchen', 'garage', "bedroom"] },
            garage: { name: 'garage', doors_to: ['corridor'] },
            bedroom: { name: 'bedroom', doors_to: ['corridor'] }
        }
        this.devices = {
            greenhouse: new Greenhouse(this, "greenhouse")
        }
        this.utilities = {
            electricity: new Observable( { consumption: 0 } )
        }
    }
}



//const chef = new ChefAgent('chef');
//chef.PlanWeek(["included ribs", "scheduled wednesday ribs"])
// let seeds = []
// setTimeout(()=>seeds = chef.plantableingredients,2000)
// setTimeout(()=>console.log(seeds),2000)

// let prom = new Promise(function (resolve) {
//     chef.PlanWeek(["included ribs", "scheduled wednesday ribs"])
//     let seeds = []
//     setTimeout(()=>seeds = chef.plantableingredients,2000)
//     setTimeout(()=>console.log("diocan",seeds),2000)
//     if (seeds != []) resolve(seeds)
// })
// prom.then(value => console.log(value))

//var myHouse = new House()
//const gardner = new GardnerAgent(myHouse.devices.greenhouse, name = 'gardner');

//chef.PlanWeekAndIngredients(["included ribs", "scheduled wednesday cabbage"])
    //.then(value=>gardner.PlantOrder(value))


module.exports = GardnerAgent


