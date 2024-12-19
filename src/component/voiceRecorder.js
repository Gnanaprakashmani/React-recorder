import React, { useState, useRef, useEffect } from "react";
import AWS from "aws-sdk";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MicRecorder from "mic-recorder-to-mp3";
import { ReactComponent as PlayIcon } from "../assests/play.svg";
import { ReactComponent as PauseIcon } from "../assests/pause.svg";
import { ReactComponent as MicIcon } from "../assests/micIcon.svg";
function VoiceRecorder({ setAudios }) {
  const [isStart, setIsStart] = useState(false);
  const [time, setTime] = useState(0);
  const recorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const barsRef = useRef(null);
  const animationIdRef = useRef(null);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    if (isStart) {
      const interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setTime(0);
    }
  }, [isStart]);

  const formattedTime = `${Math.floor(time / 60)}:${time % 60 < 10 ? "0" : ""}${
    time % 60
  }`;
  useEffect(() => {
    return () => cancelAnimationFrame(animationIdRef.current);
  }, []);

  const drawVisualizer = () => {
    const barsContainer = barsRef.current;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      barsContainer.innerHTML = "";

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 4;

        const bar = document.createElement("div");
        bar.style.height = `${Number(barHeight)}px`;
        bar.style.width = "4px";
        bar.style.margin = "0 1px";
        bar.style.backgroundColor = "#00c4ff";
        bar.style.flexShrink = 0;
        barsContainer.appendChild(bar);
      }
    };

    draw();
  };

  const startRecording = () => {
    const recorder = new MicRecorder({ bitRate: 128 });
    recorderRef.current = recorder;

    recorder
      .start()
      .then(() => {
        setIsStart(true);
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          mediaStreamRef.current = stream;
          const audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
          audioContextRef.current = audioContext;

          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 2048;
          analyserRef.current = analyser;

          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);

          drawVisualizer();
        });
      })
      .catch((e) => {
        console.error("Error starting recording", e);
      });
  };

  const stopRecording = () => {
    recorderRef.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const audioURL = URL.createObjectURL(blob);
        setAudios((prev) => [...prev, { blob, blobURL: audioURL }]);
        setIsStart(false);
        if (barsRef.current) {
          barsRef.current.innerHTML = "";
        }

        cancelAnimationFrame(animationIdRef.current);

        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        }
      })
      .catch((e) => {
        console.error("Error stopping recording", e);
      });
  };

  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
    region: "eu-north-1",
  });

  // const uploadFileToS3 = async () => {
  //   const response = await fetch(audioData.blobURL);
  //   const fileBlob = await response.blob();
  //   const params = {
  //     Bucket: "hr-01",
  //     Key: v4(),
  //     Body: fileBlob,
  //     ContentType: "audio/mpeg",
  //   };

  //   try {
  //     const data = await s3.upload(params).promise();
  //     if (data) {
  //       toast.success("🎉 File uploaded successfully!");
  //       setAudioData(null);
  //     }
  //   } catch (error) {
  //     toast.error("❌ Error uploading file!");
  //     console.error("Error uploading file:", error);
  //   }
  // };
  return (
    <div className="audio-recorder">
      <div className="audio-parallel">
        <div>
          <h1 className="title">Voice Recorder</h1>
        </div>
        <MicIcon />
        <h3 className="time-title">{formattedTime}</h3>
        <div className="recorder-section">
          <div className="visualizer-section">
            <div
              ref={barsRef}
              className="bars-container"
              style={{
                display: "flex",
                justifyContent: "flex-start",
                height: "50px",
                flexDirection: "row",
                gap: "2px",
              }}
            >
              {!isStart && (
                // <div
                //   style={{
                //     width: "100%",
                //     height: "50px",
                //     backgroundColor: "#eee",
                //     borderRadius: "10px",
                //   }}
                // >
                //   <p
                //     style={{
                //       textAlign: "center",
                //       color: "#888",
                //     }}
                //   >
                //     Start Recording
                //   </p>
                // </div>
                <div className="dummy-static-wave">
                  {Array(40)
                    .fill(0)
                    .map(() => (
                      <div className="bar"></div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="button-group">
          {!isStart ? (
            <PlayIcon onClick={startRecording} />
          ) : (
            <PauseIcon onClick={stopRecording} />
          )}
        </div>
      </div>
      <ToastContainer />
      {/* 
        {audioData && (
          <div className="playback-section">
            <h3>🔊 Playback</h3>
            <audio controls src={audioData.blobURL} className="audio-player" />
          </div>
        )}

        <button
          onClick={uploadFileToS3}
          className="upload-button"
          disabled={!audioData}
        >
          🚀 Upload to S3
        </button> */}
    </div>
  );
}

export default VoiceRecorder;
