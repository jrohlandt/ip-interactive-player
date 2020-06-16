import { STATES } from '../Constants';


const HTML5API = function (
  videoUrl,
  onPlayerReady, onPlayerError, onTimeUpdate,
  onPlayerStateChange
) {
  let video = document.createElement('video');
  document.getElementById('player').appendChild(video);
  video.onloadedmetadata = onPlayerReady;
  video.src = videoUrl;
  video.onplay = () => onPlayerStateChange(STATES.playing);
  video.onplaying = () => onPlayerStateChange(STATES.playing);
  video.onpause = () => onPlayerStateChange(STATES.paused);
  video.onended = () => onPlayerStateChange(STATES.ended);
  video.onwaiting = () => onPlayerStateChange(STATES.buffering);
  video.onerror = onPlayerError;
  video.ontimeupdate = onTimeUpdate;
}

export default HTML5API;