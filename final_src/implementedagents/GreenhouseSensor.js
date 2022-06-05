const Goal = require('../bdi/Goal');
const Intention = require('../bdi/Intention');




class SenseGreenhouseGoal extends Goal {

    /** @type {Array<Light>} greenhouse */
    constructor (greenhouse = []) {
        super()


        this.greenhouse = greenhouse

    }

}

class SenseGreenhouseIntention extends Intention {

    constructor (agent, goal) {
        super(agent, goal)

        /** @type {Array<Light>} lights */
        this.greenhouse = this.goal.greenhouse
    }

    static applicable (goal) {
        return goal instanceof SenseGreenhouseGoal
    }


    *exec () {
        var GreenhouseGoals = []
        for (let l of ["ph", "nutrients","crop"]) {
            let greenhouseGoalPromise = new Promise( async res => {
                while (true) {
                    let status = await this.greenhouse.notifyChange(l)
                    switch (l){
                        case "ph":
                        case "nutrients":
                            this.log('sense: ' + this.greenhouse.name + ' has ' + status)
                            this.agent.beliefs.declare(
                                `low_${status.split("_")[1]} ${this.greenhouse.name}`,
                                status.split("_")[0] == "low")
                            break
                        // case "crop":
                        //     this.log(`sense: ${status} in ${this.greenhouse.name}` )
                        //     if (status == "empty"){
                        //         this.agent.beliefs.declare(`empty ${this.greenhouse.name}`)
                        //
                        //         this.agent.beliefs.literals.forEach(bel =>{
                        //             if (bel.split(" ")[0] == "planted"){
                        //                 this.agent.beliefs.undeclare(bel)
                        //                 this.agent.beliefs.declare(`harvested ${bel.split(" ")[1]}`)
                        //                 this.log(bel, "YOOO")
                        //             }
                        //             if (bel.split(" ")[0] == "dirty"){
                        //                 this.agent.beliefs.undeclare(bel)
                        //             }
                        //         })
                        //     }
                        //     else if (status == "dirty"){
                        //         this.agent.beliefs.undeclare("empty greenhouse")
                        //         this.agent.beliefs.declare("dirty greenhouse")
                        //     }
                        //
                        //     else {
                        //         this.agent.beliefs.declare(`planted ${status} ${this.greenhouse.name}`)
                        //         this.agent.beliefs.undeclare(`empty ${this.greenhouse.name}`)
                        //     }
                        // //
                    }
                }
            });

            GreenhouseGoals.push(greenhouseGoalPromise)
        }
        yield Promise.all(GreenhouseGoals)
    }

}

class OldSenseGreenhouseIntention extends Intention {
    
    constructor (agent, goal) {
        super(agent, goal)
        
        /** @type {Array<Light>} lights */
        this.greenhouse = this.goal.greenhouse
    }
    
    static applicable (goal) {
        return goal instanceof SenseGreenhouseGoal
    }


    *exec () {
        var GreenhouseGoals = []
        for (let l of ["ph", "nutrients"]) {
            // let lightGoalPromise = this.agent.postSubGoal( new SenseOneLightGoal(l) )
            // lightsGoals.push(lightGoalPromise)
            
            let greenhouseGoalPromise = new Promise( async res => {
                while (true) {
                    let status = await this.greenhouse.notifyChange(l)
                    this.log('sense: ' + this.greenhouse.name + ' has ' + status)

                    this.agent.beliefs.declare(
                        `low_${status.split("_")[1]} ${this.greenhouse.name}`,
                         status.split("_")[0] == "low")
                    if (this.agent.beliefs.check(`low_ph ${this.greenhouse.name}`)){
                        this.agent.log(`Adjusting ${this.greenhouse.name} pH levels`)
                        this.greenhouse.adjustph()
                    }
                    if (this.agent.beliefs.check(`low_nutrients ${this.greenhouse.name}`)){
                        this.agent.log(`Adjusting ${this.greenhouse.name} nutrients levels`)
                        this.greenhouse.adjustnutrients()
                    }

                }
            });

            GreenhouseGoals.push(greenhouseGoalPromise)
        }
        yield Promise.all(GreenhouseGoals)
    }

} //wrong case

class ReactiveRegulationGoal extends Goal {

    /** @type {Array<Light>} greenhouse */
    constructor (greenhouse = []) {
        super()


        this.greenhouse = greenhouse

    }

}

class ReactiveRegulationIntention extends Intention {

    constructor (agent, goal) {
        super(agent, goal)

        /** @type {Array<Light>} lights */
        this.greenhouse = this.goal.greenhouse


    }

    static applicable (goal) {
        return goal instanceof ReactiveRegulationGoal
    }

    *exec () {
        var reactiveGoals = []
        let GoalPromise = new Promise( async res => {
            while (true) {
                let status = await this.agent.beliefs.notifyAnyChange()
                if (this.agent.beliefs.check(`low_ph ${this.greenhouse.name}`)){
                    this.agent.log(`Acting on ${this.greenhouse.name} to regulate pH`)
                    this.greenhouse.adjustph()
                }
                if (this.agent.beliefs.check(`low_nutrients ${this.greenhouse.name}`)){
                    this.agent.log(`Acting on ${this.greenhouse.name} to regulate nutrients`)
                    this.greenhouse.adjustnutrients()
                }
            }
        });

        reactiveGoals.push(GoalPromise)

        yield Promise.all(reactiveGoals)
    }

}












module.exports = {SenseGreenhouseGoal,SenseGreenhouseIntention, ReactiveRegulationGoal, ReactiveRegulationIntention}