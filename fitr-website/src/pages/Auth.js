import React, { useEffect, useState } from 'react';
import { auth } from '../firebase.js'
import SignIn from "../components/Signin.js"
import SignUp from "../components/Signup.js"

import { useHistory } from 'react-router-dom';


export default function Auth() {

    const history = useHistory();
    const [authType, setAuthType] = useState('signIn');

    useEffect(() => {
        auth.onAuthStateChanged(user => {
            if (user) history.push('/main')
        })
    }, [])

    return (
        <div>
            {authType === 'signIn' ?
                <div>
                    <SignIn />
                    <p>New user? <span onClick={() => setAuthType('signUp')}>Create account.</span></p>
                </div>
                :
                <div>
                    <SignUp />
                    <p>Have an account? <span onClick={() => setAuthType('signIn')}>Sign In.</span></p>
                </div>
            }
        </div>
    )
}