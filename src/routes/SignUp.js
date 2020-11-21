import React, { useCallback } from "react";
import db from "../base";
import '../App.css';

const SignUp = ({ history }) => {

    const handleSignUp = (event) => {
        console.log("Hello");
        event.preventDefault();
        const { email, password } = event.target.elements;

        try{
            db
                .auth()
                .createUserWithEmailAndPassword(email.value,
                    password.value);
            history.push("/");
        } catch(error){
            alert(error);
        }
    }

    const redirectLogIn = () =>{
        history.push("/")
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
                    <input name="preffered_name" type="preferred_name" placeholder="Preferred name" />
                </label>
                <button type="submit" > Sign Up</button>
                </form>
            <button onClick={redirectLogIn}>Log In</button>
        </div>
    );

};

export default SignUp;