'use strict'

const Room = use('App/Models/Room')
const Axios = use('axios')
const md5 = use('crypto')
const User = use('App/Models/User')

class RoomController {
  async GetPublicData ({ response, request, params }) {
    try {
      const room_code = params.code

      const get_room = await Room.with('users').where({
        room_code: room_code
      }).select('room_title','room_category','room_difficulty','room_type').first()

      if (!get_room) {
        response.status(404).send({ error: 'E_ROOM_NOT_FOUND' })
      } else {
        response.status(200).send({ get_room })
      }
    } catch(e) {
      response.status(500).send({ error: 'E_SERVER_ERROR' })
    }
  }
  async GetData ({ response, request, auth }) {
    try {
      const user = await auth.getUser()

      const get_room = await Room.with('users').where({
        _id: user.room_id
      }).select(
        'room_code',
        'room_category',
        'room_difficulty',
        'room_started',
        'room_title',
        'room_goal',
        'room_channel',
        'room_round',
        'room_type',
        'created_at'
      ).first()

      get_room['me'] = user
      response.status(200).send(get_room)
    } catch(e) {
      response.status(500).send({ error: 'E_SERVER_ERROR' })
    }
  }

  async EnterRoom ({ response, request, auth, params }) {
    try {
      const room_code = params.code
      const { username } = request.body

      const room_count = await Room.where({
        room_code: room_code
      }).first()

      if (!room_count) {
        response.status(404).send({ error: 'E_ROOM_NOT_FOUND' })
      } else {
        const CreateUser = await User.create({
          username: username,
          room_id: room_count._id,
          status: 'waiting_for_next_round',
          is_admin: false,
          points: 0,
          socket_id: null
        })

        const token = await auth.generate(CreateUser)

        response.status(201).send({ login: token })
      }
    } catch(e) {
      response.status(500).send({ error: 'E_SERVER_ERROR' })
    }
  }

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
        room_round: 0,
        room_questions: questions.data.results,
        room_started: false,
        room_is_private: is_private
      })

      // Cria o usuário o insere dentro da sala
      const CreateUser = await User.create({
        username: room_username,
        room_id: CreateRoom._id,
        status: 'waiting_to_start',
        is_admin: true,
        points: 0,
        socket_id: null
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
