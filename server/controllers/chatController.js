import mongoose from 'mongoose';
import Chat from '../models/Chat.js';
import { generateChatResponse } from '../services/aiService.js';

/**
 * Supported tutoring styles
 */
const ALLOWED_STYLES = ['academic', 'concise', 'code', 'socratic'];

/**
 * Sanitize and validate tutoring style
 * @param {string} style
 * @returns {string} valid style
 */
const sanitizeStyle = (style) => {
  const normalized = String(style || '').toLowerCase().trim();
  return ALLOWED_STYLES.includes(normalized) ? normalized : 'academic';
};

/**
 * @desc    Get all chat sessions for the authenticated user
 * @route   GET /api/chats
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 */
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .select('title style messages createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .lean();

    // Attach messageCount metadata for frontend efficiency
    const formattedChats = chats.map((chat) => ({
      ...chat,
      messageCount: chat.messages ? chat.messages.length : 0,
      preview: chat.messages && chat.messages.length > 0
        ? chat.messages[chat.messages.length - 1].content.slice(0, 60) + '...'
        : '',
    }));

    res.status(200).json({
      success: true,
      count: formattedChats.length,
      chats: formattedChats,
    });
  } catch (error) {
    console.error('Error in getChats controller:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve study conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get a single chat session by ID
 * @route   GET /api/chats/:id
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 */
export const getChatById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation identifier format',
      });
    }

    const chat = await Chat.findOne({ _id: id, user: req.user._id });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat conversation not found or access unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    console.error('Error in getChatById controller:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversation details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Create a new chat conversation with an initial prompt
 * @route   POST /api/chats
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 */
export const createChat = async (req, res) => {
  try {
    const { title, message, style = 'academic' } = req.body;
    const tutoringStyle = sanitizeStyle(style);

    const userText = typeof message === 'string' ? message.trim() : '';
    const chatTitle = title?.trim() || (userText ? userText.slice(0, 32) + '...' : 'New Study Chat');

    const messages = [];

    if (userText) {
      // 1. Add authenticated user message
      messages.push({
        role: 'user',
        content: userText,
        timestamp: new Date(),
      });

      // 2. Generate initial AI tutor response with requested style
      const aiResponse = await generateChatResponse({
        messages,
        prompt: userText,
        style: tutoringStyle,
      });

      // 3. Add assistant response
      messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      });
    }

    const newChat = await Chat.create({
      user: req.user._id,
      title: chatTitle,
      style: tutoringStyle,
      messages,
    });

    res.status(201).json({
      success: true,
      message: 'Conversation initialized successfully',
      chat: newChat,
    });
  } catch (error) {
    console.error('Error in createChat controller:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize study conversation',
    });
  }
};

/**
 * @desc    Send a message to an existing chat session
 * @route   POST /api/chats/:id/messages
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 */
export const addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, style } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation identifier format',
      });
    }

    const userText = typeof message === 'string' ? message.trim() : '';
    if (!userText) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required and cannot be empty',
      });
    }

    if (userText.length > 8000) {
      return res.status(400).json({
        success: false,
        message: 'Message exceeds maximum allowable length (8000 characters)',
      });
    }

    const chat = await Chat.findOne({ _id: id, user: req.user._id });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access unauthorized',
      });
    }

    // Determine active style: request style override -> chat default -> fallback 'academic'
    const activeStyle = sanitizeStyle(style || chat.style);
    if (style && chat.style !== activeStyle) {
      chat.style = activeStyle;
    }

    // 1. Append user message
    chat.messages.push({
      role: 'user',
      content: userText,
      timestamp: new Date(),
    });

    // 2. Generate AI response incorporating full history and requested style
    const aiResponse = await generateChatResponse({
      messages: chat.messages,
      prompt: userText,
      style: activeStyle,
    });

    // 3. Append assistant response
    chat.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    });

    // Automatically update generic placeholder titles based on user prompt
    if (chat.title === 'New Study Conversation' || chat.title === 'New Study Chat') {
      chat.title = userText.slice(0, 30) + (userText.length > 30 ? '...' : '');
    }

    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Message processed successfully',
      chat,
    });
  } catch (error) {
    console.error('Error in addMessage controller:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process study tutor response',
    });
  }
};

/**
 * @desc    Delete a chat session
 * @route   DELETE /api/chats/:id
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 */
export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation identifier format',
      });
    }

    const chat = await Chat.findOneAndDelete({ _id: id, user: req.user._id });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Study conversation deleted successfully',
      deletedId: id,
    });
  } catch (error) {
    console.error('Error in deleteChat controller:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete study conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

