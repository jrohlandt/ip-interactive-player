import React from 'react';
import PropTypes from 'prop-types';
import styles from './PlayerWindow.module.css';
import './styles.css';

import { STATES, ACTIONS } from './Constants';

class PlayerWindow extends React.Component {

  constructor(props) {
    super(props);

    this.playbackStateIs = this.playbackStateIs.bind(this);
    this.handleProgressClick = this.handleProgressClick.bind(this);

  }

  componentDidCatch(error, info) {
    // Can also be logged to an error reporting service
    console.error('PlayerWindow: ', error, info);
  }

  playbackStateIs(playbackState) {
    return this.props.playbackState === playbackState;
  }

  handleProgressClick(e) {
    const pos = (e.pageX - e.target.offsetLeft) / e.target.offsetWidth;
    this.props.doAction(ACTIONS.SEEK_TO, { currentTime: pos * this.props.duration });
  }

  render() {
    const props = this.props;

    const mutedOverlay = <div className={styles.mutedOverlay}>muted</div>;
    const bufferingOverlay = <div className={styles.bufferingOverlay}>buffering</div>;

    return (
      <div className="wrapper">

        <div className="player-container">

          {/* <!-- Player element --> */}
          <div id="player" data-src=""></div>

          {/* Overlays */}
          {/* Place overlays after Youtube element */}
          {props.muted ? mutedOverlay : ''}
          {this.playbackStateIs(STATES.BUFFERING) ? bufferingOverlay : ''}

          {/* <!-- Player Controls --> */}
          <div className="player-control-bar" >

            {/* <!-- todo use webpack to load icons --> */}
            <div
              id="play-button"
              className={"play-button " + (this.playbackStateIs(STATES.PLAYING) ? 'playing ' : 'paused ')}
              onClick={() => props.doAction(this.playbackStateIs(STATES.PLAYING) ? ACTIONS.PAUSE : ACTIONS.PLAY)}
            >
              <img src="/icons/play-icon.svg" className="play" alt="" />
              <img src="/icons/paused-icon.svg" className="pause" alt="" />
            </div>

            <div className="progress-bar-wrapper">
              <progress
                id="progress-bar"
                max={props.duration}
                value={props.currentTime}
                onClick={this.handleProgressClick}
              ></progress>
            </div>

            <div
              id="mute-button"
              className={"mute-button " + (props.muted === true ? "muted" : "not-muted")}
              onClick={() => props.doAction(props.muted ? ACTIONS.UNMUTE : ACTIONS.MUTE)}
            >
              <img src="/icons/sound-on-icon.svg" className="sound-on" alt="" />
              <img src="/icons/sound-off-icon.svg" className="sound-off" alt="" />
            </div>

          </div>
        </div>

      </div>
    );
  }

};

PlayerWindow.propTypes = {
  duration: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
  muted: PropTypes.bool.isRequired,
  doAction: PropTypes.func.isRequired,
};

export default PlayerWindow;