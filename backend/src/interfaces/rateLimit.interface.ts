import { Options } from 'express-rate-limit';

export default interface ILimiterOptions extends Partial<Options> {
  limiterName?: string;
}
