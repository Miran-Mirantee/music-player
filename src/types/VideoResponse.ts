type VideoResponse = {
  artist: { name: string; artistId: string };
  duration: number | null; // why does it return null??
  name: string;
  thumbnails: { height: number; url: string; width: number }[];
  type: string;
  videoId: string;
};

export default VideoResponse;
