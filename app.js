const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

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