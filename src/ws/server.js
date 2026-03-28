import {WebSocket, WebSocketServer} from 'ws'
import {ApiError} from "../utilities/ApiError.js";

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

export function attachWebsocketServer(server){
    const wss = new WebSocketServer({ server , path: '/ws' , maxPayload: 1024 * 1024  })

    wss.on('connection' , (socket) => {
        sendJson(socket , {type: "welcome"})

        socket.on('error' , (err) => {
            console.log("Websocket error: " + err.message)
            throw new ApiError("Websocket error: " + err.message , 500)
        })
    })

    function broadcastMatchesCreated(match){
        console.log("yaha bhi aaya")
        broadcast(wss , {type: "match_created" , data: match})
    }

    return {
        broadcastMatchesCreated
    }
}