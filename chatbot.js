// NOTE that the API endpoints that we use are
// - /api/generate
// - /api/tags  (later on, to get the list of models)

const SERVERS = [

    // this one is fast because it has GPUs
    {
        name: "GPU fast", url: "https://ollama-sam.inria.fr",
        // not given here as this is a public repo...
        username: "xxx", password: "xxx",
    },

    // this one is slow because it has no GPUs
    {
        name: "CPU slow", url: "https://ollama.pl.sophia.inria.fr",
        // not given here as this is a public repo...
        username: "xxx", password: "xxx",
        // start with this one as the default
        default: true,
    },
]


// we provide some reasonable defaults
// for the initial steps of the project
// however in the final release the list of models
// should be fetched at the server too
// NOTE: that if you receive a 404 answer
// this might actually mean the model is not available
const MODELS = [
    "gemma2:2b",
    "mistral:7b",
    "deepseek-r1:7b",
]


window.addEventListener('DOMContentLoaded',
    (event) => {

        //// utility functions - optional and for convenience only

        // fill the dropdown to choose the model
        // the starter code uses the MODELS constant to populate the dropdown
        // however a more elaborate solution would be to fetch the list of models
        // from the server at the /api/tags endpoint
        const populateModels = (models) => {
            // console.log("populating models", models)
            const modelRoot = document.getElementById("model")
            // clean up the dropdown
            while (modelRoot.firstChild)
                modelRoot.removeChild(modelRoot.firstChild)
            for (const model of models) {
                const option = new Option(model, model)
                modelRoot.appendChild(option)
            }
        }

        // add incoming messages to the chat
        const addMessage = (text) => {
            const messages = document.getElementById("messages")
            const message = document.createElement('div')
            message.innerText = text
            messages.appendChild(message)
        }
        const appendChunk = (text) => {
            document.getElementById("messages").lastChild.innerText += text
        }

        // enable / disable the send button
        const enableSend = () => {
            document.getElementById("send").disabled = false
        }
        const disableSend = () => {
            document.getElementById("send").disabled = true
        }

        // fill the dropdown to choose the server
        const setURLOptions = () => {
            for (const server of SERVERS) {
                const option = new Option(server.name, server.url)
                document.getElementById("server-name").appendChild(option)
                if (server.default) {
                    document.getElementById("server-name").value = server.url
                }
            }
        }

        // and locate the currently selected server specification
        const currentServer = () => {
            const url = document.getElementById("server-name").value
            for (const server of SERVERS) {
                if (server.url === url) {
                    return server
                }
            }
        }


        // your code goes here

        const sendPrompt = async (event) => {
            // needed because we use a form
            // it prevents the form from being submitted
            event.preventDefault()

            // xxx your code goes here
            console.log("sendPrompt - WIP -- your code is needed here ...")
        }


        document.getElementById("streaming").checked = true
        setURLOptions()
        populateModels(MODELS)
        document.getElementById("send").addEventListener("click", sendPrompt)

        // convenience for development
        // if you are debugging a specific setting, it can be useful to have the page
        // send one request automatically upon reload
        // so for example, using non-streaming - gemma model - on the CPU box - with a prompt in german
        const autostart = () => {
            document.getElementById("prompt").value = `Hallo !`
            document.getElementById("model").value = `gemma`
            document.getElementById("streaming").checked = false
            document.getElementById("server-name").value = SERVERS[0].url
            sendPrompt()
        }
        // comment this off when you are done debugging
        // autostart()
    })
