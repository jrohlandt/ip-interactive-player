import React from "react";

import { STATES, VENDORS, ACTIONS } from "./Constants";
import { isValidState, isValidAction } from "./Helpers";
import PlayerWindow from "./PlayerWindow";
import YoutubeAPI from "./YoutubeAPI.js";
import { getYoutubeVideoId } from "./utils/vendor";

class YoutubePlayer extends React.Component {
  constructor(props) {
    super(props);

    this.initIntervalId = 0;
    this.mainLoopId = 0;

    this.player = false;

    this.state = {
      ready: false,
      playbackState: STATES.UNSTARTED,
      muted: false,
      duration: 0,
      currentTime: 0,
      initialised: false,
      url: ""
    };

    this.initPlayer = this.initPlayer.bind(this);
    this.mainLoop = this.mainLoop.bind(this);
    this.startMainLoop = this.startMainLoop.bind(this);
    this.setPlayer = this.setPlayer.bind(this);
    this.onPlayerReady = this.onPlayerReady.bind(this);
    this.onPlayerStateChange = this.onPlayerStateChange.bind(this);

    this.handleProgressClick = this.handleProgressClick.bind(this);
    this.doAction = this.doAction.bind(this);
  }

  setPlayer(player) {
    this.player = player;
  }

  onPlayerReady() {
    this.setState({ ready: true });
    if (this.state.playbackState === STATES.UNSTARTED && this.props.autoplay) {
      // wait for React to setState({ready: true})
      setTimeout(() => {
        this.doAction(ACTIONS.PLAY);
        this.doAction(ACTIONS.SEEK_TO, { currentTime: 0 });
      }, 100);
    }
  }

  onPlayerStateChange(playbackState) {
    if (isValidState(playbackState)) {
      this.props.updatePlaybackState(playbackState);
      this.setState({ playbackState });
      console.log("player state changed: ", playbackState);
    } else console.error(`Invalid playback state: ${playbackState}.`);
  }

  doAction(action, params = {}) {
    action = action.toUpperCase();
    if (!isValidAction(action)) {
      throw new Error(`Invalid action ${action}.`);
    }

    if (this.state.ready === false || this.player === false) {
      console.log(`Cannot perform action (${action}). Player is not ready yet`);
      return;
    }

    switch (action) {
      case ACTIONS.PLAY:
        // play video
        this.player.playVideo();
        // and if finished playing, restart the main loop to play it again.
        if (this.state.playbackState === STATES.ENDED) {
          this.startMainLoop();
        }

        // if the vidoe is still not playing, then mute it and then play.
        setTimeout(() => {
          if (this.state.playbackState === STATES.UNSTARTED) {
            this.player.mute();
            this.player.playVideo();
            this.setState({ muted: true });
          }
        }, 1000);
        break;
      case ACTIONS.PAUSE:
        this.player.pauseVideo();
        break;
      case ACTIONS.MUTE:
        this.player.mute();
        this.setState({ muted: true });
        break;
      case ACTIONS.UNMUTE:
        this.player.unMute();
        this.setState({ muted: false });
        break;
      case ACTIONS.SEEK_TO:
        if (this.state.playbackState === STATES.ENDED) {
          // video finished playing, to play it again, restart the main loop.
          this.startMainLoop();
        }
        this.player.seekTo(params.currentTime, true);
        break;
      default:
        throw new Error(`Invalid action: ${action}.`);
    }
  }

  handleProgressClick(e) {
    const pos = (e.pageX - e.target.offsetLeft) / e.target.offsetWidth;
    this.doAction(ACTIONS.SEEK_TO, { currentTime: pos * this.state.duration });
  }

  initPlayer() {
    if (this.state.initialised === true) {
      clearInterval(this.initIntervalId);
      return;
    }
    console.log("init player");

    if (this.state.initialised === true) return;

    YoutubeAPI(
      this.props.url,
      this.setPlayer,
      STATES,
      this.onPlayerReady,
      this.onPlayerStateChange
    );
    this.setState({ initialised: true, url: this.props.url });
  }

  mainLoop() {
    if (this.state.playbackState === STATES.ENDED) {
      clearInterval(this.mainLoopId);
    }

    // Make sure player is ready and that player object is set.
    if (this.state.ready === false || this.player === false) {
      return;
    }

    let state = {};
    if (this.state.duration === 0) {
      const duration = this.player.getDuration();
      // state.duration = this.player.getDuration();
      if (!isNaN(duration)) {
        state.duration = duration;
      }
    }

    const currTime = this.player.getCurrentTime();
    if (!isNaN(currTime)) {
      if (this.state.currentTime !== currTime) {
        this.props.updateCurrentTime(currTime);
        state.currentTime = currTime;
      }
    }

    // when a new video url is passed to the component
    // if (this.state.url !== this.props.url) {
    //   state.url = this.props.url;
    //   state.duration = 0;
    //   state.currentTime = 0;
    //   this.player.loadVideoById(getYoutubeVideoId(state.url));
    //   this.doAction(ACTIONS.SEEK_TO, {currentTime: 0});
    // }

    this.setState(state);
  }

  startMainLoop() {
    this.mainLoopId = setInterval(this.mainLoop, 100);
  }

  componentDidMount() {
    // Initialise Player
    this.initIntervalId = setInterval(this.initPlayer, 100);

    // Main loop
    this.startMainLoop();
  }

  componentWillUnmount() {
    clearInterval(this.mainLoopId);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // handle url change
    if (prevProps.url !== this.props.url || this.props.forceReload === true) {
      this.props.resetForceReload();
      this.player.loadVideoById(getYoutubeVideoId(this.props.url));
      this.doAction(ACTIONS.SEEK_TO, { currentTime: 0 });
      this.setState({ url: this.props.url, duration: 0, currentTime: 0 });
    }

    // listen for commands from parent component
    if (prevProps.pause !== this.props.pause) {
      // setTimeout(() => {
      if (this.props.pause !== true) return;
      console.log("!!!!!!!!!!!!!!!!!!! PAUSE", this.state.currentTime);

      this.doAction(ACTIONS.PAUSE);
      // }, 1000);
    }

    if (prevProps.message === this.props.message) return;
    if (typeof this.props.message.name === "undefined") return;

    // if (this.props.message.name  === 'pause_playback') {
    //   this.doAction(ACTIONS.PAUSE);
    // }
  }

  render() {
    return (
      <PlayerWindow
        vendor={VENDORS.YOUTUBE}
        duration={this.state.duration}
        currentTime={this.state.currentTime}
        playbackState={this.state.playbackState}
        muted={this.state.muted}
        onPlayerReady={this.onPlayerReady}
        onPlayerStateChange={this.onPlayerStateChange}
        doAction={this.doAction}
        handleProgressClick={this.handleProgressClick}
        messageFromInteractor={this.props.messageFromInteractor}
      />
    );
  }
}

export default YoutubePlayer;
