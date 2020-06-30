import { Router } from 'express'

import AuthController from './app/controllers/AuthController'
import InstanceController from './app/controllers/InstanceController'
import SearchController from './app/controllers/SearchController'
import UserController from './app/controllers/UserController'
import MediaController from './app/controllers/MediaController'
import BehaviourController from './app/controllers/BehaviourController'

import AuthMiddleware from './app/middlewares/Auth'
import SafeRequestsMiddleware from './app/middlewares/SafeRequests'

const route = new Router()

route.get('/', (_, res) => {
	res.json({ status: 'ok', message: 'Server Running' })
})

route.get('/instances', InstanceController.index)
route.post('/auth', AuthController.index)

route.use(AuthMiddleware)

route.post('/instance/new', InstanceController.create)
route.post('/instance/importCookies', InstanceController.importCookies)
route.post('/instance/destroy', (req, res) =>
	InstanceController.destroy(req, res)
)

route.use(SafeRequestsMiddleware)

route.post('/instance/sendCode', (req, res) =>
	InstanceController.sendCode(req, res)
)
route.post('/instance/parseChallenge', (req, res) =>
	InstanceController.parseChallenge(req, res)
)
route.post('/instance/status', InstanceController.getInstanceStatus)
route.post('/instance/captureScreen', (req, res) =>
	InstanceController.captureScreen(req, res)
)

route.post('/search', SearchController.index)

route.post('/feed/:user', UserController.feed)
route.post('/followers/:user', UserController.followers)

route.post('/follow/:user', UserController.follow)
route.post('/unfollow/:user', UserController.unfollow)
route.post('/like/:user/:mediaId', MediaController.like)
route.post('/comment/:user/:mediaId', MediaController.comment)

route.post('/behaviour/simulateRandomBehaviour', (req, res) =>
	BehaviourController.simulateRandomBehaviour(req, res)
)
route.post('/behaviour/simulateRandomBehaviourBackground', (req, res) =>
	BehaviourController.simulateRandomBehaviourBackground(req, res)
)

export default route
