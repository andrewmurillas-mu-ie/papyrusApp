import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GithubCallbackPage(): React.ReactElement {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, loginWithGithubToken } = useAuth();
    const [hasProcessedToken, setHasProcessedToken] = useState(false);

    useEffect(() => {
        if (hasProcessedToken) return;

        const processToken = async () => {
            console.log('[GithubCallback] Full URL:', window.location.href);
            console.log('[GithubCallback] Search params:', location.search);
            
            const params = new URLSearchParams(location.search);
            const token = params.get('token');
            console.log('[GithubCallback] token from query:', token);

            if (!token) {
                console.log('[GithubCallback] No token found in URL, going to /login');
                navigate('/login');
                return;
            }

            console.log('[GithubCallback] Token found, attempting login...');
            const result = await loginWithGithubToken(token);
            console.log('[GithubCallback] loginWithGithubToken result:', result);

            if (!result.ok) {
                console.log('[GithubCallback] Login failed, navigating to /login');
                navigate('/login');
                return;
            }

            // Mark that we've processed the token
            setHasProcessedToken(true);
        };

        processToken();
    }, [hasProcessedToken, location.search, loginWithGithubToken, navigate]);

    // Step 2: Navigate AFTER user state has updated
    useEffect(() => {
        if (hasProcessedToken && user) {
            console.log('[GithubCallback] User state updated, navigating to /dashboard');
            navigate('/dashboard', { replace: true });
        }
    }, [hasProcessedToken, user, navigate]);

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
