import React from "react";
import "./styles.css";
import { buildStructure } from "../../utils/tree";
import {
  STATES,
  ON_PLAYER_STATE_CHANGE,
  ON_TIME_UPDATE
} from "../../utils/constants";
import Ajax from "../../utils/ajax";
// import { isProduction } from '../../utils/env';
import VideoPlayer from "../VideoPlayer";

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
        url: "",
        interactions: { fork: { enabled: false, type: "on_end" }, tails: [] },
        nodes: [],
        showInteractor: false
      },
      messageToVideoPlayer: {},
      pauseCurrentVideo: false,
      forceReload: false // if the next video has the same url, force the video player component to play it.
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
      showInteractor: false
    };
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
   * shouldPresentFork
   * Check if the current video has a interactor event type that matches "type"
   * and if it should be displayed now.
   * @param {obj} currentVideo
   * @param {string} type // e.g. on_start, on_end or custom_time
   */
  shouldPresentFork(currentVideo, type) {
    if (typeof currentVideo.interactions === "undefined") return false;
    if (typeof currentVideo.interactions.fork === "undefined") return false;

    let fork = currentVideo.interactions.fork;

    if (fork.enabled !== true) return false;
    if (type !== fork.type) return false;

    let shouldShow = false;
    switch (type) {
      case "on_start":
        shouldShow = true;
        break;
      case "on_end":
        shouldShow = true;
        break;
      case "custom_time":
        if (currentVideo.currentTime >= fork.start_time) {
          shouldShow = true;
        }
        break;
      default:
        break;
    }

    return shouldShow;
  }

  messageFromVideoPlayer(obj) {
    if (
      typeof obj.message === "undefined" ||
      typeof obj.message.name === "undefined"
    )
      return;
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
          if (this.shouldPresentFork(currentVideo, "on_start")) {
            currentVideo.showInteractor = true;
            currentVideo.interactions.fork.enabled = false;
            state.pauseCurrentVideo = true;
          }
          break;
        case STATES.PAUSED:
          // TODO show thumbnail
          break;
        case STATES.ENDED:
          if (this.shouldPresentFork(currentVideo, "on_end")) {
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

      if (this.shouldPresentFork(currentVideo, "custom_time")) {
        currentVideo.showInteractor = true;
        currentVideo.interactions.fork.enabled = false;
        state.pauseCurrentVideo = true;
      }

      // show tails
      if (currentVideo.interactions && currentVideo.interactions.tails) {
        // const tails = currentVideo.interactions.tails.filter(
        //   t => t.coordinates[message.params.currentTime] === 1
        // );

        let tails = [];
        for (let i = 0; i < currentVideo.interactions.tails.length; i++) {
          let t = currentVideo.interactions.tails[i];
          if (t.coordinates[Math.floor(message.params.currentTime)]) {
            tails.push({
              x: "10%", //t.coordinates[Math.floor(message.params.currentTime)]["x"],
              y: "10%", //t.coordinates[Math.floor(message.params.currentTime)]["y"],
              label: t.label,
              content: t.content
            });
          }
        }

        state.messageToVideoPlayer.tails = tails.length > 0 ? tails : [];
        if (tails.length)
          console.log(
            "tails: ",
            currentVideo.interactions.tails.length,
            Math.floor(message.params.currentTime),
            tails
          );
        // currentVideo.messageToVideoPlayer.tails = tails.map(t => ({
        //   x: t.coordinates["" + message.params.currentTime]["x"],
        //   y: t.coordinates["" + message.params.currentTime]["y"],
        //   label: t.label,
        //   content: t.content
        // }));
        // [
        //   {
        //     start_time: 10,
        //     end_time: 32,
        //     label: "click for info",
        //     content: "hello this is the content text",

        //     x: "201px",
        //     y: "153px"
        //   },
        //   {
        //     start_time: 10,
        //     end_time: 32,
        //     label: "click for info",
        //     content: "hello this is the content text",

        //     x: "401px",
        //     y: "253px"
        //   }
        // ];
      } else {
        state.messageToVideoPlayer.tails = [];
      }

      state.currentVideo = currentVideo;
      this.setState(state);
    }
  }

  componentDidMount() {
    const parsedURL = new URL(window.location.href);
    const projectId = parsedURL.searchParams.get("projectId");
    let nodeId = parsedURL.searchParams.get("nodeId");
    const autoplay = parsedURL.searchParams.get("autoplay");
    const loadDummyProject = parsedURL.searchParams.get("loadDummyProject");

    console.log(projectId, autoplay, typeof loadDummyProject);

    let url = "";
    if (loadDummyProject === "true") {
      url = `${process.env.PUBLIC_URL}/data/project_1.json`;
    } else {
      url = `/player/${projectId}`;
    }

    Ajax.get(url)
      .then(res => {
        if (typeof res.project !== "undefined") {
          if (res.project.nodes.length > 0) {
            if (nodeId !== null) {
              nodeId = parseInt(nodeId, 10);
            } else {
              nodeId = 0;
            }
            console.log(res.project.nodes);
            this.videoTree = buildStructure(res.project.nodes, nodeId);
            // console.log('video tree', this.videoTree);
            this.autoplay =
              autoplay !== null
                ? autoplay !== "false"
                : res.project.settings.autoplay;
            // console.log('autoplay', this.autoplay);
            this.changeVideo(this.videoTree);
          }
        }
      })
      .catch(err => console.error(err));
  }

  render() {
    let currentVideo = this.state.currentVideo;
    let interactionMarkup = <div style={{ display: "none" }} />;

    if (currentVideo.showInteractor) {
      interactionMarkup = (
        <div className="current-interaction">
          {currentVideo.nodes.map(n => {
            return (
              <button key={n.id} onClick={() => this.changeVideo(n)}>
                {n.title}
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className="wrapper">
        <div className="interactor-wrapper">
          {interactionMarkup}
          {this.state.currentVideo.url ? (
            <VideoPlayer
              autoplay={this.autoplay}
              url={this.state.currentVideo.url}
              forceReload={this.state.forceReload}
              resetForceReload={this.resetForceReload}
              pause={this.state.pauseCurrentVideo}
              // play={this.state.play}
              sendMessageToParent={this.messageFromVideoPlayer}
              messageFromInteractor={this.state.messageToVideoPlayer}
            />
          ) : (
            "No video url supplied"
          )}
        </div>

        <footer>footer</footer>
      </div>
    );
  }
}

export default Interactor;
