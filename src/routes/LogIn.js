import React, {useContext} from "react";
import "./style/login.css";
import logo from "./resource/time2meet_logo.png";

import {AuthContext} from "../auth/Auth";
import { Redirect } from "react-router-dom";
import db , { provider2 } from "../base"
const Login = ({history}) => {

    const handleLogin = (event) => {
        event.preventDefault();
        const { email, password } = event.target.elements;

        try{
            db
                .auth()
                .signInWithEmailAndPassword(email.value,
                    password.value)
                    .catch(function(error) {
                        alert(error["message"]);
                        history.push("/signup");
                    });
            history.push("/");
        } catch(error){
            alert(error["message"]);
        }
    }
    const handleLoginWithGoogle = () => {
        let meetingIDs = [];
        let userIDs = [];
        try{
            db
                .auth()
                .signInWithPopup(provider2).then(function(user){
                    if (user.additionalUserInfo.isNewUser){
                db.database().ref("UserInfo").child(db.auth().currentUser.uid).set({
                    id: db.auth().currentUser.uid,
                    name: db.auth().currentUser.displayName,//db.auth().currentUser.displayName,
                    email: db.auth().currentUser.email,//db.auth().currentUser.email
                })}
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
                                    userIDs.push(db.auth().currentUser.uid);
                                    db.database().ref("meetings").child(meetingID[0]).update({userIDs});
                                })
                                datasnapshot[meetingID[0]].invEmail.splice(index, 1);
                            }
                        }

                        db.database().ref("UserInfo/").update({invitations: datasnapshot});
                        db.database().ref("UserInfo/"+db.auth().currentUser.uid).update({meetingIDs});
                    }
                })
            }).catch(function(error) {
                alert(error["message"]);
            });
            history.push("/");
        } catch (error){
            alert(error["message"]);
        }
    }

    const redirectSignUp = () => {
        history.push("/signup")
    }
    const redirectForgotPassword = () => {
        history.push("/forgotpassword")
    }

    const { currentUser } = useContext(AuthContext);
    if (currentUser) {
        return <Redirect to="/" />;
    }

    return (
		<form className="login" onSubmit={handleLogin}>
			<img src={logo} alt=""></img>
			<input name="email" type="text" placeholder="user email" />
			<input name="password" type="password" placeholder="password" />
			<div className="link" onClick={redirectForgotPassword}>
				Forget Password
			</div>
			<input type="submit" value="Log In"></input>
			<div className="link" onClick={redirectSignUp}>
				Don't have an account? Sign Up
			</div>
			<hr />
			<div className="text">Or</div>
			<div className="g-sign-in-button" onClick={handleLoginWithGoogle}>
				<div className="content-wrapper">
					<div className="logo-wrapper">
						<img
							src="https://developers.google.com/identity/images/g-logo.png"
							alt=""
						></img>
					</div>
					<span className="text-container">
						<span>Sign in with Google</span>
					</span>
				</div>
			</div>
		</form>
	);
};

export default Login;