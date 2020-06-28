import React from 'react';
import './styles.css';
import { buildStructure } from './tree';
import { STATES, ON_PLAYER_STATE_CHANGE, ON_TIME_UPDATE } from '../../utils/constants';
import Ajax from '../../utils/ajax';
// import { isProduction } from '../../utils/env';
import VideoPlayer from '../VideoPlayer';

class Interactor extends React.Component {

  state;
  videoTree;
  autoplay = false;
  constructor(props) {
    super(props);

    this.state = {
      currentVideo: {
        currentTime: 0,
        id: 0,
        url: '',
        interactions: { fork: { enabled: false, type: 'on_end', start_time: 0 } },
        nodes: [],
      },
      currentInteraction: null,
      pauseCurrentVideo: false,
      forceReload: false, // if the next video has the same url, force the video player component to play it.
    };

    this.changeVideo = this.changeVideo.bind(this);
    this.messageFromVideoPlayer = this.messageFromVideoPlayer.bind(this);
    this.resetForceReload = this.resetForceReload.bind(this);

  }

  changeVideo(video) {
    let state = { ...this.state };
    state.currentVideo = {
      ...video,
      currentTime: 0,
    }
    state.currentInteraction = null;
    state.pauseCurrentVideo = false;
    if (state.currentVideo.url === this.state.currentVideo.url) {
      state.forceReload = true;
    }
    this.setState(state);
  }

  resetForceReload() {
    this.setState({ forceReload: false });
  }

  /**
   * getCurrentInteraction
   * Check if the current video has a interactor event type that matches "type"
   * and if it should be displayed now.
   * @param {obj} currentVideo 
   * @param {string} type // e.g. on_start, on_end or custom_time
   * @returns {obj or null}
   */
  getCurrentInteraction(currentVideo, type) {

    if (typeof currentVideo.interactions === 'undefined' || currentVideo.interactions.length === 0) return false;
    // if (typeof currentVideo.interactions.fork === 'undefined') return false;


    for (let i = 0; i < currentVideo.interactions.length; i++) {
      const interaction = currentVideo.interactions[i];

      // for now just hard code fork but later there will be other interactions (e.g. CTA, Optin etc)
      if (interaction.type !== "fork") {
        return null;
      }

      if (interaction.enabled !== true) return null;
      if (type !== interaction.start_time_type) return null;

      switch (type) {
        case 'on_start':
          interaction.enabled = false;
          return interaction;
        case 'on_end':
          interaction.enabled = false;
          return interaction;
        case 'custom_time':
          if (currentVideo.currentTime >= interaction.start_time) {
            interaction.enabled = false;
            return interaction;
          }
          break;
        default:
          return null;
      }
    }

    return null;
  }

  messageFromVideoPlayer(obj) {
    if (typeof obj.message === 'undefined' || typeof obj.message.name === 'undefined') return;
    const message = obj.message;

    let state = { ...this.state };
    let currentVideo = { ...this.state.currentVideo };

    // On State Change
    if (message.name === ON_PLAYER_STATE_CHANGE) {

      const playbackState = message.params.playbackState;

      switch (playbackState) {
        case STATES.UNSTARTED:
          // TODO show thumbnail
          break;
        case STATES.BUFFERING:
          break;
        case STATES.PLAYING:
          state.currentInteraction = this.getCurrentInteraction(currentVideo, 'on_start');
          break;
        case STATES.PAUSED:
          // TODO show thumbnail
          break;
        case STATES.ENDED:
          state.currentInteraction = this.getCurrentInteraction(currentVideo, 'on_end');
          break;
        case STATES.CUED:
          break;
        default:
          break;
      }
      currentVideo.playbackState = message.params.playbackState;
      state.currentVideo = currentVideo;
      this.setState(state);
    }

    // On Time Update
    if (message.name === ON_TIME_UPDATE) {

      currentVideo.currentTime = message.params.currentTime;
      if (state.currentInteraction === null) {
        state.currentInteraction = this.getCurrentInteraction(currentVideo, 'custom_time');
      }

      state.currentVideo = currentVideo;
      this.setState(state);
    }
  }

  componentDidMount() {

    const parsedURL = new URL(window.location.href);
    const projectId = parsedURL.searchParams.get('projectId');
    const autoplay = parsedURL.searchParams.get('autoplay');
    const loadDummyProject = parsedURL.searchParams.get('loadDummyProject');

    console.log(projectId, autoplay, typeof loadDummyProject);

    let url = '';
    if (loadDummyProject === 'true') {
      url = `${process.env.PUBLIC_URL}/data/project_1.json`;
    } else {
      url = `/api/player/get-details/${projectId}`;
    }

    Ajax.get(url)
      .then(res => {
        if (typeof res.project !== 'undefined') {
          if (res.project.nodes.length > 0) {
            this.videoTree = buildStructure(res.project.nodes);
            // console.log('video tree', this.videoTree);
            this.autoplay = autoplay !== null ? autoplay !== 'false' : res.project.settings.autoplay;
            // console.log('autoplay', this.autoplay);
            this.changeVideo(this.videoTree);
          }
        }
      })
      .catch(err => console.error(err));
  }

  render() {
    const { currentVideo, currentInteraction } = this.state;
    let interactionMarkup = null;

    if (currentInteraction) {
      interactionMarkup = (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
          // opacity: .5,
          backgroundColor: currentInteraction.style.backgroundColor,
        }}>
          {
            currentVideo.nodes.map(n => {
              return (
                <button
                  key={n.id}
                  style={n.style ? n.style : {}}
                  onClick={() => this.changeVideo(n)}
                >
                  {n.title}
                </button>
              );
            })
          }
        </div>
      );
    }

    return (
      <div className="wrapper">
        <div className="Interaction__wrapper">
          {
            this.state.currentVideo.url
              ? <VideoPlayer
                autoplay={this.autoplay}
                url={this.state.currentVideo.url}
                forceReload={this.state.forceReload}
                resetForceReload={this.resetForceReload}
                pause={!!currentInteraction}
                displayOverlay={interactionMarkup}
                sendMessageToParent={this.messageFromVideoPlayer}
                messageFromInteractor={this.state.messageToVideoPlayer}
              />
              : 'No video url supplied'
          }
        </div>

        <footer>footer</footer>
      </div>
    );
  }

}

export default Interactor;
