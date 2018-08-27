import firebase from 'firebase'

const config = {
    apiKey: "AIzaSyDrwFzYNLjQEOMp5qNw0ISjOQOwHMq9XIQ",
    authDomain: "groupproject2-31ab2.firebaseapp.com",
    databaseURL: "https://groupproject2-31ab2.firebaseio.com",
    projectId: "groupproject2-31ab2",
    storageBucket: "groupproject2-31ab2.appspot.com",
    messagingSenderId: "1094329325836"
};

firebase.initializeApp(config);

export default firebase;