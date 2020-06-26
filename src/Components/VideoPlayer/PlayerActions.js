import { getYoutubeVideoId, getVimeoVideoId } from './utils/vendor';
const PlayerActions = {
  VIMEO: {
    play: p => p.play().catch(error => { console.log('play error', error) }),
    pause: p => p.pause(),
    mute: p => p.setVolume(0),
    unMute: p => p.setVolume(1),
    // isMuted: not used for vimeo,
    seekTo: (p, seconds) => p.setCurrentTime(seconds),
    // getCurrentTime: not used for vimeo
    // getDuration: not used for vimeo,
    changeSrc: (p, url) => p.loadVideo(getVimeoVideoId(url)),
    destroy: p => p.destroy(),
  },
  YOUTUBE: {
    play: p => p.playVideo(),
    pause: p => p.pauseVideo(),
    mute: p => p.mute(),
    unMute: p => p.unMute(),
    isMuted: p => p.isMuted(),
    seekTo: (p, seconds) => p.seekTo(seconds, true),
    getCurrentTime: p => isNaN(p.getCurrentTime()) ? 0 : p.getCurrentTime(),
    getDuration: p => isNaN(p.getDuration()) ? 0 : p.getDuration(),
    changeSrc: (p, url) => p.loadVideoById(getYoutubeVideoId(url)),
    destroy: p => p.destroy(),
  },
  HTML5: {
    play: (p) => {
      p.play().catch(err => {
        console.warn(err);
        p.muted = true;
        p.play().catch(err => console.error(err));
      });
    },
    pause: p => p.pause(),
    mute: p => p.muted = true,
    unMute: p => p.muted = false,
    isMuted: p => { return p.muted; },
    seekTo: (p, seconds) => p.currentTime = seconds,
    getCurrentTime: p => isNaN(p.currentTime) ? 0 : p.currentTime,
    getDuration: p => isNaN(p.duration) ? 0 : p.duration,
    changeSrc: (p, url) => { p.src = url; p.load(); p.currentTime = 0; },
    destroy: () => document.getElementById('player').getElementsByTagName('video')[0].remove(),
  },

};

export default PlayerActions;

