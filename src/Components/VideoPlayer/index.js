import React from 'react';

import { STATES, ON_PLAYER_STATE_CHANGE, ON_TIME_UPDATE } from './Constants';
// import { isValidState, isValidVendor, isValidAction } from './Helpers.js';
import HTML5Player from './HTML5Player.js';
import { VENDORS } from './Constants.js';
import YoutubePlayer from './YoutubePlayer.js';
import { join } from 'path';

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
    this.setState({currentTime});
  }

  updatePlaybackState(playbackState) {
    this.setState({playbackState});
  }

  componentDidMount() {
    if (typeof(this.props.sendMessageToParent) === 'function') {
      this.communicateWithParent = true;
    }
  }
  sendMessageToParent(obj) {
    if (this.communicateWithParent !== true) return;
    this.props.sendMessageToParent({message: obj});
  }

  componentDidUpdate(prevProps, prevState, snapshot) {

    if (this.communicateWithParent !== true) return;
    
    if (prevState.playbackState !== this.state.playbackState) {
      this.sendMessageToParent({
        name: ON_PLAYER_STATE_CHANGE, 
        params: {playbackState: this.state.playbackState}
      });
    }

    if (prevState.currentTime !== this.state.currentTime) {
      // console.log('inded time update', this.state.currentTime);
      this.sendMessageToParent({
        name: ON_TIME_UPDATE, 
        params: { 'currentTime' : this.state.currentTime }
      });
    }

    if (prevState.duration !== this.state.duration) {
      // send message toparent
    }
  }

  render() {
    const props = {
      vendor: this.props.vendor,
      url: this.props.url,
      autoplay: this.props.autoplay,
      message: this.props.message,
      // purposely exluding this.props.sendMessageToParent
    };

    switch(props.vendor) {
      case VENDORS.HTML5: 
        return (
          <HTML5Player 
            {...props} 
            updatePlaybackState={this.updatePlaybackState}
            updateCurrentTime={this.updateCurrentTime}
          />
        );
      case VENDORS.YOUTUBE:
        return (
          <YoutubePlayer 
            {...props} 
            updatePlaybackState={this.updatePlaybackState} 
            updateCurrentTime={this.updateCurrentTime}
          />
        );
      default:
        return <div>Invalid vendor</div>;
    }
  }
    
};

export default VideoPlayer;
