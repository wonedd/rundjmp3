// const express = require('express');
import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv';
import ejs from 'ejs';

dotenv.config();

const app = express();

app.set('view engine', 'ejs');

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.redirect('/rundj');
});

app.get('/rundj', (req, res) => {
  res.send('Welcome to the DJ page!');
});

app.post('/convert', async (req, res) => {
  const { videoId } = req.body;

  if (!videoId) {
    return res.json({
      error: "invalid value"
    })
  }

  const options = {
    method: 'GET',
    url: 'https://youtube-mp36.p.rapidapi.com/dl',
    params: { id: videoId },
    headers: {
      'X-RapidAPI-Key': process.env.API_KEY,
      'X-RapidAPI-Host': process.env.API_HOST
    }
  };

  try {
    const response = await axios.request(options);

    const result = {
      success: true,
      song_title: response.data.title,
      song_link: response.data.link
    };

    return res.json(result);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})