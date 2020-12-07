import React, {Component} from 'react';
import db from '../base';

class TabularView extends Component {
    constructor(state) {
        super(state)
        this.state = {
            meetingID: this.props.meetingID,
            meetingName: this.props.meetingName,

            userIDs: this.props.userIDs,
            creatorID: this.props.creatorID,
            namesEmails: [],
            meetingData: [],
            bestTimes: []
        }
        
        this.firebaseMeetingsRef = db.database().ref("meetings/"+this.state.meetingID);
        this.firebaseAvailabilitiesRef = db.database().ref("availability/"+this.state.meetingID);
        this.firebaseUsersRef = db.database().ref("UserInfo");
        this.updateUsers = this.updateUsers.bind(this);
    }
    componentWillUnmount() {
        this.firebaseMeetingsRef.off();
        this.firebaseAvailabilitiesRef.off();
    }
    updateUsers(userIDs){
        console.log(userIDs);
        this.firebaseUsersRef.on('value', (snapshot)=>{
            const {namesEmails} = this.state;
            for (const id of userIDs){
                if (id in snapshot.val()){
                    const name = snapshot.child(id).child("name").val();
                    const email = snapshot.child(id).child("email").val();
                    namesEmails[name] = email;
                }
            }
            this.setState({namesEmails:namesEmails})
        });
    }
    componentDidMount() {
        // read meeting table in database
        this.firebaseMeetingsRef.on('value', (snapshot) => {
            this.setState({
                meetingData: snapshot.val()
            });
            //get names and emails of users
            this.updateUsers(snapshot.val().userIDs);
        });

        // calculate top 3 times
        this.firebaseAvailabilitiesRef.on('value', (snapshot)=> {
            let avaArray = {};
            if (snapshot.val() != null) {
                for (const [user,ava] of Object.entries(snapshot.val())) {
                    for (const each of Object.values(ava.availability)) {
                        let key = each.day + ' ' + this.convertTo12Hr(each.hour);
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
                for (let key in avaArray) {
                    sortable.push([key, avaArray[key]["priority"]]);
                }
                sortable.sort(function (a, b) {
                    return b[1] - a[1];
                });
                sortable = sortable.slice(0, 3);
                var bestTimes = [];
                for (let key in sortable) {
                    bestTimes.push(sortable[key][0]);
                }
                this.setState({
                    bestTimes: bestTimes
                })
            }
        });
    }

    convertTo12Hr(hour) {
        hour = Number(hour);
        var AMPM = (hour < 12) ? "AM" : (hour == 24) ? "AM" : "PM";
        var h = (hour % 12) || 12;
        return h + AMPM;
    }

    sendEmail(selectedDate) {
        var split = selectedDate.split(' ');
        var date = split[0];
        var time = split[1];
        // set the date and time in the database
        db.database().ref('meetings/' + this.state.meetingID).update({
            decided: true,
            setDate: date,
            setTime: time
        });
        for (const [name, email] of Object.entries(this.state.namesEmails)){
            var http = new XMLHttpRequest();
            var url = 'https://api.emailjs.com/api/v1.0/email/send';
            var data = {
                service_id: 'service_5z6owfz',
                template_id: 'contact_form',
                user_id: 'user_afExeUlzmWRabJUP88WuS',
                template_params: {
                    'username': name,
                    'to_email': email,
                    'meeting_name': this.state.meetingName,
                    'meeting_date': selectedDate
                }
            }
            http.open('POST', url, true);
            http.setRequestHeader('Content-type', 'application/json');
            http.onreadystatechange = function() {
                // if successful, remove suggestions table
                if(http.readyState === 4 && http.status === 200) {
                    document.getElementById("suggestionsTable").innerText =
                        "Participants emailed successfully! Meeting has been scheduled for: " + selectedDate;
                }
            }
            http.send(JSON.stringify(data));
        }
    }
    
    render() {
        var meeting1, meeting2, meeting3;

        // if meeting has been decided, don't show the table
        if (this.state.meetingData.decided === true) {
            document.getElementById("suggestionsTable").innerText =
                `This meeting has been scheduled for ${this.state.meetingData.setDate} at ${this.state.meetingData.setTime}.`;
        }
        // else render the table
        else {
            if (this.state.bestTimes[0] != null) {
                if (db.auth().currentUser.uid === this.state.creatorID) {
                    meeting1 = 
                        <li>
                            {this.state.bestTimes[0]}
                            <button onClick={() => this.sendEmail(this.state.bestTimes[0])}>
                                Set Meeting and Email Participants
                            </button>
                        </li>;
                }
                else {
                    meeting1 = 
                        <li>{this.state.bestTimes[0]}</li>;
                }
            }
            if (this.state.bestTimes[1] != null) {
                if (db.auth().currentUser.uid === this.state.creatorID) {
                    meeting2 = 
                        <li>
                            {this.state.bestTimes[1]}
                            <button onClick={() => this.sendEmail(this.state.bestTimes[1])}>
                                Set Meeting and Email Participants
                            </button>
                        </li>;
                }
                else {
                    meeting2 = 
                        <li>{this.state.bestTimes[1]}</li>;
                }
            }
            if (this.state.bestTimes[2] != null) {
                if (db.auth().currentUser.uid === this.state.creatorID) {
                    meeting3 = 
                        <li>
                            {this.state.bestTimes[2]}
                            <button onClick={() => this.sendEmail(this.state.bestTimes[2])}>
                                Set Meeting and Email Participants
                            </button>
                        </li>;
                }
                else {
                    meeting3 = 
                        <li>{this.state.bestTimes[2]}</li>;
                }
            }
        }

        console.log(this.state.userIDs);
        return (
            <div className="tabularView">
                <h2>Suggested Meeting Times</h2>
                <div id="suggestionsTable">
                    <ul>
                        {meeting1}
                        {meeting2}
                        {meeting3}
                    </ul>
                </div>
            </div>
        );
    }
}

export default TabularView; 