import React, {Component} from 'react';
import db from '../base';
import { Redirect } from "react-router-dom";
import "../style.css"
import logo from "../routes/resource/time2meet_logo.png";

class MeetingList extends Component {
    constructor(props) {
        super(props);

        var user = db.auth().currentUser;
        var name, email, photoUrl, uid, emailVerified;

        if (user != null) {
            name = user.displayName;
            email = user.email;
            photoUrl = user.photoURL;
            emailVerified = user.emailVerified;
            uid = user.uid;  // The user's ID, unique to the Firebase project. Do NOT use
                             // this value to authenticate with your backend server, if
                             // you have one. Use User.getToken() instead.
        }

        this.state = {
            creatorID: uid,
            meetingIDs: [],
            meetingNames: [],
            decidedM: [],
        };
        this.firebaseRef = db.database().ref("UserInfo/"+this.state.creatorID);
        this.firebaseRef_M = db.database().ref("meetings");



        this.createMeeting = this.createMeeting.bind(this);
        this.clickMeeting = this.clickMeeting.bind(this);
        this.fetchData = this.fetchData.bind(this);


    }

    componentDidMount() {
        this.firebaseRef.on('value', snapshot => {

            if (snapshot.val() != null && snapshot.child("meetingIDs").val() != null) {
                this.setState({
                    meetingIDs: snapshot.child("meetingIDs").val(),
                });
                this.fetchData(this.state.meetingIDs);
            }
        });
    }

    fetchData(meetingIDs){

        let meetingNames = [];
        let decidedM  = [];

        this.firebaseRef_M.on('value', snapshot => {
            for(const id of meetingIDs){
                if (snapshot.val() != null && snapshot.child(id).val() != null) {
                    meetingNames.push(snapshot.child(id).child("meetingName").val())
                    decidedM.push(snapshot.child(id).child("decided").val())
                }
            }
            if(decidedM.length !== 0){
                this.setState({
                    meetingNames: meetingNames,
                    decidedM: decidedM,
                });
            }
        });


    }

    componentWillUnmount() {
        this.firebaseRef.off();
        this.firebaseRef_M.off();
    }


    createMeeting(event){

        this.props.history.push({
            pathname:"/createMeeting",
            state:{
                creatorID: this.state.creatorID,
                meetingIDs: this.state.meetingIDs,
                meetingNames: this.state.meetingNames,
                decidedM: this.state.decidedM,
                userID: this.state.creatorID,
            }
        });
        return <Redirect to="/createMeeting" />;
    }

    clickMeeting(event){
        let meetingID = event.target.parentElement.getAttribute('id');
        if(meetingID != null){
            this.props.history.push({
                pathname:"/Calendar",
                state:{
                    userID: this.state.creatorID,
                    meetingID: meetingID,
                }
            });

            return <Redirect to="/Calendar" />;
        }
    }

    render() {
        let futureMeeting = [];
		let pastMeeting = [];
		if (this.state.decidedM.length !== 0 && this.state.meetingNames.length !== 0) {
			for (const id in this.state.meetingIDs) {
				if (this.state.decidedM[id]) {
					pastMeeting.push(
						<div key={id} id={this.state.meetingIDs[id]} className="meetingList_meeting_item">
							{this.state.meetingNames[id]}
							<button className="meetingList_flat_btn" onClick={this.clickMeeting}>
								View Meeting
							</button>
						</div>
					);
				} else {
					futureMeeting.push(
						<div key={id} id={this.state.meetingIDs[id]} className="meetingList_meeting_item">
							{this.state.meetingNames[id]}
							<button className="meetingList_flat_btn" onClick={this.clickMeeting}>
								View Meeting
							</button>
						</div>
					);
				}
			}
		}

        return (
			<div>
				<div className="meetingList_container">
					<img src={logo} alt=""></img>
					<div>
						<h2 className="meetingList_h2">Current Meetings</h2>
						<div>{futureMeeting.length ? futureMeeting : <p className="no_meetings">No Current Meetings</p>}</div>
						<h2 className="meetingList_h2">Planned Meetings</h2>
						<div>{pastMeeting.length ? pastMeeting : <p className="no_meetings">No Planned Meetings</p>}</div>
					</div>
					<br />
					<div>
						<button className="meetingList_float_left_btn" onClick={this.createMeeting}>Create Meeting</button>
						<button className="meetingList_float_right_btn" onClick={() => db.auth().signOut()}>Sign Out</button>
					</div>
				</div>
			</div>
		);
    }
}


export default MeetingList;