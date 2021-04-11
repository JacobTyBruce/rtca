const output = document.querySelector(".output-window"),
    statusMessage = document.querySelector(".status-messages"),
    message = document.querySelector(".message"),
    btn = document.querySelector('.btn')


// sc = socket Client
var sc = io()

sc.emit('join', prompt('Pick A Name'))

sc.on("join", (name) => {
    console.log('User Joined')
    let h1 = document.createElement("h1");
    let text = document.createTextNode(name+" has joined the chat!")
    h1.appendChild(text)
    h1.classList.add('content')
    output.append(h1)
})