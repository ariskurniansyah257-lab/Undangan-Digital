// Bentuk data ternormalisasi yang dikonsumsi renderer undangan publik.
// Bisa berasal dari database (invitations + anak tabel) atau data demo.

export interface EventItem {
  name: string;
  date: string | null; // ISO date
  startTime: string | null;
  endTime: string | null;
  locationName: string | null;
  locationAddress: string | null;
  mapUrl: string | null;
}

export interface BankItem {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface GalleryItem {
  imageUrl: string;
  caption: string | null;
}

export interface StoryItem {
  title: string;
  story: string | null;
  storyDate: string | null;
}

export interface PersonProfile {
  name: string;
  fullName?: string;
  parents?: string;
  instagram?: string;
  photo?: string | null;
}

export interface InvitationView {
  id: string | null; // null untuk demo
  slug: string;
  eventType: string;
  title: string;
  status: "draft" | "published";
  quoteText: string | null;
  quoteSource: string | null;
  photoMode: "gabung" | "pisah";
  themeName: string | null;
  themeSlug: string | null;
  songUrl: string | null;
  // konten dari config jsonb
  groom: PersonProfile;
  bride: PersonProfile;
  mainDate: string | null; // tanggal utama untuk countdown & hero
  coupleTagline: string | null;
  hashtag: string | null;
  closingMessage: string | null;
  couplePhoto: string | null;
  galleryMode: "normal" | "slide";
  videoUrl: string | null;
  events: EventItem[];
  banks: BankItem[];
  gallery: GalleryItem[];
  story: StoryItem[];
}
