import Player from '@vimeo/player';
import { STATES } from '../Constants';
import { getVimeoVideoId } from '../utils/vendor';

function VimeoAPI(
  url,
  doAction,
  onPlayerReady,
  onPlayerError,
  onTimeUpdate,
  onPlayerStateChange
) {
  // wait for <div id="player"></div> to be created. todo see how YT player handles this.
  const interval = setInterval(() => {
    const el = document.getElementById('player');
    if (!el) return;
    clearInterval(interval);
    const player = new Player('player', {
      id: getVimeoVideoId(url),
      width: 300,
      autoplay: 1,
      controls: 0,
    });
    player.ready()
      .then(() => onPlayerReady(player))
      .catch(error => onPlayerError(error));

    player.on('play', () => onPlayerStateChange(STATES.PLAYING));
    player.on('playing', () => onPlayerStateChange(STATES.PLAYING));
    player.on('pause', () => onPlayerStateChange(STATES.PAUSED));
    player.on('ended', () => onPlayerStateChange(STATES.ENDED));
    player.on('bufferstart', () => { onPlayerStateChange(STATES.BUFFERING); });
    // player.on('bufferend', () => {
    //   // player.getPaused().then(status => status ? onPlayerStateChange(STATES.PAUSED) : onPlayerStateChange(STATES.PLAYING));
    // });
    // player.on('volumechange', (data) => {});
    player.on('timeupdate', (data) => onTimeUpdate(data));
    // player.on('loaded', () => console.log('new vimeo video is loaded'));
    player.on('error', (error) => onPlayerError(error));


  }, 100);
}

export default VimeoAPI;