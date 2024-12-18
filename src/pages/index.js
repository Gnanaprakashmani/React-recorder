import React,{useState} from "react";
import VoiceRecorder from "../component/voiceRecorder";
import VoiceList from "../component/voiceList";

const Main = () => {
  const [audios,setAudios]=useState([])
  return (
    <div className="container">
      <div className="voice-container">
        <div className="recorder">
          <VoiceRecorder setAudios={setAudios}/>
        </div>
        <div className="voice-list">
          <VoiceList audios={audios} setAudios={setAudios}/>
        </div>
      </div>
    </div>
  );
};

export default Main;
