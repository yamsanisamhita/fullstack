import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const API_URL = '/api/notes'

  const loadNotes = async () => {
    try {
      const response = await fetch(API_URL)
      const data = await response.json()
      setNotes(data)
    } catch (error) {
      setMessage('Unable to load notes right now.')
    }
  }

  useEffect(() => {
    loadNotes()
  }, [])

  const resetForm = () => {
    setTitle('')
    setContent('')
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!title.trim()) {
      setMessage('Title is required.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `${API_URL}/${editingId}` : API_URL
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })

      if (!response.ok) {
        throw new Error('Failed to save note')
      }

      await loadNotes()
      resetForm()
      setMessage(editingId ? 'Note updated successfully.' : 'Note created successfully.')
    } catch (error) {
      setMessage('Something went wrong while saving the note.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (note) => {
    setEditingId(note._id)
    setTitle(note.title)
    setContent(note.content)
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Failed to delete note')
      }
      await loadNotes()
      if (editingId === id) {
        resetForm()
      }
      setMessage('Note deleted successfully.')
    } catch (error) {
      setMessage('Unable to delete the note.')
    }
  }

  return (
    <div className="app-shell">
      <div className="notes-app">
        <section className="sidebar-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Workspace</p>
              <h1>Notes</h1>
            </div>
            <button className="ghost-button" onClick={resetForm} type="button">
              New
            </button>
          </div>

          <form className="note-form" onSubmit={handleSubmit}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter title"
            />

            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows="8"
              placeholder="Write something..."
            />

            <div className="form-actions">
              <button className="primary-button" type="submit" disabled={loading}>
                {editingId ? 'Update note' : 'Add note'}
              </button>
              {editingId ? (
                <button className="secondary-button" type="button" onClick={resetForm}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="notes-section">
          {message ? <div className="status-banner">{message}</div> : null}
          <div className="notes-grid">
            {notes.length === 0 ? (
              <div className="empty-state">
                <h2>No notes yet</h2>
                <p>Create your first note to get started.</p>
              </div>
            ) : (
              notes.map((note) => (
                <article key={note._id} className="note-card">
                  <div className="note-card-header">
                    <h2>{note.title}</h2>
                    <div className="actions">
                      <button className="icon-button" onClick={() => handleEdit(note)} type="button">
                        Edit
                      </button>
                      <button className="icon-button danger" onClick={() => handleDelete(note._id)} type="button">
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="note-content">{note.content || 'No additional content.'}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
