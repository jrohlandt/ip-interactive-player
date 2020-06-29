import React from 'react';

import { STATES, ON_PLAYER_STATE_CHANGE, ON_TIME_UPDATE } from './Constants';
import Player from './Player';

class VideoPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.communicateWithParent = false;
    this.state = {
      playbackState: STATES.UNSTARTED,
      duration: 0,
      currentTime: 0,
    };

    this.updateCurrentTime = this.updateCurrentTime.bind(this);
    this.updatePlaybackState = this.updatePlaybackState.bind(this);
    this.sendMessageToParent = this.sendMessageToParent.bind(this);
  }

  updateCurrentTime(currentTime) {
    this.setState({ currentTime });
  }

  updatePlaybackState(playbackState) {
    this.setState({ playbackState });
  }

  componentDidMount() {
    if (typeof (this.props.sendMessageToParent) === 'function') {
      this.communicateWithParent = true;
    }
  }
  sendMessageToParent(obj) {
    if (this.communicateWithParent !== true) return;
    this.props.sendMessageToParent({ message: obj });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {

    if (this.communicateWithParent !== true) return;

    if (prevState.playbackState !== this.state.playbackState) {
      this.sendMessageToParent({
        name: ON_PLAYER_STATE_CHANGE,
        params: { playbackState: this.state.playbackState }
      });
    }

    if (prevState.currentTime !== this.state.currentTime) {
      // console.log('inded time update', this.state.currentTime);
      this.sendMessageToParent({
        name: ON_TIME_UPDATE,
        params: { 'currentTime': this.state.currentTime }
      });
    }

    if (prevState.duration !== this.state.duration) {
      // send message toparent
    }
  }

  render() {
    return (
      <Player
        url={this.props.url}
        t={this.props.t}
        forceReload={this.props.forceReload}
        resetForceReload={this.props.resetForceReload}
        settings={{ autoplay: this.props.autoplay }}
        pause={this.props.pause}
        updateInteractorPlaybackState={this.updatePlaybackState}
        updateInteractorCurrentTime={this.updateCurrentTime}
        displayOverlay={this.props.displayOverlay}
      />
    );
  }

};

export default VideoPlayer;
