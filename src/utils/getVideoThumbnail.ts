import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

const getVideoThumbnail = (
  videoUrl: string,
): Promise<{thumbnails: string[]; gif: string}> => {
  return new Promise((resolve, reject) => {
    const thumbnails: string[] = [];
    const originalName = path.basename(videoUrl);
    const gifFilename = `./uploads/${originalName}-animation.gif`;

    // First, get video duration
    ffmpeg.ffprobe(videoUrl, (err, metadata) => {
      if (err) {
        console.log('Error retrieving video metadata:', err);
        return reject(err);
      }

      const duration = metadata.format.duration || 10; // Default to 10s if duration is undefined
      const speedFactor = duration / 5; // Compress full video into 5 seconds

      // Generate thumbnails
      ffmpeg()
        .input(videoUrl)
        .screenshots({
          count: 5,
          filename: `./uploads/${originalName}-thumb-%i.png`,
          size: '320x?',
        })
        .on('filenames', (filenames) => {
          thumbnails.push(...filenames);
        })
        .on('end', () => {
          // Generate GIF after thumbnails are done
          ffmpeg()
            .input(videoUrl)
            .outputOptions([
              '-filter_complex',
              `[0:v]setpts=(PTS-STARTPTS)/${speedFactor},fps=10,scale=320:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=32[p];[b][p]paletteuse`,
              '-c:v',
              'gif',
              '-compression_level',
              '50',
              '-f',
              'gif',
            ])
            .output(gifFilename)
            .on('end', () => {
              resolve({thumbnails, gif: gifFilename});
            })
            .on('error', (err) => {
              console.log('GIF generation error:', err);
              resolve({thumbnails, gif: ''}); // Return thumbnails even if GIF fails
            })
            .run();
        })
        .on('error', (err) => {
          console.log('Screenshot generation error:', err);
          reject(err);
        });
    });
  });
};

export default getVideoThumbnail;
