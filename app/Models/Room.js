'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Room extends Model {
  users () {
    return this.hasMany('App/Models/User')
  }
}

module.exports = Room
