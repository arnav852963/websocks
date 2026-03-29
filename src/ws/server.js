import {WebSocket, WebSocketServer} from 'ws'
import {ApiError} from "../utilities/ApiError.js";
import {wsArcjet} from "../arcjet.js";

const matchSubscriber = new Map()
function subscribe(matchId , socket){
    if(!matchSubscriber.has(matchId)) matchSubscriber.set(matchId , new Set())
    matchSubscriber.get(matchId).add(socket)

}

function handleMessage(socket , data) {



       let message
    try{
        message = JSON.parse(data.toString())

    } catch (e) {
           sendJson(socket , {type: "error" , message: "Invalid message format"})
        return;

    }



    if (message?.type === "subscribe" && Number.isInteger(message.matchId)) {
        subscribe(message.matchId, socket)

        socket.subscribtions.add(message.matchId)
        sendJson(socket, {type: "subscribed", matchId: message.matchId})
        return
    }


    if (message?.type === "unsubscribe" && Number.isInteger(message.matchId)) {
        unsubscribe(message.matchId, socket)
        socket.subscribtions.delete(message.matchId)
        sendJson(socket, {type: "unsubscribed", matchId: message.matchId})


    }
}


function unsubscribe(matchId , socket){
    if(!matchSubscriber.has(matchId)) return
    matchSubscriber.get(matchId).delete(socket)
    if(matchSubscriber.get(matchId).size === 0) matchSubscriber.delete(matchId)
}

function cleanupSubscribe(socket){
    for(const matchId of socket.subscriptions){
        unsubscribe(matchId , socket)
    }
}


function broadcastToMatch(matchId , payload){
    const  subscribers = matchSubscriber.get(matchId)
    if(!subscribers || subscribers.size === 0) return

    const message = JSON.stringify(payload)

    for (const client of subscribers){
        if(client.readyState !== WebSocket.OPEN) continue
        client.send(message)
    }

}





function sendJson(socket , payload){
    if(socket.readyState !== WebSocket.OPEN) return
    socket.send(JSON.stringify(payload))
}



function broadcast(wss , payload){

    for(const client of wss.clients){
        if(client.readyState !== WebSocket.OPEN) continue
        client.send(JSON.stringify(payload))
    }
}

export  function attachWebsocketServer(server){
    
    
    const wss = new WebSocketServer({ server , path: '/ws' , maxPayload: 1024 * 1024  })

    wss.on('connection' , async (socket) => {

        socket.subscribtions = new Set()

        if(wsArcjet){
            try {
                const decision =await  wsArcjet.protect(socket)
                if (decision.isDenied()) {
                    if(decision.reason.isRateLimit()){
                        const code = decision.reason.isRateLimit() ? 1013 : 1011
                        const reason = decision.reason.isRateLimit() ? "Too many requests. Please try again later." : "Connection denied by Arcjet. Reason: " + decision.reason.toString()


                        socket.close(code , reason)
                        return
                    }
                }

            } catch (e) {
                console.log("Arcjet error: " + e.message)
                socket.close(1011 , "server security error: " + e.message)
                return

            }

        }
        socket.isAlive =true

        socket.on("pong" , () => {
            socket.isAlive = true
        })


        socket.on("message" , (data)=>{
            console.log(typeof data)
            handleMessage(socket , data)


        })





        sendJson(socket , {type: "welcome"})

        socket.on('error' , (err) => {
            console.log("Websocket error: " + err.message)
            socket.terminate()
            throw new ApiError("Websocket error: " + err.message , 500)
        })
        socket.on("close" , () => {

        socket.terminate()

    })
    })

    const  interval = setInterval(() => {
        wss.clients.forEach((socket) => {
            if(socket.isAlive === false) return socket.terminate()

            socket.isAlive = false
            socket.ping()
        })

    }, 30000)

    wss.on("close" , () => { clearInterval(interval) })

    function broadcastMatchesCreated(match){
        console.log("yaha bhi aaya")
        broadcast(wss , {type: "match_created" , data: match})
    }

    function broadcastCommentary(matchId , commentary){
        broadcastToMatch(matchId , {type: "commentary" , data: commentary})
    }

    return {
        broadcastMatchesCreated,
        broadcastCommentary
    }
}