import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Container from "./Container"
import Login from "./Login"
import HomePage from './HomePage';
import NotFoundPage from './NotFoundPage'
import "./assets/main.css"

function App() {
  return (
    <Router>
      <Container>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;