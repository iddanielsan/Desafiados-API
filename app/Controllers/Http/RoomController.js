'use strict'

const Room = use('App/Models/Room')
const Axios = use('axios')
const md5 = use('crypto')
const User = use('App/Models/User')

class RoomController {
  async List ({ response, request }) {
    try {
      const users = await Room.with('users').where({
        room_is_private: false
      }).select(
        'room_code',
        'room_category',
        'room_difficulty',
        'room_started',
        'room_title',
        'room_goal',
        'room_type',
        'created_at'
      ).fetch()

      response.status(200).send(users)
    } catch(e) {
      response.status(500).send({ error: 'E_SERVER_ERROR' })
    }
  }

  async Create ({ response, request, auth }) {
    try {
      const { difficulty, type, category, goal, room_title, room_username, is_private } = request.body

      // Obtém o token de sessão do Trivia DB
      // O principal objetivo é evitar perguntas repetidas
      const TDBSession = await Axios.get('https://opentdb.com/api_token.php', {
        params: {
          command: 'request'
        }
      })

      // Obtém as perguntas
      const questions = await Axios.get('https://opentdb.com/api.php', {
        params: {
          amount: goal,
          category: category,
          difficulty: difficulty,
          type: type,
          token: TDBSession.data.token
        }
      })

      // Cria a sala
      const CreateRoom = await Room.create({
        room_code: Math.random().toString(36).substr(2, 5).toUpperCase(),
        room_title: room_title,
        room_goal: goal,
        room_channel: md5.createHash('md5').update(`DELTA-${Date.now()}-${room_title}`).digest("hex"),
        tdb_session_token: TDBSession.data.token,
        room_category: category,
        room_difficulty: difficulty,
        room_type: type,
        room_questions: questions.data.results,
        room_started: false,
        room_is_private: is_private
      })

      // Cria o usuário o insere dentro da sala
      const CreateUser = await User.create({
        username: room_username,
        room_id: CreateRoom._id,
        points: 0
      })

      // Gera o token JWT de login
      const token = await auth.generate(CreateUser)

      response.status(201).send({
        login: token,
        channel: CreateRoom.channel,
        room_title: room_title,
        room_type: type,
        difficulty: difficulty,
        room_started: false,
        room_code: CreateRoom.room_code,
        room_goal: goal
      })
    } catch(e) {
      response.status(500).send({ error: 'E_CREATE_ROOM' })
    }
  }
}

module.exports = RoomController
