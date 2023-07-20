import ytdl from 'ytdl-core';
import { randomUUID } from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { join } from 'path';

ffmpeg.setFfmpegPath(ffmpegPath);


export class ConversorService {
  constructor(dirname) {
    this.dirname = dirname;
    this.convertedVideos = [];
    this.fetchVideo = this.fetchVideo.bind(this);
  }
  async fetchVideo(url) {
    try {
      if (!url) {
        throw new Error('Invalid YouTube video URL');
      }
      const videoStream = ytdl(url, { quality: 'highestaudio' });
      const audioFileNameWithIndex = `${randomUUID()}.mp3`;
      const audioFilePath = `/converted_audio/${audioFileNameWithIndex}`;

      const ffmpegCommand = ffmpeg(videoStream)
        .audioBitrate(128)
        .toFormat('mp3')
        .save(join(this.dirname, 'converted_audio', audioFileNameWithIndex));

      return new Promise((resolve, reject) => {
        ffmpegCommand.on('end', () => {
          console.log('Done');
          this.convertedVideos.push(audioFilePath);
          resolve({ success: true, audioLink: audioFilePath });
        }).on('error', (err) => {
          reject({ success: false, error: err });
        });
        ffmpegCommand.run();
      });
    } catch (err) {
      console.log('Error', err);
      return { success: false, error: err };
    }
  }

  async uploadAudio(audioBlob) {
    try {
      if (!audioBlob) {
        throw new Error('Missing audioBlob');
      }

      const createdAudio = await prisma.audio.create({
        data: {
          blob: audioBlob,
        },
      });

      setTimeout(async () => {
        try {
          await prisma.audio.delete({
            where: {
              id: createdAudio.id,
            },
          });
          console.log(`Audio with ID ${createdAudio.id} deleted successfully.`);
        } catch (err) {
          console.error('Error deleting audio:', err);
        }
      }, 3 * 60 * 1000); // 3 minutos em milissegundos

      return { success: true, message: 'Audio uploaded and will be deleted after 3 minutes' };
    } catch (err) {
      console.error('Error uploading audio:', err);
      return { success: false, error: 'Failed to upload audio' };
    }
  }

  async getResult(urls) {
    const promises = urls.map((url) => this.fetchVideo(url));
    const results = await Promise.all(promises);
    return results;
  }


}
