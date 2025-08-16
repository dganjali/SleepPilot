import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../Layout.jsx';
import Dashboard from '../Pages/Dashboard';
import Landing from '../Pages/Landing';
import Profile from '../Pages/Profile';
import Recommendations from '../Pages/Recommendations';
import Risks from '../Pages/Risks';
import Trends from '../Pages/Trends';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route 
          path="/dashboard" 
          element={
            <Layout currentPageName="Dashboard">
              <Dashboard />
            </Layout>
          } 
        />
        <Route 
          path="/trends" 
          element={
            <Layout currentPageName="Trends">
              <Trends />
            </Layout>
          } 
        />
        <Route 
          path="/recommendations" 
          element={
            <Layout currentPageName="Recommendations">
              <Recommendations />
            </Layout>
          } 
        />
        <Route 
          path="/risks" 
          element={
            <Layout currentPageName="Risks">
              <Risks />
            </Layout>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <Layout currentPageName="Profile">
              <Profile />
            </Layout>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
