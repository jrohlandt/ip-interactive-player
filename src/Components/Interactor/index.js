import React from 'react';
import './styles.css';
import { buildStructure } from '../../utils/tree';
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
        showInteractor: false,
      },
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
      showInteractor: false,
    }
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
   * shouldShowInteractor
   * Check if the current video has a interactor event type that matches "type"
   * and if it should be displayed now.
   * @param {obj} currentVideo 
   * @param {string} type // e.g. on_start, on_end or custom_time
   */
  shouldShowInteractor(currentVideo, type) {

    if (typeof currentVideo.interactions === 'undefined') return false;
    if (typeof currentVideo.interactions.fork === 'undefined') return false;


    let interactor = currentVideo.interactions.fork; // for now just hard code fork but later there will be other interactions (e.g. CTA, Optin etc)
    if (interactor.enabled !== true) return false;
    if (type !== interactor.type) return false;

    switch (type) {
      case 'on_start':
        return true;
      case 'on_end':
        return true;
      case 'custom_time':
        if (currentVideo.currentTime >= interactor.start_time) {
          return true;
        }
        break;
      default:
        return false;
    }

    return false;
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
          if (this.shouldShowInteractor(currentVideo, 'on_start')) {
            currentVideo.showInteractor = true;
            currentVideo.interactions.fork.enabled = false;
            state.pauseCurrentVideo = true;
          }
          break;
        case STATES.PAUSED:
          // TODO show thumbnail
          break;
        case STATES.ENDED:

          if (this.shouldShowInteractor(currentVideo, 'on_end')) {
            currentVideo.showInteractor = true;
            currentVideo.interactions.fork.enabled = false;
            // state.pauseCurrentVideo = true; // video already ended 
          }
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

      if (this.shouldShowInteractor(currentVideo, 'custom_time')) {
        currentVideo.showInteractor = true;
        currentVideo.interactions.fork.enabled = false;
        state.pauseCurrentVideo = true;
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
      console.log('laod dummy');
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
    let currentVideo = this.state.currentVideo;
    let interactionMarkup = <div style={{ 'display': 'none' }}></div>;

    if (currentVideo.showInteractor) {
      interactionMarkup = (
        <div className="current-interaction">
          {
            currentVideo.nodes.map(n => {
              return (
                <button
                  key={n.id}
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
        <div className="interactor-wrapper">
          {interactionMarkup}
          {
            this.state.currentVideo.url
              ? <VideoPlayer
                autoplay={this.autoplay}
                url={this.state.currentVideo.url}
                forceReload={this.state.forceReload}
                resetForceReload={this.resetForceReload}
                pause={this.state.pauseCurrentVideo}
                // play={this.state.play}
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
