import React, { useState } from 'react';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => setLogs(prev => [...prev, msg]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        setToken(data.token);
        addLog(`Login Success! Token: ${data.token}`);
      } else {
        addLog(`Error: ${data.error}`);
      }
    } catch (err) {
      addLog(`Network Error: ${err.message}`);
    }
  };

  const testProtectedApi = async () => {
    try {
      // Requirement: Tokens sent as HTTP headers
      const res = await fetch('http://localhost:5000/api/profile', {
        headers: { 'Authorization': token } 
      });
      const data = await res.json();
      addLog(`API Response: ${JSON.stringify(data)}`);
    } catch (err) {
      addLog(`API Error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Exam Part 1: Login System</h1>
      
      {!token ? (
        <form onSubmit={handleLogin} style={{ border: '1px solid #ccc', padding: '20px', maxWidth: '300px' }}>
          <h3>Login</h3>
          <input 
            placeholder="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            style={{ display: 'block', margin: '10px 0', width: '100%' }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={{ display: 'block', margin: '10px 0', width: '100%' }}
          />
          <button type="submit">Login</button>
        </form>
      ) : (
        <div>
          <h3>Welcome, {username}</h3>
          <button onClick={testProtectedApi}>Test Protected API (Send Token)</button>
          <button onClick={() => setToken(null)} style={{marginLeft: '10px'}}>Logout</button>
        </div>
      )}

      <div style={{ marginTop: '20px', background: '#f0f0f0', padding: '10px' }}>
        <h4>Client Logs:</h4>
        {logs.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}

export default App;