# chatbot

## assignment

create your own conversational bot, using the starter code that has

- a few settings:
  - a radio button to choose between streaming and non-streaming mode (see below)
  - how to select one of the available models
  - how to select one of the available servers
- a "messages" area (contains only one invite upon startup) where you are expected
  to keep track of the conversation (both prompts and answers)
- a prompt area with a send button

your code should mainly go in the `sendPrompt` function in the js file

## the servers and the API

in order to serve your needs, we have setup two separate ***ollama*** instances,
that each serves various LLM models  
the details about how to reach these servers are defined in the `chatbot.js`
file in the `SERVERS` variable

Each of these servers provides the same API, which is documented here:
- the [ollama API is documented here](https://github.com/ollama/ollama/blob/main/docs/api.md)
- and also here (maybe more user-friendly):
  - https://docs.ollama.com/api/generate
  - https://docs.ollama.com/api/tags

### more about the servers

- as you will see there are 2 servers available
  - the first one has more computing resources, in particular it has a GPU
  - the other one is CPUonly and thus more limited
- both boxes are accessible through basic authentication (meaning login/password) which are not given here as this is a public repo; you will get them in class

### several models

the beauty of *ollama* is that several models are made available through the
same API; this means you are going to be in a position to compare the
performance of several popular LLMs by just changing the value for the `model`
field above; here are 2 available options for that field

- `gemma2:2b`: a small model; I recommended you use only this model during development
  as it is faster and uses fewer resources
- `mistral:7b`: it has 7 billion parameters, to get more realistic answers once your code works fine

as we'll see below, that there are more models available, but you can assume at least these 2 will be available on both servers

## hints

### timeline

starting from scratch, I recommend that you tackle the problem in the following order

- you better start with a hard-wird list of models (see the global `MODELS`
  constant in `chatbot.js`)  
  and in non-streaming mode (see below)  
  this way you can write the code that just submits the prompt  
  for that you will use the `/api/generate` endpoint of the API  
  this amounts to sending a usual POST request to the server, and you will get
  the answer back in a single response (so no need to deal with streaming)  
  also, see the next section for more details about authenticating

- once you have that working (i.e. you can submit a prompt and get an answer
  back), you can write the code that fetches the list of available models from
  the server, and populate the model selection dropdown with that list;  
  for that you will use the `/api/tags` endpoint of the API  

- and then only try to tackle the streaming mode, which is a little more complex
  (although we also give the code for that below)

### authenticating

you will need to provide a `login / password`  
to that effect you need to enhance the `request` object passed to `fetch()` with
an additional field `headers` that you would build like so:

```js
    if (server.username && server.password) {
         console.log("inserting user/password")
         const headers = new Headers()
         headers.append('Authorization', 'Basic ' + btoa(`${server.username}:${server.password}`))
         request.headers = headers
    }
```

### streaming or not streaming

here's an example taken from the ollama documentation, adapted to our setup

```console
# if you have curl installed, you can use this as-is in the terminal

curl -X POST http://mistral.pl.sophia.inria.fr:8080/api/generate -d '{
  "model": "mistral",
  "prompt":"Here is a story about llamas eating grass"
 }'
```

and you will then see the answer coming back piece by piece

```console
{"model":"mistral","created_at":"2024-03-06T10:42:41.922755311Z","response":" Title","done":false}
{"model":"mistral","created_at":"2024-03-06T10:42:42.047344064Z","response":":","done":false}
{"model":"mistral","created_at":"2024-03-06T10:42:42.21405405Z","response":" The","done":false}
{"model":"mistral","created_at":"2024-03-06T10:42:42.378292723Z","response":" G","done":false}
{"model":"mistral","created_at":"2024-03-06T10:42:42.541091495Z","response":"raz","done":false}
....
```

which means: if I send a POST request on that URL with this (JSON) data, I am
getting **a stream of** responses, each of them being a part of the answer to my
prompt

in the above example, you can see that the answers come from the server "in small bits"  
this is because:

- by default, the request is made in so-called *streaming* mode (available bits
  of the answer are sent as soon as they are available)
- as opposed to the more usual **non-streaming** mode where the answer would
come **in a single response** - but at the very end of the processing, which
typically takes tens of seconds - so not very user-friendly !

so you have two options for this exercise - and like always, fast students are encouraged to tackle both:

- use a **non-streaming mode** - the easiest, but less rewarding:  
  to enable this you need to pass `stream: "false"` in your request data (i.e.
  in addition to the `model` and `prompt` fields)  
  in this case your code expects a single response, so the code would look like
  any other exercise you have done so far with `fetch()`  
  it is less rewarding because the user possibly has to wait for a looooong time
  before they can see their answer
- use a **streaming mode** - more rewarding, but a little trickier  
  if you do not specify the `streaming` mode, the API will work in streaming
  mode  
  this means that your single intial request ends up in **several** response paquets  
  so it is a little trickier to code, because this not a unusual pattern when
  talking to more traditional APIs  
  but on the other hand it is (much) more user-friendly to see the answer pieces
  get displayed as they are churned out by the LLM model

  in order to address this situation, you will need to use something like the
  following code snippet

  ```js
  // arming the callback is done as usual, even though our callback is an async function
  document.getElementById('send').addEventListener('click', sendPrompt)

  // it is important to define an 'async' function
  // because otherwise you cannot use 'await' in the body of the function
  const sendPrompt = async () => {
    ...
    const response = await fetch(url, options)
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    while (true) {
        // this will wait for the next chunk of the response
        // so the call to read() returns something different each time
        const { done, value } = await reader.read()
        // this is how we detect that the stream is over
        if (done) break
        // the value is a Uint8Array, so we need to decode it
        const chunk = decoder.decode(value, { stream: true })
        // sometimes we receive several JSON objects in the same chunk
        for (const line of chunk.split('\n')) {
            // do something with that line of JSON
            ...
        }
        ...
    }
  }
  ...
  ```

### other tips

- the starter contains a few utility functions that you may find useful
- in particular, it might help to disable the button while the bot is answering
  (to avoid multiple simultaneous requests);  
  use `enableSend/disableSend` functions for that
- the CSS assumes that the prompts and answers will get in the `#messages` div,
  in alternating order (prompt, answer, prompt, answer, etc.);  
  your code should make sure to respect this assumption, or you'll need to rewrite parts of the CSS
- as you will see, the html code involves `<form>` elements; this is a common
  practice when prompting, because it allows the user to press the `Enter` key
  to send the prompt; this is why the `sendPrompt()` function invokes
  `preventDefault()` on the incoming event; leave it as-is, because in our case
  we do not want to reach the original server (which would reload the page, and
  lose the conversation history)
