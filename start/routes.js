'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.post('/room', 'RoomController.Create').validator('RoomCreate')
Route.get('/room', 'RoomController.List')
Route.post('/room/:code', 'RoomController.EnterRoom')

Route.group(() => {
  Route.get('/room', 'RoomController.GetData')
}).prefix('v1').middleware(['auth:jwt'])
