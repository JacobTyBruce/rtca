const output = document.querySelector(".output-window"),
    statusMessage = document.querySelector(".status-messages"),
    message = document.querySelector(".message"),
    btn = document.querySelector('.btn'),
    warning = document.querySelector('.warning'),
    file = document.querySelector('.file'),
    sidebar_btn = document.querySelector('.sidebar-action'),
    sidebar = document.querySelector('.sidebar')

// sc = socket Client
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

// Global Functions

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
       let dataUrl;
        let reader = new FileReader()
        reader.onloadend = () => {
            dataUrl = reader.result
             resolve(dataUrl);
        }
        reader.onerror = () => {reject(undefined)};
        reader.readAsDataURL(file);
    })
    
}

// Event Listener Hell 

btn.addEventListener('click', async (e) => {

    let uploadFile;
    if (file.files.length > 0) { uploadFile = await convertImage(file.files[0]) }

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
    if (e.target.innerHTML == 'dm') { sc.emit('send-dm', "Request to send DM, Hello!") }
})

// Socket Events 

sc.on('usersOnline', (usersOnline) => {
    console.log('Users')
    document.querySelector('.users-online').innerHTML = usersOnline.length
})

sc.on("join", ([name, usersOnline]) => {
    document.querySelector('.users-online').innerHTML = usersOnline.length
    addMessage(name, 'join')
})

sc.on('leave', ([name, usersOnline]) => {
    document.querySelector('.users-online').innerHTML = usersOnline.length
    addMessage(name, 'leave')
})

sc.on('message', (data) => {
    addMessage(data, 'content')
})

sc.on('dm', (data) => {
    console.log(data)
})