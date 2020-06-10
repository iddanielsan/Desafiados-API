'use strict'

const Room = use('App/Models/Room')
const User = use('App/Models/User')
const DisconnectedUser = use('App/Models/DisconnectedUser')

class GameProcessorController {
  constructor ({ socket, request, auth }) {
    this.socket = socket
    this.request = request
    this.auth = auth
  }

  async onMessage (message) {
    try {
      const user = await this.auth.getUser()

      if (message.subEvent === 'user:new') {

        // Após o novo client avisar que entrou, é enviado para os outros clients o objeto dele.
        this.socket.broadcast('user:new', user)

        // Seta o ID do cliente no objeto do usuário
        user.socket_id = this.socket.id
        await user.save()
      }

      // Busca por usuários desconectados
      const SearchDisconnectedUsers = await DisconnectedUser.where({ room_id: user.room_id }).fetch()

      // Se houver usuários desconectados, é enviado o ID para todos clients
      if (SearchDisconnectedUsers.rows.length > 0) {
        this.socket.broadcastToAll('user:disconnected', SearchDisconnectedUsers)

        // Os ID´s enviados são deletados em seguida
        await DisconnectedUser.where({ room_id: user.room_id }).delete()
      }
    } catch(e) {
    }
  }

  async onClose (message) {
    try {
      const user = await this.auth.getUser()
      await user.delete()

      const CountUsersRoom = await User.where({ room_id: user.room_id }).count()

      if (CountUsersRoom > 0) {

        var new_admin = false
        var new_admin_id = null

        if (user.is_admin) {
          new_admin = true
          const SearchNewAdmin = await User.where({ room_id: user.room_id }).first()
          new_admin_id = SearchNewAdmin._id
          await User.where({ _id: SearchNewAdmin._id }).update({ is_admin: true })
        }

        await DisconnectedUser.create({
          room_id: user.room_id,
          user: user._id,
          new_admin: new_admin,
          new_admin_id: new_admin_id
        })

      } else {
        await Room.where({ _id: user.room_id }).delete()
      }
    } catch(e) {
      // statements
      console.log(e);
    }
  }
}

module.exports = GameProcessorController
