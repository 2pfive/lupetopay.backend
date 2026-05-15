INSERT INTO admin_roles (id, name, description, created_at)
VALUES
  (gen_random_uuid(), 'super_admin', 'Accès total à toutes les fonctionnalités', now()),
  (gen_random_uuid(), 'admin', 'Accès administratif standard', now()),
  (gen_random_uuid(), 'support', 'Accès support client', now()),
  (gen_random_uuid(), 'auditor', 'Accès en lecture seule pour audit et contrôle', now());