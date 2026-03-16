import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import ProfileDashboard from './components/ProfileDashboard';
import StarPopup from './components/StarPopup';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '';

export default function App() {
  const [repoData, setRepoData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('profile');
  const [showStar, setShowStar] = useState(false);

  // Show star popup 10 seconds after results load
  useEffect(() => {
    if (repoData || profileData) {
      const t = setTimeout(() => setShowStar(true), 10000);
      return () => clearTimeout(t);
    }
  }, [repoData, profileData]);

  const analyzeRepo = async (url) => {
    setLoading(true); setError(null); setRepoData(null); setProfileData(null); setShowStar(false);
    try {
      const res = await axios.post(`${API}/api/repo/analyze`, { url });
      setRepoData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  const analyzeProfile = async (username) => {
    setLoading(true); setError(null); setProfileData(null); setRepoData(null); setShowStar(false);
    try {
      const res = await axios.post(`${API}/api/profile/analyze`, { username });
      setProfileData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  const reset = () => { setRepoData(null); setProfileData(null); setError(null); setShowStar(false); };

  if (repoData) return (
    <>
      <Dashboard data={repoData} onReset={reset} onAnalyze={analyzeRepo} />
      {showStar && <StarPopup onClose={() => setShowStar(false)} />}
    </>
  );

  if (profileData) return (
    <>
      <ProfileDashboard data={profileData} onReset={reset} onAnalyzeRepo={analyzeRepo} onAnalyzeProfile={analyzeProfile} />
      {showStar && <StarPopup onClose={() => setShowStar(false)} />}
    </>
  );

  return (
    <LandingPage
      mode={mode} setMode={setMode}
      onAnalyzeRepo={analyzeRepo}
      onAnalyzeProfile={analyzeProfile}
      loading={loading} error={error}
    />
  );
}
