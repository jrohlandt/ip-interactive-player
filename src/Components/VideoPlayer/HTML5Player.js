import React from 'react';

import { STATES, VENDORS, ACTIONS } from './Constants';
import { isValidState, isValidAction } from './Helpers.js';
import PlayerWindow from './PlayerWindow.js';

class HTML5Player extends React.Component {

    constructor(props) {
        super(props);

        this.player = false;

        this.state = {
          ready: false,
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
    }

  onPlayerReady() {
    this.setState({ready: true});
    this.player = document.getElementById('player').getElementsByTagName('video')[0];
    if (this.state.playbackState === STATES.UNSTARTED && this.props.autoplay) {
        setTimeout(_ => this.doAction(ACTIONS.PLAY), 100); // wait for React to setState({ready: true})
    }
  }

  onPlayerStateChange(playbackState) {
    console.log('pp: ', playbackState);
    if (isValidState(playbackState)) {
      this.props.updatePlaybackState(playbackState);
      this.setState({playbackState});
    }
    else 
      console.error(`Invalid playback state: ${playbackState}.`);
  }

  onTimeUpdate() {
    let { currentTime, duration } = this.player;
    duration = isNaN(duration) ? 0 : duration;
    this.props.updateCurrentTime(currentTime);
    this.setState({currentTime, duration});
  }

  doAction(action, params={}) {
    action = action.toUpperCase();
    if (!isValidAction(action)) {
      throw new Error(`Invalid action ${action}.`);
    }

    if (!this.state.ready) {
      console.log(`Cannot perform action (${action}). Player is not ready yet`);
      return;
    }

    switch (action) {
      case(ACTIONS.PLAY):
         this.player.play()
            .catch(err => {
                console.warn(err);
               this.player.muted = true; // todo need to set state to muted as well somehow.
               this.player.play()
                    .catch(err => console.error(err));
                this.setState({muted: true});                
            });
          break;
      case (ACTIONS.PAUSE):
         this.player.pause();
          break;
      case (ACTIONS.MUTE):
         this.player.muted = true;
          this.setState({muted: true});
          break;
      case (ACTIONS.UNMUTE):
         this.player.muted = false;
          this.setState({muted: false});
          break;
      case (ACTIONS.SEEK_TO):
       this.player.currentTime = params.currentTime;
        break;
      default:
          throw new Error(`Invalid action: ${action}.`);
    }
  }

  handleProgressClick(e) {
      const pos = (e.pageX - e.target.offsetLeft) / e.target.offsetWidth;
      this.doAction(ACTIONS.SEEK_TO, {currentTime: pos * this.state.duration});
  }

  componentDidMount() {
    //
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.url !== this.props.url) {
      this.doAction(ACTIONS.PAUSE);
      this.doAction(ACTIONS.PLAY);
      this.setState({duration: 0, currentTime: 0});
    }

    if (prevProps.pause !== this.props.pause) {
      this.doAction(ACTIONS.PAUSE);
    };

    if (prevProps.message === this.props.message) return;
    if (typeof this.props.message.name === 'undefined') return;

    // if (this.props.message.name  === 'pause_playback') {
    //   this.doAction(ACTIONS.PAUSE);
    // }
  }

  render() {
    return (
      <React.Fragment>
        <PlayerWindow 
                vendor={VENDORS.HTML5}
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
              />
        
      </React.Fragment>
    );  
  }
  
}

export default HTML5Player;
