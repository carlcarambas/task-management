// import NxWelcome from './nx-welcome';

export function App() {
  return (
    <div className="app-container">
      {/* login */}
      <div className="login-container">
        <h1>Login</h1>
        <form>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
          <button type="submit">Login</button>
          <p>
            Don't have an account? <a href="#">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default App;
