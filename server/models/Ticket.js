import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'Open' },
  priority: { type: String, default: 'Medium' },
  userEmail: { type: String, required: true },
  aiReply: { type: String, default: '' },
  replies: [{ role: String, message: String, createdAt: { type: Date, default: Date.now } }],
  routedToAdmin: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Ticket', ticketSchema);
