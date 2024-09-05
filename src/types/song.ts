type Song = {
  album: { name: string; albumId: string };
  artist: { name: string; artistId: string };
  duration: number;
  name: string;
  thumbnails: { height: number; url: string; width: number }[];
  type: string;
  videoId: string;
};

export default Song;
