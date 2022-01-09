const db = firebase.firestore()
const auth = firebase.auth()

const signInWithGoogleBtn = document.getElementById('signInWithGoogleButton');
const signInWithGithubBtn = document.getElementById('signInWithGithubButton');
const signInWithTwitterBtn = document.getElementById('signInWithTwitterButton');

const googleProvider = new firebase.auth.GoogleAuthProvider();
const githubProvider = new firebase.auth.GithubAuthProvider();
const twitterProvider = new firebase.auth.TwitterAuthProvider();

auth.onAuthStateChanged(user => {
    if (user) {
        window.location = 'index.html'
    } else {
        signInWithGoogleBtn.onclick = () => {
            auth.signInWithPopup(googleProvider)
        }

        signInWithGithubBtn.onclick = () => {
            auth.signInWithPopup(githubProvider)
        }

        signInWithTwitterBtn.onclick = () => {
            auth.signInWithPopup(twitterProvider)
        }
    }
})