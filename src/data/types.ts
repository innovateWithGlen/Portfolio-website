export type Education = {
  degree: string;
  institution: string;
};

export type PortfolioPortrait = {
  src: string;
  width: number;
  height: number;
  mode: 'original';
};

export type PortfolioUi = {
  name: string;
  role: string;
  tagline: string;
  availability: string;
  aboutBio: string;
  education: Education;
  linkedin: string;
  bookingUrl: string;
  email: string;
  portrait?: PortfolioPortrait;
};

export type ServiceIconName = 'code' | 'search' | 'tag' | 'cloud' | 'workflow' | 'commerce' | 'sparkles';

export type PortfolioService = {
  id: string;
  title: string;
  description: string;
  tech: string;
  techLabel: string;
  icon: ServiceIconName;
  status: 'available' | 'coming-soon';
};

export type PortfolioProject = {
  id: string;
  url: string;
  title: string;
  description: string;
  image: string;
  category: string;
};

export type PortfolioData = {
  ui: PortfolioUi;
  services: PortfolioService[];
  projects: PortfolioProject[];
};
