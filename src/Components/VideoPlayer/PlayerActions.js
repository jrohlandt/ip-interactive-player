const PlayerActions = {
  YOUTUBE: {
    getPlayer: () => window.YOUTUBE_PLAYER_32f3S9x8E32A39h8,
    play: p => p.playVideo(),
    pause: p => p.pauseVideo(),
    mute: p => p.mute(),
    unMute: p => p.unMute(),
    seekTo: (p, seconds) => p.seekTo(seconds, true),
    getCurrentTime: p => p.getCurrentTime(),
    getDuration: p => p.getDuration(),
  },
  HTML5: {
    getPlayer: () => document.getElementById('player').getElementsByTagName('video')[0],
    play: (p) => p.play(),
    pause: p => p.pause(),
    mute: p => p.muted = true,
    unMute: p => p.muted = false,
    seekTo: (p, seconds) => p.currentTime = seconds,
    getCurrentTime: p => p.currentTime,
    getDuration: p => p.duration,
  },
  VIMEO: {
    // pause: (p) => p.pause(),
  }
};

export default PlayerActions;

