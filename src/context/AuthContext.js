import { createContext, useContext, useState, useCallback } from 'react';
import { getLS, setLS, removeLS } from '../utils/storage';
import { hashPassword } from '../utils/helpers';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => getLS('cargo_session', null));

  const register = useCallback(({ name, email, password, company, phone }) => {
    const users = getLS('cargo_users', []);
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    const user = {
      id: `u_${Date.now()}`,
      name,
      email,
      passwordHash: hashPassword(password),
      company: company || '',
      phone: phone || '',
      createdAt: new Date().toISOString(),
    };
    setLS('cargo_users', [...users, user]);
    const session = { id: user.id, name: user.name, email: user.email, company: user.company };
    setLS('cargo_session', session);
    setCurrentUser(session);
    return { success: true };
  }, []);

  const login = useCallback(({ email, password }) => {
    const users = getLS('cargo_users', []);
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.passwordHash === hashPassword(password)
    );
    if (!user) return { success: false, error: 'Invalid email or password.' };
    const session = { id: user.id, name: user.name, email: user.email, company: user.company };
    setLS('cargo_session', session);
    setCurrentUser(session);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    removeLS('cargo_session');
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
