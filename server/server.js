import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import User from './models/User.js';
import Ticket from './models/Ticket.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Normalize email helper
const normalizeEmail = (value = '') => value.trim().toLowerCase();

// Create default admin user
const ensureAdminUser = async () => {
  const adminEmail = normalizeEmail('admin@helpdesk.com');

  const existingAdmin = await User.findOne({
    email: adminEmail
  });

  if (!existingAdmin) {
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: 'admin123',
      role: 'admin'
    });

    console.log('Default admin user created');
  }
};

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Atlas connected');
    await ensureAdminUser();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);

    const exists = await User.findOne({
      email: normalizedEmail
    });

    if (exists) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role:
        normalizedEmail === 'admin@helpdesk.com'
          ? 'admin'
          : 'user'
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({
      email: normalizedEmail,
      password
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Get all tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({
      createdAt: -1
    });

    res.json({ tickets });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Create ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const { subject, description, userEmail } = req.body;

    const aiReply = description
      .toLowerCase()
      .includes('support')
      ? 'Your message mentions support. An admin has been notified and will take over from here.'
      : `Thanks for reaching out. Our AI assistant reviewed your request: "${description}"`;

    const ticket = await Ticket.create({
      subject,
      description,
      userEmail,
      aiReply,
      routedToAdmin: description
        .toLowerCase()
        .includes('support')
    });

    res.status(201).json({
      ticket
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Reply to ticket
app.post('/api/tickets/:id/reply', async (req, res) => {
  try {
    const { message, role } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          replies: {
            role,
            message
          }
        }
      },
      {
        new: true
      }
    );

    res.json({
      ticket
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Update ticket
app.put('/api/tickets/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true
      }
    );

    res.json({
      ticket
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});