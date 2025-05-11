-- Deshabilitar ROW LEVEL SECURITY en las tablas (si es necesario)
ALTER TABLE "invitations" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "team_members" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "teams" DISABLE ROW LEVEL SECURITY;

-- Eliminar las tablas "invitations", "team_members", y "teams"
DROP TABLE IF EXISTS "invitations" CASCADE;
DROP TABLE IF EXISTS "team_members" CASCADE;
DROP TABLE IF EXISTS "teams" CASCADE;

-- Eliminar la restricción "activity_logs_team_id_teams_id_fk" solo si existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'activity_logs_team_id_teams_id_fk' AND table_name = 'activity_logs') THEN
        ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_team_id_teams_id_fk";
    END IF;
END $$;

-- Modificar la tabla "activity_logs" y agregar las columnas en "users"
ALTER TABLE "activity_logs" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" text;
ALTER TABLE "users" ADD COLUMN "stripe_subscription_id" text;
ALTER TABLE "users" ADD COLUMN "stripe_product_id" text;
ALTER TABLE "users" ADD COLUMN "plan_name" varchar(50);
ALTER TABLE "users" ADD COLUMN "subscription_status" varchar(20);

-- Eliminar la columna "team_id" de la tabla "activity_logs"
ALTER TABLE "activity_logs" DROP COLUMN "team_id";

-- Agregar restricciones únicas en las nuevas columnas de "users"
ALTER TABLE "users" ADD CONSTRAINT "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id");
ALTER TABLE "users" ADD CONSTRAINT "users_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id");
