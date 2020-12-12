import React, {Component} from 'react';
import { ReactMultiEmail, isEmail } from 'react-multi-email';
import 'react-multi-email/style.css';
import db from '../base';
import "../style.css";
import TabularView from "./TabularView";

interface IProps {}
interface IState {
    emails: string[];
}

class Invite extends Component {
    constructor(props) {
        super(props);
        this.state = {
            creatorID: this.props.creatorID,
            meetingID: this.props.meetingID,
            meetingName: this.props.meetingName,
            userIDs: [],
            emails: [],
            idEmails: [],
            invEmail: [],
            send: false,
            decided: false,
        };

        this.sendInvitation = this.sendInvitation.bind(this);
        this.pushToFirebase = this.pushToFirebase.bind(this);
        this.getUserID = this.getUserID.bind(this);


    }

    componentDidMount() {
        //retrieve data of meeting
        this.firebaseRef_U = db.database().ref("UserInfo");
        this.firebaseRef = db.database().ref("meetings");
        this.firebaseRef.on('value', snapshot => {
            if (snapshot.val() != null && snapshot.child(this.state.meetingID).val() != null) {
                if(snapshot.child(this.state.meetingID).child("userIDs").val() != null){
                    this.setState({
                        userIDs: snapshot.child(this.state.meetingID).child("userIDs").val(),
                    });
                }
                this.setState({
                    decided: snapshot.child(this.state.meetingID).child("decided").val(),
                });
            }
        })

        let idEmails = []
        this.firebaseRef_U.on('value', snapshot => {
            if (snapshot.val() != null) {
                for (const user of Object.entries(snapshot.val())) {
                    idEmails.push(user[1])
                }
                if(snapshot.child("invitations") != null && snapshot.child("invitations").child(this.state.meetingID).child("invEmail").val() != null){
                    this.setState({
                        invEmail: snapshot.child("invitations").child(this.state.meetingID).child("invEmail").val()
                    });
                }
            }
            this.setState({idEmails});
        })
    }


    componentWillUnmount() {
        this.firebaseRef.off();
        this.firebaseRef_U.off();
    }

    sendInvitation(meetingName, email){
        console.log("sendInvitation")
        var http = new XMLHttpRequest();
        var url = 'https://api.emailjs.com/api/v1.0/email/send';
        var data = {
            service_id: 'service_5z6owfz',
            template_id: 'invitation',
            user_id: 'user_afExeUlzmWRabJUP88WuS',
            template_params: {
                'to_email': email,
                'meeting_name': meetingName
            }
        }
        http.open('POST', url, true);
        http.setRequestHeader('Content-type', 'application/json');
        http.onreadystatechange = function() {
            // do something if successful
            if(http.readyState === 4 && http.status === 200) {
            }
            // else not successful
            else {
            }
        }
        http.send(JSON.stringify(data));

    }

    getUserID(event){
        let { send, emails, invEmail, meetingName, meetingID, userIDs, idEmails } = this.state;
        if(send){
            this.setState({send: false})
        }else{
            if (emails.length == 0) {
                return;
            }
            for(const email of emails){
                const isEmail = (element) => element.email == email;
                const index = idEmails.findIndex(isEmail);
                //user has not signed up
                if(index == -1){
                    console.log("user has not signed up")
                    console.log(invEmail)
                    const isEmail = (element) => element == email;
                    const id = invEmail.findIndex(isEmail);
                    if (id == -1) {
                        invEmail.push(email);
                        this.sendInvitation(meetingName, email);
                        this.firebaseRef_U.child("invitations").child(meetingID).update({invEmail});
                    }
                }else{
                    let userID = idEmails[index].id;
                    const isUID = (element) => element == userID;
                    const id = userIDs.findIndex(isUID);
                    if (id == -1) {
                        userIDs.push(userID);
                        this.sendInvitation(meetingName, email);
                    }

                    this.pushToFirebase(event);

                }
            }
            this.setState({
                userIDs: userIDs,
                send: true,
            });

        }

    }

    pushToFirebase(event) {

        const { meetingID, userIDs} = this.state;
        event.preventDefault();

        this.firebaseRef.child(meetingID).update({userIDs});

        //iterate each user and add meeting id
        this.firebaseRef_U.once('value').then((snapshot) => {
            if (snapshot.val() != null){
                for(const uid of userIDs) {
                    if (snapshot.child(uid).val() != null){
                        let meetingIDs = [];
                        if(snapshot.child(uid).child("meetingIDs").val() != null){
                            meetingIDs = snapshot.child(uid).child("meetingIDs").val();
                        }
                        const isID = (element) => element == meetingID;
                        const id = meetingIDs.findIndex(isID);
                        if(id == -1){
                            meetingIDs.push(meetingID);
                        }

                        this.firebaseRef_U.child(uid).update({meetingIDs});
                    }
                }
            }
        });


    }


    render(){
        const { emails, send} = this.state;
        return(
            <div>
                    <div><TabularView
                        meetingID={this.state.meetingID}
                        meetingName={this.state.meetingName}
                        creatorID={this.state.creatorID}
                        userIDs={this.state.userIDs}
                    /></div>
                {this.state.decided ? null:
                    <div>
                        <label className="listObject">Invite participants by entering their email addresses:</label>
                        {send ? <p className="listObject">Invitations sent! </p> :
                        <ReactMultiEmail
                            placeholder="Email"
                            emails={emails}
                            onChange={(_emails: string[]) => {
                                this.setState({ emails: _emails });
                            }}
                            validateEmail={email => {
                                if (isEmail(email) == false) {
                                    alert('Invalid email');
                                }
                                return isEmail(email); // return boolean
                            }}
                            getLabel={(
                                email: string,
                                index: number,
                                removeEmail: (index: number) => void,
                            ) => {
                                return (
                                    <div data-tag key={index}>
                                        {email}
                                        <span data-tag-handle onClick={() => removeEmail(index)}>
                                    ×
                                </span>
                                    </div>
                                );
                            }}
                        />}
                        <button onClick={this.getUserID}>Send Invitation</button>
                    </div>}

            </div>
        );
    }



}

export default Invite;

