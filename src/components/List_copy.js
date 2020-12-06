/*
import React, {Component} from 'react';
import db from '../base';
import { Redirect } from "react-router-dom";
import "../style.css";

class MeetingList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            creatorID: 'cr',
            meetingIDs: [],
            meetingNames: [],
            decidedM: []
        };

        this.createMeeting = this.createMeeting.bind(this);
        this.clickMeeting = this.clickMeeting.bind(this);
        //this.listMeeting = this.listMeeting.bind(this);


    }

    componentDidMount() {
        this.firebaseRef = db.database().ref("UserInfo/"+this.state.creatorID);
        this.firebaseRef.once('value').then((snapshot) => {

            if (snapshot.val() != null && snapshot.child("meetingIDs").val() != null) {
                //console.log(snapshot.child("meetingIDs").val())
                this.setState({
                    meetingIDs: snapshot.child("meetingIDs").val(),
                    meetingNames: snapshot.child("meetingNames").val(),
                    decidedM: snapshot.child("decidedM").val(),
                });
                //console.log(this.state.meetingIDs)
                //return this.state.meetingIDs
            }
            //console.log(snapshot.child("meetingIDs").val())
        });

    }

    componentWillUnmount() {
        this.firebaseRef.off();
    }


    createMeeting(event){

        this.props.history.push({
            pathname:"/createMeeting",
            state:{
                creatorID: this.state.creatorID,
                meetingIDs: this.state.meetingIDs,
                meetingNames: this.state.meetingNames,
                decidedM: this.state.decidedM
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
                    creatorID: this.state.creatorID,
                    meetingID: meetingID,
                }
            });
            return <Redirect to="/Calendar" />;
        }
    }

    render() {
        let futureMeeting = []
        let pastMeeting = []
        for (const id in this.state.meetingIDs){
            if(this.state.decidedM[id]){
                pastMeeting.push(<div id = {this.state.meetingIDs[id]}>{this.state.meetingNames[id]}<button onClick={this.clickMeeting}>View Meeting</button></div>);
            }else{
                futureMeeting.push(<div id = {this.state.meetingIDs[id]}>{this.state.meetingNames[id]}<button onClick={this.clickMeeting}>View Meeting</button></div>);
            }
        }
        //console.log(this.state.meetingName);
        //console.log(this.state.meetingName.length);
        return (
            <div>
                <div className="flex-container">
                    <div>
                        <label>User Id:</label>
                        <p>{this.state.creatorID}</p>
                        <button onClick={this.createMeeting}>Create Meeting</button>
                    </div>
                    <div className="meetingList">
                        <label>Future Meetings</label>
                        <div>
                            {futureMeeting.length ? futureMeeting : <p>No Future Meeting</p>}
                        </div>
                        <label>Past Meetings</label>
                        <div>
                            {pastMeeting.length ? pastMeeting : <p>No Past Meeting</p>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


export default MeetingList;
 */