import React, { useState } from "react";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import AWS from "aws-sdk";
import { ReactComponent as Bin } from "../assests/rubbishBin.svg";

const VoiceList = ({ audios, setAudios }) => {
  const [isLoading, setIsLoading] = useState(false);
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
    region: "eu-north-1",
  });

  const s3 = new AWS.S3();
  const uploadFileToS3 = async () => {
    setIsLoading(true);
    try {
      const uploadPromises = audios.map(async (info) => {
        const response = await fetch(info.blobURL);
        const fileBlob = await response.blob();

        const params = {
          Bucket: "hr-01",
          Key: `${v4()}.mp3`,
          Body: fileBlob,
          ContentType: "audio/mpeg",
        };
        const data = await s3.upload(params).promise();
        return data;
      });

      await Promise.all(uploadPromises).then((res) => {
        toast.success("🎉 All files uploaded successfully!");
        setAudios([]);
      });
    } catch (err) {
      toast.error("❌ Error uploading files!");
      console.error("Upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="audio-recorder">
      <div className="audio-parallel-list">
        <div>
          <h1 className="title">Recordings</h1>
        </div>
        <div className="audio-container">
          {audios?.map((info, idx) => (
            <div className="binIcon">
              <audio controls src={info.blobURL} className="audio-player" />
              <span
                onClick={() => {
                  setAudios(audios.filter((audio, index) => index !== idx));
                }}
                className="container_align"
              >
                <Bin height={20} width={20} cursor={"pointer"} />
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={uploadFileToS3}
          className="upload-button"
          disabled={!audios.length || isLoading}
        >
          {isLoading ? (
            <div class="spinner">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          ) : (
            "Upload to S3"
          )}
        </button>
      </div>
    </div>
  );
};

export default VoiceList;
