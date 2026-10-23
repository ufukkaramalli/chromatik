import IController from '../interfaces/controller.interface';
import IAppControllerRegistry from '../interfaces/registry.interface';

// Domain / Business API Controllers
import TrackController from './api/track.controller';
import UserController from './api/user.controller';
import SoundkitController from './api/soundkit.controller';
import CommentController from './api/comment.controller';
import CurrencyController from './api/currency.controller';
import CartController from './api/cart.controller';
import ExploreController from './api/explore.controller';

// System / Infrastructure Controllers
import HealthController from './system/health.controller';
import SitemapController from './system/sitemap.controller';

export class ControllerRegistry implements IAppControllerRegistry {
  public apiControllers: IController[];
  public systemControllers: IController[];

  constructor() {
    this.apiControllers = this.initializeApiControllers();
    this.systemControllers = this.initializeSystemControllers();
  }

  private initializeApiControllers(): IController[] {
    return [
      new TrackController(),
      new UserController(),
      new SoundkitController(),
      new CommentController(),
      new CurrencyController(),
      new CartController(),
      new ExploreController(),
    ];
  }

  private initializeSystemControllers(): IController[] {
    return [
      new HealthController(),
      new SitemapController(),
    ];
  }
}

// Re-export controller classes and registry type for direct imports/tests
export {
  IAppControllerRegistry,
  TrackController,
  UserController,
  SoundkitController,
  CommentController,
  CurrencyController,
  CartController,
  ExploreController,
  HealthController,
  SitemapController,
};

export default ControllerRegistry;
