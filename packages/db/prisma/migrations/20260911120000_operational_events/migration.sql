-- CreateTable
CREATE TABLE "operational_events" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "surface" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "detail" TEXT,
    "request_path" TEXT,
    "actor_id" UUID,

    CONSTRAINT "operational_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "operational_events_created_at_idx" ON "operational_events"("created_at");

-- CreateIndex
CREATE INDEX "operational_events_surface_created_at_idx" ON "operational_events"("surface", "created_at");

-- AddForeignKey
ALTER TABLE "operational_events" ADD CONSTRAINT "operational_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Lock down Data API / anon access: service role / Prisma still bypasses RLS when using privileged DB roles.
ALTER TABLE "operational_events" ENABLE ROW LEVEL SECURITY;
