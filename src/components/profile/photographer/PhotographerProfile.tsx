import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfileLayout from '../ProfileLayout';
import Stats from './Stats';
import SalesHistory from './SalesHistory';
import EditProfile from './EditProfile';
import ContactDetails from './ContactDetails';
import ChangePassword from './ChangePassword';
import PayoutDetails from './PayoutDetails';
import CloseAccount from './CloseAccount';

const menuItems = [
  { label: 'Stats', path: '/photographerprofile/stats' },
  { label: 'Sales History', path: '/photographerprofile/sales' },
  { label: 'Edit Profile', path: '/photographerprofile/edit' },
  { label: 'Contact Details', path: '/photographerprofile/contact' },
  { label: 'Change Password', path: '/photographerprofile/password' },
  { label: 'Payout Details', path: '/photographerprofile/payout' },
  { label: 'Close Account', path: '/photographerprofile/close' }
];

const PhotographerProfile: React.FC = () => {
  return (
    <ProfileLayout items={menuItems}>
      <Routes>
        <Route path="stats" element={<Stats />} />
        <Route path="sales" element={<SalesHistory />} />
        <Route path="edit" element={<EditProfile />} />
        <Route path="contact" element={<ContactDetails />} />
        <Route path="password" element={<ChangePassword />} />
        <Route path="payout" element={<PayoutDetails />} />
        <Route path="close" element={<CloseAccount />} />
        <Route path="*" element={<Navigate to="stats" replace />} />
      </Routes>
    </ProfileLayout>
  );
};

export default PhotographerProfile;