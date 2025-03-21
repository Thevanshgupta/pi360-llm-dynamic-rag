import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('students');
  const chatWindowRef = useRef(null);

  const WORKER_URLS = {
    workshop: 'https://pi360-rag-sql-generator.theshinchangupta.workers.dev',
    students: 'https://pi360-sql-generator.karan-cse.workers.dev',
    training: 'https://pi360-rag-sql-generator.theshinchangupta.workers.dev',
    research: 'https://pi360-rag-sql-generator.theshinchangupta.workers.dev',
    seminar: 'https://pi360-rag-sql-generator.theshinchangupta.workers.dev',
    conference: 'https://pi360-rag-sql-generator.theshinchangupta.workers.dev',
  };

  const exportCSV = (data, filename = 'data.csv') => {
    if (!data || data.length === 0) return;

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(item => 
        Object.values(item)
          .map(value => `"${value}"`.replace(/\n/g, ' '))
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url); 
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const beautifyResponse = async (responseContent, userQuery) => {
    try {
      const systemMessage = `You are a data analyst. You have been given a task to analyze the data and provide a response. 
      You have to take the data and reply it in a beautiful way.
      Response should be given in 3 lines only and for one word give it one word.`;
  
      const response = await fetch('https://pi360-deepseek-model.theshinchangupta.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `${systemMessage}\n\nDATA: ${JSON.stringify(responseContent)}` },
            { role: 'user', content: `Create response for and please remove the extra data from the response like give a small and accurate data remove the things that are not required like extra make it professional: "${userQuery}"` }
          ],
        }),
      });
  
      if (!response.ok) throw new Error(`Beautification failed: ${response.statusText}`);
      
      const data = await response.json();
      let beautified = data.response;

      const cleanResponse = (text) => {
        return text
          .replace(/\*\*/g, '')
          .replace(/<\/?think>/g, "")
          .replace(/\b2,?024\b/g, "2024")
          .replace(/\.{2,}/g, '.')
          .trim();
      };
  
      return cleanResponse(beautified);
  
    } catch (error) {
      console.error('Formatting Error:', error);
      const value = Object.values(responseContent)[0] || 0;
      return `There were ${value.toLocaleString()} during 2024.`;
    }
  };

  const renderTable = (data) => {
    if (!data || data.length === 0) return <p>No data available</p>;
    const keys = Object.keys(data[0]);
    
    return (
      <div className="table-container">
        <div className="export-button-container">
          <button 
            className="export-csv-button"
            onClick={() => exportCSV(data, `export-${Date.now()}.csv`)}
          >
            Export CSV
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr>{keys.map((key) => <th key={key}>{key}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>{keys.map((key) => <td key={key}>{item[key]}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleSend = async () => {
    if (input.trim() === '') return;

    const tempId = Date.now();
    const userMessage = { 
      id: tempId,
      type: 'user', 
      content: input,
      timestamp: new Date().getTime()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const payload = activeSection === 'students'
        ? { content: input, section: activeSection }
        : { schemaName: activeSection, content: input };

      console.log(`Sending request to ${WORKER_URLS[activeSection]} with payload:`, payload);

      const workerResponse = await fetch(WORKER_URLS[activeSection], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!workerResponse.ok) {
        const errorText = await workerResponse.text();
        throw new Error(`Failed to generate SQL query: ${workerResponse.status} - ${errorText}`);
      }
      
      const workerData = await workerResponse.json();
      const sqlQuery = workerData.query;

      console.log('Generated SQL:', sqlQuery);

      const encodedQuery = btoa(sqlQuery);
      const chatResponse = await fetch(
        `https://pi360.net/site/api/endpoints/chat.php?institute_id=mietjammu&secret=R0dqSDg3Njc2cC00NCNAaHg=&query=${encodedQuery}`
      );

      if (!chatResponse.ok) {
        const errorText = await chatResponse.text();
        throw new Error(`Database error: ${chatResponse.status} - ${errorText}`);
      }
      
      const chatData = await chatResponse.json();
      
      if (chatData.response_code === "200") {
        const beautified = await beautifyResponse(chatData.content, input);
        
        setMessages(prev => prev.map(msg => 
          msg.id === tempId
            ? {...msg, response: {
                sql: sqlQuery,
                rawData: chatData.content,
                beautified: beautified
              }}
            : msg
        ));
      } else {
        throw new Error(chatData.response_message || 'Database error');
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === tempId
          ? {...msg, error: `Error: ${error.message}`}
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const renderResponse = (response, error) => {
    if (error) {
      return (
        <div className="error-message">
          <div className="error-text">{error}</div>
        </div>
      );
    }
    if (!response) return null;
    
    return (
      <div className="bot-response">
        <div className="sql-query">Generated SQL: {response.sql}</div>
        <div className="beautified-response">{response.beautified}</div>
        {renderTable(response.rawData)}
      </div>
    );
  };

  useEffect(() => {
    chatWindowRef.current?.scrollTo(0, chatWindowRef.current.scrollHeight);
  }, [messages]);

  return (
    <div className="chatbot-container">
      <div className="section-selector">
        <button 
          className={activeSection === 'students' ? 'active' : ''} 
          onClick={() => setActiveSection('students')}
        >
          Students & Placements
        </button>
        <button 
          className={activeSection === 'research' ? 'active' : ''} 
          onClick={() => setActiveSection('research')}
        >
          Research
        </button>
        <button 
          className={activeSection === 'training' ? 'active' : ''} 
          onClick={() => setActiveSection('training')}
        >
          Training
        </button>
        <button 
          className={activeSection === 'seminar' ? 'active' : ''} 
          onClick={() => setActiveSection('seminar')}
        >
          Seminar
        </button>
        <button 
          className={activeSection === 'conference' ? 'active' : ''} 
          onClick={() => setActiveSection('conference')}
        >
          Conferences
        </button>
        <button 
          className={activeSection === 'workshop' ? 'active' : ''} 
          onClick={() => setActiveSection('workshop')}
        >
          Workshops
        </button>
      </div>
      
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((message) => (
          <div key={message.id} className="message-container">
            <div className={`message ${message.type}`}>
              <div className="message-content">
                {message.type === 'user' && (
                  <div className="user-icon">You</div>
                )}
                <div className="text-content">{message.content}</div>
              </div>
            </div>
            {renderResponse(message.response, message.error)}
          </div>
        ))}
        {isLoading && (
          <div className="typing-indicator">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend} 
            disabled={isLoading}
            className="send-button"
          >
            <svg className="send-icon" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
            </svg>
          </button>
        </div>
        <div className="disclaimer">
          Responses may contain inaccuracies. Verify important information.
        </div>
      </div>
    </div>
  );
};

export default Chatbot;