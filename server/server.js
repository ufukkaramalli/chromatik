const http = require('http').createServer()
const io = require('socket.io')(http)

http.listen(3000)

io.on('connection', socket => {
  console.log('Kullanıcı Bağlandı')
  socket.on('disconnect', () => {
    console.log('Kullancı Ayrıldı')
  })
})
