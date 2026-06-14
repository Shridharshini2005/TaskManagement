import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const statusColor = { TODO: '#6366f1', IN_PROGRESS: '#f59e0b', DONE: '#10b981' };
const priorityColor = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444' };

const emptyForm = { title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '' };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const fetchTasks = async () => {
    const { data } = await api.get('/tasks');
    setTasks(data);
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, dueDate: form.dueDate || null };
    if (editingId) {
      await api.put(`/tasks/${editingId}`, payload);
    } else {
      await api.post('/tasks', payload);
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    fetchTasks();
  };

  const startEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    });
    setEditingId(task.id);
    setShowForm(true);
  };

  const deleteTask = async (id) => {
    if (window.confirm('Delete this task?')) {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    }
  };

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.logo}>TaskBoard</h1>
        <div style={styles.headerRight}>
          <span style={styles.userName}>👋 {user.name}</span>
          <button style={styles.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.controls}>
          <div style={styles.filters}>
            {['ALL', ...STATUSES].map(s => (
              <button key={s} style={{...styles.filterBtn,
                background: filter === s ? '#4f46e5' : '#fff',
                color: filter === s ? '#fff' : '#555'}}
                onClick={() => setFilter(s)}>
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          <button style={styles.addBtn}
            onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>
            + New Task
          </button>
        </div>

        {showForm && (
          <div style={styles.modal}>
            <div style={styles.modalCard}>
              <h2 style={styles.modalTitle}>{editingId ? 'Edit Task' : 'New Task'}</h2>
              <form onSubmit={handleSubmit}>
                <input style={styles.input} placeholder="Task title *"
                  value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                <textarea style={styles.textarea} placeholder="Description (optional)"
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                <div style={styles.row}>
                  <select style={styles.select} value={form.priority}
                    onChange={e => setForm({...form, priority: e.target.value})}>
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                  <select style={styles.select} value={form.status}
                    onChange={e => setForm({...form, status: e.target.value})}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <input style={styles.input} type="date" value={form.dueDate}
                  onChange={e => setForm({...form, dueDate: e.target.value})} />
                <div style={styles.modalActions}>
                  <button type="button" style={styles.cancelBtn}
                    onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" style={styles.submitBtn}>
                    {editingId ? 'Save changes' : 'Create task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <p>No tasks yet. Click "New Task" to get started.</p>
          </div>
        ) : (
          <div style={styles.taskGrid}>
            {filtered.map(task => (
              <div key={task.id} style={styles.taskCard}>
                <div style={styles.taskHeader}>
                  <span style={{...styles.badge, background: statusColor[task.status] + '22',
                    color: statusColor[task.status]}}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span style={{...styles.badge, background: priorityColor[task.priority] + '22',
                    color: priorityColor[task.priority]}}>
                    {task.priority}
                  </span>
                </div>
                <h3 style={styles.taskTitle}>{task.title}</h3>
                {task.description && <p style={styles.taskDesc}>{task.description}</p>}
                {task.dueDate && (
                  <p style={styles.dueDate}>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
                <div style={styles.taskActions}>
                  <button style={styles.editBtn} onClick={() => startEdit(task)}>Edit</button>
                  <button style={styles.deleteBtn} onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f0f2f5' },
  header: { background: '#1a1a2e', padding: '0 32px', height: 60,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 16 },
  userName: { color: '#a5b4fc', fontSize: 14 },
  logoutBtn: { background: 'transparent', color: '#a5b4fc', border: '1px solid #a5b4fc',
               padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  container: { maxWidth: 1100, margin: '0 auto', padding: 32 },
  controls: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  filters: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  filterBtn: { padding: '7px 14px', border: '1px solid #ddd', borderRadius: 6,
               fontSize: 13, cursor: 'pointer', fontWeight: 500 },
  addBtn: { background: '#4f46e5', color: '#fff', border: 'none', padding: '10px 20px',
            borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
           display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  modalCard: { background: '#fff', borderRadius: 12, padding: 32, width: 480,
               boxShadow: '0 8px 32px rgba(0,0,0,0.15)', maxWidth: '90vw' },
  modalTitle: { marginBottom: 20, fontSize: 20, fontWeight: 700, color: '#1a1a2e' },
  input: { width: '100%', padding: '11px 13px', marginBottom: 12,
           border: '1px solid #ddd', borderRadius: 8, fontSize: 14,
           boxSizing: 'border-box', fontFamily: 'inherit' },
  textarea: { width: '100%', padding: '11px 13px', marginBottom: 12,
              border: '1px solid #ddd', borderRadius: 8, fontSize: 14,
              boxSizing: 'border-box', resize: 'vertical', minHeight: 80, fontFamily: 'inherit' },
  row: { display: 'flex', gap: 12, marginBottom: 12 },
  select: { flex: 1, padding: '11px 13px', border: '1px solid #ddd',
            borderRadius: 8, fontSize: 14, fontFamily: 'inherit' },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: { padding: '10px 20px', border: '1px solid #ddd', borderRadius: 8,
               background: '#fff', fontSize: 14, cursor: 'pointer' },
  submitBtn: { padding: '10px 20px', background: '#4f46e5', color: '#fff',
               border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  taskGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  taskCard: { background: '#fff', borderRadius: 10, padding: 20,
              boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #eee' },
  taskHeader: { display: 'flex', gap: 8, marginBottom: 10 },
  badge: { fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4 },
  taskTitle: { fontSize: 16, fontWeight: 600, color: '#1a1a2e', marginBottom: 6 },
  taskDesc: { fontSize: 13, color: '#666', marginBottom: 8, lineHeight: 1.5 },
  dueDate: { fontSize: 12, color: '#999', marginBottom: 12 },
  taskActions: { display: 'flex', gap: 8 },
  editBtn: { flex: 1, padding: '7px 0', background: '#f0f2f5', border: 'none',
             borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 },
  deleteBtn: { flex: 1, padding: '7px 0', background: '#fef2f2', color: '#ef4444',
               border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 },
  empty: { textAlign: 'center', padding: 80, color: '#999' },
};
