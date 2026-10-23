import { Request, Response, NextFunction, Router } from 'express'
import IController from '../../interfaces/controller.interface'
import currencyService from '../../service/currency.service'

class CurrencyController implements IController {
  public path = '/currency'
  public router: Router = Router()

  constructor() {
    this.initialiseRoutes()
  }

  private initialiseRoutes(): void {
    this.router.get(`${this.path}/rates`, this.getRates)
    this.router.post(`${this.path}/convert`, this.convert)
  }

  /**
   * @openapi
   * /api/currency/rates:
   *   get:
   *     tags:
   *       - Currency
   *     summary: Get current exchange rates (USD base, TRY, EUR)
   *     responses:
   *       '200':
   *         description: Exchange rates retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     base:
   *                       type: string
   *                       example: USD
   *                     rates:
   *                       type: object
   *                       properties:
   *                         TRY:
   *                           type: number
   *                           example: 49.48
   *                         EUR:
   *                           type: number
   *                           example: 0.89
   *                     source:
   *                       type: string
   *                       example: GLOBAL
   *                     lastUpdated:
   *                       type: string
   *                       example: "2026-10-16T23:09:00.473Z"
   *       '500':
   *         description: Internal server error
   */
  private getRates = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const data = await currencyService.getRates()
      return res.status(200).json({
        success: true,
        data
      })
    } catch (error) {
      return next(error)
    }
  }

  /**
   * @openapi
   * /api/currency/convert:
   *   post:
   *     tags:
   *       - Currency
   *     summary: Convert a USD amount to TRY using active live rate
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - amount
   *             properties:
   *               amount:
   *                 type: number
   *                 description: USD amount to convert
   *                 example: 29.0
   *     responses:
   *       '200':
   *         description: Converted amount details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     usdAmount:
   *                       type: number
   *                       example: 29.0
   *                     tryAmount:
   *                       type: number
   *                       example: 1434.93
   *                     rate:
   *                       type: number
   *                       example: 49.48
   *       '400':
   *         description: Invalid amount
   */
  private convert = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const amount = parseFloat(req.body?.amount)
      if (isNaN(amount) || amount < 0) {
        return res.status(400).json({ success: false, message: 'Invalid amount' })
      }
      const result = await currencyService.convertUsdToTry(amount)
      return res.status(200).json({
        success: true,
        data: {
          usdAmount: amount,
          tryAmount: result.tryAmount,
          rate: result.rate
        }
      })
    } catch (error) {
      return next(error)
    }
  }
}

export default CurrencyController
