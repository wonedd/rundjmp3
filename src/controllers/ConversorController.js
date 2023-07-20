// ConversorController.js
import { ConversorService } from '../services/ConversorService.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ConversorController {
  constructor() {
    this.conversorService = new ConversorService(__dirname);
  }

  convertVideos = async (req, res) => {
    const { body: { videos } } = req;

    if (!Array.isArray(videos) || videos.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid video URLs' });
    }

    try {
      const results = await this.conversorService.getResult(videos);

      return res.json({ success: true, videos: results });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }

  uploadAudio = async (req, res) => {
    try {
      const { audioBlob } = req.body;

      const result = await this.conversorService.uploadAudio(audioBlob);

      return res.json(result);
    } catch (err) {
      console.error('Error uploading audio:', err);
      return res.status(500).json({ success: false, error: 'Failed to upload audio' });
    }
  }
}
