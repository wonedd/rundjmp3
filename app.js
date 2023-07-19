import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv';
import ejs from 'ejs';
import ytdl from 'ytdl-core';
import { PrismaClient } from '@prisma/client';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import { randomUUID } from 'crypto';

ffmpeg.setFfmpegPath(ffmpegPath);

dotenv.config();

const prisma = new PrismaClient();


const app = express();

app.set('view engine', 'ejs');

app.use(express.json());

const PORT = process.env.PORT || 3000;


app.get('/', (req, res) => {
  res.render('rundj');
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/converted_audio', express.static(join(__dirname, 'converted_audio')));



app.post('/convert', async (req, res) => {
  const value = req.body;
  const convertedVideos = [];

  async function fetchVideo(url) {
    try {
      const videoStream = ytdl(url, { quality: 'highestaudio' });
      const audioFileNameWithIndex = `${randomUUID()}.mp3`;
      const audioFilePath = `/converted_audio/${audioFileNameWithIndex}`;

      const ffmpegCommand = ffmpeg(videoStream)
        .audioBitrate(128)
        .toFormat('mp3')
        .save(join(__dirname, 'converted_audio', audioFileNameWithIndex));

      return new Promise((resolve, reject) => {
        ffmpegCommand.on('end', () => {
          console.log('Done');
          convertedVideos.push(audioFilePath);
          resolve({ success: true, audioLink: audioFilePath });
        }).on('error', (err) => {
          reject({ success: false, error: err.message });
        });
        ffmpegCommand.run();
      });
    } catch (err) {
      console.log('Error', err);
      return { success: false, error: err.message };
    }
  }

  if (value.videos.length > 0) {
    const promises = value.videos.map((v) => fetchVideo(v));

    Promise.all(promises)
      .then((results) => {
        return res.json({ success: true, videos: results });
      })
      .catch((err) => {
        console.error('Error:', err);
        return res.json({ success: false, error: err.message });
      });
  }
});



app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})