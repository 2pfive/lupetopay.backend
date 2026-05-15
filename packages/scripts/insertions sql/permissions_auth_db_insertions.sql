INSERT INTO admin_permissions (id, code, description, created_at)
VALUES
  (gen_random_uuid(), 'admin:read', 'Voir les administrateurs', now()),
  (gen_random_uuid(), 'admin:create', 'Créer un administrateur', now()),
  (gen_random_uuid(), 'admin:update', 'Modifier un administrateur', now()),
  (gen_random_uuid(), 'admin:delete', 'Supprimer un administrateur', now()),

  (gen_random_uuid(), 'client:read', 'Voir les clients', now()),
  (gen_random_uuid(), 'client:create', 'Créer un client', now()),
  (gen_random_uuid(), 'client:update', 'Modifier un client', now()),
  (gen_random_uuid(), 'client:delete', 'Supprimer un client', now()),

  (gen_random_uuid(), 'api_key:read', 'Voir les clés API', now()),
  (gen_random_uuid(), 'api_key:create', 'Créer des clés API', now()),
  (gen_random_uuid(), 'api_key:revoke', 'Révoquer une clé API', now()),

  (gen_random_uuid(), 'security_log:read', 'Consulter les journaux de sécurité', now());