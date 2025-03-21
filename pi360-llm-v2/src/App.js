import React from 'react';
import Chatbot from './Chatbot';

function App() {
  return (
    <div className="App container">
      <header className="App-header">
        <h1>Chat-Pi360 | Beta</h1>
      </header>
      <p className="disclaimer">
        Chat Pi360 is a LLM prototype trained on a limited student data. It may hallucinate and provide incorrect responses.
      </p>
      <Chatbot />
    </div>
  );
}

export default App;
