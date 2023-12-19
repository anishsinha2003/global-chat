import './App.css';
import { useState, useEffect } from 'react';
import SendIcon from '@mui/icons-material/Send';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import logo from './images/logo.png'
import googleLogo from './images/googleLogo.png'
import githubLogo from './images/github-logo.png'
import anonLogo from './images/anon-logo.png'

import { GithubAuthProvider } from 'firebase/auth';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

const pages = ['Sign Out'];

// from firebase
firebase.initializeApp({
  apiKey: "AIzaSyA5JV5aFllckcTvaB3h2wmREeyh5nXLGf4",
  authDomain: "global-chat-system.firebaseapp.com",
  projectId: "global-chat-system",
  storageBucket: "global-chat-system.appspot.com",
  messagingSenderId: "629728286026",
  appId: "1:629728286026:web:84c58bc6142515da59ddb3",
  measurementId: "G-1GJEFS6M9N"

})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div>
      {user ? <Chatroom /> : <SignIn />}
    </div>
  );
}

function Chatroom() {

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, {idField: 'id'});

  const [messageToSend, setMessageToSend] = useState("");

  // whenever new message has been added to firebase, scroll to bottom of chatbox
  useEffect(() => {
    let messageBoxScroll = document.getElementById("message-box");
    messageBoxScroll.scrollTop = messageBoxScroll.scrollHeight;

  }, [messages]);
  // when message submit is clicked, this func is called
  const sendMessage = async(e) => {
    const uid = auth.currentUser.uid;
    const photoURL = auth.currentUser.photoURL;
    // writes the new data (message) to the database
    await messagesRef.add({
      text: messageToSend,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,

    })
    setMessageToSend('');

    // scroll to the bottom of chat box
    let messageBoxScroll = document.getElementById("message-box");
    messageBoxScroll.scrollTop = messageBoxScroll.scrollHeight;
  }

  console.log(messages);
  // if person presses enter instead of submit button
  function handleEnter(event) {
    if (event.key === 'Enter') {
      sendMessage(event);
    }
  }
  let photoURL = auth.currentUser.photoURL;
  if (photoURL === null) {
    photoURL = anonLogo;
  }

  return (
    <>
      <div className="App">
        <div className='stars'></div>
        <Navbar photoURL={photoURL}/>
        <div className="all-messages-container" id='message-box'>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
        </div>
        <div className='message-send'>
          <input
            value={messageToSend}
            className="input"
            placeholder="Type your message here"
            onKeyDown={event => handleEnter(event)}
            onChange={event => setMessageToSend(event.target.value)}
          />
          <button className="button" onClick={sendMessage}><SendIcon/></button>
        </div>
      </div>
    </>
  )
}

function ChatMessage(props) {
  let userSentMessage = false;

  let {text, uid, createdAt, photoURL} = props.message;
  if (uid === auth.currentUser.uid) {
    userSentMessage = true;
  }

  if (photoURL === null) {
    photoURL = anonLogo;
  }

  return (
    <>
      <br/>
      {userSentMessage === false
      ? <>
        <MessageLeft
          message={text}
          timestamp={getTimeStampString(createdAt)}
          photoURL={photoURL}
        />
        <br/><br/>
      </>
      : <>
        <MessageRight
          message={text}
          timestamp={getTimeStampString(createdAt)}
          photoURL={photoURL}
        />
        <br/><br/>
      </>
      }
    </>
  )
}

function SignIn() {
  const signInWithGoogle = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
  }

  const signInWithGithub = () => {
    const provider = new firebase.auth.GithubAuthProvider();
    auth.signInWithPopup(provider)
      .then((result) => {
        GithubAuthProvider.credentialFromResult(result);
      })
  }
  const mySignInAnonymously = () => {
    auth.signInAnonymously();
  }
  return (
    <div className='sign-in-container'>
      <div className='stars'></div>
      <img src={logo} className='logo' alt="logo"/>
      <div className='sign-in-item'>
        <span className='sign-in-title'>
          Welcome to Global Chat!
        </span>
        <br/>
        <button onClick={signInWithGoogle} className='sign-in-button-google'>
          <img src={googleLogo} className='google-logo' alt="logo"/>
          <span>Continue with Google</span>
        </button>
        <br/><br/>
        <button onClick={signInWithGithub} className='sign-in-button-github'>
          <img src={githubLogo} className='github-logo' alt="logo"/>
          <span>Continue with Github</span>
        </button>
        <br/><br/>
        <button onClick={mySignInAnonymously} className='sign-in-button-anonymous'>
          <img src={anonLogo} className='anonymous-logo' alt="logo"/>
          <span>Continue as Guest</span>
        </button>
      </div>
    </div>
  )
}

const MessageLeft = (props) => {
  return (
    <div className='message-left-container'>
      <img src={props.photoURL} className='message-photo-left' alt='profile-pic'/> &nbsp;&nbsp;&nbsp;&nbsp;
      <div className='message-left'>
        <p className='message-text-left'>
          {props.message}
        </p>
        <p className='message-timestamp-left'>
          {props.timestamp}
        </p>
      </div>
    </div>
  )
}

const MessageRight = (props) => {
  return (
    <div className='message-right-container'>
      <div className='message-right'>
        <p className='message-text-right'>
          {props.message}
        </p>
        <p className='message-timestamp-right'>
          {props.timestamp}
        </p>
      </div>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <img src={props.photoURL} className='message-photo-right' alt='profile-pic'/>
    </div>
  )
}

const Navbar = (props) => {

  return (
    <AppBar position="static" sx={{backgroundColor:"#A0D7ED",  boxShadow: "1px 5px 10px grey" }}>
      <Container maxWidth="xl">
        <Toolbar>
          <img src={logo} className='logo-nav-bar' alt="logo-for-nav"/>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                sx={{
                  letterSpacing: '.1rem',
                  fontWeight: 600,
                  fontSize: 17,
                  color: 'black',
                  display: 'block',
                  position: 'relative',
                  left: '-310px',
                    '&:hover': {
                      backgroundColor: '#15529D',
                      color: 'white',
                    }
                  }}
                  onClick={() => auth.signOut()}
              >
                {page}
              </Button>
            ))}
          </Box>
          <img src={props.photoURL} className='navbar-profile-photo' alt="profile"/>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
// helper
function getTimeStampString(createdAt) {
  if (!createdAt || createdAt.seconds === null || createdAt.nanoseconds === null) {
    return "";
  }
  const date = new Date(createdAt.seconds * 1000 + createdAt.nanoseconds / 1e6);

  const dateString = date.toLocaleDateString();
  const timeString = date.toLocaleTimeString();

  return `${dateString} ${timeString}`;
}
export default App;

