import { TTask } from '../../app.types';

interface TaskListProps {
  isLoading: boolean;
  tasks: TTask[];
  onDelete?: (id: string) => void;
  onToggleComplete?: (task: TTask) => void;
}

const TaskList = ({
  isLoading,
  tasks,
  onDelete,
  onToggleComplete,
}: TaskListProps) => {
  if (isLoading) {
    return (
      <div className="py-4" data-testid="task-list-loading">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-16 bg-gray-200 rounded"
              data-testid="task-loader"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4" data-testid="task-list">
      <ul className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <li key={task._id} className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleComplete?.(task)}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span
                  className={`ml-3 ${
                    task.completed
                      ? 'line-through text-gray-500'
                      : 'text-gray-900'
                  }`}
                  data-testid={`task-title-${task._id}`}
                >
                  {task.name || task.title}
                </span>
              </div>
              <button
                onClick={() => onDelete?.(task._id)}
                className="ml-2 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-md hover:bg-red-200"
                data-testid={`delete-button-${task._id}`}
              >
                Delete
              </button>
            </div>
            {task.description && (
              <p
                className="mt-1 ml-8 text-sm text-gray-500"
                data-testid={`task-description-${task._id}`}
              >
                {task.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
