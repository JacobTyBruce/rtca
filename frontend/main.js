const output = document.querySelector(".output-window"),
    statusMessage = document.querySelector(".status-messages"),
    message = document.querySelector(".message"),
    btn = document.querySelector('.btn'),
    warning = document.querySelector('.warning')

// sc = socket Client
var sc = io()

const username = prompt('Pick A Name')

window.addEventListener("beforeunload", function(e){
    // Do something
    e.preventDefault();
 }, false);

sc.emit('join', username)

function addMessage(data, type) {
    let p = document.createElement("p");
    if (type == 'alert') { var text = document.createTextNode(data+" has joined the chat!") }
    if (type == 'content') { var text = document.createTextNode(data.user+": "+data.message) }
    p.appendChild(text)
    p.classList.add(type)
    output.append(p)
    warning.classList.remove('active')
}

function addAlert(message) {
    warning.innerHTML = ""
    let text = document.createTextNode(message);
    warning.append(text);
    warning.classList.add('active')
}

sc.on("join", (name) => {
    console.log('User Joined')
    addMessage(name, 'alert')
})

btn.addEventListener('click', (e) => {
    console.log(message.value, message.value.length)
    if (message.value.length > 0 && message.value.match(/./g)) {
        sc.emit("message", {user: username, message: message.value})
        e.preventDefault
        addMessage({user: username, message: message.value}, 'content')
        message.value = "";
    } else {
        addAlert("Your message must be at least 1 character long!")
        message.value = ""
    }
    
})

message.addEventListener('keyup', (e) => {
    if (e.keyCode == 13) {
        console.log(message.value, message.value.length)
        if (message.value.match(/./g)) {
            sc.emit("message", {user: username, message: message.value})
            e.preventDefault
            addMessage({user: username, message: message.value}, 'content')
            message.value = "";
        } else {
            addAlert("Your message must be at least 1 character long!")
            message.value = ""
        }
    }
})

sc.on('message', (data) => {
    addMessage(data, 'content')
})