const Goal = require('../bdi/Goal');
const Intention = require('../bdi/Intention');

class SolarGoal extends Goal {

    constructor (solarpanel) {
        super()

        this.solarpanel = solarpanel

    }

}

class SolarIntention extends Intention {

    constructor(agent, goal) {
        super(agent, goal)

        /** @type {Array<Light>} lights */
        this.solarpanel = this.goal.solarpanel

    }

    static applicable(goal) {
        return goal instanceof SolarGoal
    }
    *exec () {
        var solarGoals = []
        let GoalPromise = new Promise( async res => {
            while (true) {
                let status = await new Promise( resolve => {
                    this.agent.beliefs.notifyChange("morning").then(resolve)
                    this.agent.beliefs.notifyChange("afternoon").then(resolve)
                })
                switch (true) {
                    case this.agent.beliefs.check("morning"):
                        this.agent.log(`acting on ${this.solarpanel.name} to chase the sun and maximize morning light intake`)
                        this.solarpanel.switchon()
                        this.solarpanel.turn(315)
                        break
                    case this.agent.beliefs.check("noon"):
                        this.agent.log(`acting on ${this.solarpanel.name} to chase the sun and maximize noon light intake`)
                        this.solarpanel.turn(270)
                        break
                    case this.agent.beliefs.check("afternoon"):
                        this.agent.log(`acting on ${this.solarpanel.name} to chase the sun and maximize afternoon light intake`)
                        this.solarpanel.turn(225)
                        break
                    case this.agent.beliefs.check("night"):
                        this.agent.log(`acting on ${this.solarpanel.name} to cover sensible parts and protect it from dust when there is no light`)
                        this.solarpanel.switchoff()
                        this.solarpanel.turn(-1)
                        break
                }

                }
            }
        );

        solarGoals.push(GoalPromise)

        yield Promise.all(solarGoals)
    }
}

module.exports = {SolarGoal, SolarIntention}