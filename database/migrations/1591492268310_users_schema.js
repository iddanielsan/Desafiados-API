'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UsersSchema extends Schema {
  up () {
    this.create('users', (collection) => {
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UsersSchema
