-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'MANAGING_EDITOR', 'EDITOR', 'JOURNALIST', 'CAMPUS_CORRESPONDENT', 'PROGRAMME_PRODUCER', 'COMMERCIAL_MANAGER', 'VENDOR_MANAGER', 'PLATFORM_ADMIN');

-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaRights" AS ENUM ('OWNED', 'LICENSED', 'THIRD_PARTY', 'PRESS_PUBLIC', 'RESTRICTED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ArticleType" AS ENUM ('NEWS', 'FEATURE', 'OPINION', 'INTERVIEW', 'EXPLAINER', 'REVIEW', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'CHANGES_REQUESTED', 'VERIFICATION', 'READY', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('UNPUBLISHED', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'CONTESTED');

-- CreateEnum
CREATE TYPE "EditorialRisk" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "BreakingDevelopmentState" AS ENUM ('SUBMITTED', 'VERIFICATION', 'DEVELOPING', 'RESOLVED', 'CONVERTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BreakingPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ProgrammeType" AS ENUM ('NEWS', 'TALK', 'CULTURE', 'DOCS', 'OTHER');

-- CreateEnum
CREATE TYPE "ProgrammeStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EpisodeProductionStatus" AS ENUM ('PLANNED', 'PRODUCTION', 'EDITING', 'EDITORIAL_REVIEW', 'READY', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'JOURNALIST',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_checks" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "detail" TEXT,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Kampala',
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "short_name" TEXT,
    "website" TEXT,
    "description" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "country_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campuses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "location_label" TEXT,
    "description" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "university_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campus_scopes" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "campus_id" TEXT NOT NULL,

    CONSTRAINT "campus_scopes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "people" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "occupation" TEXT,
    "university_id" TEXT,
    "linked_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "website" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "storage_path" TEXT,
    "public_url" TEXT,
    "provider_id" TEXT,
    "alt_text" TEXT,
    "caption" TEXT,
    "credit" TEXT,
    "rights" "MediaRights" NOT NULL DEFAULT 'UNKNOWN',
    "width" INTEGER,
    "height" INTEGER,
    "duration_sec" INTEGER,
    "campus_id" TEXT,
    "uploaded_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "standfirst" TEXT,
    "body" TEXT NOT NULL,
    "article_type" "ArticleType" NOT NULL DEFAULT 'NEWS',
    "workflow_status" "WorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'UNPUBLISHED',
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "editorial_risk" "EditorialRisk" NOT NULL DEFAULT 'LOW',
    "hero_media_id" TEXT,
    "university_id" TEXT,
    "editor_id" UUID,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "first_published_at" TIMESTAMP(3),
    "last_published_at" TIMESTAMP(3),
    "scheduled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_authors" (
    "article_id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "user_id" UUID,

    CONSTRAINT "article_authors_pkey" PRIMARY KEY ("article_id","person_id")
);

-- CreateTable
CREATE TABLE "article_campuses" (
    "article_id" TEXT NOT NULL,
    "campus_id" TEXT NOT NULL,

    CONSTRAINT "article_campuses_pkey" PRIMARY KEY ("article_id","campus_id")
);

-- CreateTable
CREATE TABLE "article_topics" (
    "article_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,

    CONSTRAINT "article_topics_pkey" PRIMARY KEY ("article_id","topic_id")
);

-- CreateTable
CREATE TABLE "breaking_updates" (
    "id" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "short_update" TEXT NOT NULL,
    "development_state" "BreakingDevelopmentState" NOT NULL DEFAULT 'SUBMITTED',
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'UNPUBLISHED',
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "BreakingPriority" NOT NULL DEFAULT 'NORMAL',
    "banner_enabled" BOOLEAN NOT NULL DEFAULT false,
    "source_context" TEXT,
    "campus_id" TEXT,
    "university_id" TEXT,
    "topic_id" TEXT,
    "reporter_id" UUID,
    "related_article_id" TEXT,
    "first_published_at" TIMESTAMP(3),
    "last_published_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breaking_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breaking_timeline_entries" (
    "id" TEXT NOT NULL,
    "breaking_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breaking_timeline_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programmes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "programme_type" "ProgrammeType" NOT NULL DEFAULT 'TALK',
    "status" "ProgrammeStatus" NOT NULL DEFAULT 'DRAFT',
    "cover_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programmes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programme_hosts" (
    "programme_id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,

    CONSTRAINT "programme_hosts_pkey" PRIMARY KEY ("programme_id","person_id")
);

-- CreateTable
CREATE TABLE "programme_topics" (
    "programme_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,

    CONSTRAINT "programme_topics_pkey" PRIMARY KEY ("programme_id","topic_id")
);

-- CreateTable
CREATE TABLE "episodes" (
    "id" TEXT NOT NULL,
    "programme_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "episode_number" INTEGER,
    "duration_sec" INTEGER,
    "video_url" TEXT,
    "transcript" TEXT,
    "production_status" "EpisodeProductionStatus" NOT NULL DEFAULT 'PLANNED',
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'UNPUBLISHED',
    "thumbnail_id" TEXT,
    "university_id" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "episode_hosts" (
    "episode_id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,

    CONSTRAINT "episode_hosts_pkey" PRIMARY KEY ("episode_id","person_id")
);

-- CreateTable
CREATE TABLE "episode_guests" (
    "episode_id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,

    CONSTRAINT "episode_guests_pkey" PRIMARY KEY ("episode_id","person_id")
);

-- CreateTable
CREATE TABLE "episode_campuses" (
    "episode_id" TEXT NOT NULL,
    "campus_id" TEXT NOT NULL,

    CONSTRAINT "episode_campuses_pkey" PRIMARY KEY ("episode_id","campus_id")
);

-- CreateTable
CREATE TABLE "episode_topics" (
    "episode_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,

    CONSTRAINT "episode_topics_pkey" PRIMARY KEY ("episode_id","topic_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_email_key" ON "user_profiles"("email");

-- CreateIndex
CREATE INDEX "audit_events_created_at_idx" ON "audit_events"("created_at");

-- CreateIndex
CREATE INDEX "health_checks_service_checked_at_idx" ON "health_checks"("service", "checked_at");

-- CreateIndex
CREATE UNIQUE INDEX "countries_code_key" ON "countries"("code");

-- CreateIndex
CREATE UNIQUE INDEX "countries_slug_key" ON "countries"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "universities_slug_key" ON "universities"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "campuses_slug_key" ON "campuses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "campus_scopes_user_id_campus_id_key" ON "campus_scopes"("user_id", "campus_id");

-- CreateIndex
CREATE UNIQUE INDEX "people_slug_key" ON "people"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organisations_slug_key" ON "organisations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "topics_slug_key" ON "topics"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_publication_status_first_published_at_idx" ON "articles"("publication_status", "first_published_at");

-- CreateIndex
CREATE INDEX "articles_workflow_status_idx" ON "articles"("workflow_status");

-- CreateIndex
CREATE UNIQUE INDEX "breaking_updates_slug_key" ON "breaking_updates"("slug");

-- CreateIndex
CREATE INDEX "breaking_updates_publication_status_first_published_at_idx" ON "breaking_updates"("publication_status", "first_published_at");

-- CreateIndex
CREATE INDEX "breaking_updates_development_state_idx" ON "breaking_updates"("development_state");

-- CreateIndex
CREATE INDEX "breaking_timeline_entries_breaking_id_occurred_at_idx" ON "breaking_timeline_entries"("breaking_id", "occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "programmes_slug_key" ON "programmes"("slug");

-- CreateIndex
CREATE INDEX "episodes_publication_status_published_at_idx" ON "episodes"("publication_status", "published_at");

-- CreateIndex
CREATE UNIQUE INDEX "episodes_programme_id_slug_key" ON "episodes"("programme_id", "slug");

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universities" ADD CONSTRAINT "universities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campuses" ADD CONSTRAINT "campuses_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campus_scopes" ADD CONSTRAINT "campus_scopes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campus_scopes" ADD CONSTRAINT "campus_scopes_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_linked_user_id_fkey" FOREIGN KEY ("linked_user_id") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_hero_media_id_fkey" FOREIGN KEY ("hero_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_editor_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_authors" ADD CONSTRAINT "article_authors_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_authors" ADD CONSTRAINT "article_authors_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_authors" ADD CONSTRAINT "article_authors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_campuses" ADD CONSTRAINT "article_campuses_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_campuses" ADD CONSTRAINT "article_campuses_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_topics" ADD CONSTRAINT "article_topics_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_topics" ADD CONSTRAINT "article_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breaking_updates" ADD CONSTRAINT "breaking_updates_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breaking_updates" ADD CONSTRAINT "breaking_updates_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breaking_updates" ADD CONSTRAINT "breaking_updates_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breaking_updates" ADD CONSTRAINT "breaking_updates_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breaking_updates" ADD CONSTRAINT "breaking_updates_related_article_id_fkey" FOREIGN KEY ("related_article_id") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breaking_timeline_entries" ADD CONSTRAINT "breaking_timeline_entries_breaking_id_fkey" FOREIGN KEY ("breaking_id") REFERENCES "breaking_updates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programmes" ADD CONSTRAINT "programmes_cover_id_fkey" FOREIGN KEY ("cover_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_hosts" ADD CONSTRAINT "programme_hosts_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_hosts" ADD CONSTRAINT "programme_hosts_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_topics" ADD CONSTRAINT "programme_topics_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_topics" ADD CONSTRAINT "programme_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_thumbnail_id_fkey" FOREIGN KEY ("thumbnail_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episode_hosts" ADD CONSTRAINT "episode_hosts_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episode_hosts" ADD CONSTRAINT "episode_hosts_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episode_guests" ADD CONSTRAINT "episode_guests_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episode_guests" ADD CONSTRAINT "episode_guests_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episode_campuses" ADD CONSTRAINT "episode_campuses_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episode_campuses" ADD CONSTRAINT "episode_campuses_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episode_topics" ADD CONSTRAINT "episode_topics_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episode_topics" ADD CONSTRAINT "episode_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

