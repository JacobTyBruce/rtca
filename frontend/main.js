const output = document.querySelector(".output-window"),
    statusMessage = document.querySelector(".status-messages"),
    message = document.querySelector(".message"),
    btn = document.querySelector('.btn'),
    warning = document.querySelector('.warning'),
    file = document.querySelector('.file');

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

function addMessage(data, type) {
    let p = document.createElement("p");
    if (type == 'alert') {
        let text = document.createTextNode(data+" has joined the chat!")
        p.appendChild(text)
        p.classList.add(type)
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

sc.on("join", (name) => {
    console.log('User Joined')
    console.log(name)
    addMessage(name, 'alert')
})

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

sc.on('message', (data) => {
    addMessage(data, 'content')
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