import { getYoutubeVideoId } from '../utils/vendor';
import { STATES } from '../Constants';

let loadYT = false;
const YoutubeAPI = function (videoUrl, onPlayerReady, onPlayerError, onPlayerStateChange) {
  if (!loadYT) {
    loadYT = new Promise((resolve, reject) => {
      const tag = document.createElement('script');
      //   todo check that this does not keep adding script tags
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => resolve(window.YT);
    });
  }

  loadYT.then(YT => {

    // 'UNSTARTED': -1,
    // 'ENDED': 0,
    // 'PLAYING': 1,
    // 'PAUSED': 2,
    // 'BUFFERING': 3,
    // 'CUED': 5,

    window.YOUTUBE_PLAYER_32f3S9x8E32A39h8 = new YT.Player('player', {
      height: '',
      width: '320',
      videoId: getYoutubeVideoId(videoUrl),
      events: {
        'onReady': function (event) {
          onPlayerReady();
        },
        'onStateChange': function (event) {
          let state = YT.PlayerState.UNSTARTED;

          switch (event.data) {
            case (YT.PlayerState.UNSTARTED):
              state = STATES.unstarted;
              break;
            case (YT.PlayerState.ENDED):
              state = STATES.ended;
              break;
            case (YT.PlayerState.PLAYING):
              state = STATES.playing;
              break;
            case (YT.PlayerState.PAUSED):
              state = STATES.paused;
              break;
            case (YT.PlayerState.BUFFERING):
              state = STATES.buffering;
              break;
            case (YT.PlayerState.VIDEO_CUED):
              state = STATES.cued;
              break;
            default:
              // done = true;
              break;
          }
          console.log('ytstate', state)
          onPlayerStateChange(state);
        },
        'onError': onPlayerError,
      },
      playerVars: {
        controls: 0,
        playsinline: 1,
        // 'autoplay': 0,
        // rel: 0,
        // autohide: 1,
        // showinfo : 0,
        // wmode: 'transparent'
      }
    });

  })
    .catch(e => console.log(e));

}

export default YoutubeAPI;