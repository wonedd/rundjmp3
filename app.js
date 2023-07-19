import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv';
import ejs from 'ejs';
import ytdl from 'ytdl-core';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import { randomUUID } from 'crypto';

ffmpeg.setFfmpegPath(ffmpegPath);

dotenv.config();


const app = express();

app.set('view engine', 'ejs');

app.use(express.json());

const PORT = process.env.PORT || 3000;


app.get('/', (req, res) => {
  res.render('rundj');
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const audioFolderPath = join(__dirname, 'converted_audio'); // Caminho absoluto para a pasta 'converted_audio'

app.use('/converted_audio', express.static(audioFolderPath)); // Servindo arquivos da pasta 'converted_audio'

async function saveMP3ToDatabase(url) {
  try {
    const videoStream = ytdl(url, { quality: 'highestaudio' });
    const audioFileNameWithIndex = `${randomUUID()}.mp3`;
    const audioFilePath = join(audioFolderPath, audioFileNameWithIndex); // Caminho absoluto para o arquivo MP3

    const ffmpegCommand = ffmpeg(videoStream)
      .audioBitrate(128)
      .toFormat('mp3')
      .save(audioFilePath);

    return new Promise((resolve, reject) => {
      ffmpegCommand.on('end', () => {
        console.log('Done');
        resolve({ success: true, audioLink: `/converted_audio/${audioFileNameWithIndex}` }); // Link relativo para o arquivo MP3
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

// Restante do código...

app.post('/convert', async (req, res) => {
  const value = req.body;
  const convertedVideos = [];

  if (value.videos.length > 0) {
    const promises = value.videos.map((v) => saveMP3ToDatabase(v)); // Chama a função 'saveMP3ToDatabase' em vez de 'fetchVideo'

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