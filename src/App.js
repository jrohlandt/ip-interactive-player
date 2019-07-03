import React from 'react';
import logo from './logo.svg';
import './App.css';

import { ACTIONS, STATES, ON_PLAYER_STATE_CHANGE, ON_TIME_UPDATE } from './utils/constants';
class App extends React.Component {

  ifr;
  state;
  data;
  waitForData;
  constructor(props) {
    super(props);

    this.ifr = null;

    this.state = {
      currentVideo: {
        currentTime: 0,
        id: 0, // get rid
        url: '', // get rid
        data: { settings: { interactors: {enabled: 0}, children: []}},
        showInteractor: false, 
      },
    };

    this.postMessageToVideoPlayer = this.postMessageToVideoPlayer.bind(this);
    this.changeVideo = this.changeVideo.bind(this);
    this.listenForMessage = this.listenForMessage.bind(this);
  }

  postMessageToVideoPlayer(message) {
    this.ifr.contentWindow.postMessage({message}, "*");
  }

  changeVideo(video) {
    console.log(video);
    
    const message = {
      name: 'change_url', 
      params: {url: video.settings.video.video_url, start_at: 0, end_at: 0}
    };
    this.postMessageToVideoPlayer(message);
    this.setState({currentVideo: {id: video.id, data: video}});
  }

  showInteractor(currentVideo) {
    // let currentVideo = {...this.state.currentVideo};
    let interactor = currentVideo.data.settings.interactors;
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

  getInteractorStart(video) {
    let interactor = video.data.settings.interactors;

    if (interactor.enabled !== 1) return false;

    if (['start', 'end', 'custom'].indexOf(interactor.show_time) !== -1) {
      return interactor.show_time;
    }
  }

  listenForMessage() {
    window.addEventListener('message', (event) => {
     
      if (typeof event.data.message === 'undefined') return;

      const message = event.data.message;
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
            if (this.getInteractorStart(currentVideo) === 'start') {
              currentVideo.showInteractor = true;
              currentVideo.data.settings.interactors.enabled = 0;
              this.postMessageToVideoPlayer({name: 'pause_playback'});
            }
            break;
          case STATES.PAUSED:
            // show thumbnail
            break;
          case STATES.ENDED:
            if (this.getInteractorStart(currentVideo) === 'end') {
              currentVideo.showInteractor = true;
              currentVideo.data.settings.interactors.enabled = 0;
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
    });
  }

  componentDidMount() {
    this.ifr.onload = () => {
      this.waitForData = setInterval(_ => {
        if (typeof(window['forMrVideo']) === 'undefined') {
          return;
        }
        this.data = window['forMrVideo'];
        clearInterval(this.waitForData);

       this.listenForMessage();

        // start by sending parent video to player
        this.changeVideo(this.data.videos[0]);
      }, 100);
    }
  }

  componentWillUnmount() {
    clearInterval(this.waitForData);
  }

  render() {
    let currentVideo = this.state.currentVideo;
    let interactionMarkup = <div style={{'display': 'none'}}></div>;

    if (currentVideo.showInteractor) {
      interactionMarkup = (
        <div className="current-interaction">
          { 
            currentVideo.data.settings.children.map(c => {
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
          <div className="iframe-wrapper">
            { interactionMarkup }
            <iframe 
              allow="autoplay"
              src="http://localhost:3000" width="300" height="300" 
              ref={(f) => this.ifr = f }
            />
          </div>
          
          <footer>footer</footer>
      </div>
    );
  }
  
}

export default App;
