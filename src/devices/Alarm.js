const Goal = require('../bdi/Goal');
const Intention = require('../bdi/Intention');
const Clock = require('../utils/Clock');



class AlarmGoal extends Goal {
    constructor(hm) {
        super();
        this.hm = hm
    }

    
}

class AlarmIntention extends Intention {
    constructor(agent, goal) {

        super(agent, goal);
        this.hm = this.goal.hm
    }

    static applicable(goal) {
        return goal instanceof AlarmGoal
    }


    *exec(){
        while(true) {
            Clock.global.notifyChange('mm')
            //if (Clock.global.hh == this.hm.hh && Clock.global.mm == this.hm.mm){
            //this.log('ALARM: Good Morning Vietnam \nit\'s  ' + Clock.global.mm)}
            yield
            if (Clock.global.hh == this.hm.hh && Clock.global.mm == this.hm.mm) {
                // Log a message!
                this.log('ALARM: Good Morning Vietnam \tit\'s  ' + Clock.global.hh)
                break;
            }
        }
    }
}



module.exports = {AlarmGoal, AlarmIntention}