import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clear existing
  await prisma.bookingRequest.deleteMany();
  await prisma.show.deleteMany();
  await prisma.movie.deleteMany();

  // Create Movies
  await prisma.movie.create({
    data: {
      title: 'Interstellar',
      description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop', // Abstract space
      genre: 'Sci-Fi/Drama',
      durationMinutes: 169,
      showType: 'Premium',
      shows: {
        create: [
          {
            theatre: 'Screen 1 - IMAX',
            location: 'Downtown Cineplex',
            dateTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Tomorrow
            totalSeats: 150,
            seatsAvailable: 150,
            pricePerSeat: 280.0
          }
        ]
      }
    }
  });

  await prisma.movie.create({
    data: {
      title: 'The Dark Knight',
      description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      posterUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=800&auto=format&fit=crop', // Dark theme
      genre: 'Action/Crime',
      durationMinutes: 152,
      showType: 'Standard',
      shows: {
        create: [
          {
            theatre: 'Screen 3',
            location: 'Uptown Mall',
            dateTime: new Date(new Date().getTime() + 48 * 60 * 60 * 1000), 
            totalSeats: 100,
            seatsAvailable: 80,
            pricePerSeat: 200.0
          }
        ]
      }
    }
  });

  await prisma.movie.create({
    data: {
      title: 'Dune: Part Two',
      description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
      posterUrl: 'https://picsum.photos/seed/dune2/800/1200', // Reliable placeholder
      genre: 'Sci-Fi/Adventure',
      durationMinutes: 166,
      showType: 'Premium',
      shows: {
        create: [
          {
            theatre: 'Screen 2 - Dolby Atmos',
            location: 'Downtown Cineplex',
            dateTime: new Date(new Date().getTime() + 72 * 60 * 60 * 1000), 
            totalSeats: 200,
            seatsAvailable: 200,
            pricePerSeat: 280.0
          }
        ]
      }
    }
  });

  await prisma.movie.create({
    data: {
      title: 'La La Land',
      description: 'While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.',
      posterUrl: 'https://picsum.photos/seed/lalaland/800/1200', // Reliable placeholder
      genre: 'Romance/Musical',
      durationMinutes: 128,
      showType: 'Standard',
      shows: {
        create: [
          {
            theatre: 'Screen 4',
            location: 'Westside Theatre',
            dateTime: new Date(new Date().getTime() + 96 * 60 * 60 * 1000), 
            totalSeats: 80,
            seatsAvailable: 80,
            pricePerSeat: 200.0
          }
        ]
      }
    }
  });

  await prisma.movie.create({
    data: {
      title: 'Leo',
      description: 'Parthiban is a mild-mannered cafe owner in Kashmir, who fends off a gang of murderous thugs and gains attention from a drug cartel claiming he was once a part of them.',
      posterUrl: 'https://upload.wikimedia.org/wikipedia/en/7/75/Leo_%282023_Indian_film%29.jpg', 
      genre: 'Action/Thriller',
      durationMinutes: 164,
      showType: 'Premium',
      shows: {
        create: [
          {
            theatre: 'Sathyam Cinemas - Santham',
            location: 'Royapettah, Chennai',
            dateTime: new Date(new Date().getTime() + 12 * 60 * 60 * 1000), 
            totalSeats: 300,
            seatsAvailable: 120,
            pricePerSeat: 280.0
          }
        ]
      }
    }
  });

  await prisma.movie.create({
    data: {
      title: 'Vikram',
      description: 'A special investigator discovers a case of serial killings is not what it seems to be, and leading down this path is only going to end in a war between everyone involved.',
      posterUrl: 'https://upload.wikimedia.org/wikipedia/en/9/93/Vikram_2022_poster.jpg',
      genre: 'Action/Thriller',
      durationMinutes: 175,
      showType: 'Premium',
      shows: {
        create: [
          {
            theatre: 'Rohini Silver Screens - Main',
            location: 'Koyambedu, Chennai',
            dateTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 
            totalSeats: 400,
            seatsAvailable: 45,
            pricePerSeat: 280.0
          }
        ]
      }
    }
  });

  await prisma.movie.create({
    data: {
      title: 'Jailer',
      description: 'A retired jailer goes on a manhunt to find his son\'s killers. But the road leads him to a familiar, albeit a bit darker place.',
      posterUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Jailer_2023_Tamil_film_poster.jpg',
      genre: 'Action/Comedy',
      durationMinutes: 168,
      showType: 'Standard',
      shows: {
        create: [
          {
            theatre: 'Kamala Cinemas',
            location: 'Vadapalani, Chennai',
            dateTime: new Date(new Date().getTime() + 48 * 60 * 60 * 1000), 
            totalSeats: 250,
            seatsAvailable: 150,
            pricePerSeat: 200.0
          }
        ]
      }
    }
  });

  await prisma.movie.create({
    data: {
      title: 'Avatar: The Way of Water',
      description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
      posterUrl: 'https://upload.wikimedia.org/wikipedia/en/5/54/Avatar_The_Way_of_Water_poster.jpg',
      genre: 'Sci-Fi/Action',
      durationMinutes: 192,
      showType: '3D',
      shows: {
        create: [
          {
            theatre: 'Screen 1 - IMAX 3D',
            location: 'Downtown Cineplex',
            dateTime: new Date(new Date().getTime() + 10 * 60 * 60 * 1000), 
            totalSeats: 300,
            seatsAvailable: 250,
            pricePerSeat: 350.0
          }
        ]
      }
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
