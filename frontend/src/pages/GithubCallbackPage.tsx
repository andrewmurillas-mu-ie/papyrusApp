import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GithubCallbackPage(): React.ReactElement {
    const location = useLocation();
    const navigate = useNavigate();
    const { loginWithGithubToken } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        console.log('[GithubCallback] token from query:', token);

        if (!token) {
            console.log('[GithubCallback] No token, going to /login');
            navigate('/login');
            return;
        }

        const result = loginWithGithubToken(token);
        console.log('[GithubCallback] loginWithGithubToken result:', result);

        if (result.ok) {
            console.log('[GithubCallback] Success, navigating to /dashboard');
            navigate('/dashboard');
        } else {
            console.log('[GithubCallback] Failed, navigating to /login');
            navigate('/login');
        }
    }, []);

    return (
        <div className="auth-shell">
            <section className="auth-card">
                <p className="eyebrow">Papyrus</p>
                <h1>Signing you in...</h1>
                <p className="muted">
                    Completing GitHub login. You will be redirected in a moment.
                </p>
            </section>
        </div>
    );
}
