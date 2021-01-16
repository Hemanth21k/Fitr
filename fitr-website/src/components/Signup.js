import React, { useState, useEffect } from 'react';
import { auth } from '../firebase.js'
import { useHistory } from 'react-router-dom'

export default function SignUp() {
    const history = useHistory();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signUp = () => {
        auth.createUserWithEmailAndPassword(email, password).then(res => {
            history.push('/main');
        }).catch(err => {
            // do sumn
        })
    }

    useEffect(() => {
        auth.onAuthStateChanged(user => {
            if (user) history.push('/main')
        })
    }, [])

    return (
        <div>
            <h1>Register your account</h1>
            <input type="text" placeholder="Enter your email" value={email} onChange={e => setEmail(e.currentTarget.value)} />
            <input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.currentTarget.value)} />
            <button onClick={signUp}>Sign Up</button>
        </div>
    )
}