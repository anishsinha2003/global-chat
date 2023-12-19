import "./SignIn.css";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const authState = firebase.auth();
function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth.signInWithPopup(provider);
    }
    return (
      <>
        <button onClick={signInWithGoogle}>
            Sign in with google
        </button>
      </>
    )
  }

export default SignIn;