const pddlActionIntention = require('../pddl/actions/pddlActionIntention')
const Agent = require('../bdi/Agent')
const Goal = require('../bdi/Goal')
const Intention = require('../bdi/Intention')
const PlanningGoal = require('../pddl/PlanningGoal')


const weekdays = ["monday","tuesday", "wednesday", "thursday", "friday",  "saturday", "sunday"]
const vegetables = ["cabbage","broccoli","tomato", "cucumber", "beans", "onion","eggplant","bell_pepper","carrots"]
const meats = ["ribs", "sausage", "hamburger", "steak","bacon","tartarre","pork_belly"]

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

class ChefAgent extends Agent {
    constructor(smartfridge, name) {
        super(name);
        this.smartfridge = smartfridge
    }

    MenuPrinter() {
        let schedule = []
        this.beliefs.literals.forEach(item => {
            if (item.split(" ")[0] == "scheduled") {

                schedule.push(item)
            }
        })
        schedule = schedule.map((item) => `Meal scheduled for ${item.split(" ")[1]} is: ${item.split(" ")[2]}`)
        this.log("Chef agent weekly schedule for 1 meal each day:")
        schedule.forEach(item=> this.log(item))

    }

    /**
     * Function to get the list of ingredients that can be planted, it has to be run after planWeek finished runnig
     * otherwise the output will be incomplete
     * @returns {*[ String]} list of plantable ingredients
     */
    get plantableingredients(){
        let ingredients = []
        this.beliefs.literals.forEach(item => {
            if (item.split(" ")[0] == "scheduled") {
                    if (vegetables.includes(item.split(" ")[2])) {
                        ingredients.push(item.split(" ")[2])
                    }

            }
        })
        return ingredients

    }

    /**
     * Function to get the list of ingredients that can be planted, it has to be run after planWeek finished runnig
     * otherwise the output will be incomplete
     * @returns {*[ String]} list of plantable ingredients
     */
    get otheringredients(){
        let ingredients = []
        this.beliefs.literals.forEach(item => {
            if (item.split(" ")[0] == "scheduled") {
                    if (!vegetables.includes(item.split(" ")[2])) {
                        ingredients.push(item.split(" ")[2])
                    }

            }
        })
        return ingredients

    }
        /**
        * Plans the weekly one meal schedule
        * @param  {List} requests  Additional requests for the chef planning agent in the form of
        * "included ribs" or "scheduled wednesday ribs"; by default is empty.
        * @return {None}       The plan for the week in the for of beliefs
        */
    async PlanWeek(requests = []){
        requests = await this.smartfridge.notifyChange("requests") //sensing of the resident requests
        this.beliefs.declare('lastdaymeat')
        meats.forEach(item => this.beliefs.declare(`meat ${item}`));
        vegetables.forEach(item => this.beliefs.declare(`vegetable ${item}`));
        meats.concat(vegetables).forEach(item => this.beliefs.undeclare(`included ${item}`));
        weekdays.forEach(item => this.beliefs.undeclare(`planned ${item}`));
        weekdays.reverse().forEach(item => this.beliefs.declare(`weekday ${item}`)); //reverse is needed to plan the week in order
        let {OnlinePlanning} = require('../pddl/OnlinePlanner')([MeatDay, NoMeatDay])
        this.intentions.push(OnlinePlanning)
        this.intentions.push(MenuIntention)
        let allgoals = weekdays.map((item) => `planned ${item}`)
        this.postSubGoal( new MenuGoal({ goal: new PlanningGoal( { goal: allgoals.concat(requests)  } ) } ) )
    }


    PromisePlanWeek(requests = []){
    return new Promise(async resolve=> {
        this.PlanWeek(requests)
        while(true){
            console.log(weekdays.map((item) => `planned ${item}`))
            if (this.beliefs.check("planned sunday")){
                resolve(this.plantableingredients)
            }
        }


    })


    }

        /**
        * Promissified version of this.PlanWeek, plans the weekly one meal schedule and returns the list of plantable
         * ingredients once the planning promise in resolved
        * @param  {List} requests  Additional requests for the chef planning agent in the form of
        * "included ribs" or "scheduled wednesday ribs"; by default is empty.
        * @return {None}       The list of ingredients
        */
    async PlanWeekAndIngredients(){
        let requests = await this.smartfridge.notifyChange("requests") //sensing of the resident requests
        this.beliefs.declare('lastdaymeat')
        shuffle(meats) //needed to get a different plan each time the planner is called
        shuffle(vegetables)
        meats.forEach(item => this.beliefs.declare(`meat ${item}`));
        vegetables.forEach(item => this.beliefs.declare(`vegetable ${item}`));
        meats.concat(vegetables).forEach(item => this.beliefs.undeclare(`included ${item}`));
        weekdays.forEach(item => this.beliefs.undeclare(`planned ${item}`));
        weekdays.reverse().forEach(item => this.beliefs.declare(`weekday ${item}`)); //reverse is needed to plan the week in order
        let {OnlinePlanning} = require('../pddl/OnlinePlanner')([MeatDay, NoMeatDay])
        this.intentions.push(OnlinePlanning)
        this.intentions.push(MenuIntention)
        let allgoals = weekdays.map((item) => `planned ${item}`)
        this.postSubGoal( new MenuGoal({ goal: new PlanningGoal( { goal: allgoals.concat(requests)  } ) } ) )
            .then(value=> this.smartfridge.postingredients(this.plantableingredients, this.otheringredients) )
        return

    }
}

class ChefAction extends pddlActionIntention {


        async checkPreconditionAndApplyEffect () {
            if ( this.checkPrecondition() ) {
                this.applyEffect()
                await new Promise(res=>setTimeout(res,1000))
            }
            else
                throw new Error('pddl precondition not valid'); //Promise is rejected!
        }

    }


class NoMeatDay extends ChefAction {
    static parameters = ["day", "food"];
    static precondition = [["weekday", "day"], ["not planned", "day"], ["vegetable", "food"], ["not included", "food"]];
    static effect = [["planned", "day"], ["not lastdaymeat"], ["included", "food"],["scheduled","day","food"]];

    * exec({day, food} = parameters) {
        this.checkPrecondition()
        yield this.applyEffect()
    }
}        

class MeatDay extends ChefAction {
    static parameters = ["day", "food"];
    static precondition = [["weekday", "day"],["not planned", "day"], ["meat", "food"], ["not lastdaymeat"], ["not included", "food"]];
    static effect = [["planned", "day"], ["lastdaymeat"],["included", "food"], ["scheduled","day","food"]];

    * exec({day, food} = parameters) {
        this.checkPrecondition()
        yield this.applyEffect()
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
class MenuGoal extends Goal {

    };
class MenuIntention extends Intention {


    static applicable (goal) {
        return goal instanceof MenuGoal
    }
    *exec ({goal}=parameters) {

        let goalAchieved = yield this.agent.postSubGoal( goal )
        if (goalAchieved)
            this.agent.MenuPrinter()

            return;

        }
    }






module.exports = ChefAgent