import {WebSocket, WebSocketServer} from 'ws'
import {ApiError} from "../utilities/ApiError.js";
import {wsArcjet} from "../arcjet.js";

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


        sendJson(socket , {type: "welcome"})

        socket.on('error' , (err) => {
            console.log("Websocket error: " + err.message)
            throw new ApiError("Websocket error: " + err.message , 500)
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

    return {
        broadcastMatchesCreated
    }
}