// models/Anime.ts
import mongoose, { Document, Schema } from 'mongoose';

// 1. Define the TypeScript Interface
export interface IAnime extends Document {
  title: string;
  episodes: number;
  status: string;
  imageUrl?: string;
  owner: mongoose.Types.ObjectId;
}

// 2. Define the Mongoose Schema using the Interface
const animeSchema: Schema = new Schema({
  title: { type: String, required: true },
  episodes: { type: Number, required: true },
  status: { type: String, required: true },
  imageUrl: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// 3. Export the typed model
export default mongoose.model<IAnime>('Anime', animeSchema);