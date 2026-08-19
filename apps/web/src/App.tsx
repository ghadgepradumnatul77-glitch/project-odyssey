import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/useAuth';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import CitizenReportPage from './pages/CitizenReportPage';
import CitizenTrackingPage from './pages/CitizenTrackingPage';
import { useState } from 'react';

function Application() {
  const { isAuthenticated } = useAuth();
  const [publicPage,setPublicPage]=useState<'login'|'report'|'tracking'>('login');
  const [trackingReference,setTrackingReference]=useState('');
  if(isAuthenticated)return <AppShell/>;
  if(publicPage==='report')return <CitizenReportPage onOfficerLogin={()=>setPublicPage('login')} onTrackReport={(reference)=>{setTrackingReference(reference);setPublicPage('tracking');}} onTracking={()=>setPublicPage('tracking')}/>;
  if(publicPage==='tracking')return <CitizenTrackingPage initialReference={trackingReference} onOfficerLogin={()=>setPublicPage('login')} onReportIssue={()=>setPublicPage('report')}/>;
  return <LoginPage onPublicReporting={()=>setPublicPage('report')} onPublicTracking={()=>setPublicPage('tracking')}/>;
}

export default function App() {
  return <AuthProvider><Application /></AuthProvider>;
}
