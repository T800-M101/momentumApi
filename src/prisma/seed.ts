import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data to avoid duplicates during development
  await prisma.image.deleteMany();
  await prisma.entry.deleteMany();

  const entries = [
  {
    title: 'Morning Hike at Chipinque',
    mood: 'happy',
    date: 'Saturday, Jan 16',
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
    images: []
  },
  {
    title: 'Refactoring with Angular Signals',
    mood: 'productive',
    date: 'Monday, May 18',
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
    images: []
  },
  {
    title: 'Docker and Postgres Configuration',
    mood: 'neutral',
    date: 'Tuesday, May 19',
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
    images: []
  }
];

  for (const entry of entries) {
    const { images, ...entryData } = entry;
    await prisma.entry.create({
      data: {
        ...entryData,
        images: {
          create: images
        }
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