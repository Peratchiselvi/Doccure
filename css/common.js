
function passtoggle() {
    var state = document.getElementById("password");
    var icon = document.getElementById("icon");
    if (state.type == "password") {
        state.type = "text";
        icon.className = "fa fa-eye-slash";
    }
    else {
        state.type = "password";
        icon.className = "fa fa-eye";
    }
}
function passvalidate(){
    var pass = document.getElementById("password").value;
    var conpass = document.getElementById("confirmpassword").value;
    if(pass == conpass){
        return;
    }
    else{
        alert("Passwords are not same!");
    }
}