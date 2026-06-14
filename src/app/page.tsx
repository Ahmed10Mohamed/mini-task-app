'use client';

import { useState } from 'react';
import { trpc } from '@/utils/trpc';

function formatUpdatedAt(date: Date) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function Home() {
  const [title, setTitle] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const tasks = trpc.task.list.useQuery();

  const create = trpc.task.create.useMutation({
    onSuccess: () => {
      setTitle('');
      setError(null);
      void utils.task.list.invalidate();
    },
    onError: (err) => setError(err.message),
  });

  const update = trpc.task.update.useMutation({
    onSuccess: () => {
      setEditId(null);
      setEditTitle('');
      setError(null);
      void utils.task.list.invalidate();
    },
    onError: (err) => setError(err.message),
  });

  const toggle = trpc.task.toggle.useMutation({
    onMutate: async ({ id }) => {
      await utils.task.list.cancel();
      const previousTasks = utils.task.list.getData();

      utils.task.list.setData(undefined, (oldTasks) =>
        oldTasks?.map((task) =>
          task.id === id ? { ...task, done: !task.done, updatedAt: new Date() } : task,
        ),
      );

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        utils.task.list.setData(undefined, context.previousTasks);
      }
    },
    onSettled: () => {
      void utils.task.list.invalidate();
    },
  });

  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => {
      setError(null);
      void utils.task.list.invalidate();
    },
    onError: (err) => setError(err.message),
  });

  const handleAdd = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    create.mutate({ title: trimmed });
  };

  const startEdit = (task: { id: string; title: string }) => {
    setEditId(task.id);
    setEditTitle(task.title);
    setError(null);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTitle('');
    setError(null);
  };

  const saveEdit = () => {
    const trimmed = editTitle.trim();
    if (!editId || !trimmed) return;
    update.mutate({ id: editId, title: trimmed });
  };

  return (
    <main className="container">
      <h1>Mini Task App</h1>
      <p className="subtitle">Next.js · tRPC · Prisma · Postgres</p>

      <div className="form">
        <input
          className="input"
          maxLength={100}
          placeholder="What needs doing?"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleAdd()}
        />
        <button className="btn" disabled={create.isPending} onClick={handleAdd}>
          {create.isPending ? 'Adding...' : 'Add'}
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}

      {tasks.isLoading ? (
        <p className="empty">Loading...</p>
      ) : tasks.data && tasks.data.length > 0 ? (
        <ul className="list">
          {tasks.data.map((task) => (
            <li key={task.id} className="item">
              <input
                checked={task.done}
                disabled={toggle.isPending}
                type="checkbox"
                onChange={() => toggle.mutate({ id: task.id })}
              />

              {editId === task.id ? (
                <div className="edit">
                  <input
                    className="input edit-input"
                    maxLength={100}
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') saveEdit();
                      if (event.key === 'Escape') cancelEdit();
                    }}
                  />
                  <div className="actions">
                    <button className="link" disabled={update.isPending} onClick={saveEdit}>
                      Save
                    </button>
                    <button className="link muted" disabled={update.isPending} onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="content">
                  <button className="title-button" onClick={() => startEdit(task)}>
                    <span className={`title ${task.done ? 'done' : ''}`}>{task.title}</span>
                  </button>
                  <span className="meta">Updated {formatUpdatedAt(task.updatedAt)}</span>
                </div>
              )}

              <button
                className="del"
                disabled={deleteTask.isPending}
                onClick={() => deleteTask.mutate({ id: task.id })}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">No tasks yet. Add one above.</p>
      )}
    </main>
  );
}
