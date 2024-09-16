import VideoResponse from "../types/VideoResponse";
import formatTime from "../utils/formalTime";

const videoCard = (video: VideoResponse) => {
  const cardDom = document.createElement("div");
  cardDom.classList.add("card");

  const thumbnailDom = document.createElement("img");
  thumbnailDom.classList.add("card-thumbnail");
  thumbnailDom.src = video.thumbnails[1]
    ? video.thumbnails[1].url
    : video.thumbnails[0].url;

  const infoDom = document.createElement("div");
  infoDom.classList.add("card-info");

  const songNameDom = document.createElement("div");
  songNameDom.classList.add("card-songName");
  songNameDom.textContent = video.name;

  const subInfoDom2 = document.createElement("div");
  subInfoDom2.classList.add("card-subInfo2");

  const artistDom = document.createElement("div");
  artistDom.classList.add("card-artist");
  artistDom.textContent = video.artist.name;

  const durationDom = document.createElement("div");
  durationDom.classList.add("card-duration");
  durationDom.textContent = video.duration ? formatTime(video.duration) : "0";

  cardDom.append(thumbnailDom, infoDom);
  infoDom.append(songNameDom, subInfoDom2);
  subInfoDom2.append(artistDom, durationDom);

  return cardDom;
};

export default videoCard;
