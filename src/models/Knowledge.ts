// models/Knowledge.ts
import mongoose from 'mongoose';

const KnowledgeSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  language: { type: String, enum: ['en', 'zh'], required: true },
  embedded: { type: Boolean, default: false },
  content: { type: String, required: true },
}, { timestamps: true });

const Knowledge = mongoose.models.Knowledge || mongoose.model('Knowledge', KnowledgeSchema);
export default Knowledge;
