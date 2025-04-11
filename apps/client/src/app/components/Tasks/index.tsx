import { useEffect, useState } from 'react';
import api from '../../../api/apiInstance';
import { TTask } from '../../app.types';
import TaskList from './TaskList';
import { useAuthStore } from '../../../store/authSlice';
import { useNavigate } from 'react-router-dom';

const Tasks = () => {
  const navigate = useNavigate();
  const { clearUser } = useAuthStore();
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [state, setState] = useState<{ isLoading: boolean; tasks: TTask[] }>({
    isLoading: true,
    tasks: [],
  });

  const handleLogout = async () => {
    setState({ isLoading: false, tasks: [] });
    try {
      await api.post(
        '/users/logout',
        {},
        {
          withCredentials: true, // Important for cookies
        }
      );
      clearUser(); // Clear user state in your store
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

  // event handlers
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setErrorMessage('');
    try {
      await api.post('/tasks', newTask);
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
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6 bg-white border-b border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                Task Manager
              </h1>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>

            {errorMessage && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                <span className="block sm:inline">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddTask} className="mb-6">
              <div className="flex gap-2">
                <input
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="Enter task name"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  placeholder="Description"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newTask.title.trim()}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:bg-green-300"
                >
                  Add Task
                </button>
              </div>
            </form>

            <TaskList
              isLoading={state.isLoading}
              tasks={state.tasks}
              onDelete={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
            />

            {!state.isLoading && state.tasks.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                No tasks yet. Add a task to get started!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
