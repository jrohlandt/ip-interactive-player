import React from 'react';
import { interpret } from 'xstate';
import { STATES, VENDORS, ACTIONS } from './Constants';
import { isValidState, isValidAction } from './Helpers.js';
import { getVendor } from './utils/vendor';
import PlayerActions from './PlayerActions';
import PlayerWindow from './PlayerWindow.js';
import HTML5API from './VideoPlayers/HTML5API';
import YoutubeAPI from './VideoPlayers/YoutubeAPI';
import PlayerMachine from './PlayerMachine';

class Player extends React.Component {

  constructor(props) {
    super(props);

    this.player = false;
    this.YoutubeTimerId = null;
    this.service = interpret(PlayerMachine).onTransition(current => {
      // console.log('xstate:', current.value, current.context); 
      this.setState({ current });
    });

    this.state = {
      // ready: false,
      // vendor: '',
      // playbackState: STATES.UNSTARTED,
      // muted: false,
      // duration: 0,
      // currentTime: 0,
      // url: '',
      current: PlayerMachine.initialState,
    };

    this.onPlayerReady = this.onPlayerReady.bind(this);
    this.onPlayerError = this.onPlayerError.bind(this);

    this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
    this.onTimeUpdate = this.onTimeUpdate.bind(this);

    this.handleProgressClick = this.handleProgressClick.bind(this);
    this.doAction = this.doAction.bind(this);

    this.getPlayer = this.getPlayer.bind(this);


    this.initPlayer = this.initPlayer.bind(this);
    this.initYoutube = this.initYoutube.bind(this);

    this.currentStateIs = this.currentStateIs.bind(this);
  }

  currentStateIs(string) {
    return this.state.current.matches('ready.' + string);
  }

  getPlayer() {
    return PlayerActions[this.state.current.context.vendor].getPlayer();
  }

  onPlayerError(e) {
    this.service.send('ERROR', { error: e });
  }

  onPlayerReady() {
    console.log('player ready', this.getPlayer())
    // this.setState({ ready: true });
    this.service.send("READY", { player: this.getPlayer() });

    if (this.props.autoplay) {
      // setTimeout(() => {
      this.service.send("PLAY"); // todo handle in ready.unstarted state
    }
  }

  onPlayerStateChange(playbackState) {
    console.log('state change: ', playbackState)
    if (isValidState(playbackState)) {
      this.props.updatePlaybackState(playbackState);
      // this.setState({ playbackState, muted: this.isMuted() });
      this.service.send(playbackState);
    }
    else {
      this.service.send('ERROR', { error: `Invalid playback state: ${playbackState}.` });
    }
  }

  onTimeUpdate() {
    this.service.send('ON_TIME_UPDATE');
    this.props.updateCurrentTime(this.state.current.context.currentTime);
  }

  initPlayer(vendor) {
    this.service.send('INITIALIZE', { vendor, autoplay: this.props.autoplay })
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

  initHTML5() {
    setTimeout(() => {
      HTML5API(this.props.url, this.onPlayerReady, this.onPlayerError, this.onTimeUpdate, this.onPlayerStateChange);
    }, 100);
  }

  initYoutube() {

    if (this.YoutubeTimerId !== null) {
      clearInterval(this.YoutubeTimerId); // so player will be re-initialized 
    }

    setTimeout(() => {
      YoutubeAPI(this.props.url, this.onPlayerReady, this.onPlayerError, this.onPlayerStateChange);
      // start YT Timer
      this.YoutubeTimerId = setInterval(() => {
        if (this.state.playbackState === STATES.ended) {
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
  };



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

    switch (action) {
      case (ACTIONS.PLAY):
        this.service.send(ACTIONS.PLAY);
        break;
      case (ACTIONS.PAUSE):
        this.service.send(ACTIONS.PAUSE);
        break;
      case (ACTIONS.MUTE):
        this.service.send(ACTIONS.MUTE);
        break;
      case (ACTIONS.UNMUTE):
        this.service.send(ACTIONS.UNMUTE);
        break;
      case (ACTIONS.SEEK_TO):
        // this.seekTo(params.currentTime);
        this.service.send(ACTIONS.SEEK_TO, { seconds: params.currentTime });
        break;
      case (ACTIONS.CHANGE_SOURCE):
        this.service.send(ACTIONS.CHANGE_SOURCE, { src: params.src });
        break;
      default:
        throw new Error(`Invalid action: ${action}.`);
    }
  }

  handleProgressClick(e) {
    const pos = (e.pageX - e.target.offsetLeft) / e.target.offsetWidth;
    this.doAction(ACTIONS.SEEK_TO, { currentTime: pos * this.state.current.context.duration });
  }

  componentDidMount() {
    this.service.start();
    const vendor = getVendor(this.props.url);

    this.initPlayer(vendor);
  }

  componentWillUnmount() {
    this.service.stop();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.url !== this.props.url || this.props.forceReload === true) {
      this.props.resetForceReload();

      const vendor = getVendor(this.props.url);
      console.log(this.state.current.context.vendor, vendor);
      if (this.state.current.context.vendor !== vendor) {
        // destroy player and reset state
        this.destroy();
        this.initPlayer(vendor);
        this.setState({ vendor, duration: 0, currentTime: 0 });
      }
      else {
        this.doAction(ACTIONS.CHANGE_SOURCE, { src: this.props.url });
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
    const { current } = this.state;
    return (
      <>
        {current.context.vendor ?
          <PlayerWindow
            vendor={current.context.vendor}
            duration={current.context.duration}
            currentTime={current.context.currentTime}
            playbackState={current.value}
            currentStateIs={this.currentStateIs}
            muted={current.context.muted}
            onPlayerReady={this.onPlayerReady}
            onPlayerStateChange={this.onPlayerStateChange}
            onTimeUpdate={this.onTimeUpdate}
            doAction={this.doAction}
            handleProgressClick={this.handleProgressClick}
          /> :
          ''}

      </>
    );
  }

}

export default Player;
