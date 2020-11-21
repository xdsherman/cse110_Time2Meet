import React, { useEffect, useState} from "react";
import db from "../base";

export const AuthContext = React.createContext();

export const AuthProvider = ({children})=> {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(()=>{
        db.auth().onAuthStateChanged(setCurrentUser);
    },[]);

    return(
        <AuthContext.Provider value={{currentUser}}>
            {children}
        </AuthContext.Provider>
    );
};
/*db.auth().onAuthStateChanged(function(user) {
    if (user) {
        var uid = user.uid;
        this.firebaseRef.child(uid).set({ name,age });
    }
});*/
