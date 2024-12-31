"use client"

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "@/hooks/useTranslations";
import axios from 'axios';
import type { ReactNode, ReactElement } from 'react';
import { 
    DragDropContext, 
    Droppable, 
    Draggable, 
    DroppableProps, 
    DroppableProvided, 
    DroppableStateSnapshot, 
    DraggableProvided, 
    DraggableStateSnapshot,
    DropResult as DndDropResult, // Dodajemy alias do importu
  } from 'react-beautiful-dnd';

type DroppableChildrenFunction = (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => JSX.Element;

interface StrictModeDroppableProps extends Omit<DroppableProps, 'children'> {
  children: DroppableChildrenFunction;
}

export const StrictModeDroppable = (props: StrictModeDroppableProps): JSX.Element | null => {
  const [enabled, setEnabled] = useState(false);
  const { children, ...rest } = props;
  
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  
  if (!enabled) return null;
  
  return (
    <Droppable {...rest}>
      {(provided, snapshot) => children(provided, snapshot)}
    </Droppable>
  );
};

interface Task {
    id: number;
    content: string;
    description: string;
    startDate: string;
    dueDate: string;
    userId: string;
    createdAt: string;
    status: ColumnId;
}

interface DropResult {
    draggableId: string;
    type: string;
    source: {
      droppableId: string;
      index: number;
    };
    destination?: {
      droppableId: string;
      index: number;
    } | null;
    reason?: 'DROP' | 'CANCEL';
  }

type ColumnId = 'todo' | 'inProgress' | 'done';

interface Column {
    id: ColumnId;
    title: string;
    tasks: Task[];
}

interface TaskCardProps {
    task: Task;
    column: Column;
    onMove: (taskId: number, sourceColumnId: ColumnId, targetColumnId: ColumnId) => void;
    onEdit: (task: Task) => void;
    onDelete: (columnId: ColumnId, taskId: number) => void;
}

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTask: Task | null;
    newTask: {
        content: string;
        description: string;
        startDate: string;
        dueDate: string;
    };
    setNewTask: (task: any) => void;
    onSubmit: () => void;
}

const TaskCard = ({ task, column, onMove, onEdit, onDelete }: TaskCardProps) => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
    
    return (
        <div className={`bg-white p-4 rounded shadow flex flex-col gap-2 ${isOverdue ? 'border-l-4 border-red-500' : ''}`}>
            <div className="flex justify-between items-start">
                <h3 className="font-medium">{task.content}</h3>
                <div className="flex gap-2">
                    {column.id !== 'done' && (
                        <button
                            onClick={() => onMove(task.id, column.id, column.id === 'todo' ? 'inProgress' : 'done')}
                            className="text-blue-500 hover:text-blue-700"
                        >
                            →
                        </button>
                    )}
                    <button
                        onClick={() => onEdit(task)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✎
                    </button>
                    <button
                        onClick={() => onDelete(column.id, task.id)}
                        className="text-red-500 hover:text-red-700"
                    >
                        ×
                    </button>
                </div>
            </div>
            {task.description && (
                <p className="text-sm text-gray-600">{task.description}</p>
            )}
            {(task.startDate || task.dueDate) && (
                <div className="text-xs text-gray-500 space-y-1">
                    {task.startDate && (
                        <div>Start: {new Date(task.startDate).toLocaleString()}</div>
                    )}
                    {task.dueDate && (
                        <div className={isOverdue ? 'text-red-500' : ''}>
                            Termin: {new Date(task.dueDate).toLocaleString()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const TaskModal = ({ isOpen, onClose, selectedTask, newTask, setNewTask, onSubmit }: TaskModalProps) => {
    const translations = useTranslations();
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-semibold mb-4">
                    {selectedTask ? translations.todoList.editTask : translations.todoList.newTask}
                </h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {translations.todoList.form.title}
                            </label>
                            <input
                                type="text"
                                value={newTask.content}
                                onChange={(e) => setNewTask({ ...newTask, content: e.target.value })}
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={translations.todoList.form.titlePlaceholder}
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {translations.todoList.form.description}
                            </label>
                            <textarea
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={translations.todoList.form.descriptionPlaceholder}
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {translations.todoList.form.startDate}
                            </label>
                            <input
                                type="datetime-local"
                                value={newTask.startDate}
                                onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {translations.todoList.form.dueDate}
                            </label>
                            <input
                                type="datetime-local"
                                value={newTask.dueDate}
                                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-100"
                            >
                                {translations.todoList.form.cancel}
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                {selectedTask ? translations.todoList.form.save : translations.todoList.form.add}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TodoList = () => {
    const { user } = useUser();
    const translations = useTranslations();

    const initialColumns = [
        {
            id: 'todo' as const,
            title: `${translations.todoList.columns.todo} (0)`,
            tasks: []
        },
        {
            id: 'inProgress' as const,
            title: `${translations.todoList.columns.inProgress} (0)`,
            tasks: []
        },
        {
            id: 'done' as const,
            title: `${translations.todoList.columns.done} (0)`,
            tasks: []
        }
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [columns, setColumns] = useState<Column[]>(initialColumns);
    const [newTask, setNewTask] = useState({
        content: '',
        description: '',
        startDate: '',
        dueDate: ''
    });

    useEffect(() => {
        if (user?.id) {
            const fetchTasks = async () => {
                try {
                    const response = await axios.get(`/api/todos?userId=${user.id}`);
                    const tasks = response.data;
                    const columnData = {
                        todo: tasks.filter((task: Task) => task.status === 'todo'),
                        inProgress: tasks.filter((task: Task) => task.status === 'inProgress'),
                        done: tasks.filter((task: Task) => task.status === 'done')
                    };

                    setColumns(prev => prev.map(column => ({
                        ...column,
                        tasks: columnData[column.id] || [],
                        title: `${translations.todoList.columns[column.id]} (${columnData[column.id]?.length || 0})`
                    })));
                } catch (error) {
                    console.error('Error fetching tasks:', error);
                }
            };

            fetchTasks();
        }
    }, [user?.id, translations]);

    const updateColumnTitle = (column: Column): string => {
        return `${translations.todoList.columns[column.id]} (${column.tasks.length})`;
    };

    const handleSubmit = () => {
        if (selectedTask) {
            updateTask();
        } else {
            addTask('todo');
        }
    };

    const addTask = async (columnId: ColumnId) => {
        if (!newTask.content.trim() || !user?.id) return;
        
        try {
            const response = await axios.post('/api/todos', {
                content: newTask.content,
                description: newTask.description,
                startDate: newTask.startDate,
                dueDate: newTask.dueDate,
                status: columnId,
                userId: user.id
            });

            const task = response.data;

            setColumns(columns.map(column => {
                if (column.id === columnId) {
                    const updatedTasks = [...column.tasks, task];
                    return {
                        ...column,
                        title: updateColumnTitle({ ...column, tasks: updatedTasks }),
                        tasks: updatedTasks
                    };
                }
                return column;
            }));
            
            setNewTask({
                content: '',
                description: '',
                startDate: '',
                dueDate: ''
            });
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const editTask = (task: Task) => {
        setSelectedTask(task);
        setNewTask({
            content: task.content,
            description: task.description,
            startDate: task.startDate,
            dueDate: task.dueDate
        });
        setIsModalOpen(true);
    };

    const updateTask = async () => {
        if (!selectedTask) return;

        try {
            const response = await axios.patch(`/api/todos/${selectedTask.id}`, {
                ...newTask,
                status: selectedTask.status
            });

            const updatedTask = response.data;

            setColumns(columns.map(column => {
                if (column.id === selectedTask.status) {
                    const updatedTasks = column.tasks.map(task =>
                        task.id === selectedTask.id ? updatedTask : task
                    );
                    return {
                        ...column,
                        title: updateColumnTitle({ ...column, tasks: updatedTasks }),
                        tasks: updatedTasks
                    };
                }
                return column;
            }));

            setSelectedTask(null);
            setNewTask({
                content: '',
                description: '',
                startDate: '',
                dueDate: ''
            });
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const moveTask = async (taskId: number, sourceColumnId: ColumnId, targetColumnId: ColumnId) => {
        const sourceColumn = columns.find(col => col.id === sourceColumnId);
        if (!sourceColumn) return;
        
        const task = sourceColumn.tasks.find(t => t.id === taskId);
        if (!task) return;

        try {
            const response = await axios.patch(`/api/todos/${taskId}`, {
                ...task,
                status: targetColumnId
            });

            const updatedTask = response.data;
            
            setColumns(columns.map(column => {
                if (column.id === sourceColumnId) {
                    const updatedTasks = column.tasks.filter(t => t.id !== taskId);
                    return {
                        ...column,
                        title: updateColumnTitle({ ...column, tasks: updatedTasks }),
                        tasks: updatedTasks
                    };
                }
                if (column.id === targetColumnId) {
                    const updatedTasks = [...column.tasks, updatedTask];
                    return {
                        ...column,
                        title: updateColumnTitle({ ...column, tasks: updatedTasks }),
                        tasks: updatedTasks
                    };
                }
                return column;
            }));
        } catch (error) {
            console.error('Error moving task:', error);
        }
    };

    const deleteTask = async (columnId: ColumnId, taskId: number) => {
        try {
            await axios.delete(`/api/todos/${taskId}`);

            setColumns(columns.map(column => {
                if (column.id === columnId) {
                    const updatedTasks = column.tasks.filter(task => task.id !== taskId);
                    return {
                        ...column,
                        title: updateColumnTitle({ ...column, tasks: updatedTasks }),
                        tasks: updatedTasks
                    };
                }
                return column;
            }));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleDragEnd = async (result: DndDropResult) => {

        console.log('handleDragEnd result:', result);

        const { destination, source, draggableId } = result;
    
        // Jeśli nie ma miejsca docelowego lub jest to to samo miejsce
        if (!destination || 
            (destination.droppableId === source.droppableId && 
             destination.index === source.index)) {
                console.log('No destination');
            return;
        }
        
        console.log('Source:', source);
        console.log('Destination:', destination);
        console.log('DraggableId:', draggableId);

        const sourceColumn = columns.find(col => col.id === source.droppableId);
        const destColumn = columns.find(col => col.id === destination.droppableId);
        
        if (!sourceColumn || !destColumn) return;
    
        const task = sourceColumn.tasks.find(t => String(t.id) === draggableId);
    if (!task) return;

    try {
        if (source.droppableId !== destination.droppableId) {
            const response = await axios.patch(`/api/todos/${draggableId}`, {
                ...task,
                status: destination.droppableId
            });
                const updatedTask = response.data;
    
                setColumns(columns.map(column => {
                    // Usuń z kolumny źródłowej
                    if (column.id === source.droppableId) {
                        const updatedTasks = column.tasks.filter(t => t.id !== parseInt(draggableId));
                        return {
                            ...column,
                            title: updateColumnTitle({ ...column, tasks: updatedTasks }),
                            tasks: updatedTasks
                        };
                    }
                    // Dodaj do kolumny docelowej
                    if (column.id === destination.droppableId) {
                        const updatedTasks = [...column.tasks];
                        updatedTasks.splice(destination.index, 0, updatedTask);
                        return {
                            ...column,
                            title: updateColumnTitle({ ...column, tasks: updatedTasks }),
                            tasks: updatedTasks
                        };
                    }
                    return column;
                }));
            } else {
                // Jeśli przenosimy w tej samej kolumnie
                setColumns(columns.map(column => {
                    if (column.id === source.droppableId) {
                        const updatedTasks = [...column.tasks];
                        const [removed] = updatedTasks.splice(source.index, 1);
                        updatedTasks.splice(destination.index, 0, removed);
                        return {
                            ...column,
                            tasks: updatedTasks
                        };
                    }
                    return column;
                }));
            }
        } catch (error) {
            console.error('Error moving task:', error);
        }
    };

    return (
        <div className="w-full p-4">
            {/* Dodajemy przycisk i modal */}
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    {translations.todoList.newTask}
                </button>
            </div>
     
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-4">
                    {columns.map(column => (
                        <StrictModeDroppable
                            droppableId={column.id}
                            key={column.id}
                            type="TASK"
                        >
                            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`flex-1 bg-gray-100 rounded-lg p-4 ${
                                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <h2 className="font-semibold text-lg mb-4">{column.title}</h2>
                                    <div className="space-y-2">
                                        {column.tasks.map((task, index) => (
                                            <Draggable
                                                key={String(task.id)}
                                                draggableId={String(task.id)}
                                                index={index}
                                            >
                                                {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            opacity: snapshot.isDragging ? 0.8 : 1
                                                        }}
                                                    >
                                                        <TaskCard
                                                            task={task}
                                                            column={column}
                                                            onMove={moveTask}
                                                            onEdit={editTask}
                                                            onDelete={deleteTask}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </StrictModeDroppable>
                    ))}
                </div>
            </DragDropContext>
     
            {/* Dodajemy modal */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedTask(null);
                    setNewTask({
                        content: '',
                        description: '',
                        startDate: '',
                        dueDate: ''
                    });
                }}
                selectedTask={selectedTask}
                newTask={newTask}
                setNewTask={setNewTask}
                onSubmit={handleSubmit}
            />
        </div>
     );

};

export default TodoList;