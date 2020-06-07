'use strict'

const { rule } = require('indicative')

class RoomCreate {
  get rules () {
    return {
      difficulty: [
        rule('required'),
        rule('in', ['hard', 'medium', 'easy'])
      ],
      type: [
        rule('required'),
        rule('in', ['multiple', 'boolean'])
      ],
      category: [
        rule('required'),
        rule('range', [8, 32])
      ],
      goal: [
        rule('required'),
        rule('in', [10, 20, 30, 40, 50])
      ],
      room_title: [
        rule('required'),
        rule('max', 25)
      ],
      room_username: [
        rule('required'),
        rule('max', 25)
      ],
      is_private: [
        rule('required'),
        rule('boolean')
      ]
    }
  }
}

module.exports = RoomCreate
