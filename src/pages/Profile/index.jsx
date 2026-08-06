import { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiMapPin, 
  FiCheckCircle, 
  FiSave,
  FiHome
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import useAuth from '@hooks/useAuth';
import axiosInstance from '@api/axiosInstance';
import { isValidMobile } from '@utils/validation';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, updateUserState } = useAuth();

  // Personal Info Form
  const [name, setName] = useState(user?.name || 'Gowtham');
  const [email] = useState(user?.email || 'rilir77518@adsprite.com');
  const [phone, setPhone] = useState(user?.phone && user?.phone !== 'Not provided' ? user?.phone : '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Address Form
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Coimbatore');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('641045');
  const [country, setCountry] = useState('India');
  const [savingAddress, setSavingAddress] = useState(false);

  // Load latest user profile and address from backend DB on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axiosInstance.get('/auth/me');
        const userData = res.data?.user || res.user || res;
        if (userData) {
          if (userData.name) setName(userData.name);
          if (userData.phone && userData.phone !== 'Not provided') setPhone(userData.phone);
        }
      } catch (err) {}

      try {
        const addrRes = await axiosInstance.get('/users/address');
        const addrData = addrRes.data?.address || addrRes.address;
        if (addrData) {
          if (addrData.street) setStreet(addrData.street);
          if (addrData.city) setCity(addrData.city);
          if (addrData.state) setState(addrData.state);
          if (addrData.zip) setPincode(addrData.zip);
          if (addrData.country) setCountry(addrData.country);
        }
      } catch (err) {}
    };

    fetchUserData();
  }, []);

  // Update Personal Info Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (phone && !isValidMobile(phone)) {
      toast.error('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await axiosInstance.put('/users/profile', { name: name.trim(), phone: phone.trim() });
      const updatedUser = res.data?.user || res.user || { ...user, name: name.trim(), phone: phone.trim() };
      
      if (updateUserState) updateUserState(updatedUser);
      toast.success('Personal information saved successfully in Database!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Update Password Handler
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    setSavingPassword(true);
    try {
      await axiosInstance.put('/users/change-password', { currentPassword, newPassword });
      toast.success('Password updated successfully in Database!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  // Save Delivery Address Handler
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!street.trim()) {
      toast.error('Street address is required');
      return;
    }

    setSavingAddress(true);
    try {
      await axiosInstance.put('/users/address', {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country: country.trim(),
      });
      toast.success('Delivery address saved successfully in Database!');
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const userInitial = (name || user?.name || 'Gowtham').charAt(0).toUpperCase();

  return (
    <Layout>
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          {/* Breadcrumb Navigation */}
          <div className={styles.breadcrumb}>
            <Link to="/" className={styles.breadLink}><FiHome size={13} /> Home</Link>
            <span className={styles.breadSep}>&rsaquo;</span>
            <span className={styles.breadActive}>My Profile</span>
          </div>

          {/* User Header Badge */}
          <div className={styles.userHeaderCard}>
            <div className={styles.avatarCircle}>{userInitial}</div>
            <div>
              <h1 className={styles.userName}>{name || user?.name || 'Gowtham'}</h1>
              <p className={styles.userEmail}>{email || user?.email}</p>
            </div>
          </div>

          {/* ── CARD 1: Personal Information ── */}
          <div className={styles.cardContainer}>
            <div className={styles.cardHeader}>
              <FiUser className={styles.cardHeaderIcon} />
              <h2 className={styles.cardHeaderTitle}>Personal Information</h2>
            </div>

            <form onSubmit={handleSaveProfile} className={styles.formGroup}>
              {/* Full Name */}
              <div className={styles.fieldBox}>
                <label className={styles.label}>Full Name</label>
                <div className={styles.inputWrap}>
                  <FiUser className={styles.inputIcon} />
                  <input
                    type="text"
                    className={styles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className={styles.fieldBox}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrap}>
                  <FiMail className={styles.inputIcon} />
                  <input
                    type="email"
                    className={`${styles.input} ${styles.inputDisabled}`}
                    value={email}
                    disabled
                  />
                </div>
                <span className={styles.helpText}>Email cannot be changed</span>
              </div>

              {/* Phone Number */}
              <div className={styles.fieldBox}>
                <label className={styles.label}>Phone Number</label>
                <div className={styles.inputWrap}>
                  <FiPhone className={styles.inputIcon} />
                  <input
                    type="tel"
                    maxLength={10}
                    className={styles.input}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className={styles.primaryBtn}
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* ── CARD 2: Change Password ── */}
          <div className={styles.cardContainer}>
            <div className={styles.cardHeader}>
              <FiLock className={styles.cardHeaderIcon} />
              <h2 className={styles.cardHeaderTitle}>Change Password</h2>
            </div>

            <form onSubmit={handleUpdatePassword} className={styles.formGroup}>
              {/* Current Password */}
              <div className={styles.fieldBox}>
                <label className={styles.label}>Current Password</label>
                <div className={styles.inputWrap}>
                  <FiLock className={styles.inputIcon} />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    className={styles.input}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                  >
                    {showCurrentPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className={styles.fieldBox}>
                <label className={styles.label}>New Password</label>
                <div className={styles.inputWrap}>
                  <FiLock className={styles.inputIcon} />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    className={styles.input}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowNewPass(!showNewPass)}
                  >
                    {showNewPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className={styles.fieldBox}>
                <label className={styles.label}>Confirm New Password</label>
                <div className={styles.inputWrap}>
                  <FiLock className={styles.inputIcon} />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    className={styles.input}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                  >
                    {showConfirmPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className={styles.primaryBtn}
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* ── CARD 3: Saved Delivery Address ── */}
          <div className={styles.cardContainer}>
            <div className={styles.cardHeader}>
              <FiMapPin className={styles.cardHeaderIcon} />
              <h2 className={styles.cardHeaderTitle}>Saved Delivery Address</h2>
            </div>

            <form onSubmit={handleSaveAddress} className={styles.formGroup}>
              {/* Street / Door No / Area */}
              <div className={styles.fieldBox}>
                <label className={styles.label}>Street Address &amp; Door No.</label>
                <div className={styles.inputWrap}>
                  <FiMapPin className={styles.inputIcon} />
                  <input
                    type="text"
                    className={styles.input}
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g., 104, Luxury Tower, Ramanathapuram"
                  />
                </div>
              </div>

              {/* City & State Grid */}
              <div className={styles.twoColGrid}>
                <div className={styles.fieldBox}>
                  <label className={styles.label}>City</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Coimbatore"
                  />
                </div>

                <div className={styles.fieldBox}>
                  <label className={styles.label}>State</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Tamil Nadu"
                  />
                </div>
              </div>

              {/* Pincode & Country Grid */}
              <div className={styles.twoColGrid}>
                <div className={styles.fieldBox}>
                  <label className={styles.label}>Pincode / Zip Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    className={styles.input}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="641045"
                  />
                </div>

                <div className={styles.fieldBox}>
                  <label className={styles.label}>Country</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="India"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingAddress}
                className={styles.primaryBtn}
              >
                {savingAddress ? 'Saving...' : 'Save Delivery Address'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
