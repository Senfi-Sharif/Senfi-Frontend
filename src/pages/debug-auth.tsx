import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';

export default function DebugAuth(): React.JSX.Element {
  const [authInfo, setAuthInfo] = useState<any>({});

  useEffect(() => {
    const token = sessionStorage.getItem('auth_token');
    const email = sessionStorage.getItem('auth_email');
    const role = sessionStorage.getItem('auth_role');
    
    setAuthInfo({
      token: token ? 'Found' : 'Not found',
      email,
      role,
      sessionStorageKeys: Object.keys(sessionStorage),
      localStorageKeys: Object.keys(localStorage)
    });
  }, []);

  return (
    <Layout title="Debug Auth" description="Debug authentication">
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Debug Authentication</h1>
        
        <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <h3>Authentication Status:</h3>
          <pre>{JSON.stringify(authInfo, null, 2)}</pre>
        </div>

        <div style={{ background: '#e8f5e8', padding: '1rem', borderRadius: '8px' }}>
          <h3>Session Storage:</h3>
          <ul>
            {authInfo.sessionStorageKeys?.map((key: string) => (
              <li key={key}>
                <strong>{key}:</strong> {sessionStorage.getItem(key)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
} 