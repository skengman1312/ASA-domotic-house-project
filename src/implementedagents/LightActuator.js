const Goal = require('../bdi/Goal');
const Intention = require('../bdi/Intention');
const Light = require('../devices/Light');



class LightsGoal extends Goal {

    constructor (lights, people = []) {
        super()

        /** @type {Array<Light>} lights */
        this.lights = lights
        this.people = people

    }

}



class MovementSensingGoal extends Goal {

    constructor ( people = []) {
        super()

        /** @type {Array<Light>} lights */
        this.people = people

    }

}
class MovementSensingIntention extends Intention{
    constructor (agent, goal) {
        super(agent, goal)

        /** @type {Array<Light>} lights */
        this.people = this.goal.people
    }

    static applicable (goal) {
        return goal instanceof MovementSensingGoal
    }

    *exec () {
        var lightsGoals = []
        for (let p of this.people) {
                let GoalPromise = new Promise( async res => {
                    while (true) {
                        let status = await p.notifyChange('in_room')
                        this.agent.beliefs.literals.forEach(value => {
                            if ((value.split(" ")[1] == p.name) && (value.split(" ")[2] != value)){
                                this.agent.beliefs.undeclare(value)
                            }
                        })
                        this.agent.beliefs.declare('in_room '+ p.name+" "+ status)
                        this.log('sense: resident ' + p.name + ' moved to ' + status)
                        }
                });

            lightsGoals.push(GoalPromise)
        }
        yield Promise.all(lightsGoals)
    }
}


class SwitchLightIntention extends Intention {

    constructor (agent, goal) {
        super(agent, goal)

        /** @type {Array<Light>} lights */
        this.lights = this.goal.lights
        this.people = this.goal.people

    }

    static applicable (goal) {
        return goal instanceof LightsGoal
    }

    *exec () {
        var lightsGoals = []
        let GoalPromise = new Promise( async res => {
            while (true) {
                let status = await this.agent.beliefs.notifyAnyChange()
                if (this.agent.beliefs.check("night")) {
                    this.lights.forEach(light => {
                        let boolarray = this.people.map(person => this.agent.beliefs.check(`in_room ${person.name} ${light.name}`))
                        if (boolarray.includes(true)) {
                            light.switchOnLight()
                        } else light.switchOffLight()

                    })
                }
            }
        });

        lightsGoals.push(GoalPromise)

        yield Promise.all(lightsGoals)
    }

}



module.exports = {LightsGoal, MovementSensingGoal, MovementSensingIntention, SwitchLightIntention}