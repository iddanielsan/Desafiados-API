'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DisconnectedUsersSchema extends Schema {
  up () {
    this.create('disconnected_users', (collection) => {
      collection.index('room_id_index', {room_id: 1})
    })
  }

  down () {
    this.drop('disconnected_users')
  }
}

module.exports = DisconnectedUsersSchema
