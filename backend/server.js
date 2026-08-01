import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/notes-app'

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((error) => {
    console.error('MongoDB connection failed:', error)
    process.exit(1)
  })

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
  },
  { timestamps: true },
)

const Note = mongoose.model('Note', noteSchema)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 })
    res.json(notes)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notes', error: error.message })
  }
})

app.post('/api/notes', async (req, res) => {
  try {
    const { title, content } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' })
    }

    const note = await Note.create({ title: title.trim(), content: content || '' })
    res.status(201).json(note)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create note', error: error.message })
  }
})

app.put('/api/notes/:id', async (req, res) => {
  try {
    const { title, content } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' })
    }

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { title: title.trim(), content: content || '' },
      { new: true, runValidators: true },
    )

    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    res.json(note)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update note', error: error.message })
  }
})

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id)

    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete note', error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
})
