import React from 'react';
import PropTypes from 'prop-types';
import './styles.css';

import { STATES, VENDORS, ACTIONS } from './Constants';

const PlayerWindow = function(props) {
    return (
        <div className="wrapper">
  
          <div className="player-container">
            { 
              props.vendor === VENDORS.HTML5 && props.playbackState === STATES.BUFFERING 
                ? <div className="player-buffering-overlay">
                    buffering
                  </div>
                : ''
            }
            
              {/* <!-- Player element --> */}
              <div id="player" data-src="">
                {
                  props.vendor === VENDORS.HTML5 
                    ? <video 
                        // key={props.url}
                        src={props.url}
                        onLoadedMetadata={props.onPlayerReady}  
                        onPlay={() => props.onPlayerStateChange(STATES.PLAYING)}
                        onPause={() => props.onPlayerStateChange(STATES.PAUSED)}
                        onEnded={() => props.onPlayerStateChange(STATES.ENDED)}
                        onWaiting={() => props.onPlayerStateChange(STATES.BUFFERING)}
                        onPlaying={() => props.onPlayerStateChange(STATES.PLAYING)}
                        onTimeUpdate={props.onTimeUpdate}
                      />
                    : ''
                }
              </div>
  
              {/* <!-- Player Controls --> */}
              <div className="player-control-bar" >
  
                  {/* <!-- todo use webpack to load icons --> */}
                  <div 
                    id="play-button"
                    className={ "play-button " + (props.playbackState === STATES.PLAYING ? 'playing ' : 'paused ')} 
                    onClick={() => props.doAction(props.playbackState === STATES.PLAYING ? ACTIONS.PAUSE : ACTIONS.PLAY)}
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
                    className={"mute-button " + (props.muted === true ? "muted" : "not-muted") }
                    onClick={() => props.doAction(props.muted ? ACTIONS.UNMUTE : ACTIONS.MUTE)}
                  >
                      <img src="/icons/sound-on-icon.svg" className="sound-on" alt="" />
                      <img src="/icons/sound-off-icon.svg" className="sound-off" alt="" />
                  </div>
  
              </div>
          </div>
  
      </div>
    );
};

PlayerWindow.propTypes = {
  vendor: PropTypes.string,
  url: PropTypes.string,
  duration: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
  playbackState: PropTypes.number.isRequired,
  muted: PropTypes.bool.isRequired,

  onPlayerReady: PropTypes.func.isRequired,
  onPlayerStateChange: PropTypes.func.isRequired,
  onTimeUpdate: PropTypes.func, // so far only html5 player uses onTimeUpdate
  doAction: PropTypes.func.isRequired,
  handleProgressClick: PropTypes.func.isRequired,
};

export default PlayerWindow;