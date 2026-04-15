import dotenv from 'dotenv';

dotenv.config();

export function getPublicSettings(req, res) {
  const appId = req.params.id;
  const requireAuth = String(process.env.REQUIRE_AUTH || 'false').toLowerCase() === 'true';

  // If auth is required but user is not authenticated, return 403 with extra_data for client handling
  if (requireAuth && !req.user?.email) {
    return res.status(403).json({
      statusCode: 403,
      error: 'Forbidden',
      message: 'Authentication required',
      extra_data: {
        reason: 'auth_required'
      }
    });
  }

  res.json({
    id: appId,
    public_settings: {
      app_name: process.env.APP_NAME || 'vrtIQ',
      require_auth: requireAuth
    }
  });
}
