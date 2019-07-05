import React from 'react';
import './styles.css';
import { buildStructure } from '../../utils/tree';
import { ACTIONS, STATES, ON_PLAYER_STATE_CHANGE, ON_TIME_UPDATE } from '../../utils/constants';
import Ajax from '../../utils/ajax';
import { isDev } from '../../utils/env';
import VideoPlayer from '../VideoPlayer';

class Interactor extends React.Component {

  state;
  videoTree;
  constructor(props) {
    super(props);

    this.state = {
      currentVideo: {
        currentTime: 0,
        id: 0,
        url: '',
        // data: { settings: { interactors: {enabled: 0}, children: []}},
        interactor: {enabled: false, type: 'on_end', start_time: 0},
        nodes: [],
        showInteractor: false, 
      },
      pauseCurrentVideo: false,
    };

    this.changeVideo = this.changeVideo.bind(this);
    this.messageFromVideoPlayer = this.messageFromVideoPlayer.bind(this);
  }

  changeVideo(video) {
    // let currentVideo = {...this.state};
    console.log('!!!!!!!!!!!!change video', video);
    
    // state.messageToVideoPlayer = {
    //   name: 'change_url', 
    //   params: {url: video.url, start_at: 0, end_at: 0}
    // };
    const currentVideo = {
        ...video,
        currentTime: 0,
        showInteractor: false,
    }
    // state.currentVideo = video; //{id: video.id, url: video.url};
    this.setState({currentVideo, pauseCurrentVideo: false});
  }

  /**
   * shouldShowInteractor
   * Check if the current video has a interactor event type that matches "type"
   * and if it should be displayed now.
   * @param {obj} currentVideo 
   * @param {string} type // e.g. on_start, on_end or custom_time
   */
  shouldShowInteractor(currentVideo, type) {
    
    if (typeof currentVideo.interactor === 'undefined') return false;
    
    let interactor = currentVideo.interactor;
    if (interactor.enabled !== true) return false;
    if (type !== interactor.type) return false;

    switch(type) {
      case 'on_start':
        console.log('display on start');
        return true;
      case 'on_end':
        console.log('display on end');
        return true;
      case 'custom_time':
        if (currentVideo.currentTime >= interactor.start_time) {
          console.log('custom time');
          return true;
        }
    }

    return false;
  }

  getInteractor(video) {

    if (typeof this.state.currentVideo.interactor === 'undefined') return false;
    let interactor = this.state.currentVideo.interactor;

    if (interactor.enabled !== true) return false;

    if (['on_start', 'on_end', 'custom_time'].indexOf(interactor.type) !== -1) {
      return interactor;
    }
  }

  messageFromVideoPlayer(obj) {
      if (typeof obj.message === 'undefined' || typeof obj.message.name === 'undefined') return;
      const message = obj.message;

      let state = {...this.state};
      let currentVideo = {...this.state.currentVideo};

      // On State Change
      if (message.name === ON_PLAYER_STATE_CHANGE) {

        const playbackState = message.params.playbackState;

        switch(playbackState) {
          case STATES.UNSTARTED:
            // show thumbnail
            break;
          case STATES.BUFFERING:
            break;
          case STATES.PLAYING:
            if (this.shouldShowInteractor(currentVideo, 'on_start')) {
              currentVideo.showInteractor = true;
              currentVideo.interactor.enabled = false;
              state.pauseCurrentVideo = true;
            }
            break;
          case STATES.PAUSED:
            // show thumbnail
            break;
          case STATES.ENDED:
            if (this.shouldShowInteractor(currentVideo, 'on_end')) {
                currentVideo.showInteractor = true;
                currentVideo.interactor.enabled = false;
                // state.pauseCurrentVideo = true;
            }
            break;
          case STATES.CUED:
            break;
        }
        // console.log(ON_PLAYER_STATE_CHANGE, message.params.playbackState);
        currentVideo.playbackState = message.params.playbackState;
        state.currentVideo = currentVideo;
        this.setState(state);
      }

      // On Time Update
      if (message.name === ON_TIME_UPDATE) {
        // console.log('parent receiveded onTimeUpdate', message.params.currentTime);
        currentVideo.currentTime = message.params.currentTime;
        
        if (this.shouldShowInteractor(currentVideo, 'custom_time')) {
          currentVideo.showInteractor = true;
          currentVideo.interactor.enabled = false;
          state.pauseCurrentVideo = true;
        }

        state.currentVideo = currentVideo;
        this.setState(state);
      }
  }

  componentDidMount() {
    let url = `${process.env.PUBLIC_URL}/data/project_1.json`;
    if (!isDev()) {
      const projectId = document.head.querySelector('meta[name="project-id"]').getAttribute('content');
      url = `/projects/${projectId}`;
    }

    Ajax.get(url)
      .then(res => {
        if (typeof res.project !== 'undefined') {
          if (res.project.nodes.length > 0) {
            this.videoTree = buildStructure(res.project.nodes);
            console.log('video tree', this.videoTree);
            this.changeVideo(this.videoTree);

            // setInterval(_ => console.log(this.state.currentVideo.interactor), 500);
          }
        }
      })
      .catch(err => console.error(err));
  }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   if (prevState.currentVideo.interactor !== this.state.currentVideo.interactor) {
  //     console.log('###########state interactor changed');
  //     console.log(prevState.currentVideo.interactor, this.state.currentVideo.interactor);
  //   }
  // }


  render() {
    let currentVideo = this.state.currentVideo;
    let interactionMarkup = <div style={{'display': 'none'}}></div>;

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
          <header>
              <div className="logo"><img src="/images/pp2-logo-white.png" alt="" /></div>
          </header>
          <div className="interactor-wrapper">
            { interactionMarkup }
            { 
                this.state.currentVideo.url 
                    ?   <VideoPlayer
                            autoPlay={true}
                            url={this.state.currentVideo.url}
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
