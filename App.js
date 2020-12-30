import { StatusBar } from 'expo-status-bar';
import React ,{ useState,useRef} from 'react';
import { Alert, Button, ImageBackground, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as tf from "@tensorflow/tfjs"
import * as posenet from "@tensorflow-models/posenet"
import * as Permissions from 'expo-permissions';
  //utilites
import {drawKeypoints,drawSkeleton} from './utilites'
export default function App() {
  //webcamref
  const cameraRef=useRef(null);
  const canvasRef=useRef(null);
  //load posenet
  const runPosenet=async ()=>{
    const net=await posenet.load({
      inputResolution:{width:640,height:480},
      scale:0.5
    })
    //setinterval
    setInterval(()=>{
      detect(net)
    },100);
  }
  const detect =async(net)=>{
    if(typeof cameraRef.current!=="undefined" && cameraRef.current !==null && cameraRef.current.video.readyState===4){
      //get video properties
      const video=cameraRef.current.video
      const videoWidth=cameraRef.current.video.videoWidth;
      const videoHeight=cameraRef.current.video.videoHeight;
      
      //set video width
      cameraRef.current.video.width=videoWidth
      cameraRef.current.video.height=videoHeight

      //Make detections
      const pose=await net.estimateSinglePose(video);
      console.log(pose);
      //all manually show point
     // drawCanvas(pose,video,videoWidth,videoHeight,canvasRef);

    }
  }
  //run pose
  runPosenet();
  //drwa functions
  const drawCanvas=(pose,video,videoWidth,videoHeight,canvas)=>{
    const ctx=canvas.current.getContext('2d');
    canvas.current.width=videoWidth;
    canvas.current.height=videoHeight;
    drawKeypoints(pose['keypoints'],0.5,ctx);
    drawSkeleton(pose['keypoints'],0.5,ctx);
  }
   const [image,setImage]=useState('https://tse1.mm.bing.net/th?id=OIP.wx64GmJDu2nd32eO_tieDgHaEK&pid=Api&P=0&w=297&h=168');
  const pickfromCamera= async ()=>{
   {cameraRef}
    const {granted}=await Permissions.askAsync(Permissions.CAMERA)
    if(granted){
      let data=await ImagePicker.launchCameraAsync({
        mediaTypes:ImagePicker.MediaTypeOptions.Images,
        allowsEditing:true,
        aspect:[1,1],
        quality:0.5
       
      }).then(image=>{
        console.log(image)
        setImage(image.uri);
      });
    }
    else{
      Alert.alert("we need to camera permission")
    }

  }
  return (
    <View style={styles.container}>
     <ImageBackground style={{width:200,height:200}}  source={{uri:image}}></ImageBackground>
     
  <Button onPress={()=>pickfromCamera()} title="camera"></Button>
  
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create(
  {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
})
