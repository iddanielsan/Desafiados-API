'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UsersSchema extends Schema {
  up () {
    this.create('users', (collection) => {
      collection.index('room_id_index', {room_id: 1})
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UsersSchema
