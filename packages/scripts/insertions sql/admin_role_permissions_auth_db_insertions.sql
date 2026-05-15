INSERT INTO admin_role_permissions (admin_role_id, admin_permission_id)
SELECT r.id, p.id
FROM admin_roles r, admin_permissions p
WHERE r.name = 'super_admin';