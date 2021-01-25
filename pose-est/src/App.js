import './App.css';
// import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import { drawKeypoints, drawSkeleton } from "./utilities";
import React from "react";
import ReactPlayer from 'react-player'
import captureVideoFrame from "capture-video-frame/capture-video-frame.js";
import ReactDOM from 'react-dom';
import * as Math from "math";
// import { Player } from 'video-react';
 

 // IMPORT ALL IMAGES 
function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
  return images;
}

const images = importAll(require.context('../public/YogaPoses', false, /\.(jpg)$/));

console.log(images)

const imgArr = [];

for(var key in images){
	imgArr.push(key);
}

var imgInd = 0;


// GET COSINE AND EUCLID SCORE
function get_score(pose1,pose2,minConfidence){
	console.log("getting score")
  let arr1 = [];
  let arr2 = [];
	let minX = [10000,10000];
	let minY = [10000,10000];
	let maxX = [0,0];
	let maxY = [0,0];
	let n = 0;
	let meanX = [0,0];
	let meanY = [0,0];
  for (let i = 5; i < pose1.length; i++) {

    let p1keypoint = pose1[i];
    let p2keypoint = pose2[i];
    // console.log(p1keypoint.score,p2keypoint.score)
    if (p1keypoint.score < minConfidence || p2keypoint.score < minConfidence) {
    	console.log("Exiting score")
      continue;
    }
    // console.log(p1keypoint.position)
    let x1 = p1keypoint.position.x;
    let y1 = p1keypoint.position.y;
    // console.log(x1,y1)
    let x2 = p2keypoint.position.x;
    let y2 = p2keypoint.position.y;
	
	if(x1 > maxX[0]){
		maxX[0] = x1;
	}else if(x1 < minX[0]){
		minX[0] = x1;
	}else if (x2 > maxX[1]){
		maxX[1] = x2;
	}else if (x2 < minX[1]){
		minX[1] = x2;
	}else if (y1 > maxY[0]){
		maxY[0] = y1;
	}else if (y1 < minY[0]){
		minY[0] = y1;
	}else if (y2 > maxY[1]) {
		maxY[1] = y2;
	}else if (y2 < minY[1]){
		minY[1] = y2;
	}else {}
	meanX[0] += x1;
	meanX[1] += x2;
	meanY[0] += y1;
	meanY[1] += y2;
	arr1.push([x1,y1,p1keypoint.score])
	arr2.push([x1,y1,p1keypoint.score])
	n+=1;
  } 


let width1 = maxX[0] - minX[0];
let height1 = maxY[0] - minY[0];
let width2 = maxX[1] - minX[1];
let height2 = maxY[1] - minY[1];

let scale_factor1 = Math.max(width1,height1);
let scale_factor2 = Math.max(width2,height2);

meanX[0] = meanX[0] / n;
meanX[1] = meanX[1] / n;
meanY[0] = meanY[0] / n;
meanY[1] = meanY[1] / n;
let outArr1 = [];
let outArr2 = [];
for(let i =0; i<arr1.length;i++){
	let t1 = (arr1[i][0] - meanX[0]) / scale_factor1;
	outArr1.push(t1)
	t1 = (arr1[i][1] - meanY[0]) / scale_factor1;
	outArr1.push(t1)
	outArr1.push(arr1[i][2])

	t1 = (arr2[i][0] - meanX[1]) / scale_factor2;
	outArr2.push(t1)
	t1 = (arr2[i][1] - meanY[1]) / scale_factor2;
	outArr2.push(t1)
	outArr2.push(arr2[i][2])
}






// console.log(p1Array,p2Array)
// //cosine sim

let num =0;
let d1 = 0;
let d2 = 0;
for (let j=0;j<outArr1.length;j++){
	num += outArr1[j] * outArr2[j];
	d1 += outArr1[j] ** 2;
	d2 += outArr2[j] ** 2;
}

d1 = Math.sqrt(d1)
d2 = Math.sqrt(d2)


if (d1!==0 || d2!==0){

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
			timer:0,
			image: '',
			cosScore :0,
			EuclidScore:0,
			cuRpose: 0
			// frameImg: 0
		};

	}
	

	render(){
		var counter = 0;
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
    }, 100);    // call detectWebCam for every 100ms

};
// 	const detectPose = async(posenet_model) =>{
// 		if ( // make sure webcam are avaliable
//       typeof this.webcamRef.current !== "undefined" &&
//       this.webcamRef.current !== null &&
//       this.webcamRef.current.video.readyState === 4
//     ) {
//       // Grab Video Properties
//       let video = this.webcamRef.current.video;
//       let videoWidth = this.webcamRef.current.video.videoWidth;
//       let videoHeight = this.webcamRef.current.video.videoHeight;
//       // Adjust video width
//       this.webcamRef.current.video.width = videoWidth;
//       this.webcamRef.current.video.height = videoHeight;
// // Make Estimation

//       let pose = await posenet_model.estimateSinglePose(video);
//       // console.log("Cam:",pose)
//       // drawResult(pose, video, videoWidth, videoHeight, this.canvasRef);


//       let frame = captureVideoFrame(this.player.getInternalPlayer())
// // //       console.log("captured frame: ",frame)
// // //       // const frameWidth = this.player.videoWidth
// // // //       // const frameHeight = this.player.videoHeight
// convertURIToImageData(frame.dataUri).then(imageData => this.setState({
//   // Here you can use imageData
//   frameImg:imageData
// }));
// // //       console.log(this.state.frameImg)
// 	  if (this.state.frameImg != 0){
//       let framePose = await posenet_model.estimateSinglePose(this.state.frameImg)
// //       console.log("Frame:",framePose)
// //       // console.log("FramePose: ",framePose)
// //       // drawResult(framePose,this.state.frameImg,videoWidth,videoHeight,canvasRef)

//       let [cosSim,euSim] = get_score(pose['keypoints'],framePose['keypoints'],0.3)

// //       console.log("CosScore:", cosSim,"Euclid:" ,euSim)

//       this.setState({
//       	cosScore:cosSim,
//       	EuclidScore:euSim
//       });
//   	 }
// 	}};

	const detectWebcamFeed = async (posenet_model) => {
		counter +=1;                    


	if (counter%10 === 0){ //count every second
		this.setState({timer: this.state.timer+1})   // increase counter 

		if(this.state.timer%10 === 0){         //call this for every 10 sec  
			var img = new Image(640,480);
			img.src  = images[imgArr[imgInd]].default;
			var imgPose = await posenet_model.estimateSinglePose(img)
			console.log("img: ", img)
			console.log("POSE: ", imgPose)
			this.setState({
			image: img,
			cuRpose: imgPose
		});
		if (imgInd < imgArr.length -1){
			imgInd +=1;
		}
		else{
			imgInd = 0;
		}
		if(this.state.timer !== 0){
			this.setState({timer:0});     
		}
		}
		
	}

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

      const pose = await posenet_model.estimateSinglePose(video);         //get Pose for webcam
      // console.log("Cam:",pose)
      drawResult(pose, video, videoWidth, videoHeight, this.canvasRef);
      if(this.state.cuRpose !== 0){
      const [cosSim,euSim] = get_score(pose['keypoints'],this.state.cuRpose['keypoints'])     //get pose for img
      this.setState({
      	cosScore:cosSim,
      	EuclidScore:euSim
      });
  }

//       if (counter%20 === 0){
//       	const frame = captureVideoFrame(this.player.getInternalPlayer())
// // // //       console.log("captured frame: ",frame)
// // // //       // const frameWidth = this.player.videoWidth
// // // // //       // const frameHeight = this.player.videoHeight
// convertURIToImageData(frame.dataUri).then(imageData => this.setState({
//   // Here you can use imageData
//   frameImg:imageData
// }));
// // // //       console.log(this.state.frameImg)
// 	  if (this.state.frameImg !== 0){
//       const framePose = await posenet_model.estimateSinglePose(this.state.frameImg)
// // //       console.log("Frame:",framePose)
// // //       // console.log("FramePose: ",framePose)
//       // drawResult(framePose,this.state.frameImg,videoWidth,videoHeight,canvasRef)

//       const [cosSim,euSim] = get_score(pose['keypoints'],framePose['keypoints'],0.3)

// // //       console.log("CosScore:", cosSim,"Euclid:" ,euSim)
//       this.setState({
//       	cosScore:cosSim,
//       	EuclidScore:euSim
//       });
//   	 }
//   	 counter = 0;

//   	}
      
//       console.log("YOLO : CosScore:", this.state.cosScore,"Euclid:" ,this.state.EuclidScore)
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
      		<div> Count : {this.state.timer} </div>
      	</div>

      	<img src={this.state.image.src} alt = "yoga" 
      	style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 100,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
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

