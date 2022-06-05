const Beliefset =  require('./Beliefset')
const Intention = require('./Intention');
const chalk = require('chalk');

var nextId = 0
const colors = ['red', 'blue',  'yellow', 'magenta', 'cyan', 'redBright', 'greenBright', 'yellowBright', 'blueBright', 'magentaBright', 'cyanBright', 'whiteBright']

/**
 * @class Agent
 */
class Agent {

    constructor (name) {
        this.name = name
        this.id = nextId++

        /** @type {Beliefset} beliefs */
        this.beliefs = new Beliefset()

        this.beliefs.observeAny( (v,fact) => this.log( 'Belief changed: ' + (v?fact:'not '+fact) ) )

        /** @type {Array<Intention>} intentions */
        this.intentions = []
    }



    headerError (header = '', ...args) {
        header += ' '.repeat(Math.max(30-header.length,0))
        console.error(chalk.bold.italic[colors[this.id%colors.length]](header, ...args))
    }

    error (...args) {
        this.headerError(this.name, ...args)
    }



    headerLog (header = '', ...args) {
        header += ' '.repeat(Math.max(30-header.length,0))
        console.log(chalk[colors[this.id%colors.length]](header, ...args))
    }

    log (...args) {
        this.headerLog(this.name, ...args)
    }



    async postSubGoal (subGoal) {

        // if (!this.beliefs.check(subGoal.precondition)) { //!subGoal.checkPrecondition()
        //     this.log('Goal cannot be taken, preconditions are not valid', subGoal)
        //     console.log(subGoal.precondition)
        //     console.log(this.beliefs)
        //     return
        // }

        for (let intentionClass of Object.values(this.intentions)) {

            if (!intentionClass.applicable(subGoal)) // By default applicable(goal) returns true (see class Intention)
                continue; // if not applicable try next

            this.log('Trying to use intention', intentionClass.name, 'to achieve goal', subGoal.toString())

            var intention = new intentionClass(this, subGoal)

            var success = await intention.run().catch( err => {
                this.error('Failed to use intention', intentionClass.name, 'to achieve goal', subGoal.toString() + ':', err.message || err || 'undefined error')
                this.error( err.stack || err || 'undefined error');
            } )

            if ( success ) {
                this.log('Succesfully used intention', intentionClass.name, 'to achieve goal', subGoal.toString())
                return Promise.resolve(true) // same as: return true;
            }
            else {
                continue // retrying
            }

        }

        this.log('No success in achieving goal', subGoal.toString())
        return Promise.resolve(false) // different from: return false; which would reject the promise!!!
        // throw new Error('No success in achieving goal'); // Promise rejection with explicit error. This should always be catched outside!

    }

}



// const {LightOn} = require('./bdi/Goal')
// const intentions =  require('./bdi/Intention')

// postSubGoal(new LightOn({l: 'light1'}))


// var kitchenAgent = new Agent('kitchen')
// kitchenAgent.intentions.push(...Object.values(intentions))
// kitchenAgent.postSubGoal(new LightOn({l: 'light0'}))

// environment.facts.push('in-room kitchen Marco')
// environment.facts.push('light-on light1')


module.exports = Agent