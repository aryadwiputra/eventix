<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Event;
use App\Models\Organizer;
use App\Models\Ticket;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\TicketCode;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EventDataSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $organizerUser = User::where('email', 'organizer@tickety.test')->firstOrFail();
        $organizer = Organizer::where('user_id', $organizerUser->id)->firstOrFail();
        $categories = Category::all()->keyBy('slug');

        $events = [
            [
                'name' => 'Java Jazz Festival 2026',
                'headline' => "Indonesia's Biggest Jazz Celebration Returns",
                'description' => "Experience three days of world-class jazz performances featuring international and local artists. From smooth jazz to fusion, this festival has something for every music lover. Enjoy food stalls, merchandise booths, and an unforgettable atmosphere at the Jakarta International Expo.\n\nLineup includes grammy-winning artists, rising stars, and legendary Indonesian jazz musicians. Don't miss the late-night jam sessions!",
                'category' => 'concert',
                'type' => 'offline',
                'location' => 'Jakarta International Expo, Kemayoran',
                'start_time' => now()->addDays(14)->setTime(15, 0),
                'end_time' => now()->addDays(16)->setTime(23, 0),
                'is_popular' => true,
                'status' => 'published',
                'tickets' => [
                    ['name' => 'Daily Pass', 'price' => 350000, 'quantity' => 2000, 'description' => 'Access for one day of the festival'],
                    ['name' => '3-Day Pass', 'price' => 850000, 'quantity' => 1000, 'description' => 'Full access to all three days'],
                    ['name' => 'VIP Pass', 'price' => 2000000, 'quantity' => 200, 'description' => 'VIP area, exclusive lounge, meet & greet'],
                ],
            ],
            [
                'name' => 'Tech Conference Asia 2026',
                'headline' => 'Where Innovation Meets Opportunity',
                'description' => "Asia's premier technology conference brings together 5,000+ developers, founders, and tech leaders. Two days of keynotes, workshops, and networking sessions covering AI, cloud computing, cybersecurity, and Web3.\n\nFeatured speakers from Google, AWS, GoTo, and leading startups. Exhibition hall with 100+ tech companies showcasing their latest products.",
                'category' => 'conference',
                'type' => 'offline',
                'location' => 'Suntec Convention Centre, Singapore',
                'start_time' => now()->addDays(30)->setTime(8, 0),
                'end_time' => now()->addDays(31)->setTime(18, 0),
                'is_popular' => true,
                'status' => 'published',
                'tickets' => [
                    ['name' => 'Early Bird', 'price' => 1500000, 'quantity' => 500, 'description' => 'Full access at discounted rate'],
                    ['name' => 'Regular', 'price' => 2500000, 'quantity' => 2000, 'description' => 'Standard conference access'],
                    ['name' => 'VIP', 'price' => 5000000, 'quantity' => 100, 'description' => 'Front-row seats, speaker dinner, VIP lounge'],
                ],
            ],
            [
                'name' => 'UI/UX Design Workshop',
                'headline' => 'Master Figma, Design Systems & User Research',
                'description' => "An intensive two-day workshop for designers who want to level up their skills. Learn modern Figma workflows, build scalable design systems, and conduct effective user research.\n\nHands-on exercises, real-world case studies, and personal feedback from industry mentors. Bring your laptop and portfolio!",
                'category' => 'workshop',
                'type' => 'offline',
                'location' => 'Block71, Bandung',
                'start_time' => now()->addDays(3)->setTime(9, 0),
                'end_time' => now()->addDays(4)->setTime(17, 0),
                'is_popular' => false,
                'status' => 'published',
                'tickets' => [
                    ['name' => 'Student', 'price' => 250000, 'quantity' => 30, 'description' => 'For active students with valid ID'],
                    ['name' => 'Professional', 'price' => 500000, 'quantity' => 50, 'description' => 'Standard professional ticket'],
                ],
            ],
            [
                'name' => 'Indonesian Food Festival',
                'headline' => 'A Culinary Journey Across the Archipelago',
                'description' => "Taste the best of Indonesian cuisine in one place! From Padang rendang to Manado tinutuan, from Surabaya rawon to Bali betutu — over 80 food stalls representing all 38 provinces.\n\nCooking demonstrations by celebrity chefs, eating competitions, live music, and a traditional market bazaar. Bring your family and appetite!",
                'category' => 'festival',
                'type' => 'offline',
                'location' => 'Alun-Alun Kidul, Yogyakarta',
                'start_time' => now()->addDays(60)->setTime(10, 0),
                'end_time' => now()->addDays(62)->setTime(22, 0),
                'is_popular' => true,
                'status' => 'published',
                'tickets' => [
                    ['name' => 'General Admission', 'price' => 25000, 'quantity' => 10000, 'description' => 'Entry to festival grounds'],
                    ['name' => 'Tasting Pass', 'price' => 100000, 'quantity' => 2000, 'description' => 'Entry + 10 food tasting tokens'],
                ],
            ],
            [
                'name' => 'Startup Pitch Night',
                'headline' => '10 Startups. 5 Minutes Each. One Winner.',
                'description' => "Watch 10 early-stage startups pitch their ideas to a panel of top investors and industry experts. Network with founders, investors, and tech enthusiasts over drinks and finger food.\n\nPrevious winners have raised over $5M in combined funding. Come for the pitches, stay for the connections!",
                'category' => 'business',
                'type' => 'offline',
                'location' => 'GoWork Coworking, SCBD Jakarta',
                'start_time' => now()->addDays(7)->setTime(18, 0),
                'end_time' => now()->addDays(7)->setTime(22, 0),
                'is_popular' => false,
                'status' => 'published',
                'tickets' => [
                    ['name' => 'General', 'price' => 50000, 'quantity' => 100, 'description' => 'Watch pitches + networking access'],
                    ['name' => 'Investor Pass', 'price' => 0, 'quantity' => 30, 'description' => 'For accredited investors (free, verified)'],
                ],
            ],
            [
                'name' => 'Art Exhibition: Modern Indonesia',
                'headline' => 'Exploring Contemporary Indonesian Identity Through Art',
                'description' => "A stunning collection of contemporary Indonesian art from 25 emerging and established artists. Paintings, installations, digital art, and sculptures that explore themes of identity, urbanization, and tradition in modern Indonesia.\n\nGuided tours available. Art pieces available for purchase. Café and gift shop on premises.",
                'category' => 'exhibition',
                'type' => 'offline',
                'location' => 'Museum MACAN, Bali',
                'start_time' => now()->subDays(7)->setTime(10, 0),
                'end_time' => now()->addDays(23)->setTime(20, 0),
                'is_popular' => false,
                'status' => 'published',
                'tickets' => [
                    ['name' => 'Adult', 'price' => 75000, 'quantity' => 500, 'description' => 'General adult admission'],
                    ['name' => 'Student', 'price' => 35000, 'quantity' => 200, 'description' => 'For students with valid ID'],
                ],
            ],
            [
                'name' => 'Marathon Charity Run 2026',
                'headline' => 'Run for a Cause — Every Kilometer Counts',
                'description' => "Join thousands of runners for Surabaya's biggest charity marathon! Choose from 5K, 10K, half-marathon, or full marathon distances. All proceeds go to educational programs for underprivileged children in East Java.\n\nRace kit includes dri-fit jersey, BIB with timing chip, finisher medal, and goodie bag. Medical stations and hydration points every 2km.",
                'category' => 'sports',
                'type' => 'offline',
                'location' => 'Taman Bungkul, Surabaya',
                'start_time' => now()->addDays(21)->setTime(5, 0),
                'end_time' => now()->addDays(21)->setTime(12, 0),
                'is_popular' => true,
                'status' => 'published',
                'tickets' => [
                    ['name' => '5K Run', 'price' => 150000, 'quantity' => 2000, 'description' => '5 kilometer route'],
                    ['name' => '10K Run', 'price' => 200000, 'quantity' => 1000, 'description' => '10 kilometer route'],
                    ['name' => 'Half Marathon', 'price' => 300000, 'quantity' => 500, 'description' => '21.1 kilometer route'],
                    ['name' => 'Full Marathon', 'price' => 400000, 'quantity' => 200, 'description' => '42.2 kilometer route'],
                ],
            ],
            [
                'name' => 'Photography Masterclass',
                'headline' => 'From Auto to Pro — Master Your Camera in 3 Days',
                'description' => "An online masterclass for photography enthusiasts who want to move beyond auto mode. Learn composition, lighting, post-processing, and storytelling from award-winning photographer Budi Santoso.\n\nIncludes live critique sessions, downloadable presets, and access to a private community. Recordings available for 30 days after the event.",
                'category' => 'workshop',
                'type' => 'online',
                'location' => null,
                'meeting_link' => 'https://zoom.us/j/eventix-photo-masterclass',
                'start_time' => now()->addDays(5)->setTime(14, 0),
                'end_time' => now()->addDays(7)->setTime(17, 0),
                'is_popular' => false,
                'status' => 'published',
                'tickets' => [
                    ['name' => 'Standard', 'price' => 350000, 'quantity' => 100, 'description' => 'Live access + recordings for 30 days'],
                    ['name' => 'Premium', 'price' => 650000, 'quantity' => 30, 'description' => 'Everything in Standard + 1-on-1 portfolio review'],
                ],
            ],
            [
                'name' => 'Indie Music Night',
                'headline' => "Discover Jakarta's Best Underground Talent",
                'description' => "An intimate evening featuring five of Jakarta's most exciting indie bands and singer-songwriters. From dream pop to folk punk, experience raw talent in an acoustic-friendly venue with great sound and craft cocktails.\n\nLimited capacity for the best experience. Come early to grab the best spots and enjoy pre-show DJ sets.",
                'category' => 'concert',
                'type' => 'offline',
                'location' => 'M Bloc Space, Blok M, Jakarta',
                'start_time' => now()->addDays(10)->setTime(19, 0),
                'end_time' => now()->addDays(10)->setTime(23, 30),
                'is_popular' => false,
                'status' => 'published',
                'tickets' => [
                    ['name' => 'Early Bird', 'price' => 75000, 'quantity' => 50, 'description' => 'Limited early bird tickets'],
                    ['name' => 'Regular', 'price' => 125000, 'quantity' => 100, 'description' => 'Standard admission'],
                ],
            ],
            [
                'name' => 'Digital Marketing Summit 2026',
                'headline' => 'Strategies That Drive Results in the AI Era',
                'description' => "A full-day online summit covering the latest digital marketing strategies: SEO in the AI era, TikTok marketing, email automation, paid ads optimization, and content strategy.\n\n9 expert speakers. Live Q&A after each session. Digital certificate of completion. All sessions recorded and available for replay.",
                'category' => 'conference',
                'type' => 'online',
                'location' => null,
                'meeting_link' => 'https://zoom.us/j/eventix-marketing-summit',
                'start_time' => now()->subDays(3)->setTime(9, 0),
                'end_time' => now()->subDays(3)->setTime(17, 0),
                'is_popular' => false,
                'status' => 'published',
                'tickets' => [
                    ['name' => 'Live Access', 'price' => 150000, 'quantity' => 500, 'description' => 'Live access to all sessions'],
                    ['name' => 'Recording Only', 'price' => 75000, 'quantity' => 9999, 'description' => 'Access to session recordings only'],
                ],
            ],
        ];

        foreach ($events as $data) {
            $category = $categories[$data['category']] ?? $categories->first();

            $event = Event::create([
                'organizer_id' => $organizer->id,
                'category_id' => $category->id,
                'name' => $data['name'],
                'slug' => Str::slug($data['name']) . '-' . Str::random(6),
                'headline' => $data['headline'],
                'description' => $data['description'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'location' => $data['location'],
                'type' => $data['type'],
                'meeting_link' => $data['meeting_link'] ?? null,
                'status' => $data['status'],
                'is_popular' => $data['is_popular'] ?? false,
                'photos' => [],
            ]);

            // Download photos
            $photos = $this->downloadPhotos($event->id);
            if (!empty($photos)) {
                $event->photos = $photos;
                $event->save();
            }

            // Create tickets
            foreach ($data['tickets'] as $ticketData) {
                Ticket::create([
                    'event_id' => $event->id,
                    'name' => $ticketData['name'],
                    'description' => $ticketData['description'],
                    'price' => $ticketData['price'],
                    'quantity' => $ticketData['quantity'],
                    'sold_count' => 0,
                    'is_active' => true,
                ]);
            }

            $this->command?->info("✓ {$data['name']} (" . count($photos) . " photos)");
        }

        $this->createSampleTransactions();
        $this->command?->info('Done — events + tickets + sample transactions seeded.');
    }

    private function downloadPhotos(int $eventId): array
    {
        $photos = [];
        $disk = Storage::disk('public');
        $folder = "events/{$eventId}";

        if (!$disk->exists($folder)) {
            $disk->makeDirectory($folder);
        }

        for ($i = 1; $i <= 3; $i++) {
            $url = 'https://picsum.photos/seed/' . $eventId . $i . '/800/600';
            $filename = "photo_{$i}.jpg";
            $path = "{$folder}/{$filename}";

            try {
                $ctx = stream_context_create(['http' => ['timeout' => 15]]);
                $imageData = @file_get_contents($url, false, $ctx);
                if ($imageData && strlen($imageData) > 1000) {
                    $disk->put($path, $imageData);
                    $photos[] = $path;
                }
            } catch (\Throwable $e) {
                $this->command?->warn("  Failed photo {$i} for event {$eventId}: {$e->getMessage()}");
            }
        }

        return $photos;
    }

    private function createSampleTransactions(): void
    {
        $attendee = User::where('email', 'attendee@tickety.test')->first();
        if (!$attendee) return;

        $events = Event::where('status', 'published')->take(4)->get();

        foreach ($events as $event) {
            $tickets = $event->tickets()->where('is_active', true)->get();
            if ($tickets->isEmpty()) continue;

            $ticket = $tickets->random();
            $qty = min(2, max(1, $ticket->sold_count > 0 ? $ticket->sold_count : 1));

            $transaction = Transaction::create([
                'event_id' => $event->id,
                'buyer_user_id' => $attendee->id,
                'code' => 'TRX' . strtoupper(Str::random(6)),
                'name' => $attendee->name,
                'email' => $attendee->email,
                'status' => 'paid',
                'fee_amount' => 5000,
                'unique_amount' => rand(1, 99),
                'total_amount' => ($ticket->price * $qty) + 5000,
                'payment_deadline' => now()->addDay(),
                'paid_at' => now()->subHours(rand(1, 48)),
            ]);

            $item = TransactionItem::create([
                'transaction_id' => $transaction->id,
                'ticket_id' => $ticket->id,
                'quantity' => $qty,
                'price_at_purchase' => $ticket->price,
                'subtotal' => $ticket->price * $qty,
            ]);

            for ($i = 0; $i < $qty; $i++) {
                TicketCode::create([
                    'transaction_item_id' => $item->id,
                    'code' => 'TIX' . strtoupper(Str::random(6)),
                    'is_redeemed' => false,
                ]);
            }

            $ticket->increment('sold_count', $qty);
            $this->command?->info("  Transaction {$transaction->code} → {$event->name}");
        }
    }
}
