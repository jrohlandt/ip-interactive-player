import { getYoutubeVideoId } from './utils/vendor';

let loadYT = false;
const YoutubeAPI = function (videoUrl, setPlayer, playbackStates, onPlayerReady, onPlayerStateChange) {
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

    var player = new YT.Player('player', {
      height: '',
      width: '320',
      videoId: getYoutubeVideoId(videoUrl),
      events: {
        'onReady': function (event) {
          onPlayerReady();
        },
        'onStateChange': function (event) {
          let state = YT.PlayerState.UNSTARTED;

          const ps = playbackStates;
          switch (event.data) {
            case (YT.PlayerState.UNSTARTED):
              state = ps.UNSTARTED;
              break;
            case (YT.PlayerState.ENDED):
              state = ps.ENDED;
              break;
            case (YT.PlayerState.PLAYING):
              state = ps.PLAYING;
              break;
            case (YT.PlayerState.PAUSED):
              state = ps.PAUSED;
              break;
            case (YT.PlayerState.BUFFERING):
              state = ps.BUFFERING;
              break;
            case (YT.PlayerState.VIDEO_CUED):
              state = ps.CUED;
              break;
            default:
              // done = true;
              break;
          }

          onPlayerStateChange(state);
        },
        'onError': function (error) { console.log(error); }
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

    setPlayer(player);
  })
    .catch(e => console.log(e));

}

export default YoutubeAPI;