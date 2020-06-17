import { STATES } from '../Constants';


const HTML5API = function (
  videoUrl,
  onPlayerReady, onPlayerError, onTimeUpdate,
  onPlayerStateChange
) {
  let video = document.createElement('video');
  video.onloadedmetadata = () => onPlayerReady(video);
  video.src = videoUrl;
  video.onplay = () => onPlayerStateChange(STATES.playing);
  video.onplaying = () => onPlayerStateChange(STATES.playing);
  video.onpause = () => onPlayerStateChange(STATES.paused);
  video.onended = () => onPlayerStateChange(STATES.ended);
  video.onwaiting = () => onPlayerStateChange(STATES.buffering);
  video.onerror = onPlayerError;
  video.ontimeupdate = onTimeUpdate;

  // wait for <div id="player"></div> to be created. todo see how YT player handles this.
  const interval = setInterval(() => {
    const el = document.getElementById('player');
    if (el) {
      el.appendChild(video);
      clearInterval(interval);
    }
  }, 100);
}

export default HTML5API;