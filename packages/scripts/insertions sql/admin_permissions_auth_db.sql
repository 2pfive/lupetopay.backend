INSERT INTO admin_role_permissions (admin_role_id, admin_permission_id)
SELECT r.id, p.id
FROM admin_roles r
JOIN admin_permissions p ON p.code IN (
  'admin:read',
  'admin:create',
  'admin:update',
  'client:read',
  'client:create',
  'client:update',
  'api_key:read',
  'api_key:create',
  'security_log:read'
)
WHERE r.name = 'admin';