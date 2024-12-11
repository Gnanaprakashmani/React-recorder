import React, { useState, useRef } from "react";
import AWS from "aws-sdk";
import { v4 } from "uuid";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MicRecorder from "mic-recorder-to-mp3";

function AudioRecorder() {
  const [audioData, setAudioData] = useState(null);
  const [record,setRecord]=useState("Start Recording")
  const recorderRef = useRef(null);

  const startRecording = () => {
    const recorder = new MicRecorder({ bitRate: 128 });
    recorderRef.current = recorder;

    recorder.start().then(() => {
        setRecord("Recording started...");
    }).catch((e) => {
      console.error("Error starting recording", e);
    });
  };

  const stopRecording = () => {
    recorderRef.current.stop().getMp3().then(([buffer, blob]) => {
      const audioURL = URL.createObjectURL(blob);
      setRecord("Start Recording")
      setAudioData({ blob, blobURL: audioURL });
    }).catch((e) => {
      console.error("Error stopping recording", e);
    });
  };

  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
    region: "eu-north-1",
  });

  const s3 = new AWS.S3();

  const uploadFileToS3 = async () => {
    const response = await fetch(audioData.blobURL);
    const fileBlob = await response.blob();
    const params = {
      Bucket: "hr-01",
      Key: v4(),
      Body: fileBlob,
      ContentType: "audio/mpeg",
    };

    try {
      const data = await s3.upload(params).promise();
      if (data) {
        toast.success("File uploaded successfully !!");
        setAudioData(null);
      }
    } catch (error) {
      toast.error("Error uploading file !!", {
        position: toast.POSITION.TOP_CENTER,
      });
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="audio-recorder">
      <ToastContainer />
      <h1 className="title">Audio Recorder App</h1>

      <div className="recorder-section">
        <div className="record-start">{record}</div>
        <div className="button-group">
          <button onClick={startRecording} className="record-button">
            Start Recording
          </button>
          <button onClick={stopRecording} className="stop-button">
            Stop Recording
          </button>
        </div>
      </div>

      {audioData && (
        <div className="playback-section">
          <h3>Playback</h3>
          <audio controls src={audioData.blobURL} className="audio-player" />
        </div>
      )}

      <button
        onClick={uploadFileToS3}
        className="upload-button"
        disabled={!audioData}
      >
        Upload to S3
      </button>
    </div>
  );
}

export default AudioRecorder;
