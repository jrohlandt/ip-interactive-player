import React from 'react';
import { STATES, VENDORS, ACTIONS } from './Constants';
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

    this.state = {
      autoplay: false,
      vendor: '',
      player: null,
      ready: false,
      playbackState: STATES.UNSTARTED,
      url: '',
      duration: 0,
      currentTime: 0,
      muted: false,
      buffering: false,
    };

    this.onPlayerReady = this.onPlayerReady.bind(this);
    this.onPlayerError = this.onPlayerError.bind(this);

    this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
    this.onTimeUpdate = this.onTimeUpdate.bind(this);


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
    this.changeSrc = this.changeSrc.bind(this);
    this.changeSrc = this.changeSrc.bind(this);
    this.destroy = this.destroy.bind(this);

    this.doAction = this.doAction.bind(this);

  }

  onPlayerError(e) {
    // this.service.send('ERROR', { error: e });
    console.error(e);
  }

  onPlayerReady(player) {
    this.setState({ ready: true, player });
    if (this.state.autoplay) {
      this.doAction(ACTIONS.PLAY);
    }
  }

  onPlayerStateChange(playbackState) {
    if (isValidState(playbackState)) {
      if (playbackState === STATES.BUFFERING) {
        this.setState({ buffering: true });
      }
      else {
        this.props.updateInteractorPlaybackState(playbackState);
        this.setState({ playbackState, buffering: false });
      }

    }
    else {
      // this.service.send('ERROR', { error: `Invalid playback state: ${playbackState}.` });
    }
  }

  onTimeUpdate(data = {}) {
    if (!this.state.player) return;
    let currentTime = 0;
    let duration = 0;
    if (this.state.vendor === VENDORS.VIMEO) {
      currentTime = typeof data.seconds !== 'undefined' ? data.seconds : 0;
      duration = typeof data.duration !== 'undefined' ? data.duration : 0;
    }
    else {
      currentTime = this.getCurrentTime();
      duration = this.getDuration();
    }
    this.props.updateInteractorCurrentTime(currentTime);
    // todo update interactorDuration
    this.setState({ currentTime, duration });
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

    this.setState({
      player: null,
      vendor: vendor,
      autoplay: this.props.settings.autoplay,
      duration: 0,
      currentTime: 0,
    });
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
      if (this.state.playbackState === STATES.ENDED) {
        clearInterval(this.YoutubeTimerId);
        return;
      }

      // Make sure player is ready and that player object is set.
      if (!this.state.ready) {
        return;
      }

      this.onTimeUpdate(); // simulate onTimeUpdate event as YT API does not have one.
    }, 100);
  };

  play = () => PlayerActions[this.state.vendor].play(this.state.player);

  pause = () => PlayerActions[this.state.vendor].pause(this.state.player);

  mute = () => PlayerActions[this.state.vendor].mute(this.state.player);

  unMute = () => PlayerActions[this.state.vendor].unMute(this.state.player);

  isMuted = () => {
    // todo 
  }

  seekTo = seconds => PlayerActions[this.state.vendor].seekTo(this.state.player, seconds);

  getCurrentTime() {
    return PlayerActions[this.state.vendor].getCurrentTime(this.state.player);
  }

  getDuration() {
    return PlayerActions[this.state.vendor].getDuration(this.state.player);
  }

  changeSrc = url => PlayerActions[this.state.vendor].changeSrc(this.state.player, url);

  destroy() {
    if (this.YoutubeTimerId !== null) clearInterval(this.YoutubeTimerId); // stop YT timer
    PlayerActions[this.state.vendor].destroy(this.state.player);
  }

  doAction(action, params = {}) {
    action = action.toUpperCase();
    if (!isValidAction(action)) {
      throw new Error(`Invalid action ${action}.`);
    }

    if (!this.state.ready) {
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
        this.setState({ muted: true });
        break;
      case (ACTIONS.UNMUTE):
        this.unMute();
        this.setState({ muted: false });
        break;
      case (ACTIONS.SEEK_TO):
        this.seekTo(params.currentTime);
        this.setState({ currentTime: params.currentTime }); // state will be updated anyway when ontimeupdate fires, but setting it here as well makes the player feel more responsive.
        break;
      case (ACTIONS.CHANGE_SOURCE):
        this.changeSrc(params.src);
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
      if (this.state.vendor !== vendor) {
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
    const { vendor, duration, currentTime, playbackState, muted, buffering } = this.state;
    return (
      <>
        {vendor ?
          <PlayerWindow
            duration={duration}
            currentTime={currentTime}
            playbackState={playbackState}
            muted={muted}
            buffering={buffering}
            doAction={this.doAction}
            vendor={vendor}
          /> :
          ''}

      </>
    );
  }

}



export default Player;
