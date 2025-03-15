'use client'
import { useState, useEffect } from 'react';
import { FiMessageSquare, FiVideo, FiUpload, FiDownload, FiCheckSquare, FiUser } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

export default function CollaborationSpace({ project, proposal }) {
  const [activeTab, setActiveTab] = useState('chat');
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (project?._id || project?.id) { // Check for both _id and id
      fetchMessages();
    }
  }, [project]); // Depend on entire project object

  const fetchMessages = async () => {
    try {
      const projectId = project._id || project.id; // Handle both ID formats
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/messages/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
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
          projectId: project.id,
          content: newMessage,
          type: 'text'
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    // Add file upload logic
  };

  const handleAddTask = async (task) => {
    // Add task creation logic
  };

  return (
    <div className="h-[600px] flex flex-col bg-white rounded-xl shadow-lg">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center px-4 py-2 ${
            activeTab === 'chat' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
          }`}
        >
          <FiMessageSquare className="mr-2" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`flex items-center px-4 py-2 ${
            activeTab === 'files' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
          }`}
        >
          <FiUpload className="mr-2" />
          Files
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center px-4 py-2 ${
            activeTab === 'tasks' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
          }`}
        >
          <FiCheckSquare className="mr-2" />
          Tasks
        </button>
        <button
          onClick={() => setActiveTab('call')}
          className={`flex items-center px-4 py-2 ${
            activeTab === 'call' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
          }`}
        >
          <FiVideo className="mr-2" />
          Video Call
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'chat' && (
          <div className="space-y-4">
            {/* Chat messages */}
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-lg ${
                  message.isMine ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`}>
                  {message.text}
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
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600">Drop files here or click to upload</p>
              </label>
            </div>
            {/* File list */}
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

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {/* Task list */}
            {tasks.map((task, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleAddTask({ ...task, completed: !task.completed })}
                  className="mr-3"
                />
                <span className={task.completed ? 'line-through text-gray-500' : ''}>
                  {task.text}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'call' && (
          <div className="flex items-center justify-center h-full">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <FiVideo className="inline-block mr-2" />
              Start Video Call
            </button>
          </div>
        )}
      </div>

      {/* Message Input */}
      {activeTab === 'chat' && (
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border rounded-lg px-4 py-2"
              placeholder="Type your message..."
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
