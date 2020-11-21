import React, {useContext} from "react";
import db from "../base";
import '../App.css';

const ForgotPassword = ({ history }) => {

    const handleForgotPassword = (event) => {
        //console.log("Hello");
        event.preventDefault();
        const {email} = event.target.elements;
        try{
            db
                .auth()
                .sendPasswordResetEmail(email.value);
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
            <h1>Forgot Password</h1>
            <form onSubmit={handleForgotPassword}>
                <label>
                    Email
                    <input name="email" type="email" placeholder="Enter Email" />
                </label>
                <button type="submit" > Send Email</button>
            </form>

            <button onClick={redirectLogIn}>Log In</button>
        </div>
    );

};

export default ForgotPassword;