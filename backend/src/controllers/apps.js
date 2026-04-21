import { appConfig } from '../config/env.js';

export function getPublicSettings(req, res) {
  const appId = req.params.id;
  const requireAuth = appConfig.requireAuth;

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
      app_name: appConfig.appName,
      require_auth: requireAuth
    }
  });
}
