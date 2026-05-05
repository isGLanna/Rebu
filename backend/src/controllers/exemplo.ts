import { Request, Response } from 'express'
import { MenuService } from '../services/menu-service'
import { createMenuSchema, queryMenuSchema, modifyMenuSchema, deleteMenuSchema, deleteBeforeThat } from '../validations/menu.schemas'   --> Importa os validadores

export class MenuController {
  constructor(private service: MenuService) {}

  async create ( req: Request, res: Response ) {
    const { day, dishes } = createMenuSchema.parse(req.body)  --> Tentar converter o corpo da requisição para o formato do schema criado no validador

    if (!req.user)  return res.status(401).json({ message: 'Usuário não autenticado' }) 
    const enterpriseId = req.user.enterpriseId

    await this.service.create(enterpriseId, day, dishes)

    res.status(201).json()
  }

  async getMenuByDate(req: Request, res: Response) {
    const { day } = queryMenuSchema.parse(req.params)

    if (!req.user)  return res.status(401).json({ message: 'Usuário não autenticado' })
    const enterpriseId = req.user.enterpriseId

    const menu = await this.service.getMenuByDate(enterpriseId, day)

    const formattedMenu = {
      cafe_manha: menu.cafe_manha,
      almoco: menu.almoco,
      cafe_tarde: menu.cafe_tarde,
      janta: menu.janta}

    res.status(200).json(formattedMenu)
  }

  async replace(req: Request, res: Response) {
    const { day, dishes } = createMenuSchema.parse(req.body)

    if (!req.user) return res.status(401).json({ message: 'Usuário não autenticado' })
    const enterpriseId = req.user.enterpriseId

    await this.service.replaceByDate(enterpriseId, day, dishes)

    res.sendStatus(204)
  }

  async insert (req: Request, res: Response) {
    const { menuId, dishes } = modifyMenuSchema.parse(req.body)
  
    await this.service.insertMenuDish(menuId, dishes)

    res.sendStatus(204)
  }

  async delete (req: Request, res: Response ) {
    const { menuId, dishes } = deleteMenuSchema.parse(req.params)

    await this.service.removeMenuDishes(menuId, dishes)
    res.sendStatus(204)
  }

  async deleteBeforeThat (req: Request, res: Response) {
    const { beforeDate } = deleteBeforeThat.parse(req.query)

    if (!req.user)  return res.status(401).json({ message: 'Usuário não autenticado' })
    const enterpriseId = req.user.enterpriseId

    await this.service.deleteBeforeThat(enterpriseId, beforeDate)
    res.sendStatus(204)
  }
}