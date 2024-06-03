const firebaseConfig = {
  apiKey: "AIzaSyCFvOzrV-myLS75nw4mEeC483AL_jcdfII",
  authDomain: "portfolio-form-76fe2.firebaseapp.com",
  databaseURL: "https://portfolio-form-76fe2-default-rtdb.firebaseio.com",
  projectId: "portfolio-form-76fe2",
  storageBucket: "portfolio-form-76fe2.appspot.com",
  messagingSenderId: "399689300892",
  appId: "1:399689300892:web:a8ee533ca7f691753be659"
};

// initialize firebase
firebase.initializeApp(firebaseConfig);

// reference your database
var contactFormDB = firebase.database().ref("PortfoliocontactForm");  // modal table name

document.getElementById("contactForm").addEventListener("submit", submitForm);

function submitForm(e) {
  e.preventDefault();

  var name = getElementVal("name");
  var emailid = getElementVal("emailid");
  var msgContent = getElementVal("msgContent");

  saveMessages(name, emailid, msgContent);

  
  console.log(name,emailid,msgContent )
  // Show toast message
  showToast();
  
  // reset the form after submitting 

  document.getElementById("contactForm").reset();
    
}

const saveMessages = (name, emailid, msgContent) => {
  var newContactForm = contactFormDB.push();

  newContactForm.set({
    name: name,
    emailid: emailid,
    msgContent: msgContent,
  });
};

const getElementVal = (id) => {
  return document.getElementById(id).value;
};


// function for toast msg 

const showToast = () => {
    var x = document.getElementById("toast");
    x.className = "toast show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
  };