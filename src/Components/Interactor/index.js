import React from 'react';
import './styles.css';
import { buildStructure } from '../../utils/tree';
import { ACTIONS, STATES, ON_PLAYER_STATE_CHANGE, ON_TIME_UPDATE } from '../../utils/constants';
import Ajax from '../../utils/ajax';
import { isDev } from '../../utils/env';
import VideoPlayer from '../VideoPlayer';

class Interactor extends React.Component {

  ifr;
  state;
  videoTree;
  constructor(props) {
    super(props);

    this.ifr = null;

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
    //   messageToVideoPlayer: {},
    };

    this.changeVideo = this.changeVideo.bind(this);
    this.messageFromVideoPlayer = this.messageFromVideoPlayer.bind(this);
  }

  changeVideo(video) {
    // let currentVideo = {...this.state};
    console.log('change video', video);
    
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
    this.setState({currentVideo});
  }

  showInteractor(currentVideo) {
    // let currentVideo = {...this.state.currentVideo};
    let interactor = currentVideo.interactor;
    const currentTime = currentVideo.currentTime;

    if (interactor.enabled === 1) {
      switch(interactor.show_time) {
        case 'start':
          // if currentVideo.playbackState === STATES.STARTED
          console.log('display on start');
          return false;
        case 'end':
          console.log('display on end');
          // currentVideo.playbackState === STATES.ENDED
          return false;
        case 'custom':
          console.log('custom time');
          if (currentTime >= interactor.custom_time) {
            return true;
          }
          return false;
      }

    }
  }

  getInteractor(video) {
    let interactor = this.state.currentVideo.interactor;

    if (interactor.enabled !== 1) return false;

    if (['start', 'end', 'custom'].indexOf(interactor.start_time) !== -1) {
      return interactor.start_time;
    }
  }

  messageFromVideoPlayer(obj) {
        // console.log('message from player', message);
      if (typeof obj.message === 'undefined' || typeof obj.message.name === 'undefined') return;
      const message = obj.message;
    //   console.log('plaer state sendMessageToParent' );

      let currentVideo = {...this.state.currentVideo};

      // On State Change
      if (message.name === ON_PLAYER_STATE_CHANGE) {
        console.log('message from player', message);

        const playbackState = message.params.playbackState;

        switch(playbackState) {
          case STATES.UNSTARTED:
            // show thumbnail
            break;
          case STATES.BUFFERING:
            break;
          case STATES.PLAYING:
            let interactor = this.getInteractor(currentVideo);
            if (interactor.type === 'on_start') {
                console.log('playing and interactor: ', interactor);
              currentVideo.showInteractor = true;
              currentVideo.interactor.enabled = 0;
              this.postMessageToVideoPlayer({name: 'pause_playback'});
            }
            break;
          case STATES.PAUSED:
            // show thumbnail
            break;
          case STATES.ENDED:
            if (this.getInteractor(currentVideo) === 'end') {
                currentVideo.showInteractor = true;
                currentVideo.interactor.enabled = 0;
              this.postMessageToVideoPlayer({name: 'pause_playback'});
            }
            break;
          case STATES.CUED:
            break;
        }
        console.log(ON_PLAYER_STATE_CHANGE, message.params.playbackState);
        currentVideo.playbackState = message.params.playbackState;
        this.setState({currentVideo});
      }

      // On Time Update
      if (message.name === ON_TIME_UPDATE) {
        // console.log('parent receiveded onTimeUpdate', message.params.currentTime);
        currentVideo.currentTime = message.params.currentTime;
        
        if (this.showInteractor(currentVideo)) {
          currentVideo.showInteractor = true;
          currentVideo.data.settings.interactors.enabled = 0;
          this.postMessageToVideoPlayer({name: 'pause_playback'});
        }

        this.setState({currentVideo});
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
          }
        }
      })
      .catch(err => console.error(err));
  }


  render() {
    let currentVideo = this.state.currentVideo;
    let interactionMarkup = <div style={{'display': 'none'}}></div>;

    if (currentVideo.showInteractor) {
      interactionMarkup = (
        <div className="current-interaction">
          { 
            currentVideo.nodes.map(c => {
              // console.log('child: ', c);
              return (
                  <button 
                    key={c.id}
                    onClick={() => this.changeVideo(c)} 
                  >
                    {c.settings.title}
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
                            // pause={this.state.pause}
                            // play={this.state.play}
                            sendMessageToParent={this.messageFromVideoPlayer}
                            messageFromInteractor={this.state.messageToVideoPlayer}
                        />
                    : ''
            }
          </div>
          
          <footer>footer</footer>
      </div>
    );
  }
  
}

export default Interactor;
