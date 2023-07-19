// const express = require('express');
import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv';
import ejs from 'ejs';
import ytdl from 'ytdl-core';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(ffmpegPath);

dotenv.config();

const app = express();

app.set('view engine', 'ejs');

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.render('rundj');
});


app.post('/convert', async (req, res) => {
  const value = req.body;

  const audioFileName = 'output';
  const convertedVideos = []; // Array para armazenar os nomes dos vídeos convertidos

  async function fetchVideo(url, audioFileName) {
    return new Promise((resolve, reject) => {
      const videoStream = ytdl(url, { quality: 'highestaudio' });

      const ffmpegCommand = ffmpeg(videoStream)
        .audioBitrate(128)
        .toFormat('mp3')
        .save(audioFileName)
        .on('end', () => {
          convertedVideos.push(audioFileName); // Adiciona o nome do vídeo convertido ao array
          resolve();
        })
        .on('error', (err) => {
          reject(err);
        });

      ffmpegCommand.run();
    });
  }

  if (value.videos.length > 0) {
    const promises = value.videos.map((v, index) => {
      const audioFileNameWithIndex = `${audioFileName}_${index}.mp3`;
      return fetchVideo(v, audioFileNameWithIndex)
        .then(() => {
          console.log('Done');
        })
        .catch((err) => {
          console.log('Error', err);
        });
    });

    Promise.all(promises)
      .then(() => {
        // Todos os vídeos foram convertidos
        return res.json({ success: true, videos: convertedVideos }); // Envia o array de nomes dos vídeos convertidos para o front-end
      })
      .catch((err) => {
        console.log('Error', err);
        return res.status(500).json({ error: 'Error converting videos' });
      });
  } else {
    return res.status(400).json({ error: 'No videos provided' });
  }
});

app.get('/download/:index', (req, res) => {
  const index = req.params.index;
  const audioFileNameWithIndex = `output_${index}.mp3`;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const filePath = join(__dirname, audioFileNameWithIndex);

  res.download(filePath, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      // Trate o erro de acordo com as suas necessidades
      res.status(500).json({ error: 'Error downloading file' });
    } else {
      // O download foi concluído com sucesso
    }
  });
});



app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})