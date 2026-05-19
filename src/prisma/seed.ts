import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning database ---');
  await prisma.image.deleteMany();
  await prisma.entry.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.mood.deleteMany();

  console.log('--- Creating a catalog of moods ---');
  const moodsData = [
    { emoji: '😀', label: 'Happy' },
    { emoji: '😌', label: 'Calm' },
    { emoji: '😴', label: 'Tired' },
    { emoji: '😔', label: 'Sad' },
    { emoji: '🤩', label: 'Excited' },
    { emoji: '🥲', label: 'Emotional' },
    { emoji: '👨‍💻', label: 'Focused' },
    { emoji: '🧠', label: 'Analytical' },
    { emoji: '🤯', label: 'Mind-blown' },
    { emoji: '😤', label: 'Determined' },
    { emoji: '💪', label: 'Strong' },
    { emoji: '🏃‍♂️', label: 'Active' },
    { emoji: '🍃', label: 'Refreshed' },
    { emoji: '🥵', label: 'Exhausted' },
    { emoji: '🤔', label: 'Puzzled' },
    { emoji: '🫠', label: 'Overwhelmed' },
    { emoji: '😎', label: 'Confident' },
    { emoji: '🧉', label: 'Chilling' },
    { emoji: '🚀', label: 'Productive' }, 
    { emoji: '😐', label: 'Neutral' },
  ];

  for (const mood of moodsData) {
    await prisma.mood.upsert({
      where: { label: mood.label },
      update: {},
      create: mood,
    });
  }

  // We created the moods and saved them so we could reference them by name later.
  const moodMap: Record<string, number> = {};
  
  for (const m of moodsData) {
    const createdMood = await prisma.mood.upsert({
      where: { label: m.label },
      update: {},
      create: m,
    });
    moodMap[m.label.toLowerCase()] = createdMood.id;
  }

  console.log('--- Creating journal entries ---');

  const entries = [
  {
    title: 'Morning Hike at Chipinque',
    moodLabel: 'happy',
    emoji:'⛰️',
    date: new Date('2026-05-17T10:00:00Z'),
    content: `
      The weather in Monterrey today was absolutely spectacular, perfect for a morning trek.
      I decided to hit the trail early to reach the lookout point before the intense midday heat kicked in.
      The air was crisp and clear, offering a rare, unobstructed view of the entire Sierra Madre range.
      It's incredible how much a simple hike can clear your head after a long week of coding.
      I noticed the vegetation is looking particularly lush after the recent rains.
      I managed to keep a steady pace, reaching the plateau in record time for my current fitness level.
      While resting at the top, I took some time to plan out the next phase of the momentum-api project.
      There's something about the silence of the mountains that helps solve complex architectural problems.
      On the way down, I ran into a few other regulars who shared tips on some of the less-traveled paths.
      I'm definitely feeling that 'productive' soreness in my legs now; it was a morning well spent.
    `,
    images: [],
    tags: {
      connectOrCreate: [
        { where: { name: 'hiking' }, create: { name: 'hiking' } },
        { where: { name: 'monterrey' }, create: { name: 'monterrey' } },
        { where: { name: 'fitness' }, create: { name: 'fitness' } }
      ]
    }
  },
  {
    title: 'Refactoring with Angular Signals',
    moodLabel: 'productive',
    emoji: '🚀',
    date: new Date('2026-05-18T09:30:00Z'),
    content: `
      Today I finally finished migrating the traditional component inputs over to the new Angular Signals API.
      The change in performance is palpable, especially when rendering the long list of journal entries.
      By using computed signals for date formatting, I've managed to remove several unnecessary change detection cycles.
      The code feels much more declarative now, and the reactivity model is easier to reason about.
      I had to spend some time debugging the 'Object is possibly undefined' errors in the gallery templates.
      However, using the new control flow syntax (@if and @for) made the HTML much cleaner than the old structural directives.
      I also integrated a custom signal-based Theme Service to handle the dark mode toggle across the entire app.
      It's satisfying to see the Agility MACH to PACH project taking shape with modern standards.
      The next step will be implementing a global state manager using signals for the user's profile data.
      Overall, the refactor was a success and the boilerplate code has been significantly reduced.
    `,
    images: [],
    tags: {
      connectOrCreate: [
        { where: { name: 'angular' }, create: { name: 'angular' } },
        { where: { name: 'frontend' }, create: { name: 'frontend' } },
        { where: { name: 'signals' }, create: { name: 'signals' } }
      ]
    }
  },
  {
    title: 'Docker and Postgres Configuration',
    moodLabel: 'neutral',
    emoji: '😐',
    date: new Date('2026-05-19T06:43:00Z'),
    content: `
      I spent most of the afternoon wrestling with NestJS dependency injection and the PrismaService setup.
      The P1003 error was a bit of a headache, but it turned out to be a simple database naming mismatch in the .env file.
      Setting up the PostgreSQL container in Docker makes the development environment feel so much more professional.
      I've mapped the ports correctly and verified that the persistence volume is working as expected.
      I also took a break from the screen to sketch out some new blueprints for my heavy-duty floating desk.
      I'm planning to use 2-inch steel square tubing (PTR) to ensure it can support my three monitors and two laptops.
      Back at the terminal, I finally got the Prisma seed script to populate the local database successfully.
      Having real data in the local Docker instance makes testing the Angular frontend much more reliable.
      I still need to look into SSL certificate configurations for the eventual production deployment.
      It was a day full of minor hurdles, but the infrastructure for the momentum-api is now rock solid.
    `,
    images: [],
    tags: {
      connectOrCreate: [
        { where: { name: 'docker' }, create: { name: 'docker' } },
        { where: { name: 'database' }, create: { name: 'database' } },
        { where: { name: 'diy' }, create: { name: 'diy' } }
      ]
    }
    
  }
];

 for (const entry of entries) {
  const targetMoodId = moodMap[entry.moodLabel] || moodMap['neutral'];

  await prisma.entry.create({
    data: {
      title: entry.title,
      content: entry.content,
      date: entry.date,
      moodId: targetMoodId, 
      tags: entry.tags 
    }
  });
}

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });