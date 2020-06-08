'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RoomsSchema extends Schema {
  up () {
    this.create('rooms', (collection) => {
      collection.index('room_code_index', {room_code: 1})
      collection.index('room_title_index', {room_title: 1})
      collection.index('room_is_private_index', {room_is_private: 1})
    })
  }

  down () {
    this.drop('rooms')
  }
}

module.exports = RoomsSchema
