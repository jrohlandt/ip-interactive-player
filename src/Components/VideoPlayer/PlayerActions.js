import { getYoutubeVideoId } from './utils/vendor';
const PlayerActions = {
  YOUTUBE: {
    getPlayer: () => window.YOUTUBE_PLAYER_32f3S9x8E32A39h8,
    play: p => p.playVideo(),
    pause: p => p.pauseVideo(),
    mute: p => p.mute(),
    unMute: p => p.unMute(),
    isMuted: p => p.isMuted(),
    seekTo: (p, seconds) => p.seekTo(seconds, true),
    getCurrentTime: p => {
      const currentTime = p.getCurrentTime();
      return !isNaN(currentTime) ? currentTime : 0;
    },
    getDuration: p => {
      const duration = p.getDuration()
      return !isNaN(duration) ? duration : 0;
    },
    changeSrc: (p, url) => p.loadVideoById(getYoutubeVideoId(url)),
    destroy: p => p.destroy(),
  },
  HTML5: {
    getPlayer: () => document.getElementById('player').getElementsByTagName('video')[0],
    play: (p) => p.play(),
    pause: p => p.pause(),
    mute: p => p.muted = true,
    unMute: p => p.muted = false,
    isMuted: p => p.muted,
    seekTo: (p, seconds) => p.currentTime = seconds,
    getCurrentTime: p => p.currentTime,
    getDuration: p => p.duration,
    changeSrc: (p, url) => { p.src = url; p.load(); },
    destroy: () => document.getElementById('player').getElementsByTagName('video')[0].remove(),
  },
  VIMEO: {
    // pause: (p) => p.pause(),
  }
};

export default PlayerActions;

