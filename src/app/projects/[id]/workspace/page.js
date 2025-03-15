'use client'
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Loading from '@/components/Loading';
import { useAuth } from '@/context/AuthContext';
import { FiMessageSquare, FiVideo, FiUpload, FiDownload, FiCheckSquare, FiUser, FiBriefcase, FiFileText } from 'react-icons/fi';

const NavBar = dynamic(() => import('@/components/NavBar'), {
  loading: () => <Loading />
});

export default function ProjectWorkspace({ params }) {
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newTask, setNewTask] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const pathParts = window.location.pathname.split('/');
        const projectId = pathParts[pathParts.indexOf('projects') + 1];
        
        if (projectId) {
          await Promise.all([
            fetchProjectDetails(projectId),
            fetchMessages(projectId),
            fetchTasks(projectId)
          ]);
        }
      } catch (error) {
        setError(error.message);
      }
    };

    init();
  }, []);

  const fetchProjectDetails = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch project details');
      }
      
      const data = await response.json();
      setProject(data);
    } catch (error) {
      throw new Error('Failed to fetch project details');
    }
  };

  const fetchMessages = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/messages/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId: project._id,
          content: newMessage,
          type: 'text'
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(project._id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', project._id);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const uploadedFile = await response.json();
        setFiles(prevFiles => [...prevFiles, uploadedFile]);

        // Send file message in chat
        await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            projectId: project._id,
            content: uploadedFile.url,
            type: 'file',
            fileInfo: {
              name: uploadedFile.name,
              size: uploadedFile.size,
              type: uploadedFile.type
            }
          })
        });

        fetchMessages(project._id);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId: project._id,
          title: newTask,
          description: taskDescription,
          assignedTo: user.role === 'client' ? 
            project.proposals.find(p => p.status === 'accepted')?.freelancer : 
            project.client
        })
      });

      if (response.ok) {
        setNewTask('');
        setTaskDescription('');
        fetchTasks(project._id);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Refresh tasks after update
        fetchTasks(project._id);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const renderMessage = (message) => {
    if (message.type === 'file') {
      return (
        <div className="flex items-center gap-2">
          <FiFileText className="w-5 h-5" />
          <a href={message.content} 
             target="_blank" 
             rel="noopener noreferrer"
             className="text-blue-600 hover:underline">
            {message.fileInfo.name}
          </a>
        </div>
      );
    }
    return message.content;
  };

  const renderTasksSection = () => (
    <div className="space-y-4">
      {user.role === 'client' && (
        <form onSubmit={handleAddTask} className="space-y-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Task title..."
          />
          <textarea
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Task description..."
            rows="3"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Task
          </button>
        </form>
      )}

      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task._id} 
               className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{task.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <span>Created by: {task.createdBy.name}</span>
                  <span>•</span>
                  <span>Assigned to: {task.assignedTo?.name}</span>
                </div>
              </div>
              <select
                value={task.status}
                onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  if (!project) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Project Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
                <div className="flex items-center text-gray-600">
                  <FiBriefcase className="mr-2" />
                  <span>Project Workspace</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Client</div>
                <div className="font-medium">{project.client?.name}</div>
              </div>
            </div>
          </div>

          {/* Workspace Content */}
          <div className="grid md:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex items-center px-4 py-2 ${
                      activeTab === 'chat' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    <FiMessageSquare className="mr-2" /> Chat
                  </button>
                  <button
                    onClick={() => setActiveTab('files')}
                    className={`flex items-center px-4 py-2 ${
                      activeTab === 'files' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    <FiUpload className="mr-2" /> Files
                  </button>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className={`flex items-center px-4 py-2 ${
                      activeTab === 'tasks' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    <FiCheckSquare className="mr-2" /> Tasks
                  </button>
                  <button
                    onClick={() => setActiveTab('call')}
                    className={`flex items-center px-4 py-2 ${
                      activeTab === 'call' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    <FiVideo className="mr-2" /> Video Call
                  </button>
                </div>

                {/* Tab Content */}
                <div className="h-[600px] flex flex-col">
                  <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'chat' && (
                      <div className="space-y-4">
                        {messages.map((message, index) => (
                          <div key={index} className={`flex ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-lg ${
                              message.sender._id === user._id ? 'bg-blue-600 text-white' : 'bg-gray-100'
                            }`}>
                              <div className="text-sm opacity-75 mb-1">
                                {message.sender.name}
                              </div>
                              {renderMessage(message)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'files' && (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <input
                            type="file"
                            className="hidden"
                            id="file-upload"
                            onChange={(e) => handleFileUpload(e.target.files[0])}
                          />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-gray-600">Drop files here or click to upload</p>
                          </label>
                        </div>
                        <div className="space-y-2">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span>{file.name}</span>
                              <button className="text-blue-600 hover:text-blue-700">
                                <FiDownload />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'tasks' && renderTasksSection()}

                    {activeTab === 'call' && (
                      <div className="flex items-center justify-center h-full">
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          <FiVideo className="inline-block mr-2" />
                          Start Video Call
                        </button>
                      </div>
                    )}
                  </div>

                  {activeTab === 'chat' && (
                    <div className="border-t p-4">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-1 border rounded-lg px-4 py-2"
                          placeholder="Type your message..."
                        />
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Send
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h3 className="font-bold mb-4">Project Details</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600">Budget</div>
                    <div className="font-medium">
                      ${project.budget?.minAmount} - ${project.budget?.maxAmount}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Duration</div>
                    <div className="font-medium">{project.duration}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Status</div>
                    <div className="font-medium capitalize">{project.status}</div>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-600 mb-2">Team Members</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <FiUser className="text-gray-600" />
                        </div>
                        <span>{project.client?.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
