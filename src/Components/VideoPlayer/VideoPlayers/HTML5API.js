import { STATES } from '../Constants';


const HTML5API = function (
  videoUrl,
  onPlayerReady, onTimeUpdate,
  onPlayerStateChange
) {
  let video = document.createElement('video');
  document.getElementById('player').appendChild(video);
  video.onloadedmetadata = onPlayerReady;
  video.src = videoUrl;
  video.onplay = () => onPlayerStateChange(STATES.PLAYING);
  video.onplaying = () => onPlayerStateChange(STATES.PLAYING);
  video.onpause = () => onPlayerStateChange(STATES.PAUSED);
  video.onended = () => onPlayerStateChange(STATES.ENDED);
  video.onwaiting = () => onPlayerStateChange(STATES.BUFFERING);
  video.ontimeupdate = onTimeUpdate;
}

export default HTML5API;