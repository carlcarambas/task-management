import { useEffect, useState } from 'react';
import api from '../../../api/apiInstance';
import { TTask } from '../../app.types';
import TaskList from './TaskList';
import { useAuthStore } from '../../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';

const Tasks = () => {
  const navigate = useNavigate();
  const { clearUser } = useAuthStore();
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [state, setState] = useState<{ isLoading: boolean; tasks: TTask[] }>({
    isLoading: true,
    tasks: [],
  });

  const { socket } = useSocket();

  const handleLogout = async () => {
    setState({ isLoading: false, tasks: [] });
    try {
      await api.post('/users/logout', {}, { withCredentials: true });
      clearUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const fetchTasksList = () => {
    setErrorMessage('');
    setState((prev) => ({ ...prev, isLoading: true }));

    api
      .get<TTask[]>('/tasks')
      .then((res) => res.data)
      .then((tasks) => {
        setState({ isLoading: false, tasks });
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
        if (error.response?.status === 401) {
          handleLogout();
          setErrorMessage('Session expired. Please log in again.');
        } else {
          setErrorMessage('Failed to load tasks. Please try again later.');
        }
      });
  };

  useEffect(() => {
    fetchTasksList();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setErrorMessage('');
    try {
      await api.post('/tasks', newTask);
      socket?.emit('notification', {
        message: `Added New Task: ${newTask.title}`,
      });
      setNewTask({ title: '', description: '' });
      fetchTasksList();
    } catch (error) {
      console.error('Error adding task:', error);
      setErrorMessage('Failed to add task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasksList();
    } catch (error) {
      console.error('Error deleting task:', error);
      setErrorMessage('Failed to delete task. Please try again.');
    }
  };

  const handleToggleComplete = async (task: TTask) => {
    try {
      await api.patch(`/tasks/${task._id}`, {
        completed: !task.completed,
      });
      fetchTasksList();
    } catch (error) {
      console.error('Error updating task:', error);
      setErrorMessage('Failed to update task. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
              <p className="text-gray-500 mt-1">
                Manage your daily tasks efficiently
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              Logout
            </button>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1">
                <input
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="Task name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-1">
                <input
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  placeholder="Description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-1">
                <button
                  type="submit"
                  disabled={!newTask.title.trim()}
                  className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors shadow-sm"
                >
                  Add Task
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Tasks Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Tasks</h2>
          </div>

          <div className="divide-y divide-gray-200 p-6">
            {state.isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-pulse flex flex-col gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ) : state.tasks.length > 0 ? (
              <TaskList
                tasks={state.tasks}
                onDelete={handleDeleteTask}
                onToggleComplete={handleToggleComplete}
              />
            ) : (
              <div className="p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No tasks
                </h3>
                <p className="mt-1 text-gray-500">
                  Get started by creating a new task.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;