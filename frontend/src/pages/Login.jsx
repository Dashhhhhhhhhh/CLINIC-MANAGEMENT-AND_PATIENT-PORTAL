import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const testProtected = async () => {
    try {
      const response = await axios.get('http://localhost:3000/protected');
      console.log(response.data);
      setMessage(response.data);
    } catch (error) {
      console.error(error);
      setMessage('Access denied or token Missing');
    }
  };

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        username,
        password,
      });

      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');

      setMessage('Login successful!');
      console.log('Token saved:', response.data.token);
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data.error || 'Login failed');
      } else {
        setMessage('Server not reachable');
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Magayon Diagnostic Center</h2>

      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>
      <button onClick={testProtected}>Test Protected Route</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;
