const Goal = require('../bdi/Goal');
const Intention = require('../bdi/Intention');

class DaylightSensorGoal extends Goal{

    constructor(clock) {
        super();
        this.clock = clock
    }
}

class DaylightSensorIntention extends Intention {

    constructor(agent, goal) {
        super(agent, goal)

        /** @type {Array<Light>} lights */
        this.clock = this.goal.clock
    }

    static applicable(goal) {
        return goal instanceof DaylightSensorGoal
    }

    *exec(){
        let prom = new Promise(async res => {
        while (true){
            let time = await this.clock.notifyChange("hh")
            switch (time){
                case 7:
                    this.agent.beliefs.undeclare("night")
                    this.agent.beliefs.declare("morning")
                    break
                case 11:
                    this.agent.beliefs.undeclare("morning")
                    this.agent.beliefs.declare("noon")
                    break
                case 15:
                    this.agent.beliefs.undeclare("noon")
                    this.agent.beliefs.declare("afternoon")
                    break
                case 18:
                    this.agent.beliefs.declare("night")
                    this.agent.beliefs.undeclare("afternoon")
                    break
            }


        }

        })

    }

}


module.exports = {DaylightSensorGoal, DaylightSensorIntention}