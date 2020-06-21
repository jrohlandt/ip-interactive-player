import React from 'react';
import { connect } from 'react-redux';
import { STATES, VENDORS, ACTIONS } from './Constants';
import { playerInit, playerReady, updatePlaybackState, updateCurrentTime, updateDuration, updateMuteState } from '../../redux/actions';
import { isValidState, isValidAction } from './Helpers.js';
import { getVendor } from './utils/vendor';
import PlayerActions from './PlayerActions';
import PlayerWindow from './PlayerWindow.js';
import VimeoAPI from './VideoPlayers/VimeoAPI';
import HTML5API from './VideoPlayers/HTML5API';
import YoutubeAPI from './VideoPlayers/YoutubeAPI';

class Player extends React.Component {

  constructor(props) {
    super(props);

    this.YoutubeTimerId = null;

    this.state = {};

    this.onPlayerReady = this.onPlayerReady.bind(this);
    this.onPlayerError = this.onPlayerError.bind(this);

    this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
    this.onTimeUpdate = this.onTimeUpdate.bind(this);

    this.doAction = this.doAction.bind(this);

    this.initPlayer = this.initPlayer.bind(this);
    this.initHTML5 = this.initHTML5.bind(this);
    this.initVimeo = this.initVimeo.bind(this);
    this.initYoutube = this.initYoutube.bind(this);

    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.mute = this.mute.bind(this);
    this.unMute = this.unMute.bind(this);
    this.seekTo = this.seekTo.bind(this);
    this.getCurrentTime = this.getCurrentTime.bind(this);
    this.getDuration = this.getDuration.bind(this);
  }

  onPlayerError(e) {
    // this.service.send('ERROR', { error: e });
    console.error(e);
  }

  onPlayerReady(player) {
    this.props.playerReady(player);
    if (this.props.autoplay) {
      this.doAction(ACTIONS.PLAY);
    }
  }

  onPlayerStateChange(playbackState) {
    if (isValidState(playbackState)) {
      this.props.updatePlaybackState(playbackState);
      this.props.updateParentPlaybackState(playbackState); // todo connect <Interactor /> to redux store so no need for prop drilling.
    }
    else {
      // this.service.send('ERROR', { error: `Invalid playback state: ${playbackState}.` });
    }
  }

  onTimeUpdate(data = {}) {
    const currentTime = typeof data.seconds !== 'undefined' ? data.seconds : this.getCurrentTime();
    this.props.updateCurrentTime(currentTime);
    this.props.updateParentCurrentTime(currentTime); // todo connect <Interactor /> to redux store so no need for prop drilling.

    const duration = typeof data.duration !== 'undefined' ? data.duration : this.getDuration();
    this.props.updateDuration(duration);

  }

  initPlayer(url) {
    const vendor = getVendor(url);

    switch (vendor) {
      case VENDORS.VIMEO:
        this.initVimeo(url);
        break;
      case VENDORS.HTML5:
        this.initHTML5(url);
        break;
      case VENDORS.YOUTUBE:
        this.initYoutube(url);
        break;
      default:
        console.error(`Vendor ${vendor} not recognized.`);
        break;
    }

    this.props.playerInit(vendor, this.props.settings.autoplay);
  }

  initHTML5(url) {
    HTML5API(
      url,
      this.onPlayerReady,
      this.onPlayerError,
      this.onTimeUpdate,
      this.onPlayerStateChange
    );
  }

  initVimeo(url) {
    VimeoAPI(
      url,
      this.doAction,
      this.onPlayerReady,
      this.onPlayerError,
      this.onTimeUpdate,
      this.onPlayerStateChange
    );
  }

  initYoutube(url) {
    if (this.YoutubeTimerId !== null) {
      clearInterval(this.YoutubeTimerId); // so player will be re-initialized 
    }

    YoutubeAPI(url, this.onPlayerReady, this.onPlayerError, this.onPlayerStateChange);
    // start YT Timer
    this.YoutubeTimerId = setInterval(() => {
      if (this.props.playbackState === STATES.ENDED) {
        clearInterval(this.YoutubeTimerId);
        return;
      }

      // Make sure player is ready and that player object is set.
      if (!this.props.ready) {
        return;
      }

      this.onTimeUpdate(); // simulate onTimeUpdate event as YT API does not have one.
    }, 100);
  };

  play = () => PlayerActions[this.props.vendor].play(this.props.player);

  pause = () => PlayerActions[this.props.vendor].pause(this.props.player);

  mute = () => PlayerActions[this.props.vendor].mute(this.props.player);

  unMute = () => PlayerActions[this.props.vendor].unMute(this.props.player);

  isMuted = () => {
    // todo 
  }

  seekTo = seconds => PlayerActions[this.props.vendor].seekTo(this.props.player, seconds);

  getCurrentTime() {
    return PlayerActions[this.props.vendor].getCurrentTime(this.props.player);
  }

  getDuration() {
    return PlayerActions[this.props.vendor].getDuration(this.props.player);
  }

  destroy() {
    if (this.YoutubeTimerId !== null) clearInterval(this.YoutubeTimerId); // stop YT timer
    PlayerActions[this.props.vendor].destroy(this.props.player);
  }

  doAction(action, params = {}) {
    action = action.toUpperCase();
    if (!isValidAction(action)) {
      throw new Error(`Invalid action ${action}.`);
    }

    if (!this.props.ready) {
      console.warn('player not ready');
      return;
    }

    switch (action) {
      case (ACTIONS.PLAY):
        this.play();
        break;
      case (ACTIONS.PAUSE):
        this.pause();
        break;
      case (ACTIONS.MUTE):
        this.mute();
        this.props.updateMuteState(true);
        break;
      case (ACTIONS.UNMUTE):
        this.unMute();
        this.props.updateMuteState(false);
        break;
      case (ACTIONS.SEEK_TO):
        this.seekTo(params.currentTime);
        this.props.updateCurrentTime(params.currentTime);
        break;
      case (ACTIONS.CHANGE_SOURCE):
        // this.service.send(ACTIONS.CHANGE_SOURCE, { src: params.src });
        break;
      default:
        throw new Error(`Invalid action: ${action}.`);
    }
  }

  componentDidMount() {
    this.initPlayer(this.props.url);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.url !== this.props.url || this.props.forceReload === true) {
      this.props.resetForceReload();

      const vendor = getVendor(this.props.url);
      if (this.props.vendor !== vendor) {
        this.destroy();
        this.initPlayer(this.props.url);
      }
      else {
        this.doAction(ACTIONS.CHANGE_SOURCE, { src: this.props.url });
      }
    }

    // If new props is pause then pause (if not already paused)
    if (prevProps.pause !== this.props.pause && this.props.pause === true) {
      this.doAction(ACTIONS.PAUSE);
    };

    // if (prevProps.message === this.props.message) return;
    // if (typeof this.props.message.name === 'undefined') return;
  }

  render() {
    const { vendor, duration, currentTime, playbackState, muted, } = this.props;
    return (
      <>
        {vendor ?
          <PlayerWindow
            duration={duration}
            currentTime={currentTime}
            playbackState={playbackState}
            muted={muted}
            doAction={this.doAction}
          /> :
          ''}

      </>
    );
  }

}

const mapStateToProps = state => ({
  vendor: state.videoPlayer.vendor,
  player: state.videoPlayer.player,
  ready: state.videoPlayer.ready,
  playbackState: state.videoPlayer.playbackState,
  duration: state.videoPlayer.duration,
  currentTime: state.videoPlayer.currentTime,
  muted: state.videoPlayer.muted,
  autoplay: state.videoPlayer.autoplay,
});

const mapDispatchToProps = {
  playerInit,
  playerReady,
  updatePlaybackState,
  updateCurrentTime,
  updateDuration,
  updateMuteState,
};

export default connect(mapStateToProps, mapDispatchToProps)(Player);
