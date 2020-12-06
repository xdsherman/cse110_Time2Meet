import React, {Component} from 'react';
import db from '../base';

class MasterCalendar extends Component {
    constructor(state) {
        super(state)

        this.state = {
            meetingID: this.props.meetingID,
            meetingDays: this.props.meetingDays,
            startTime: this.props.startTime,
            endTime: this.props.endTime,
            availabilities: [],
            bestTimes: [],
            index: 0
        }
        this.firebaseRef = db.database().ref("availability/"+this.state.meetingID);
        this.hover = this.hover.bind(this);
        this.toggle = this.toggle.bind(this);
    }
    componentWillUnmount() {
        this.firebaseRef.off();
    }
    componentDidMount() {
        this.firebaseRef.on('value', (snapshot)=> {
            let avaArray = {};
            if (snapshot.val() != null) {
                for (const [user,ava] of Object.entries(snapshot.val())) {
                    for (const each of Object.values(ava.availability)) {
                        let key = each.hour+ '-' + each.day;
                        if (avaArray[key] === undefined) {
                            avaArray[key] = {}
                            avaArray[key]["priority"] = each.priority;
                            avaArray[key]["users"] = [user];
                        } else {
                            avaArray[key]["priority"] += each.priority;
                            avaArray[key]["users"].push(user);
                        }
                    }
                }
                var sortable = [];
                for (var key in avaArray) {
                    sortable.push([key, avaArray[key]["priority"]]);
                }

                sortable.sort(function (a, b) {
                    return b[1] - a[1];
                });
                sortable = sortable.slice(0, 3);
                var bestTimes = [];
                for (var key in sortable) {
                    bestTimes.push(sortable[key][0]);
                }
                this.setState({
                    bestTimes: bestTimes,
                    availabilities: avaArray
                })
            } else {
                this.setState({
                    bestTimes: [],
                    availabilities: []
                })
            }
        })
    }
    convertTo12Hr(hour) {
        var AMPM = (hour < 12) ? "AM" : "PM";
        var h = (hour % 12) || 12;
        return h + AMPM;
    }
    hover(event){
        let key = event.target.getAttribute('id');
        const {availabilities} = this.state;
        //console.log(key);
        //console.log(availabilities);
        if (key in availabilities){
           alert(availabilities[key]["users"] + ": " + availabilities[key]["priority"]);
        }

    }
    toggle(event){
        let direction = event.target.getAttribute('id');
        if (direction === 'next' & this.state.index < Math.floor(this.state.meetingDays.length/8)){
            this.setState({
                index: this.state.index+1
            })
        } else if (direction === 'prev' & this.state.index > 0){
            this.setState({
                index: this.state.index-1
            })
        }
    }
    render() {
        let slotsM = [];
        let hours = [];
        let daysM = [];
        let time = Number(this.state.startTime);
        let windowLength = this.state.endTime - this.state.startTime;
        //start time window, displays 1-12, half hour, 7 days per window
        Array.from({length: windowLength}, (_, i) => hours.push(<div>{this.convertTo12Hr(i+time)}</div>));
        for (const eachday of this.state.meetingDays){
            let slot = [];
            Array.from({length: windowLength}, (_, i) =>{
                slot.push(<div id ={(i+time)+'-'+eachday} style={{backgroundColor: this.state.color}} onClick={this.hover}></div>);
            });
            slotsM[eachday] = slot;
        }
        if(this.state.meetingDays.length != 0){
            daysM = this.state.meetingDays.map(day => <div id = {day}><div className="day">{day}</div><div id={day} className= "slots">{slotsM[day]}</div></div>);
        }

        if (Object.keys(this.state.availabilities).length !== 0 && daysM.length !== 0 && Object.keys(slotsM).length !== 0) {
            var lowest = Number.MAX_SAFE_INTEGER;
            var highest = 0;
            // loop to get lowest and highest selections from calendar
            for (const [key, value] of Object.entries(this.state.availabilities)) {
                let priority = value.priority;
                if (priority > -1) {
                    if (priority < lowest) {
                        lowest = priority;
                    }
                    if (priority > highest) {
                        highest = priority;
                    }
                }
            }
            // loop again to color timeslots accordingly
            for (const [key, value] of Object.entries(this.state.availabilities)) {
                let hour = key.split("-")[0];
                let day = key.split("-")[1];
                let priority = value.priority;
                // darkest color is rgb(50,50,50), lightest is rgb(200,200,200), range=150
                let color;
                if (highest === lowest) {
                    color = 'rgb(0,200,0)';
                } else {
                    let stepsize = 150 / (highest - lowest);
                    let rgbVal = 200 - (stepsize * (priority - lowest));
                    color = `rgb(${0.5*rgbVal}, ${0.9*rgbVal}, ${0.5*rgbVal})`;
                }
                // assign color
                let slot = daysM.find(x => x.props.id === day).props.children[1].props.children.find(x => x.props.id.split('-')[0] === hour);
                slot.props.style.backgroundColor = color;
            }
        }
        let daysOutM = [];
        daysOutM.push(daysM.slice(this.state.index*7, this.state.index*7+7));
        return (
            <div>
                <div className="flex-container">
                    {this.state.index !== 0 && <button id='prev' onClick={this.toggle}>Previous</button>}
                    {hours.length ? <div className="hours">{hours}</div> : null}{daysOutM}
                    {this.state.index !== Math.floor(this.state.meetingDays.length/8) &&
                    <button id='next' onClick={this.toggle}>Next</button>}
                </div>
            </div>
        );
    }
}
export default MasterCalendar;