import 'dotenv/config';
import App from './app'
import validateEnv from './utils/validateEnv';
import TrackController from './controller/track.controller';
import UserController from './controller/user.controller'
import SoundkitController from './controller/soundkit.controller';

validateEnv();

const app = new App(
    /**
     * Register Controllers
     */
    [
        new TrackController(),
        new UserController(),
        new SoundkitController()
    ],
    /**
     * Register server port number
     */
    Number(process.env.PORT));

app.listen();