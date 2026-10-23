import Note from '../models/Note.js';
import { generateSummary } from '../services/aiService.js';

// @desc    Get all note summaries for current user
// @route   GET /api/summaries
// @access  Private
export const getSummaries = async (req, res) => {
  try {
    const summaries = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, summaries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single note summary by ID
// @route   GET /api/summaries/:id
// @access  Private
export const getSummaryById = async (req, res) => {
  try {
    const summary = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!summary) {
      return res.status(404).json({ success: false, message: 'Summary note not found' });
    }
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate and save a note summary
// @route   POST /api/summaries
// @access  Private
export const createSummary = async (req, res) => {
  try {
    const { title, originalText } = req.body;

    if (!title || !originalText) {
      return res.status(400).json({ success: false, message: 'Please provide both title and original notes text' });
    }

    // Call AI service to generate comprehensive summary
    const summaryText = await generateSummary({ title, text: originalText });

    const note = await Note.create({
      user: req.user._id,
      title,
      originalText,
      summary: summaryText,
    });

    res.status(201).json({ success: true, summary: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a note summary
// @route   DELETE /api/summaries/:id
// @access  Private
export const deleteSummary = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Summary not found' });
    }
    res.json({ success: true, message: 'Summary deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
