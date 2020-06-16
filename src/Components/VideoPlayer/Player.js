import React from 'react';

import { STATES, VENDORS, ACTIONS } from './Constants';
import { isValidState, isValidAction } from './Helpers.js';
import { getVendor } from './utils/vendor';
import PlayerActions from './PlayerActions';
import PlayerWindow from './PlayerWindow.js';
import HTML5API from './VideoPlayers/HTML5API';
import YoutubeAPI from './VideoPlayers/YoutubeAPI';

class Player extends React.Component {

  constructor(props) {
    super(props);

    this.player = false;
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
    this.onPlayerError = this.onPlayerError.bind(this);

    this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
    this.onTimeUpdate = this.onTimeUpdate.bind(this);

    this.handleProgressClick = this.handleProgressClick.bind(this);
    this.doAction = this.doAction.bind(this);

    this.getPlayer = this.getPlayer.bind(this);
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.mute = this.mute.bind(this);
    this.unMute = this.unMute.bind(this);
    this.isMuted = this.isMuted.bind(this);
    this.seekTo = this.seekTo.bind(this);
    this.getCurrentTime = this.getCurrentTime.bind(this);
    this.getDuration = this.getDuration.bind(this);
    this.changeSrc = this.changeSrc.bind(this);

    this.initPlayer = this.initPlayer.bind(this);
    this.initYoutube = this.initYoutube.bind(this);
  }

  getPlayer() {
    return PlayerActions[this.state.vendor].getPlayer();
  }

  onPlayerError(error) {
    // note in html5 player this will e will be event and in YT it will be and error.
    console.error(error); // todo handle UI
  }

  onPlayerReady() {
    console.log('player ready', this.getPlayer())
    this.setState({ ready: true });

    this.player = this.getPlayer();
    if (/*this.state.playbackState === STATES.UNSTARTED && */this.props.autoplay) {
      setTimeout(() => {
        this.doAction(ACTIONS.PLAY); // wait for React to setState({ready: true})
        // this.doAction(ACTIONS.SEEK_TO, { currentTime: 0 }); // todo is this really needed????
      }
        , 100); // wait for React to setState({ready: true})
    }
  }

  onPlayerStateChange(playbackState) {
    console.log('state change: ', playbackState)
    if (isValidState(playbackState)) {
      this.props.updatePlaybackState(playbackState);
      this.setState({ playbackState, muted: this.isMuted() });
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

  initPlayer(vendor) {
    switch (vendor) {
      case VENDORS.HTML5:
        this.initHTML5();
        break;
      case VENDORS.YOUTUBE:
        this.initYoutube();
        break;
      default:
        break;
    }
  }

  play = () => PlayerActions[this.state.vendor].play(this.player);
  pause = () => PlayerActions[this.state.vendor].pause(this.player);
  mute = () => PlayerActions[this.state.vendor].mute(this.player);
  unMute = () => PlayerActions[this.state.vendor].unMute(this.player);
  isMuted = () => PlayerActions[this.state.vendor].isMuted(this.player);
  seekTo = seconds => PlayerActions[this.state.vendor].seekTo(this.player, seconds);
  getCurrentTime = () => PlayerActions[this.state.vendor].getCurrentTime(this.player);
  getDuration = () => PlayerActions[this.state.vendor].getDuration(this.player);
  changeSrc = url => PlayerActions[this.state.vendor].changeSrc(this.player, url);
  destroy() {
    if (this.YoutubeTimerId !== null) {
      clearInterval(this.YoutubeTimerId); // stop YT timer
    }
    return PlayerActions[this.state.vendor].destroy(this.player);
  }

  doAction(action, params = {}) {
    action = action.toUpperCase();
    if (!isValidAction(action)) {
      throw new Error(`Invalid action ${action}.`);
    }

    if (!this.state.ready || this.player === false) {
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

    this.initPlayer(vendor);

    this.setState({ vendor: vendor });
    console.log('vendor: ', this.props.url, getVendor(this.props.url));
  }

  initHTML5() {
    setTimeout(() => {
      HTML5API(this.props.url, this.onPlayerReady, this.onPlayerError, this.onTimeUpdate, this.onPlayerStateChange);
    }, 100);
    this.player = false;
    this.setState({ ready: false });
  }

  initYoutube() {

    if (this.YoutubeTimerId !== null) {
      clearInterval(this.YoutubeTimerId); // so player will be re-initialized 
    }

    setTimeout(() => {
      YoutubeAPI(this.props.url, this.onPlayerReady, this.onPlayerError, this.onPlayerStateChange);
      // start YT Timer
      this.YoutubeTimerId = setInterval(() => {
        if (this.state.playbackState === STATES.ENDED) {
          clearInterval(this.YoutubeTimerId);
          return;
        }

        // Make sure player is ready and that player object is set.
        if (this.state.ready === false || this.player === false) {
          return;
        }

        this.onTimeUpdate(); // simulate onTimeUpdate event as YT API does not have one.
      }, 100);
    }, 100);
    this.player = false;
    this.setState({ ready: false });
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.url !== this.props.url || this.props.forceReload === true) {
      this.props.resetForceReload();

      const vendor = getVendor(this.props.url);
      if (prevState.vendor !== vendor) {
        // destroy player and reset state
        this.destroy();
        this.initPlayer(vendor);
        this.setState({ vendor, duration: 0, currentTime: 0 });
      }
      else {
        this.doAction(ACTIONS.PAUSE);
        this.changeSrc(this.props.url);
        this.doAction(ACTIONS.SEEK_TO, { currentTime: 0 });
        this.doAction(ACTIONS.PLAY);
      }
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
