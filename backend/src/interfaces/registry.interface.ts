import IController from './controller.interface';

export default interface IAppControllerRegistry {
  apiControllers: IController[];
  systemControllers: IController[];
}
