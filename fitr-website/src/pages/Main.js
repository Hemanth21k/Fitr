import React, { useEffect } from 'react';
import { auth } from '../firebase.js'
import { useHistory } from 'react-router-dom';

export default function Main() {

    useEffect(() => {
        auth.onAuthStateChanged(user => {
            if (!user) history.push('/auth');
        })
    })
    const history = useHistory();

    const logOut = () => {
        auth.signOut().then(res => {
            history.push('/auth');
            //do something else with res
        }).catch(err => {
            //do something else with err
        })
    }

    return (
        <div className='main'>
            <h1>Hey there, you're logged in!</h1>
            <button onClick={logOut}>Log out</button>
        </div>
    )
}