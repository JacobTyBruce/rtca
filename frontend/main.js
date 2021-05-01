const output = document.querySelector(".output-window"),
    statusMessage = document.querySelector(".status-messages"),
    message = document.querySelector(".message"),
    btn = document.querySelector('.btn'),
    warning = document.querySelector('.warning'),
    custom_file = document.querySelector('.custom-file'),
    file = document.querySelector('.file'),
    sidebar_btn = document.querySelector('.sidebar-action'),
    sidebar = document.querySelector('.sidebar'),
    new_msg_win = document.querySelector('.new-msg-win > div'),
    dm_user = document.querySelectorAll('.user')

// sc = socket Client -- maybe move this connection to until after you send a username so we can control how client connects; 
// ALTERNATIVE OPTION --- upon disconnection, halt reconnection and display a button that says reconnect and send a join event
// OR upon disconnection event, halt client VISUALLY from doing anything and set interval to check upon reconnection (there is a prop that returns boolean), once returns true, send join event and resume client
// -- these methods keep username and could keep UUID, but as long as server is updated, a changing UUID should be fine as user should never directly interact with it, but a change in username would confuse other users
var sc = io()

// --- username crap ---
document.querySelector('.username').focus()

var username;

document.querySelector('.username-btn').addEventListener('click', (e) => {
    let user = document.querySelector('.username')
    if ((user.value.length > 2 && user.value.length < 21) && user.value.match(/\S/g)) {
        username = document.querySelector('.username').value;
        sc.emit('join', username)
        document.body.removeChild(document.querySelector('.full-wrapper'))
        warning.classList.remove('active')
        let p = document.createElement("p");
        var text = document.createTextNode(" You joined the chat!")
        p.appendChild(text)
        p.classList.add('alert')
        output.append(p)
    } else {
        addAlert("Your name must be between 3 and 20 characters!");
    }
})

document.querySelector('.username').addEventListener('keydown', (e) => {
    if (e.code == 'Enter') {
        let user = document.querySelector('.username')
        if ((user.value.length > 2 && user.value.length < 21) && user.value.match(/\S/g)) {
            username = document.querySelector('.username').value;
            sc.emit('join', username)
            document.body.removeChild(document.querySelector('.full-wrapper'))
            warning.classList.remove('active')
            let p = document.createElement("p");
            var text = document.createTextNode(" You joined the chat!")
            p.appendChild(text)
            p.classList.add('alert')
            output.append(p)
        } else {
            addAlert("Your name must be between 3 and 20 characters!");
        }
    }
})

// --- End Username ---

// Global Functions & vars

function addMessage(data, type) {
    let p = document.createElement("p");
    
    if (type == 'join') {
        let text = document.createTextNode(data+" has joined the chat!")
        p.appendChild(text)
        p.classList.add('alert')
        output.append(p)
    }
    if (type == 'leave') {
        let text = document.createTextNode(data+" has left the chat!")
        p.appendChild(text)
        p.classList.add('alert')
        output.append(p)
    }
    if (type == 'content' && data.hasOwnProperty('message')) {
        let text = document.createTextNode(data.user+": "+data.message);
        p.appendChild(text)
        p.classList.add(type)
        output.append(p)
    }
    // currently only has image support -- add support for other files/downloads later -- i.e. make custom previews depending on type
    if (data.hasOwnProperty('file')) {
        output.append(document.createTextNode(data.user))
        let img = document.createElement('img')
        img.src = data.file
        img.classList.add('image')
        output.append(img)
    }
    warning.classList.remove('active')
    output.scrollTop = output.scrollHeight
}

function addAlert(message) {
    warning.innerHTML = ""
    let text = document.createTextNode(message);
    warning.append(text);
    warning.classList.add('active')
}

async function convertImage(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.onloadend = () => {
             resolve(reader.result);
        }
        reader.onerror = () => {reject(undefined)};
        reader.readAsDataURL(file);
    })
    
}

// checks if dm user array has message alreadt with user passed in
function hasMessage(user) {

}

var usersOnlineArr;

/* dm struct:
    {
        username: [array of messages],
        username2: [more messages]
    }
*/

var dm_messages = {}

// Event Listener Hell

file.addEventListener('change', async (e) => {
    console.log(file.files)
    let img = await convertImage(file.files[0])
    console.log(getComputedStyle(document.documentElement).getPropertyValue("--file-bg-img"))
    let bg = `url("${img}")`;
    document.documentElement.style.setProperty("--file-bg-img", bg)
    console.log(getComputedStyle(document.documentElement).getPropertyValue("--file-bg-img"))
})

btn.addEventListener('click', async (e) => {

    let uploadFile;
    if (file.files.length > 0) {
        uploadFile = await convertImage(file.files[0])
    }

    if (message.value.match(/./g) || file.files.length > 0) {
        if (message.value.match(/./g) && file.files.length > 0) {
            sc.emit("message", {user: username, message: message.value, file: uploadFile})
            addMessage({user: username, message: message.value, file: uploadFile}, 'content')
        }
        if (!(message.value.match(/./g)) && file.files.length > 0) {
            sc.emit("message", {user: username, file: uploadFile})
            addMessage({user: username, file: uploadFile}, 'content')
        }
        if (message.value.match(/./g) && !(file.files.length > 0)) {
            sc.emit("message", {user: username, message: message.value})
            addMessage({user: username, message: message.value}, 'content')
        }
        e.preventDefault
        message.value = "";
        file.value = null;
        console.log(uploadFile)
    } else {
        addAlert("Your message must be at least 1 character long or contain a file!")
        message.value = ""
    }
    
})

message.addEventListener('keyup', (e) => {
    if (e.code == 'Enter') {
        console.log(message.value, message.value.length)
        if (message.value.match(/./g) || file.files.length > 0) {
            sc.emit("message", {user: username, message: message.value})
            e.preventDefault
            addMessage({user: username, message: message.value}, 'content')
            message.value = "";
        } else {
            addAlert("Your message must be at least 1 character long or contain a file!")
            message.value = ""
        }
    }
})

btn.addEventListener('mouseover', (e) => {
    if (message.value.match(/./g) || file.files.length > 0) {
        e.target.classList.remove('bad-input')
        e.target.classList.add('good-input')
    } else {
        e.target.classList.remove('good-input')
        e.target.classList.add('bad-input')
        e.target.title = "Please enter a message or upload a file"
    }
})

var sidebar_open = false;

sidebar_btn.addEventListener('mousedown', (e) => {
    if (!sidebar_open) { sidebar.classList.add('sidebar-open'); sidebar_open = true; return; }
    if (sidebar_open) { sidebar.classList.remove('sidebar-open'); sidebar_open = false; return; }
})

document.querySelector('.sidebar ul li').addEventListener('mousedown', (e) => {
    // find better solution here
    console.log("Here are the other User's UUIDs: \n")
    usersOnlineArr.forEach(user => { console.log(user)})
    let uuid = prompt("User's UUID")
    console.log("Sending DM")
    // fix this monstrosity later, horrible solution
    if (e.target.innerHTML == "DM's") { sc.emit('dm', {users: [uuid, username], message: "Hello!"}) }
})

// Socket Events & vars

// move this print users function to its own global function because users have to be redrawn on user leave/join/reconnect ---- note: users rejoin w/ same uuid
sc.on('usersOnline', (usersOnline) => {
    console.log('Users')
    document.querySelector('.users-online').innerHTML = usersOnline.length
    usersOnline.forEach((user) => {
        if (user.username != username) {
            let p = document.createElement('p');
            let text = document.createTextNode(user.username)
            p.append(text)
            p.dataset.uuid = user.id
            p.classList.add('user')
            let newElm = new_msg_win.appendChild(p)
            newElm.addEventListener("click", (e) => {
                let newMsg = prompt("Enter the message to send to " + user.username);
                if ()

            })
        }
    })
    dm_users = document.querySelectorAll('.user')

})

sc.on("join", ([name, usersOnline]) => {
    usersOnlineArr = usersOnline;
    document.querySelector('.users-online').innerHTML = usersOnline.length
    addMessage(name, 'join')
})

sc.on('leave', ([name, usersOnline]) => {
    usersOnlineArr = usersOnline;
    document.querySelector('.users-online').innerHTML = usersOnline.length
    addMessage(name, 'leave')
})

sc.on('message', (data) => {
    addMessage(data, 'content')
})

sc.on('dm', ([from, message]) => {
    console.log("DM Received")
    addAlert("You got a DM from " + from + ": " + message)
    setTimeout(() => { warning.classList.remove('active') }, 2500)
})

// don't want to implement Manager to listen for reconnect, but maybe in the future
// with the disconnect method as well, if you can't reconnect it will have the disconnect reason to display to the user
sc.on('disconnect', () => {
    console.log('Disconnect from Server')
    let check = setInterval(() => {
        if (sc.connected == true) {
            console.log('Reconnected - Sending Name Back to Server')
            sc.emit('reconnect', username)
            clearInterval(check)
        } else { console.log("Disconnected") }
    }, 500);
})