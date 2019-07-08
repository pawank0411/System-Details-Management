
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      document.getElementById('login').style.display = 'none';
      document.getElementById('logout').style.display = 'block';
    } else {
      // No user is signed in.
      document.getElementById('login').style.display = 'block';
      document.getElementById('logout').style.display = 'none';
    }
  });

document.getElementById('login_b').onclick = function (){

    var email = document.getElementById('username').value;
    var pass = document.getElementById('Password').value;

    firebase.auth().signInWithEmailAndPassword(email, pass).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        window.alert('Error' + ':' + errorMessage);
        // ...
      });
}

document.getElementById('logout_b').onclick = function (){
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        var email = document.getElementById('username').value = '';
        var pass = document.getElementById('Password').value = '';
    
        window.alert('SignOut Successful');
      }).catch(function(error) {
        // An error happened.
        var errorCode = error.code;
        var errorMessage = error.message;
        window.alert('Error' + ':' + errorMessage);
      });
      
}