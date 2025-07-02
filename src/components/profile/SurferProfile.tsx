import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfileLayout from './ProfileLayout';
import MyMedia from './surfer/MyMedia';
import PurchaseHistory from './surfer/PurchaseHistory';
import PersonalDetails from './surfer/PersonalDetails';
import ContactDetails from './surfer/ContactDetails';
import ChangePassword from './surfer/ChangePassword';
import CloseAccount from './surfer/CloseAccount';

const menuItems = [
  { label: 'My Media', path: '/surfer/media' },
  { label: 'Purchase History', path: '/surfer/purchases' },
  { label: 'Personal Details', path: '/surfer/personal' },
  { label: 'Contact Details', path: '/surfer/contact' },
  { label: 'Change Password', path: '/surfer/password' },
  { label: 'Close Account', path: '/surfer/close' }
];

const SurferProfile: React.FC = () => {
  return (
    <ProfileLayout items={menuItems}>
      <Routes>
        <Route path="media" element={<MyMedia />} />
        <Route path="purchases" element={<PurchaseHistory />} />
        <Route path="personal" element={<PersonalDetails />} />
        <Route path="contact" element={<ContactDetails />} />
        <Route path="password" element={<ChangePassword />} />
        <Route path="close" element={<CloseAccount />} />
        <Route path="*" element={<Navigate to="media" replace />} />
      </Routes>
    </ProfileLayout>
  );
};

export default SurferProfile;