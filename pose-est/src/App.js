import './App.css';
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import { drawKeypoints, drawSkeleton } from "./utilities";
import React from "react";
import ReactPlayer from 'react-player'
import captureVideoFrame from "capture-video-frame/capture-video-frame.js";
import ReactDOM from 'react-dom';
// import { Player } from 'video-react';

function convertURIToImageData(URI) {
  return new Promise(function(resolve, reject) {
    if (URI == null) return reject();
    var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        image = new Image();
    image.addEventListener('load', function() {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(context.getImageData(0, 0, canvas.width, canvas.height));
    }, false);
    image.src = URI;
  });
}
class App extends React.Component{
	constructor (props){
		super(props);

		this.state = {

			frameImg: ''
		};

	}
	

	render(){const webcamRef = React.createRef(null);
	const canvasRef = React.createRef(null);

  const runPosenet = async () => {
    const posenet_model = await posenet.load({
    	architecture: 'MobileNetV1',
  		outputStride: 16,
      inputResolution: { width: 320, height: 224 },
      multiplier: 0.75
    });
    //
    setInterval(() => {
      detectWebcamFeed(posenet_model);

    }, 100);
};

	const detectWebcamFeed = async (posenet_model) => {
    if ( // make sure webcam are avaliable
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Grab Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      // Adjust video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
// Make Estimation
      const pose = await posenet_model.estimateSinglePose(video);
      console.log(pose)
      drawResult(pose, video, videoWidth, videoHeight, canvasRef);


      const frame = captureVideoFrame(this.player.getInternalPlayer())
      console.log("captured frame: ",frame)
      const frameWidth = this.player.videoWidth
      const frameHeight = this.player.videoHeight
      var frameImage = new Image;
      frameImage.src = frame.dataUri
convertURIToImageData(frame.dataUri).then(imageData => this.setState({
  // Here you can use imageData

  frameImg:imageData
}));
      console.log(this.state.frameImg)
      const framePose = await posenet_model.estimateSinglePose(this.state.frameImg)
      console.log("FramePose: ",framePose)
      drawResult(framePose,this.state.frameImg,videoWidth,videoHeight,canvasRef)
    }
  };
  runPosenet();
  const drawResult = (pose, video, videoWidth, videoHeight, canvas) => {
    const ctx = canvas.current.getContext("2d");
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;
    drawKeypoints(pose["keypoints"], 0.6, ctx);
    drawSkeleton(pose["keypoints"], 0.7, ctx);
  };




  return (
    <div className="App">
      <header className="App-header">
      	<ReactPlayer
      		ref={player => { this.player = player }}
      		url = 'test.mp4'
      		controls = {true}
      		style = {{position:"absolute",
      					left:20

      				}}
      		config={{ file: { attributes: {
					    crossorigin: 'anonymous'
					  }}}}
      	/>

      	<Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            right: 100,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />


        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            right: 100,
            textAlign: "center",
            zindex: 9,
            width: 640,

            height: 480,
          }}
        />
      </header>
    </div>
  );

	}


}

export default App;

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

