import { render, screen, fireEvent } from '@testing-library/react';
import TaskList from './TaskList';
import { TTask } from '../../app.types';
import '@testing-library/jest-dom';

describe('TaskList Component', () => {
  const mockTasks: TTask[] = [
    {
      _id: '1',
      title: 'First Task',
      description: 'This is the first task',
      completed: false,
      owner: '5f6d6a8d8e9d5a0e0a0d0c0b0a090807060504030201000',
      createdAt: '2025-04-12T11:38:17.643Z',
    },
    {
      _id: '2',
      title: 'Second Task',
      description: 'This is the second task',
      completed: true,
      owner: '5f6d6a8d8e9d5a0e0a0d0c0b0a090807060504030201000',
      createdAt: '2025-04-12T11:38:17.643Z',
    },
  ];

  const mockOnDelete = jest.fn();
  const mockOnToggleComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // it('matches snapshot', () => {
  //   const { asFragment } = render(
  //     <TaskList isLoading={false} tasks={mockTasks} />
  //   );
  //   expect(asFragment()).toMatchSnapshot();
  // });

  it('renders loading state correctly', () => {
    render(<TaskList isLoading={true} tasks={[]} />);

    const loaders = screen.getAllByTestId('task-loader');
    expect(loaders).toHaveLength(3);
  });

  it('renders empty state when no tasks are provided', () => {
    render(<TaskList isLoading={false} tasks={[]} />);
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('renders tasks correctly', () => {
    render(
      <TaskList
        isLoading={false}
        tasks={mockTasks}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
      />
    );

    // Check if all tasks are rendered
    const taskItems = screen.getAllByRole('listitem');
    expect(taskItems).toHaveLength(2);

    // Check task titles
    expect(screen.getByText('First Task')).toBeInTheDocument();
    expect(screen.getByText('Second Task')).toBeInTheDocument();

    // Check descriptions
    expect(screen.getByText('This is the first task')).toBeInTheDocument();
    expect(screen.getByText('This is the second task')).toBeInTheDocument();

    // Check completed status
    expect(screen.getByText('Second Task')).toHaveClass('line-through');
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <TaskList isLoading={false} tasks={mockTasks} onDelete={mockOnDelete} />
    );

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('calls onToggleComplete when checkbox is clicked', () => {
    render(
      <TaskList
        isLoading={false}
        tasks={mockTasks}
        onToggleComplete={mockOnToggleComplete}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(mockOnToggleComplete).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('handles undefined callbacks gracefully', () => {
    render(<TaskList isLoading={false} tasks={mockTasks} />);

    // Should not throw errors when callbacks aren't provided
    const deleteButton = screen.getAllByText('Delete')[0];
    const checkbox = screen.getAllByRole('checkbox')[0];

    expect(() => fireEvent.click(deleteButton)).not.toThrow();
    expect(() => fireEvent.click(checkbox)).not.toThrow();
  });
});
