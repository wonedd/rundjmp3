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
  res.render('rundj');
});


app.post('/convert', async (req, res) => {
  const { videos } = await req.body;
  // const result = await getId(videos);
  return res.json({
    videos
  });



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


const getId = async (links) => {
  try {
    if (typeof links === 'string') {
      let videoId = "";
      if (links.includes("youtube.com") || links.includes("youtu.be")) {
        const videoIdMatch = links.match(/[?&]v=([^&#]*)/);
        videoId = videoIdMatch && videoIdMatch[1];
      } else {
        throw new Error(`Invalid YouTube link: ${links}`);
      }

      if (!videoId) {
        throw new Error(`Video ID not found in link: ${links}`);
      }

      return [videoId];
    } else if (Array.isArray(links)) {
      const videoIds = [];

      for (const fullLink of links) {
        let videoId = "";

        if (fullLink.includes("youtube.com") || fullLink.includes("youtu.be")) {
          const videoIdMatch = fullLink.match(/[?&]v=([^&#]*)/);
          videoId = videoIdMatch && videoIdMatch[1];
        } else {
          throw new Error(`Invalid YouTube link: ${fullLink}`);
        }

        if (!videoId) {
          throw new Error(`Video ID not found in link: ${fullLink}`);
        }

        videoIds.push(videoId);
      }

      return videoIds;
    } else {
      throw new Error("Invalid argument: links must be a string or an array");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};


app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})