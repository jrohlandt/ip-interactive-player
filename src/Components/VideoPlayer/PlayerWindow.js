import React from 'react';
import PropTypes from 'prop-types';
import styles from './PlayerWindow.module.css';
import './styles.css';

import { STATES, ACTIONS } from './Constants';

class PlayerWindow extends React.Component {

  componentDidCatch(error, info) {
    // Can also be logged to an error reporting service
    console.error('PlayerWindow: ', error, info);
  }

  render() {
    const props = this.props;

    const mutedOverlay = <div className={styles.mutedOverlay}>muted</div>;
    const bufferingOverlay = <div className={styles.bufferingOverlay}>buffering</div>;

    return (
      <div className="wrapper">

        <div className="player-container">

          {/* <!-- Player element --> */}
          <div id="player" data-src="">

          </div>

          {/* Overlays */}
          {/* Place overlays after Youtube element */}
          {props.muted ? mutedOverlay : ''}
          {/* {props.playbackState === STATES.BUFFERING ? bufferingOverlay : ''} */}

          {/* <!-- Player Controls --> */}
          <div className="player-control-bar" >

            {/* <!-- todo use webpack to load icons --> */}
            <div
              id="play-button"
              className={"play-button " + (props.currentStateIs(STATES.playing) ? 'playing ' : 'paused ')}
              onClick={() => props.doAction(props.currentStateIs(STATES.playing) ? ACTIONS.PAUSE : ACTIONS.PLAY)}
            >
              <img src="/icons/play-icon.svg" className="play" alt="" />
              <img src="/icons/paused-icon.svg" className="pause" alt="" />
            </div>

            <div className="progress-bar-wrapper">
              <progress
                id="progress-bar"
                max={props.duration}
                value={props.currentTime}
                onClick={props.handleProgressClick}
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
  vendor: PropTypes.string,
  duration: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
  muted: PropTypes.bool.isRequired,

  onPlayerReady: PropTypes.func.isRequired,
  onPlayerStateChange: PropTypes.func.isRequired,
  onTimeUpdate: PropTypes.func, // so far only html5 player uses onTimeUpdate
  doAction: PropTypes.func.isRequired,
  handleProgressClick: PropTypes.func.isRequired,
};

export default PlayerWindow;