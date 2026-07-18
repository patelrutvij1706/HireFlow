const { Settings, User } = require('../models');

// Get user settings
const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    let settings = await Settings.findOne({ where: { userId } });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await Settings.create({
        userId,
        emailNotifications: true,
        applicationUpdates: true,
        newApplications: true,
        profileVisibility: 'public',
        companyProfileVisibility: 'public',
        language: 'English',
        darkMode: false
      });
    }

    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
};

// Update user settings
const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      emailNotifications,
      applicationUpdates,
      newApplications,
      profileVisibility,
      companyProfileVisibility,
      language,
      darkMode
    } = req.body;

    let settings = await Settings.findOne({ where: { userId } });

    // Create settings if they don't exist
    if (!settings) {
      settings = await Settings.create({
        userId,
        emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
        applicationUpdates: applicationUpdates !== undefined ? applicationUpdates : true,
        newApplications: newApplications !== undefined ? newApplications : true,
        profileVisibility: profileVisibility || 'public',
        companyProfileVisibility: companyProfileVisibility || 'public',
        language: language || 'English',
        darkMode: darkMode !== undefined ? darkMode : false
      });
    } else {
      // Update existing settings
      const updateData = {};
      if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
      if (applicationUpdates !== undefined) updateData.applicationUpdates = applicationUpdates;
      if (newApplications !== undefined) updateData.newApplications = newApplications;
      if (profileVisibility) updateData.profileVisibility = profileVisibility;
      if (companyProfileVisibility) updateData.companyProfileVisibility = companyProfileVisibility;
      if (language) updateData.language = language;
      if (darkMode !== undefined) updateData.darkMode = darkMode;

      await settings.update(updateData);
    }

    // Reload settings to return updated data
    await settings.reload();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password (the hook will hash it automatically)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  changePassword
};






