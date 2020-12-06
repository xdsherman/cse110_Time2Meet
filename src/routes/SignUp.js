import React, { useCallback } from "react";
import db from "../base";
import '../App.css';

const SignUp = ({ history }) => {

    const handleSignUp = (event) => {
        event.preventDefault();
        const { email, password,preferred_name } = event.target.elements;
        let meetingIDs = []
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
                    //meeting: []
                })

                db.database().ref("UserInfo").once('value').then((snapshot) => {
                    if (snapshot.val() != null && snapshot.child("invitations").val()!= null) {
                        for (const meetingID of Object.entries(snapshot.child("invitations").val())) {
                            const isEmail = (element) => element == db.auth().currentUser.email;
                            console.log(meetingID[1])
                            console.log(typeof(meetingID[1]))
                            const index = meetingID[1].invEmail.findIndex(isEmail);
                            if(index !== -1){
                                meetingIDs.push(meetingID[0])
                            }
                        }
                        db.database().ref("UserInfo/"+db.auth().currentUser.uid).update({meetingIDs});

                    }


                })

                    }).catch(function(error) {
               console.log(error);
            });

            history.push("/");



        } catch(error){
            alert(error);
        }
    }



    const redirectLogIn = () =>{
        history.push("/login")
    }
    return(
        <div className="centered">
            <h1>Sign Up</h1>
            <form onSubmit={handleSignUp}>
                <label>
                    Email
                    <input name="email" type="email" placeholder="Email" />
                </label>
                <label>
                    Password
                    <input name="password" type="password" placeholder="Password" />
                </label>
                <label>
                    Preferred Name
                    <input name="preferred_name" type="preferred_name" placeholder="Preferred name" />
                </label>
                <button type="submit" > Sign Up</button>
                </form>
            <button onClick={redirectLogIn}>Log In</button>
        </div>
    );

};

export default SignUp;
