
var nextId = 0

/**
 * @class Goal
 */
class Goal {

    constructor (parameters = {}) {
        this.id = nextId++

        /** @type {*} parameters */
        this.parameters = parameters
        
        // // [x, y] given parameters=['x','y']
        // if (Array.isArray(parameters))
        //     for (let i = 0; i < parameters.length; i++) {
        //         const element = parameters[i];
        //         this.parameters[this.constructor.parameters[i]] = parameters[i]
        //     }
        // // {'x': x, 'y': y}
        // else
        //     this.parameters = parameters
    }

    toString() {
        return this.constructor.name + '#'+this.id + this.parameters.toString() //+ this.effect.map(e=>'('+e+')').join('')
    }

    // get precondition () {
    //     return BeliefSet.ground(this.constructor.precondition, this.parameters)
    // }

    // checkPrecondition (beliefSet) {
    //     return beliefSet.check(this.precondition);
    // }

    // get effect () {
    //     return BeliefSet.ground(this.constructor.effect, this.parameters)
    // }

    // checkEffect (beliefSet) {
    //     return beliefSet.check(this.effect);
    // }

    // applyEffect (beliefSet) {
    //     for ( let b of this.effect )
    //         beliefSet.apply(b)
    // }
}



module.exports = Goal