import { STATES } from '../Constants';


const HTML5API = function (url, onPlayerReady, onPlayerError, onTimeUpdate, onPlayerStateChange) {
  let player = document.createElement('video');
  player.onloadedmetadata = () => onPlayerReady(player);
  player.src = url;
  player.onplay = () => onPlayerStateChange(STATES.PLAYING);
  player.onplaying = () => onPlayerStateChange(STATES.PLAYING);
  player.onpause = () => onPlayerStateChange(STATES.PAUSED);
  player.onended = () => onPlayerStateChange(STATES.ENDED);
  player.onwaiting = () => onPlayerStateChange(STATES.BUFFERING);
  player.onerror = onPlayerError;
  player.ontimeupdate = onTimeUpdate;

  // wait for <div id="player"></div> to be created. todo see how YT player handles this.
  const interval = setInterval(() => {
    const el = document.getElementById('player');
    if (el) {
      el.appendChild(player);
      clearInterval(interval);
    }
  }, 100);
}

export default HTML5API;