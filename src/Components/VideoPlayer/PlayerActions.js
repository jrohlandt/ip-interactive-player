const PlayerActions = {
  YOUTUBE: {
    pause: (player) => player.pause(),
  },
  HTML5: {
    getPlayer: () => document.getElementById('player').getElementsByTagName('video')[0],
    play: (player) => player.play(),
    pause: player => player.pause(),
    mute: player => player.muted = true,
    unMute: player => player.muted = false,
    seekTo: (player, seconds) => player.currentTime = seconds,
    getCurrentTime: player => player.currentTime,
    getDuration: player => player.duration,
  },
  VIMEO: {
    pause: (player) => player.pause(),
  }
};

export default PlayerActions;

