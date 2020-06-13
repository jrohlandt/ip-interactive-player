import React from 'react';

import { STATES, VENDORS, ACTIONS } from './Constants';
import { isValidState, isValidAction } from './Helpers.js';
import { getVendor } from './utils/vendor';
import PlayerActions from './PlayerActions';
import PlayerWindow from './PlayerWindow.js';
import YoutubeAPI from './YoutubeAPI';

class Player extends React.Component {

  constructor(props) {
    super(props);

    this.player = false;
    // this.YoutubeInitIntervalId = null;
    this.YoutubeTimerId = null;

    this.state = {
      ready: false,
      vendor: '',
      playbackState: STATES.UNSTARTED,
      muted: false,
      duration: 0,
      currentTime: 0,
      url: '',
    };

    this.onPlayerReady = this.onPlayerReady.bind(this);
    this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
    this.onTimeUpdate = this.onTimeUpdate.bind(this);

    this.handleProgressClick = this.handleProgressClick.bind(this);
    this.doAction = this.doAction.bind(this);

    this.getPlayer = this.getPlayer.bind(this);
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.mute = this.mute.bind(this);
    this.unMute = this.unMute.bind(this);
    this.seekTo = this.seekTo.bind(this);
    this.getCurrentTime = this.getCurrentTime.bind(this);
    this.getDuration = this.getDuration.bind(this);
  }

  getPlayer() {
    return PlayerActions[this.state.vendor].getPlayer();
  }

  onPlayerReady() {

    this.setState({ ready: true });

    this.player = this.getPlayer();
    if (this.state.playbackState === STATES.UNSTARTED && this.props.autoplay) {
      setTimeout(() => {
        this.doAction(ACTIONS.PLAY);
        this.doAction(ACTIONS.SEEK_TO, { currentTime: 0 }); // todo is this really needed????
      }
        , 100); // wait for React to setState({ready: true})
    }
  }

  onPlayerStateChange(playbackState) {
    if (isValidState(playbackState)) {
      this.props.updatePlaybackState(playbackState);
      this.setState({ playbackState });
    }
    else
      console.error(`Invalid playback state: ${playbackState}.`);
  }

  onTimeUpdate() {
    let currentTime = this.getCurrentTime();
    let duration = this.getDuration();
    duration = isNaN(duration) ? 0 : duration;
    this.props.updateCurrentTime(currentTime);
    this.setState({ currentTime, duration });
  }

  play() {
    return PlayerActions[this.state.vendor].play(this.player);
  }

  pause() {
    return PlayerActions[this.state.vendor].pause(this.player);
  }

  mute() {
    return PlayerActions[this.state.vendor].mute(this.player);
  }

  unMute() {
    return PlayerActions[this.state.vendor].unMute(this.player);
  }

  seekTo(seconds) {
    return PlayerActions[this.state.vendor].seekTo(this.player, seconds);
  }

  getCurrentTime() {
    return PlayerActions[this.state.vendor].getCurrentTime(this.player);
  }

  getDuration() {
    return PlayerActions[this.state.vendor].getDuration(this.player);
  }

  doAction(action, params = {}) {
    action = action.toUpperCase();
    if (!isValidAction(action)) {
      throw new Error(`Invalid action ${action}.`);
    }

    if (!this.state.ready) {
      console.log(`Cannot perform action (${action}). Player is not ready yet`);
      return;
    }

    switch (action) {
      case (ACTIONS.PLAY):
        if (this.state.vendor === VENDORS.HTML5) {
          this.play()
            .catch(err => {
              console.warn(err);
              this.mute();
              this.play().catch(err => console.error(err));
              this.setState({ muted: true });
            });
        } else {
          this.play();
        }
        break;
      case (ACTIONS.PAUSE):
        this.pause();
        break;
      case (ACTIONS.MUTE):
        this.mute();
        this.setState({ muted: true });
        break;
      case (ACTIONS.UNMUTE):
        this.unMute();
        this.setState({ muted: false });
        break;
      case (ACTIONS.SEEK_TO):
        this.seekTo(params.currentTime);
        break;
      default:
        throw new Error(`Invalid action: ${action}.`);
    }
  }

  handleProgressClick(e) {
    const pos = (e.pageX - e.target.offsetLeft) / e.target.offsetWidth;
    this.doAction(ACTIONS.SEEK_TO, { currentTime: pos * this.state.duration });
  }

  componentDidMount() {
    const vendor = getVendor(this.props.url);

    if (vendor === VENDORS.YOUTUBE) {
      setTimeout(() => {
        YoutubeAPI(this.props.url, STATES, this.onPlayerReady, this.onPlayerStateChange);
        this.YoutubeTimerId = setInterval(() => {
          if (this.state.playbackState === STATES.ENDED) {
            clearInterval(this.YoutubeTimerId);
          }

          // Make sure player is ready and that player object is set.
          if (this.state.ready === false || this.player === false) {
            return;
          }

          this.onTimeUpdate(); // simulate onTimeUpdate event as YT API does not have one.
        });
      });
    }

    this.setState({ vendor: vendor });
    console.log('vendor: ', this.props.url, getVendor(this.props.url));
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.url !== this.props.url || this.props.forceReload === true) {
      this.props.resetForceReload();
      this.doAction(ACTIONS.PAUSE);
      this.doAction(ACTIONS.PLAY);
      this.setState({ duration: 0, currentTime: 0 });
    }

    // If new props is pause then pause (if not already paused)
    if (prevProps.pause !== this.props.pause && this.props.pause === true) {
      this.doAction(ACTIONS.PAUSE);
    };

    if (prevProps.message === this.props.message) return;
    if (typeof this.props.message.name === 'undefined') return;
  }

  render() {
    return (
      <React.Fragment>
        {this.state.vendor ?
          <PlayerWindow
            vendor={this.state.vendor}
            url={this.props.url}
            duration={this.state.duration}
            currentTime={this.state.currentTime}
            playbackState={this.state.playbackState}
            muted={this.state.muted}
            onPlayerReady={this.onPlayerReady}
            onPlayerStateChange={this.onPlayerStateChange}
            onTimeUpdate={this.onTimeUpdate}
            doAction={this.doAction}
            handleProgressClick={this.handleProgressClick}
          /> :
          ''}

      </React.Fragment>
    );
  }

}

export default Player;
