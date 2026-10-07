import {
  prisma,
  PublicationStatus,
  WorkflowStatus,
  VerificationStatus,
  BreakingDevelopmentState,
  EntityStatus,
  ProgrammeStatus,
  EpisodeProductionStatus,
  OpportunityListingStatus,
  OpportunityType,
  WorkMode,
  EventLifecycleStatus,
  EventType,
  VendorListingStatus,
  CollectionStatus,
  SponsorStatus,
  CampaignStatus,
  DeliverableType,
  DeliverableStatus,
  LeadStatus,
  MediaType,
  MediaRights,
  ArticleType,
  EditorialRisk,
} from '../src/index';

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);
const daysFromNow = (d: number) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

async function upsertImage(id: string, publicUrl: string, altText: string, campusId?: string) {
  return prisma.mediaAsset.upsert({
    where: { id },
    update: { publicUrl, altText, type: MediaType.IMAGE },
    create: {
      id,
      type: MediaType.IMAGE,
      publicUrl,
      altText,
      credit: 'Campus 360 demo placeholder',
      rights: MediaRights.THIRD_PARTY,
      campusId: campusId ?? null,
      width: 1200,
      height: 800,
    },
  });
}

async function main() {
  const uganda = await prisma.country.upsert({
    where: { code: 'UG' },
    update: {},
    create: {
      name: 'Uganda',
      code: 'UG',
      slug: 'uganda',
      timezone: 'Africa/Kampala',
      status: EntityStatus.ACTIVE,
    },
  });

  const makerere = await prisma.university.upsert({
    where: { slug: 'makerere' },
    update: {},
    create: {
      name: 'Makerere University',
      slug: 'makerere',
      shortName: 'Mak',
      website: 'https://www.makerere.ac.ug',
      description: 'Uganda’s oldest and largest university.',
      status: EntityStatus.ACTIVE,
      countryId: uganda.id,
    },
  });

  const kyambogoUni = await prisma.university.upsert({
    where: { slug: 'kyambogo' },
    update: {},
    create: {
      name: 'Kyambogo University',
      slug: 'kyambogo',
      shortName: 'KYU',
      website: 'https://kyu.ac.ug',
      description: 'A major public university in Kampala.',
      status: EntityStatus.ACTIVE,
      countryId: uganda.id,
    },
  });

  const campus = await prisma.campus.upsert({
    where: { slug: 'makerere' },
    update: { isActive: true },
    create: {
      name: 'Makerere Main Campus',
      slug: 'makerere',
      locationLabel: 'Kampala',
      description: 'The heart of Makerere student life.',
      status: EntityStatus.ACTIVE,
      isActive: true,
      universityId: makerere.id,
    },
  });

  const kyuCampus = await prisma.campus.upsert({
    where: { slug: 'kyambogo' },
    update: { isActive: true },
    create: {
      name: 'Kyambogo Main Campus',
      slug: 'kyambogo',
      locationLabel: 'Kampala',
      description: 'Kyambogo student life and culture.',
      status: EntityStatus.ACTIVE,
      isActive: true,
      universityId: kyambogoUni.id,
    },
  });

  const topics = [
    ['Campus Politics', 'campus-politics'],
    ['Student Life', 'student-life'],
    ['Careers', 'careers'],
    ['Culture', 'culture'],
    ['Sports', 'sports'],
    ['Technology', 'technology'],
  ] as const;

  for (const [name, slug] of topics) {
    await prisma.topic.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }

  const politics = await prisma.topic.findUniqueOrThrow({ where: { slug: 'campus-politics' } });
  const studentLife = await prisma.topic.findUniqueOrThrow({ where: { slug: 'student-life' } });
  const careers = await prisma.topic.findUniqueOrThrow({ where: { slug: 'careers' } });
  const culture = await prisma.topic.findUniqueOrThrow({ where: { slug: 'culture' } });
  const sports = await prisma.topic.findUniqueOrThrow({ where: { slug: 'sports' } });
  const technology = await prisma.topic.findUniqueOrThrow({ where: { slug: 'technology' } });

  const host = await prisma.person.upsert({
    where: { slug: 'nalubega-anya' },
    update: {},
    create: {
      name: 'Nalubega Anya',
      slug: 'nalubega-anya',
      bio: 'Campus 360 presenter and correspondent.',
      occupation: 'Presenter',
      universityId: makerere.id,
    },
  });

  const reporter = await prisma.person.upsert({
    where: { slug: 'okello-james' },
    update: {},
    create: {
      name: 'Okello James',
      slug: 'okello-james',
      bio: 'Campus correspondent covering Makerere.',
      occupation: 'Correspondent',
      universityId: makerere.id,
    },
  });

  const reporter2 = await prisma.person.upsert({
    where: { slug: 'nakato-mercy' },
    update: {},
    create: {
      name: 'Nakato Mercy',
      slug: 'nakato-mercy',
      bio: 'Culture and student life reporter.',
      occupation: 'Reporter',
      universityId: makerere.id,
    },
  });

  const org = await prisma.organisation.upsert({
    where: { slug: 'campus-360' },
    update: {},
    create: {
      name: 'Campus 360',
      slug: 'campus-360',
      type: 'media',
      website: 'https://campus360.com',
    },
  });

  // Demo media — local public placeholders (served by apps/web)
  const mediaGrad = await upsertImage(
    'seed-media-grad',
    '/placeholders/portrait.svg',
    'Graduation procession placeholder',
    campus.id,
  );
  const mediaHostel = await upsertImage(
    'seed-media-hostel',
    '/placeholders/story.svg',
    'Hostel water taps placeholder',
    campus.id,
  );
  const mediaDerby = await upsertImage(
    'seed-media-derby',
    '/placeholders/story.svg',
    'Campus football derby placeholder',
    campus.id,
  );
  const mediaFest = await upsertImage(
    'seed-media-fest',
    '/placeholders/utility.svg',
    'Campus music festival stage placeholder',
    campus.id,
  );
  const mediaAi = await upsertImage(
    'seed-media-ai',
    '/placeholders/story.svg',
    'Students with laptops in lecture hall placeholder',
    campus.id,
  );
  const mediaLibrary = await upsertImage(
    'seed-media-library',
    '/placeholders/portrait.svg',
    'Night library reading room placeholder',
    campus.id,
  );
  const mediaFees = await upsertImage(
    'seed-media-fees',
    '/placeholders/story.svg',
    'Student fees consultation placeholder',
    campus.id,
  );
  const mediaIntern = await upsertImage(
    'seed-media-intern',
    '/placeholders/utility.svg',
    'Career fair booths placeholder',
    campus.id,
  );
  const mediaCover = await upsertImage(
    'seed-media-hotseat-cover',
    '/placeholders/watch.svg',
    '360 Hotseat programme cover',
    campus.id,
  );
  const mediaEpThumb = await upsertImage(
    'seed-media-ep1-thumb',
    '/placeholders/watch.svg',
    'Episode thumbnail placeholder',
    campus.id,
  );
  const mediaEvent = await upsertImage(
    'seed-media-orientation',
    '/placeholders/utility.svg',
    'Fresher orientation poster placeholder',
    campus.id,
  );
  const mediaVendor = await upsertImage(
    'seed-media-rolex',
    '/placeholders/utility.svg',
    'Rolex stall logo placeholder',
    campus.id,
  );

  const hotseat = await prisma.programme.upsert({
    where: { slug: '360-hotseat' },
    update: {
      status: ProgrammeStatus.ACTIVE,
      coverId: mediaCover.id,
      description:
        'Candid conversations with the people shaping campus culture — guild leaders, creatives, coaches and founders.',
    },
    create: {
      name: '360 Hotseat',
      slug: '360-hotseat',
      description:
        'Candid conversations with the people shaping campus culture — guild leaders, creatives, coaches and founders.',
      programmeType: 'TALK',
      status: ProgrammeStatus.ACTIVE,
      coverId: mediaCover.id,
      hosts: { create: [{ personId: host.id }] },
      topics: { create: [{ topicId: politics.id }] },
    },
  });

  const fieldShow = await prisma.programme.upsert({
    where: { slug: 'campus-field-notes' },
    update: {
      status: ProgrammeStatus.ACTIVE,
      coverId: mediaCover.id,
    },
    create: {
      name: 'Campus Field Notes',
      slug: 'campus-field-notes',
      description: 'Short on-the-ground reports from hostels, halls and hangouts.',
      programmeType: 'NEWS',
      status: ProgrammeStatus.ACTIVE,
      coverId: mediaCover.id,
      hosts: { create: [{ personId: reporter2.id }] },
      topics: { create: [{ topicId: studentLife.id }] },
    },
  });

  // Demo YouTube URLs (public samples used as placeholders for unlisted uploads)
  const ytHotseat = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ';
  const ytField = 'https://www.youtube.com/watch?v=LXb3EKWsInQ';
  const ytSports = 'https://www.youtube.com/watch?v=ScMzIvxBSi4';

  await prisma.episode.upsert({
    where: {
      programmeId_slug: { programmeId: hotseat.id, slug: 'guild-president-sits-down' },
    },
    update: {
      publicationStatus: PublicationStatus.PUBLISHED,
      productionStatus: EpisodeProductionStatus.PUBLISHED,
      publishedAt: hoursAgo(30),
      videoUrl: ytHotseat,
      thumbnailId: mediaEpThumb.id,
      description:
        'A candid conversation on fees, housing and student voice with the Guild President.',
    },
    create: {
      programmeId: hotseat.id,
      title: 'Guild President sits down',
      slug: 'guild-president-sits-down',
      description:
        'A candid conversation on fees, housing and student voice with the Guild President.',
      episodeNumber: 1,
      durationSec: 2460,
      videoUrl: ytHotseat,
      thumbnailId: mediaEpThumb.id,
      productionStatus: EpisodeProductionStatus.PUBLISHED,
      publicationStatus: PublicationStatus.PUBLISHED,
      publishedAt: hoursAgo(30),
      universityId: makerere.id,
      hosts: { create: [{ personId: host.id }] },
      campuses: { create: [{ campusId: campus.id }] },
      topics: { create: [{ topicId: politics.id }] },
    },
  });

  await prisma.episode.upsert({
    where: {
      programmeId_slug: { programmeId: hotseat.id, slug: 'makerere-creatives-roundtable' },
    },
    update: {
      publicationStatus: PublicationStatus.PUBLISHED,
      videoUrl: ytField,
      thumbnailId: mediaEpThumb.id,
      publishedAt: hoursAgo(8),
    },
    create: {
      programmeId: hotseat.id,
      title: 'Makerere creatives roundtable',
      slug: 'makerere-creatives-roundtable',
      description: 'Musicians, designers and student filmmakers on building scenes without gatekeepers.',
      episodeNumber: 2,
      durationSec: 1980,
      videoUrl: ytField,
      thumbnailId: mediaEpThumb.id,
      productionStatus: EpisodeProductionStatus.PUBLISHED,
      publicationStatus: PublicationStatus.PUBLISHED,
      publishedAt: hoursAgo(8),
      universityId: makerere.id,
      hosts: { create: [{ personId: host.id }] },
      campuses: { create: [{ campusId: campus.id }] },
      topics: { create: [{ topicId: culture.id }] },
    },
  });

  await prisma.episode.upsert({
    where: {
      programmeId_slug: { programmeId: fieldShow.id, slug: 'night-library-pulse' },
    },
    update: {
      publicationStatus: PublicationStatus.PUBLISHED,
      videoUrl: ytSports,
      thumbnailId: mediaEpThumb.id,
      publishedAt: hoursAgo(5),
    },
    create: {
      programmeId: fieldShow.id,
      title: 'Night library pulse',
      slug: 'night-library-pulse',
      description: 'Why exam season turns the Main Library into the busiest place on campus.',
      episodeNumber: 1,
      durationSec: 720,
      videoUrl: ytSports,
      thumbnailId: mediaEpThumb.id,
      productionStatus: EpisodeProductionStatus.PUBLISHED,
      publicationStatus: PublicationStatus.PUBLISHED,
      publishedAt: hoursAgo(5),
      universityId: makerere.id,
      hosts: { create: [{ personId: reporter2.id }] },
      campuses: { create: [{ campusId: campus.id }] },
      topics: { create: [{ topicId: studentLife.id }] },
    },
  });

  type DemoArticle = {
    slug: string;
    title: string;
    standfirst: string;
    body: string;
    articleType: ArticleType;
    topicId: string;
    heroId: string;
    authorId: string;
    campusId: string;
    universityId: string;
    hours: number;
  };

  const demoArticles: DemoArticle[] = [
    {
      slug: 'graduation-schedule-revised',
      title: 'Graduation schedule revised after venue squeeze',
      standfirst: 'Senate confirms a new timetable as Freedom Square capacity limits bite.',
      body: `Makerere University has revised the graduation schedule for the upcoming ceremony.

Officials cited venue capacity and procession logistics as the primary reasons for the change. Colleges will now graduate across staggered morning and afternoon slots.

Students are advised to check their college notices for updated reporting times and dress code reminders. Campus 360 will publish a full slot list once Senate circulates the final PDF.`,
      articleType: ArticleType.NEWS,
      topicId: politics.id,
      heroId: mediaGrad.id,
      authorId: reporter.id,
      campusId: campus.id,
      universityId: makerere.id,
      hours: 20,
    },
    {
      slug: 'hostel-water-crisis-mitchell',
      title: 'Mitchell halls face third day without running water',
      standfirst: 'Residents queue at tankers while estates promises a pump repair “within 48 hours”.',
      body: `Students in Mitchell and neighbouring halls say taps have been dry since Monday evening, forcing late-night queues at privately hired tankers.

Estates managers told Campus 360 a borehole pump failed after overloaded demand during the heat wave. Temporary bowzers are scheduled for peak evening hours.

Guild welfare officers are collecting complaints and asking residents to avoid open-flame cooking when pressure returns unpredictably.`,
      articleType: ArticleType.NEWS,
      topicId: studentLife.id,
      heroId: mediaHostel.id,
      authorId: reporter.id,
      campusId: campus.id,
      universityId: makerere.id,
      hours: 6,
    },
    {
      slug: 'mak-kyu-derby-preview',
      title: 'Mak–KYU derby: five storylines before kickoff',
      standfirst: 'Rivalry week returns with packed terraces, a new coach and a goal drought to break.',
      body: `The Makerere–Kyambogo football derby lands this weekend with both squads chasing form and bragging rights.

Coach changes on the Mak side have tightened training schedules, while KYU arrives unbeaten in their last three friendlies. Student unions on both campuses are coordinating safe transport corridors.

Campus 360 will livestream pitchside updates and publish a full match report within an hour of the final whistle.`,
      articleType: ArticleType.FEATURE,
      topicId: sports.id,
      heroId: mediaDerby.id,
      authorId: reporter2.id,
      campusId: campus.id,
      universityId: makerere.id,
      hours: 12,
    },
    {
      slug: 'gulu-beats-festival-lineup',
      title: 'Campus Beats festival posts first-wave lineup',
      standfirst: 'Afrobeats, Lugaflow and student openers headline a two-night Freedom Square run.',
      body: `Organisers of Campus Beats have released the first-wave lineup for the two-night festival, mixing national acts with Makerere openers.

Tickets go on student sale Thursday at noon. Security plans include bag checks and a clear bag policy after last year’s overcrowding near the north gate.

Vendors interested in food stalls should apply through the Campus Guide desk before Friday.`,
      articleType: ArticleType.NEWS,
      topicId: culture.id,
      heroId: mediaFest.id,
      authorId: reporter2.id,
      campusId: campus.id,
      universityId: makerere.id,
      hours: 28,
    },
    {
      slug: 'ai-tools-in-lecture-halls',
      title: 'Lecturers split as AI writing tools flood coursework',
      standfirst: 'Some departments draft new integrity rules; students say detection tools punish bilingual writers.',
      body: `A quiet scramble is underway across faculties as generative AI tools reshape how essays and lab reports get drafted.

The School of Computing is piloting disclosure forms, while humanities tutors report a spike in homogeneous phrasing. Student leaders want clearer guidance before exam season.

Campus 360 spoke to lecturers on both sides — those experimenting with AI-assisted feedback, and those calling for a temporary ban until policy catches up.`,
      articleType: ArticleType.FEATURE,
      topicId: technology.id,
      heroId: mediaAi.id,
      authorId: reporter.id,
      campusId: campus.id,
      universityId: makerere.id,
      hours: 40,
    },
    {
      slug: 'night-library-economy',
      title: 'Inside the night library economy',
      standfirst: 'Thermos flasks, shared power banks and 2 a.m. group chats — how students hack exam season.',
      body: `When the Main Library stays open late, a parallel economy appears: thermos tea, phone charging queues and whispered past-paper exchanges.

We spent three nights documenting the routines that keep finalists awake — and the quiet kindness of librarians who ignore the occasional snore.

This feature is part of Campus 360’s Student Life series.`,
      articleType: ArticleType.FEATURE,
      topicId: studentLife.id,
      heroId: mediaLibrary.id,
      authorId: reporter2.id,
      campusId: campus.id,
      universityId: makerere.id,
      hours: 50,
    },
    {
      slug: 'fees-consultation-week',
      title: 'Fees consultation week: what Guild wants on the table',
      standfirst: 'Student leaders push for payment plans and clearer communication on surcharge rules.',
      body: `Guild leadership has published a consultation agenda ahead of meetings with university management on fees and surcharges.

Priority asks include flexible instalment plans for continuing students and earlier notice when payment portals close.

A town hall is scheduled at the Mandela Group of Companies auditorium. Campus 360 will cover the session live.`,
      articleType: ArticleType.NEWS,
      topicId: politics.id,
      heroId: mediaFees.id,
      authorId: reporter.id,
      campusId: campus.id,
      universityId: makerere.id,
      hours: 15,
    },
    {
      slug: 'internship-rush-q2',
      title: 'Internship rush: how to apply without burning out',
      standfirst: 'Career services shares a checklist as applications spike for Q2 placements.',
      body: `Career Services reports a sharp rise in internship applications for the next quarter, especially in telecoms, NGOs and fintech.

Advisers recommend tailoring CVs to each role, tracking deadlines in one sheet, and avoiding mass-identical cover letters.

Campus 360’s Opportunities desk is updating active listings daily — start with verified campus-relevant roles.`,
      articleType: ArticleType.NEWS,
      topicId: careers.id,
      heroId: mediaIntern.id,
      authorId: reporter2.id,
      campusId: campus.id,
      universityId: makerere.id,
      hours: 9,
    },
    {
      slug: 'kyu-hostels-inspection-drive',
      title: 'Kyambogo launches surprise hostel safety inspections',
      standfirst: 'Fire exits and overcrowding top the checklist as private hostels face spot checks.',
      body: `Kyambogo University security and local council teams have begun spot inspections of private hostels popular with KYU students.

Focus areas include fire exits, electrical wiring and overcrowding beyond licensed capacity. Students say advance notice would help — officials argue surprise visits are the point.

Campus 360 will track which hostels receive improvement notices.`,
      articleType: ArticleType.NEWS,
      topicId: studentLife.id,
      heroId: mediaHostel.id,
      authorId: reporter.id,
      campusId: kyuCampus.id,
      universityId: kyambogoUni.id,
      hours: 18,
    },
  ];

  for (const item of demoArticles) {
    const publishedAt = hoursAgo(item.hours);
    const article = await prisma.article.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        standfirst: item.standfirst,
        body: item.body,
        articleType: item.articleType,
        publicationStatus: PublicationStatus.PUBLISHED,
        workflowStatus: WorkflowStatus.PUBLISHED,
        verificationStatus: VerificationStatus.VERIFIED,
        editorialRisk: EditorialRisk.LOW,
        heroMediaId: item.heroId,
        universityId: item.universityId,
        firstPublishedAt: publishedAt,
        lastPublishedAt: publishedAt,
      },
      create: {
        title: item.title,
        slug: item.slug,
        standfirst: item.standfirst,
        body: item.body,
        articleType: item.articleType,
        workflowStatus: WorkflowStatus.PUBLISHED,
        publicationStatus: PublicationStatus.PUBLISHED,
        verificationStatus: VerificationStatus.VERIFIED,
        editorialRisk: EditorialRisk.LOW,
        universityId: item.universityId,
        heroMediaId: item.heroId,
        firstPublishedAt: publishedAt,
        lastPublishedAt: publishedAt,
        campuses: { create: [{ campusId: item.campusId }] },
        topics: { create: [{ topicId: item.topicId }] },
        authors: { create: [{ personId: item.authorId }] },
      },
    });

    // Ensure join rows exist on re-seed (create path only adds once)
    await prisma.articleCampus.upsert({
      where: { articleId_campusId: { articleId: article.id, campusId: item.campusId } },
      update: {},
      create: { articleId: article.id, campusId: item.campusId },
    });
    await prisma.articleTopic.upsert({
      where: { articleId_topicId: { articleId: article.id, topicId: item.topicId } },
      update: {},
      create: { articleId: article.id, topicId: item.topicId },
    });
    await prisma.articleAuthor.upsert({
      where: { articleId_personId: { articleId: article.id, personId: item.authorId } },
      update: {},
      create: { articleId: article.id, personId: item.authorId },
    });
  }

  const gradArticle = await prisma.article.findUniqueOrThrow({
    where: { slug: 'graduation-schedule-revised' },
  });

  await prisma.breakingUpdate.upsert({
    where: { slug: 'guild-cabinet-announced' },
    update: {
      publicationStatus: PublicationStatus.PUBLISHED,
      developmentState: BreakingDevelopmentState.DEVELOPING,
      bannerEnabled: true,
      firstPublishedAt: hoursAgo(3),
      lastPublishedAt: hoursAgo(1),
      relatedArticleId: gradArticle.id,
    },
    create: {
      headline: 'Guild cabinet officially announced',
      slug: 'guild-cabinet-announced',
      shortUpdate:
        'The Guild President has named the cabinet. Full portfolio list is being verified.',
      developmentState: BreakingDevelopmentState.DEVELOPING,
      publicationStatus: PublicationStatus.PUBLISHED,
      verificationStatus: VerificationStatus.VERIFIED,
      priority: 'HIGH',
      bannerEnabled: true,
      sourceContext: 'Guild secretariat notice board and verified student leaders.',
      campusId: campus.id,
      universityId: makerere.id,
      topicId: politics.id,
      relatedArticleId: gradArticle.id,
      firstPublishedAt: hoursAgo(3),
      lastPublishedAt: hoursAgo(1),
      timeline: {
        create: [
          {
            body: 'Guild President announces cabinet formation is complete.',
            occurredAt: hoursAgo(3),
          },
          {
            body: 'Full portfolio list posted; Campus 360 verifying names.',
            occurredAt: hoursAgo(1),
          },
        ],
      },
    },
  });

  await prisma.breakingUpdate.upsert({
    where: { slug: 'exam-timetable-portal-glitch' },
    update: {
      publicationStatus: PublicationStatus.PUBLISHED,
      developmentState: BreakingDevelopmentState.DEVELOPING,
      bannerEnabled: false,
      firstPublishedAt: hoursAgo(10),
      lastPublishedAt: hoursAgo(4),
    },
    create: {
      headline: 'Exam timetable portal briefly showing blank slots',
      slug: 'exam-timetable-portal-glitch',
      shortUpdate:
        'Students reported missing papers on the portal. ICT says a cache refresh is rolling out.',
      developmentState: BreakingDevelopmentState.DEVELOPING,
      publicationStatus: PublicationStatus.PUBLISHED,
      verificationStatus: VerificationStatus.VERIFIED,
      priority: 'NORMAL',
      bannerEnabled: false,
      sourceContext: 'ICT helpdesk statement + student screenshots.',
      campusId: campus.id,
      universityId: makerere.id,
      topicId: studentLife.id,
      firstPublishedAt: hoursAgo(10),
      lastPublishedAt: hoursAgo(4),
      timeline: {
        create: [
          {
            body: 'Multiple colleges report blank exam slots after midnight update.',
            occurredAt: hoursAgo(10),
          },
          {
            body: 'ICT confirms cache issue; advises hard refresh and retry in 30 minutes.',
            occurredAt: hoursAgo(4),
          },
        ],
      },
    },
  });

  const opportunity = await prisma.opportunity.upsert({
    where: { slug: 'mtn-foundation-internship' },
    update: {
      publicationStatus: PublicationStatus.PUBLISHED,
      listingStatus: OpportunityListingStatus.ACTIVE,
      publishedAt: hoursAgo(24),
      deadline: daysFromNow(21),
    },
    create: {
      title: 'MTN Foundation campus internship',
      slug: 'mtn-foundation-internship',
      description:
        'A 10-week internship for Makerere students in digital marketing and community programmes.',
      eligibility: 'Continuing undergraduate students in year 2 or 3.',
      location: 'Kampala',
      workMode: WorkMode.HYBRID,
      compensation: 'Stipend provided',
      applicationUrl: 'https://example.com/apply',
      sourceLabel: 'Organisation careers page',
      opportunityType: OpportunityType.INTERNSHIP,
      listingStatus: OpportunityListingStatus.ACTIVE,
      publicationStatus: PublicationStatus.PUBLISHED,
      verificationStatus: VerificationStatus.VERIFIED,
      deadline: daysFromNow(21),
      expiresAt: daysFromNow(21),
      publishedAt: hoursAgo(24),
      organisationId: org.id,
      universityId: makerere.id,
      campuses: { create: [{ campusId: campus.id }] },
    },
  });

  await prisma.opportunity.upsert({
    where: { slug: 'stanbic-campus-ambassador' },
    update: {
      publicationStatus: PublicationStatus.PUBLISHED,
      listingStatus: OpportunityListingStatus.ACTIVE,
      deadline: daysFromNow(14),
    },
    create: {
      title: 'Stanbic campus ambassador programme',
      slug: 'stanbic-campus-ambassador',
      description:
        'Represent Stanbic on campus through financial literacy sessions and student activations.',
      eligibility: 'Any continuing undergraduate with strong communication skills.',
      location: 'Kampala campuses',
      workMode: WorkMode.HYBRID,
      compensation: 'Monthly stipend + merch',
      applicationUrl: 'https://example.com/stanbic-ambassador',
      sourceLabel: 'Bank campus desk',
      opportunityType: OpportunityType.OTHER,
      listingStatus: OpportunityListingStatus.ACTIVE,
      publicationStatus: PublicationStatus.PUBLISHED,
      verificationStatus: VerificationStatus.VERIFIED,
      deadline: daysFromNow(14),
      expiresAt: daysFromNow(14),
      publishedAt: hoursAgo(48),
      organisationId: org.id,
      universityId: makerere.id,
      campuses: { create: [{ campusId: campus.id }] },
    },
  });

  const event = await prisma.event.upsert({
    where: { slug: 'fresher-orientation-week' },
    update: {
      publicationStatus: PublicationStatus.PUBLISHED,
      lifecycleStatus: EventLifecycleStatus.UPCOMING,
      startAt: daysFromNow(3),
      publishedAt: hoursAgo(12),
      posterId: mediaEvent.id,
    },
    create: {
      name: 'Fresher Orientation Week',
      slug: 'fresher-orientation-week',
      description: 'Welcome sessions, campus tours and society bazaars for first-year students.',
      eventType: EventType.UNIVERSITY,
      lifecycleStatus: EventLifecycleStatus.UPCOMING,
      publicationStatus: PublicationStatus.PUBLISHED,
      venue: 'Freedom Square',
      startAt: daysFromNow(3),
      endAt: daysFromNow(5),
      publishedAt: hoursAgo(12),
      posterId: mediaEvent.id,
      campusId: campus.id,
      universityId: makerere.id,
      organisationId: org.id,
    },
  });

  await prisma.event.upsert({
    where: { slug: 'mak-kyu-derby-2026' },
    update: {
      publicationStatus: PublicationStatus.PUBLISHED,
      lifecycleStatus: EventLifecycleStatus.UPCOMING,
      startAt: daysFromNow(2),
      posterId: mediaDerby.id,
    },
    create: {
      name: 'Mak vs KYU Football Derby',
      slug: 'mak-kyu-derby-2026',
      description: 'The annual inter-university derby. Arrive early — terraces fill fast.',
      eventType: EventType.SPORTS,
      lifecycleStatus: EventLifecycleStatus.UPCOMING,
      publicationStatus: PublicationStatus.PUBLISHED,
      venue: 'University sports grounds',
      startAt: daysFromNow(2),
      endAt: daysFromNow(2),
      publishedAt: hoursAgo(16),
      posterId: mediaDerby.id,
      ticketUrl: 'https://example.com/derby-tickets',
      priceLabel: 'Students free with ID',
      campusId: campus.id,
      universityId: makerere.id,
      organisationId: org.id,
    },
  });

  const foodCategory = await prisma.vendorCategory.upsert({
    where: { slug: 'food' },
    update: {},
    create: { name: 'Food', slug: 'food', description: 'Meals and snacks near campus.' },
  });

  await prisma.vendorCategory.upsert({
    where: { slug: 'printing' },
    update: {},
    create: { name: 'Printing', slug: 'printing', description: 'Print, photocopy and binding.' },
  });

  const vendor = await prisma.vendor.upsert({
    where: { slug: 'rolex-garage-wandegeya' },
    update: {
      listingStatus: VendorListingStatus.ACTIVE,
      verified: true,
      logoId: mediaVendor.id,
    },
    create: {
      businessName: 'Rolex Garage Wandegeya',
      slug: 'rolex-garage-wandegeya',
      description: 'Late-night rolex and tea for students heading back from town.',
      address: 'Wandegeya market strip',
      phone: '+256700000001',
      whatsapp: '256700000001',
      priceRange: 'UGX 3,000–8,000',
      openingHours: '11:00–02:00',
      verified: true,
      featured: true,
      listingStatus: VendorListingStatus.ACTIVE,
      listingStart: new Date(),
      logoId: mediaVendor.id,
      categoryId: foodCategory.id,
      campuses: { create: [{ campusId: campus.id }] },
    },
  });

  await prisma.collection.upsert({
    where: { slug: 'topic-careers' },
    update: { status: CollectionStatus.ACTIVE },
    create: {
      title: 'Careers',
      slug: 'topic-careers',
      description: 'Jobs, internships and career-ready campus coverage.',
      status: CollectionStatus.ACTIVE,
      topicId: careers.id,
      publishedAt: new Date(),
      items: {
        create: [
          {
            entityType: 'Opportunity',
            entityId: opportunity.id,
            title: opportunity.title,
            urlPath: `/opportunities/${opportunity.slug}`,
            sortOrder: 1,
          },
          {
            entityType: 'Article',
            entityId: gradArticle.id,
            title: gradArticle.title,
            urlPath: `/news/${gradArticle.slug}`,
            sortOrder: 2,
          },
        ],
      },
    },
  });

  const mtnOrg = await prisma.organisation.upsert({
    where: { slug: 'mtn-uganda' },
    update: {},
    create: {
      name: 'MTN Uganda',
      slug: 'mtn-uganda',
      type: 'sponsor',
      website: 'https://www.mtn.co.ug',
    },
  });

  const sponsor = await prisma.sponsor.upsert({
    where: { id: 'seed-sponsor-mtn' },
    update: { status: SponsorStatus.ACTIVE },
    create: {
      id: 'seed-sponsor-mtn',
      organisationId: mtnOrg.id,
      status: SponsorStatus.ACTIVE,
      commercialContact: 'partnerships@example.test',
      notes: 'Seed sponsor — rotate contacts in production.',
      lastContactAt: new Date(),
    },
  });

  const campaign = await prisma.campaign.upsert({
    where: { slug: 'makerere-fresher-week-2026' },
    update: { status: CampaignStatus.LIVE },
    create: {
      name: 'Makerere Fresher Week 2026',
      slug: 'makerere-fresher-week-2026',
      sponsorId: sponsor.id,
      objectives: 'Reach first-years with brand presence across Guide + Events.',
      contractValue: 'UGX 12,000,000 (seed reference)',
      targetAudience: 'First-year Makerere students',
      status: CampaignStatus.LIVE,
      startAt: new Date(),
      endAt: daysFromNow(30),
      campuses: { create: [{ campusId: campus.id }] },
      deliverables: {
        create: [
          {
            title: 'Homepage sponsored feature',
            deliverableType: DeliverableType.HOMEPAGE_FEATURE,
            status: DeliverableStatus.IN_PROGRESS,
            dueAt: daysFromNow(7),
          },
          {
            title: 'Campus Guide featured listing',
            deliverableType: DeliverableType.VENDOR_FEATURE,
            status: DeliverableStatus.PLANNED,
            dueAt: daysFromNow(14),
          },
        ],
      },
    },
  });

  await prisma.commercialLead.upsert({
    where: { id: 'seed-lead-stanbic' },
    update: { status: LeadStatus.QUALIFIED },
    create: {
      id: 'seed-lead-stanbic',
      organisationName: 'Stanbic Bank Campus',
      contactName: 'Partnerships desk',
      contactEmail: 'campus@example.test',
      interest: 'Opportunities sponsorship + career fair coverage',
      budgetRange: 'UGX 8–15m',
      source: 'seed',
      status: LeadStatus.QUALIFIED,
      message: 'Interested in Q4 campus activations.',
      campuses: { create: [{ campusId: campus.id }] },
    },
  });

  console.log('Seed complete (demo-rich):', {
    campuses: [campus.slug, kyuCampus.slug],
    articles: demoArticles.length,
    programmes: [hotseat.slug, fieldShow.slug],
    opportunity: opportunity.slug,
    event: event.slug,
    vendor: vendor.slug,
    sponsor: sponsor.id,
    campaign: campaign.slug,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
