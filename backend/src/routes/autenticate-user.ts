/*
importa o controller
importa o express

incializa o express

Exemplo de rota:
import { Router } from 'express'
import { MenuService } from '../services/menu-service'
import { MenuController } from '../controllers/menu-controller'
import { authorizeRoles, authenticate } from '../middlewares/auth-middleware'  --> pode ser necessário para autenticação e autorização (ou motorista ou passageiro acessão algumas rotas)

const menuRouter = Router()
const service = new MenuService()
const controller = new MenuController(service)
const temPermissão = [
  'cozinheiro'
]

menuRouter.use(authenticate)

menuRouter.post('/menus', authorizeRoles(...temPermissão), (req, res) => { controller.create(req, res)})
menuRouter.put('/menus', authorizeRoles(...temPermissão), (req, res) => { controller.replace(req, res)})
menuRouter.post('/menus/:menuId/dishes', authorizeRoles(...temPermissão), (req, res) => { controller.insert(req, res)})
menuRouter.get('/menus/:day', authorizeRoles('*'), (req, res) => { controller.getMenuByDate(req, res)})
menuRouter.delete('/menus/:menuId/dishes/:id', authorizeRoles(...temPermissão), (req, res) => { controller.delete(req, res)})
menuRouter.delete('/menus',authorizeRoles(...temPermissão), (req, res) => { controller.deleteBeforeThat(req, res)})



*/