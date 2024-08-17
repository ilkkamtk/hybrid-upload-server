import ffmpeg from 'fluent-ffmpeg';

const getVideoThumbnail = (videoUrl: string) => {
  return new Promise((resolve) => {
    ffmpeg()
      .input(videoUrl)
      .on('end', () => {
        resolve(true);
      })
      .screenshots({
        count: 5, // Number of thumbnails to generate
        filename: './uploads/%b-thumb-%i.png', // Filename pattern with index
        size: '640x480', // Set the size of the thumbnails
      })
      .on('error', (error) => {
        console.error('ffmpeg', error);
      });
  });
};

export default getVideoThumbnail;
