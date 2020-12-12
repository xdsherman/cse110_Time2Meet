import React, { useCallback } from "react";
import db from "../base";
import "./style/signup.css";
import logo from "./resource/time2meet_logo.png";

const SignUp = ({ history }) => {

    const handleSignUp = (event) => {
        event.preventDefault();
        const { email, password,preferred_name } = event.target.elements;
        let meetingIDs = [];
        let userIDs = [];
        try{
            db
                .auth()
                .createUserWithEmailAndPassword(email.value,
                    password.value).then(function(user){
                db.auth().currentUser.updateProfile({
                    displayName: preferred_name.value
                });

                db.database().ref("UserInfo").child(db.auth().currentUser.uid).set({
                    id: db.auth().currentUser.uid,
                    name: preferred_name.value,//db.auth().currentUser.displayName,
                    email: db.auth().currentUser.email,//db.auth().currentUser.email
                })

                db.database().ref("UserInfo").once('value').then((snapshot) => {
                    if (snapshot.val() != null && snapshot.child("invitations").val()!= null) {
                        if(snapshot.child(db.auth().currentUser.uid) != null && snapshot.child(db.auth().currentUser.uid).child("meetingIDs").val()!= null){
                            meetingIDs = snapshot.child(db.auth().currentUser.uid).child("meetingIDs").val();
                        }
                        let invitations = Object.entries(snapshot.child("invitations").val());
                        let datasnapshot = snapshot.child("invitations").val()
                        console.log(invitations)
                        console.log(datasnapshot)
                        for (const id in invitations) {
                            console.log(id);

                            const meetingID = invitations[id];
                            //meetingID[0] is the meeting id
                            //meetingID[1] is the array of {'ivEmail' : ...}
                            //meetingID[1].invEmail is the array of emails
                            //console.log(meetingID[0])
                            //console.log(meetingID[1])
                            //console.log(meetingID[1].invEmail)
                            const isEmail = (element) => element == db.auth().currentUser.email;
                            const index = meetingID[1].invEmail.findIndex(isEmail);
                            if(index !== -1){
                                meetingIDs.push(meetingID[0]);
                                db.database().ref("meetings").once('value').then((snapshot) => {
                                    if (snapshot.val() != null && snapshot.child(meetingID[0]).val() != null) {
                                        if(snapshot.child(meetingID[0]).child("userIDs").val() != null){
                                            userIDs= snapshot.child(meetingID[0]).child("userIDs").val();
                                        }
                                    }
                                    //console.log("current");
                                    //console.log(userIDs);
                                    userIDs.push(db.auth().currentUser.uid);
                                    db.database().ref("meetings").child(meetingID[0]).update({userIDs});
                                })
                                //console.log(invitations[id])
                                datasnapshot[meetingID[0]].invEmail.splice(index, 1);
                                //invitations[id][1].invEmail.splice(index, 1);
                            }
                        }

                        //console.log(invitations.values())
                        db.database().ref("UserInfo/").update({invitations: datasnapshot});
                        db.database().ref("UserInfo/"+db.auth().currentUser.uid).update({meetingIDs});
                    }
                })
            }).catch(function(error) {
                alert(error["message"]);
                history.push("/signup");
            });
            history.push("/");

        } catch(error){
            alert(error);
        }
    }



    const redirectLogIn = () =>{
        history.push("/")
    }
    return (
		<form className="login" onSubmit={handleSignUp}>
			<img src={logo} alt=""></img>
			<input type="text" name="email" placeholder="user email" />
			<input type="password" name="password" placeholder="password" />
			<input type="text" name="preferred_name" placeholder="preferred name" />
			<input type="submit" value="Sign Up"></input>
			<div className="link" onClick={redirectLogIn}>
				Already have an account? Log in
			</div>
		</form>
	);

};

export default SignUp;