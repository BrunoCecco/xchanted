import { QueueEvents } from 'bullmq'
import { Server } from 'socket.io'

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = createWSServer(res.socket.server)
    res.socket.server.io = io
  }

  
  res.end()
}


function createWSServer(port) {
    const io = new Server(port);
    console.log('creating ws server')
    io.on('connection', (socket) => {
      socket.emit('Connected to Queue Events Server Events')
      console.log('got connection')
  
      // Create queue events instance
      const queueEvents = new QueueEvents('user', {
        connection: {
            host: "159.65.86.5",
            port: 6379
        }
      });
      
      queueEvents.on('waiting', ({ jobId }) => {
        console.log(`A job with ID ${jobId} is waiting`);
        socket.emit('msg', `A job with ID ${jobId} is waiting`)
      });
      
      queueEvents.on('active', ({ jobId, prev }) => {
        console.log(`Job ${jobId} is now active; previous status was ${prev}`);
        socket.emit('msg', `Job ${jobId} is now active; previous status was ${prev}`)
      });

      queueEvents.on('progress', (data) => {
        console.log(`Progress ${JSON.stringify(data)}`);
        if(data.data.message)
          socket.emit(data.data.userId, `${data.data.message}`)
        if(data.data.progress)
          socket.emit(data.data.userId, `${data.data.progress}`)
    });
      
    })
    return io;
  }

export default SocketHandler