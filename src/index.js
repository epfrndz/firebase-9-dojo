import { initializeApp } from 'firebase/app'
import { 
    getFirestore, collection, getDocs,
    addDoc, deleteDoc, doc, onSnapshot,
    query, where,
    orderBy, serverTimestamp,
    getDoc,
    updateDoc,
} from 'firebase/firestore'
import {
    getAuth,
    createUserWithEmailAndPassword,
    signOut,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    FacebookAuthProvider,
    signInWithPopup,
} from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyCQDSOfmFrf_OFWGWByQbMe8prAhpFj54k",
    authDomain: "fir-9-dojo-3dfd3.firebaseapp.com",
    projectId: "fir-9-dojo-3dfd3",
    storageBucket: "fir-9-dojo-3dfd3.appspot.com",
    messagingSenderId: "150731127507",
    appId: "1:150731127507:web:ca44b0cbe8cc34c905f226"
};

// init firebase app
initializeApp(firebaseConfig);

// init services
const db = getFirestore();
const auth = getAuth();

// collection ref
const colRef = collection(db, 'books')

// get collection data
// getDocs(colRef)
//     .then((snapshot) => {
//         let books = [];
//         snapshot.docs.forEach((doc) => {
//             books.push({ ...doc.data(), id: doc.id });
//         });
//         console.log(books);
//     })
//     .catch(err => {
//         console.log(err.message)
//     })

// real time collection data
// onSnapshot(colRef, (snapshot) => {
//     let books = [];
//     snapshot.docs.forEach((doc) => {
//         books.push({ ...doc.data(), id: doc.id });
//     });
//     console.log(books);
// });

// queries
// const q = query(colRef, where("author", "==", "patrick rothfuss"))

// query with real time collection data
// onSnapshot(q, (snapshot) => {
//     let books = [];
//     snapshot.docs.forEach((doc) => {
//         books.push({ ...doc.data(), id: doc.id });
//     });
//     console.log(books);
// });

// sorted/ordered query with real time collection data
// queries
const q = query(colRef, orderBy("createdAt"))

// real time query
const unsubCollection = onSnapshot(q, (snapshot) => {
    let books = [];
    snapshot.docs.forEach((doc) => {
        books.push({ ...doc.data(), id: doc.id });
    });
    console.log(books);
});


// adding documents
const addBookForm = document.querySelector('.add');
addBookForm.addEventListener('submit', (e) => {
    e.preventDefault();

    addDoc(colRef, {
        title: addBookForm.title.value,
        author: addBookForm.author.value,
        createdAt: serverTimestamp(0),
    })
    .then(() => {
        addBookForm.reset();
    })
});

// deleting documents
const deleteBookForm = document.querySelector('.delete');
deleteBookForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const docRef = doc(db, "books", deleteBookForm.id.value);
    deleteDoc(docRef)
        .then(() => {
            deleteBookForm.reset();
        })
})

// get a single document
const docRef = doc(db, 'books', 'ZOgu8S8V6GfIhvVR4ozu');

const unsubDoc = onSnapshot(docRef, (doc) => {
    console.log(doc.data(), doc.id)
})

// updating a document
const updateForm = document.querySelector('.update')
const updateDetailsForm = document.querySelector('.record-details form')

updateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const targetDocRef = doc(db, 'books', updateForm.id.value);
    updateDetailsForm.parentElement.hidden = false;
    let returnedDoc = null;
    getDoc(targetDocRef)
        .then((doc) => {
            returnedDoc = Object.assign({}, doc.data());
            updateDetailsForm.id.value = doc.id;
            updateDetailsForm.title.value = returnedDoc.title;
            updateDetailsForm.author.value = returnedDoc.author;
        })
    updateForm.reset();
})

updateDetailsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const targetDocRef = doc(db, 'books', updateDetailsForm.id.value)
    updateDoc(targetDocRef, {
        title: updateDetailsForm.title.value,
        author: updateDetailsForm.author.value,
    })
    .then(() => {
        updateDetailsForm.reset();
        updateDetailsForm.parentElement.hidden = true;
    })
})

// signing-up users
const signupForm = document.querySelector('form.signup')
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = signupForm.email.value;
    const pw = signupForm.password.value;
    createUserWithEmailAndPassword(auth, email, pw)
        .then((cred) => {
            console.log('user created:', cred.user);
            signupForm.reset();
        })
        .catch((err) => {
            console.log(err.message);
        })
})

// logging in and out

const logoutButton = document.querySelector('button.logout');
logoutButton.addEventListener('click', (e) => {
    e.preventDefault();
    signOut(auth)
        .then(() => {
            console.log('the user is signed out');
        })
        .catch((err) => {
            console.log(err.message);
        })
})


const loginForm = document.querySelector('form.login')
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = loginForm.email.value;
    const password = loginForm.password.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((cred) => {
            console.log('user logged in:', cred.user);
        })
        .catch((err) => {
            console.log(err.message);
        })

})

// subscribing to auth changes
const unsubAuth = onAuthStateChanged(auth, (user) => {
    console.log('user state changed:', user)
})

// unsubscribing from auth changes
const unsubButton = document.querySelector('button.unsub');
unsubButton.addEventListener('click', () => {
    console.log('unsubscribing');
    unsubCollection();
    unsubDoc();
    unsubAuth();
})

// Checking of document exists

const testDocRef = doc(db, 'books', 'rV35Guu1fgcrctL2aLga');
getDoc(testDocRef)
    .then((doc) => {
        if (doc.exists()) {
            console.log('Document details:', doc.data())
        } else {
            console.log('Document does not exist.')
        }
    })
    .catch((err) => {
        console.log(err.message)
    })

// Facebook Login

const fbSigninBtn = document.getElementById('fbSignIn');
const fbProvider = new FacebookAuthProvider();
fbProvider.addScope('user_birthday')
auth.languageCode = 'it';
fbProvider.setCustomParameters({
    'display' : 'popup'
})

fbSigninBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signInWithPopup(auth, fbProvider)
        .then((cred) => {
            console.log(cred)
            const fbUserInfo = cred.user;
            console.log(fbUserInfo.displayName)
            console.log(fbUserInfo.email)
        })
        .catch((err) => {
            console.log(err.message)
        })
});
