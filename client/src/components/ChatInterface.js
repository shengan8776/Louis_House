import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatInterface.css';


// 聊天界面主组件
function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello, how can I help you plan your trip?",
      sender: "ai",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (inputText.trim()) {
      const userMessage = {
        id: Date.now(),
        text: inputText,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInputText('');
      setTimeout(scrollToBottom, 100);
      
      try {
        const response = await axios.post('http://localhost:3001/api/auth/login', { 
          prompt: inputText 
        }, {
          withCredentials: true
        });
        
        console.log('Received API response:', response.data);
      
        const aiMessage = {
          id: Date.now() + 1,
          text: response.data,
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prevMessages => [...prevMessages, aiMessage]);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error('发送消息时出错:', error);
        
        const errorMessage = {
          id: Date.now() + 1,
          text: "抱歉，发送消息时出现了问题。请稍后再试。",
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prevMessages => [...prevMessages, errorMessage]);
        setTimeout(scrollToBottom, 100);
      }
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-messages-area" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div key={message.id || index} className="message-row">
            <div className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}>
              <div className="message-text">{message.text}</div>
              <div className="message-time">
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Add your Plan..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" disabled={!inputText.trim()}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatInterface;