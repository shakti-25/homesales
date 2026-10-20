/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { User, VisitRecord } from './types/index.ts';
import { INITIAL_USERS, INITIAL_VISITS } from './data/seedData.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { TopBar } from './components/TopBar.tsx';
import { VisitsList } from './components/VisitsList.tsx';
import { CheckInForm } from './components/CheckInForm.tsx';
import { RepAnalyticsView } from './components/RepAnalyticsView.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { EditVisitModal } from './components/EditVisitModal.tsx';
import { GoogleAuthModal } from './components/GoogleAuthModal.tsx';
import { AdminPinModal } from './components/AdminPinModal.tsx';
import { requestDeviceLocation, reverseGeocodeCoordinates } from './utils/geolocation.ts';

const STORAGE_KEY_VISITS = 'ai_track_live_visits_v1';
const STORAGE_KEY_USER = 'ai_track_live_user_v1';

export default function App() {
  // 1. Initial State Initialization with LocalStorage Persistence
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Default to Shakti Thevar (Admin user)
    return INITIAL_USERS[0];
  });

  const [visits, setVisits] = useState<VisitRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_VISITS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_VISITS;
  });

  // Tab & Modal Navigation
  const [activeTab, setActiveTab] = useState<'visits' | 'checkin' | 'rep-analytics' | 'admin-dashboard'>(
    'visits'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<VisitRecord | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [pendingVisitToEdit, setPendingVisitToEdit] = useState<VisitRecord | null>(null);
  const [gpsLocality, setGpsLocality] = useState<string | null>('Goregaon East, Mumbai');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(visits));
  }, [visits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Attempt ambient reverse geocoding on app load for GPS status header
  useEffect(() => {
    async function initGpsBeacon() {
      try {
        const coords = await requestDeviceLocation();
        const geo = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);
        setGpsLocality(geo.locality);
      } catch {
        // Fallback default locality
        setGpsLocality('Goregaon East, Mumbai');
      }
    }
    initGpsBeacon();
  }, []);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }

  // Visit Operations
  function handleAddVisit(newVisit: VisitRecord) {
    setVisits((prev) => [newVisit, ...prev]);
    showToast(`Visit ${newVisit.serialNo} recorded at ${newVisit.locality}!`);
  }

  function handleSaveEdit(updated: VisitRecord) {
    setVisits((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    setEditingVisit(null);
    showToast(`Visit record ${updated.serialNo} updated successfully.`);
  }

  function handleDeleteVisit(id: string) {
    setVisits((prev) => prev.filter((v) => v.id !== id));
    setEditingVisit(null);
    showToast('Visit record deleted successfully.');
  }

  // Admin PIN Verification
  function handleOpenAdminPinModal(pendingVisit?: VisitRecord) {
    if (pendingVisit) {
      setPendingVisitToEdit(pendingVisit);
    }
    setShowAdminPinModal(true);
  }

  function handleAdminPinSuccess() {
    setCurrentUser((prev) => ({
      ...prev,
      role: 'admin',
    }));
    setShowAdminPinModal(false);

    if (pendingVisitToEdit) {
      setEditingVisit(pendingVisitToEdit);
      setPendingVisitToEdit(null);
      showToast('Admin PIN 250205 verified. Edit visit opened.');
    } else {
      showToast('Admin PIN 250205 verified. Administrator privileges unlocked.');
    }
  }

  function handleLockAdmin() {
    setCurrentUser((prev) => ({
      ...prev,
      role: 'sales_rep',
    }));
    if (activeTab === 'rep-analytics' || activeTab === 'admin-dashboard') {
      setActiveTab('visits');
    }
    showToast('Admin session locked. Switched to Representative view.');
  }

  function handleLoginUser(user: User) {
    setCurrentUser(user);
    if (!users.some((u) => u.email === user.email)) {
      setUsers((prev) => [...prev, user]);
    }
    showToast(`Signed in as ${user.email} (${user.role === 'admin' ? 'Administrator' : 'Sales Rep'})`);
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Left Menu / Sidebar Navigation */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        gpsLocality={gpsLocality}
        visitsCount={visits.length}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenAdminPinModal={() => handleOpenAdminPinModal()}
        onLockAdmin={handleLockAdmin}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Right Content Area offset by sidebar width on desktop */}
      <div className="md:pl-64 lg:pl-72 flex flex-col min-h-screen">
        {/* Top Header Bar for View Information and Mobile Hamburger */}
        <TopBar
          currentUser={currentUser}
          activeTab={activeTab}
          gpsLocality={gpsLocality}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenAdminPinModal={() => handleOpenAdminPinModal()}
          onOpenAuthModal={() => setShowAuthModal(true)}
        />

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'visits' && (
            <VisitsList
              visits={visits}
              currentUser={currentUser}
              onEditVisit={(v) => setEditingVisit(v)}
              onNewVisitClick={() => setActiveTab('checkin')}
              onOpenAdminPinModal={handleOpenAdminPinModal}
            />
          )}

          {activeTab === 'checkin' && (
            <CheckInForm
              currentUser={currentUser}
              existingVisits={visits}
              onAddVisit={handleAddVisit}
              onCancel={() => setActiveTab('visits')}
            />
          )}

          {activeTab === 'rep-analytics' && (
            <RepAnalyticsView
              visits={visits}
              users={users}
              currentUser={currentUser}
              onOpenAdminPinModal={() => handleOpenAdminPinModal()}
            />
          )}

          {activeTab === 'admin-dashboard' && (
            <AdminDashboard
              currentUser={currentUser}
              visits={visits}
              users={users}
              onOpenAdminPinModal={() => handleOpenAdminPinModal()}
            />
          )}
        </main>
      </div>

      {/* Admin Edit Modal */}
      {editingVisit && (
        <EditVisitModal
          visit={editingVisit}
          onSave={handleSaveEdit}
          onDelete={handleDeleteVisit}
          onClose={() => setEditingVisit(null)}
          adminName={currentUser.name}
        />
      )}

      {/* Gmail SSO Modal */}
      {showAuthModal && (
        <GoogleAuthModal
          currentUser={currentUser}
          onLogin={handleLoginUser}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* 6-Digit Admin PIN Modal */}
      <AdminPinModal
        isOpen={showAdminPinModal}
        onClose={() => {
          setShowAdminPinModal(false);
          setPendingVisitToEdit(null);
        }}
        onSuccess={handleAdminPinSuccess}
        title="Admin PIN Verification"
        description="Enter the 6-digit security PIN to verify administrator privileges and access restricted controls."
      />
    </div>
  );
}
