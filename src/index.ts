import WcPlayer from './Player';
import { HTML5AudioPlayer, HTML5VideoPlayer } from './Html5';

WcPlayer.use(HTML5AudioPlayer);
WcPlayer.use(HTML5VideoPlayer);

WcPlayer.define();
