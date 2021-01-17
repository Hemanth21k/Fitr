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

function get_score(pose1,pose2,minConfidence){
  console.log("getting score")
  let p1Array = [];
  let p2Array = [];

  for (let i = 5; i < pose1.length; i++) {
    let p1keypoint = pose1[i];
    let p2keypoint = pose2[i];
    console.log(p1keypoint.score,p2keypoint.score)
    if (p1keypoint.score < minConfidence || p2keypoint.score < minConfidence) {
      // console.log("Exiting score")
      continue;
    }
    // console.log(p1keypoint.position)
    let x1 = p1keypoint.position.x;
    let y1 = p1keypoint.position.y;
    console.log(x1,y1)
    p1Array.push(x1,y1)  

    let x2 = p2keypoint.position.x;
    let y2 = p2keypoint.position.y;
    p2Array.push(x2,y2)
  } 


// console.log(p1Array,p2Array)
//cosine sim
let num=0;
let d1 = 0;
let d2 = 0;

for (let j=0;j<p1Array.length;j++){
  num += p1Array[j] * p2Array[j];
  d1 += p1Array[j] ** 2;
  d2 += p2Array[j] ** 2;
}

d1 = Math.sqrt(d1)
d2 = Math.sqrt(d2)


if (d1!=0 || d2!=0){

  let cosineSim = num/(d1*d2);
  let EuclidDist = 2 * (1-cosineSim);
  EuclidDist = Math.sqrt(EuclidDist);
  console.log("CosScore:", cosineSim,"EuclidSCORE:" ,EuclidDist)
  return [cosineSim,EuclidDist];

}
else{
  return [0,0];
}

}
  


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
    this.canvasRef = React.createRef(null);
    this.webcamRef = React.createRef(null);
    this.state = {
      cosScore :0,
      EuclidScore:0,
      frameImg: 0
    };

  }
  

  render(){

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
      typeof this.webcamRef.current !== "undefined" &&
      this.webcamRef.current !== null &&
      this.webcamRef.current.video.readyState === 4
    ) {
      // Grab Video Properties
      const video = this.webcamRef.current.video;
      const videoWidth = this.webcamRef.current.video.videoWidth;
      const videoHeight = this.webcamRef.current.video.videoHeight;
      // Adjust video width
      this.webcamRef.current.video.width = videoWidth;
      this.webcamRef.current.video.height = videoHeight;
// Make Estimation

      const pose = await posenet_model.estimateSinglePose(video);
      // console.log("Cam:",pose)
      drawResult(pose, video, videoWidth, videoHeight, this.canvasRef);


      const frame = captureVideoFrame(this.player.getInternalPlayer())
//       console.log("captured frame: ",frame)
//       // const frameWidth = this.player.videoWidth
// //       // const frameHeight = this.player.videoHeight
convertURIToImageData(frame.dataUri).then(imageData => this.setState({
  // Here you can use imageData

  frameImg:imageData
}));
//       console.log(this.state.frameImg)
    if (this.state.frameImg != 0){
      const framePose = await posenet_model.estimateSinglePose(this.state.frameImg)
      // console.log("Frame:",framePose)
      // console.log("FramePose: ",framePose)
      // drawResult(framePose,this.state.frameImg,videoWidth,videoHeight,canvasRef)

      const [cosSim,euSim] = get_score(pose['keypoints'],framePose['keypoints'],0.3)

      // console.log("CosScore:", cosSim,"Euclid:" ,euSim)

      this.setState({
        cosScore:cosSim,
        EuclidScore:euSim
      });
    }
      // console.log("Frame : CosScore:", this.state.cosScore,"Euclid:" ,this.state.EuclidScore)
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
        <div className = "Scores" style = {{position:"absolute",top:20}}>
          <div> CosineScore: {this.state.cosScore}</div>
          <div> EuclidScore: {this.state.EuclidScore} </div>
        </div>
        


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
          ref={this.webcamRef}
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
          ref={this.canvasRef}
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

