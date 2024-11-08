import { useState } from "react"
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('user')
  const [password, setPassword] = useState('123456')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setLoading(true)
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch("http://localhost:3000/api/v1/login", {
        method: "POST",
        body: formData,
      });

      setLoading(false)

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful:", data)
        navigate('/')
      } else {
        console.error("Login failed:", response.statusText)
      }
    } catch (error) {
      setLoading(false)
      console.error("An error occurred:", error)
    }
  };

  return (
    <div className="login-container">
      <div className="login">
        <h2 style={{ color: '#fff' }}>LOGIN</h2>
        <div className="alert">*username : user, password : 123456</div>
        <input type="text" className="custom-input" placeholder="user" required value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" className="custom-input" placeholder="123456" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <div>
          <button className="default-btn green" onClick={handleLogin} disabled={loading}>{ loading ? "Loading..." : "Login" }</button>
        </div>
      </div>
    </div>
  )
}

export default Login