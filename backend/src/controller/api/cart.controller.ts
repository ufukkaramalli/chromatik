import { Request, Response, NextFunction, Router } from 'express'
import IController from '../../interfaces/controller.interface'
import authenticated from '../../middleware/authenticated.middleware'
import cartService from '../../service/cart.service'

class CartController implements IController {
  public path = '/cart'
  public router: Router = Router()

  constructor() {
    this.initialiseRoutes()
  }

  private initialiseRoutes(): void {
    // All cart endpoints require user authentication
    this.router.get(`${this.path}`, authenticated, this.getCart)
    this.router.post(`${this.path}/items`, authenticated, this.addItem)
    this.router.put(`${this.path}/items/:id`, authenticated, this.updateLicense)
    this.router.delete(`${this.path}/items/:id`, authenticated, this.removeItem)
    this.router.delete(`${this.path}`, authenticated, this.clearCart)
    this.router.post(`${this.path}/sync`, authenticated, this.syncGuestCart)
  }

  /**
   * @openapi
   * /api/cart:
   *   get:
   *     tags:
   *       - Cart
   *     summary: Get current authenticated user's cart
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '200':
   *         description: Cart details retrieved successfully
   *       '401':
   *         description: Unauthorized
   */
  private getCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const userId = (req as any).user._id.toString()
      const cart = await cartService.getCart(userId)
      return res.status(200).json({
        success: true,
        data: cart
      })
    } catch (error) {
      return next(error)
    }
  }

  /**
   * @openapi
   * /api/cart/items:
   *   post:
   *     tags:
   *       - Cart
   *     summary: Add an item (track or soundkit) to the cart
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - itemType
   *               - itemId
   *             properties:
   *               itemType:
   *                 type: string
   *                 enum: [track, soundkit]
   *                 example: track
   *               itemId:
   *                 type: string
   *                 example: 6ad2ab5305162fe742ca6cb6
   *               licenseType:
   *                 type: string
   *                 enum: [basic, premium, unlimited, exclusive]
   *                 example: basic
   *     responses:
   *       '200':
   *         description: Item added to cart successfully
   *       '400':
   *         description: Invalid parameters or item unavailable
   *       '401':
   *         description: Unauthorized
   */
  private addItem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const userId = (req as any).user._id.toString()
      const { itemType, itemId, licenseType } = req.body

      if (!itemType || !itemId) {
        return res.status(400).json({ success: false, message: 'MISSING_PARAMETERS' })
      }

      const cart = await cartService.addItem(userId, { itemType, itemId, licenseType })
      return res.status(200).json({
        success: true,
        data: cart
      })
    } catch (error) {
      return next(error)
    }
  }

  /**
   * @openapi
   * /api/cart/items/{id}:
   *   put:
   *     tags:
   *       - Cart
   *     summary: Update license tier for a track in cart
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Cart item ID or Track ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - licenseType
   *             properties:
   *               licenseType:
   *                 type: string
   *                 enum: [basic, premium, unlimited, exclusive]
   *                 example: premium
   *     responses:
   *       '200':
   *         description: License updated successfully
   *       '400':
   *         description: Missing license type or license not available
   *       '401':
   *         description: Unauthorized
   *       '404':
   *         description: Item or cart not found
   */
  private updateLicense = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const userId = (req as any).user._id.toString()
      const { id } = req.params
      const { licenseType } = req.body

      if (!licenseType) {
        return res.status(400).json({ success: false, message: 'MISSING_LICENSE_TYPE' })
      }

      const cart = await cartService.updateLicense(userId, id, licenseType)
      return res.status(200).json({
        success: true,
        data: cart
      })
    } catch (error) {
      return next(error)
    }
  }

  /**
   * @openapi
   * /api/cart/items/{id}:
   *   delete:
   *     tags:
   *       - Cart
   *     summary: Remove an item from the cart
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Cart item ID, Track ID, or Soundkit ID
   *     responses:
   *       '200':
   *         description: Item removed successfully
   *       '401':
   *         description: Unauthorized
   *       '404':
   *         description: Cart not found
   */
  private removeItem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const userId = (req as any).user._id.toString()
      const { id } = req.params
      const cart = await cartService.removeItem(userId, id)
      return res.status(200).json({
        success: true,
        data: cart
      })
    } catch (error) {
      return next(error)
    }
  }

  /**
   * @openapi
   * /api/cart:
   *   delete:
   *     tags:
   *       - Cart
   *     summary: Clear all items from the cart
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '200':
   *         description: Cart cleared successfully
   *       '401':
   *         description: Unauthorized
   */
  private clearCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const userId = (req as any).user._id.toString()
      const cart = await cartService.clearCart(userId)
      return res.status(200).json({
        success: true,
        data: cart
      })
    } catch (error) {
      return next(error)
    }
  }

  /**
   * @openapi
   * /api/cart/sync:
   *   post:
   *     tags:
   *       - Cart
   *     summary: Merge guest localStorage cart into user account cart
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               items:
   *                 type: array
   *                 items:
   *                   type: object
   *                   required:
   *                     - itemType
   *                     - itemId
   *                   properties:
   *                     itemType:
   *                       type: string
   *                       enum: [track, soundkit]
   *                     itemId:
   *                       type: string
   *                     licenseType:
   *                       type: string
   *     responses:
   *       '200':
   *         description: Cart synced successfully
   *       '401':
   *         description: Unauthorized
   */
  private syncGuestCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const userId = (req as any).user._id.toString()
      const { items } = req.body

      const cart = await cartService.syncGuestCart(userId, Array.isArray(items) ? items : [])
      return res.status(200).json({
        success: true,
        data: cart
      })
    } catch (error) {
      return next(error)
    }
  }
}

export default CartController
