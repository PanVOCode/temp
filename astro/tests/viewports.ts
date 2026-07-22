export type ViewportDevice = {
  id: string;
  name: string;
  width: number;
  height: number;
  dpr: number;
  platform: "macbook" | "windows" | "tablet" | "phone";
  isMobile?: boolean;
  /** Native scroll (no fullscreen hijack) — phones and tablets */
  nativeScroll?: boolean;
  hasTouch?: boolean;
};

export const MACBOOK_VIEWPORTS: ViewportDevice[] = [
  {
    id: "mba-13",
    name: 'MacBook Air 13"',
    width: 1280,
    height: 800,
    dpr: 2,
    platform: "macbook",
  },
  {
    id: "mba-15",
    name: 'MacBook Air 15"',
    width: 1680,
    height: 1050,
    dpr: 2,
    platform: "macbook",
  },
  {
    id: "mbp-14",
    name: 'MacBook Pro 14"',
    width: 1512,
    height: 982,
    dpr: 2,
    platform: "macbook",
  },
  {
    id: "mbp-16",
    name: 'MacBook Pro 16"',
    width: 1728,
    height: 1117,
    dpr: 2,
    platform: "macbook",
  },
  {
    id: "mbp-13",
    name: 'MacBook Pro 13"',
    width: 1440,
    height: 900,
    dpr: 2,
    platform: "macbook",
  },
  {
    id: "mba-m2",
    name: "MacBook Air M2 (default)",
    width: 1470,
    height: 956,
    dpr: 2,
    platform: "macbook",
  },
];

export const WINDOWS_VIEWPORTS: ViewportDevice[] = [
  {
    id: "win-fhd",
    name: "Full HD 1920×1080",
    width: 1920,
    height: 1080,
    dpr: 1,
    platform: "windows",
  },
  {
    id: "win-1366",
    name: "Laptop 1366×768",
    width: 1366,
    height: 768,
    dpr: 1,
    platform: "windows",
  },
  {
    id: "win-1536",
    name: "Scaled 1536×864",
    width: 1536,
    height: 864,
    dpr: 1.25,
    platform: "windows",
  },
  {
    id: "win-qhd",
    name: "QHD 2560×1440",
    width: 2560,
    height: 1440,
    dpr: 1,
    platform: "windows",
  },
  {
    id: "win-hd",
    name: "HD 1280×720",
    width: 1280,
    height: 720,
    dpr: 1,
    platform: "windows",
  },
  {
    id: "win-1600",
    name: "WSXGA+ 1600×900",
    width: 1600,
    height: 900,
    dpr: 1,
    platform: "windows",
  },
];

/** Tablets: desktop page layout, but native scroll (no fullscreen hijack). */
export const TABLET_VIEWPORTS: ViewportDevice[] = [
  {
    id: "ipad-mini",
    name: "iPad Mini",
    width: 768,
    height: 1024,
    dpr: 2,
    platform: "tablet",
    hasTouch: true,
    nativeScroll: true,
  },
  {
    id: "ipad-air",
    name: "iPad Air",
    width: 820,
    height: 1180,
    dpr: 2,
    platform: "tablet",
    hasTouch: true,
    nativeScroll: true,
  },
  {
    id: "ipad-pro-11",
    name: 'iPad Pro 11"',
    width: 834,
    height: 1194,
    dpr: 2,
    platform: "tablet",
    hasTouch: true,
    nativeScroll: true,
  },
  {
    id: "ipad-pro-11-land",
    name: 'iPad Pro 11" landscape',
    width: 1194,
    height: 834,
    dpr: 2,
    platform: "tablet",
    hasTouch: true,
    nativeScroll: true,
  },
];

export const PHONE_VIEWPORTS: ViewportDevice[] = [
  {
    id: "iphone-15",
    name: "iPhone 15",
    width: 390,
    height: 844,
    dpr: 3,
    platform: "phone",
    isMobile: true,
  },
  {
    id: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    width: 430,
    height: 932,
    dpr: 3,
    platform: "phone",
    isMobile: true,
  },
  {
    id: "iphone-se",
    name: "iPhone SE",
    width: 375,
    height: 667,
    dpr: 2,
    platform: "phone",
    isMobile: true,
  },
  {
    id: "galaxy-s24",
    name: "Samsung Galaxy S24",
    width: 360,
    height: 780,
    dpr: 3,
    platform: "phone",
    isMobile: true,
  },
  {
    id: "pixel-8",
    name: "Google Pixel 8",
    width: 412,
    height: 915,
    dpr: 2.625,
    platform: "phone",
    isMobile: true,
  },
  {
    id: "galaxy-a54",
    name: "Samsung Galaxy A54",
    width: 384,
    height: 854,
    dpr: 2.625,
    platform: "phone",
    isMobile: true,
  },
];

export const ALL_VIEWPORT_GROUPS = [
  {
    label: "MacBook",
    platform: "macbook" as const,
    devices: MACBOOK_VIEWPORTS,
  },
  {
    label: "Windows",
    platform: "windows" as const,
    devices: WINDOWS_VIEWPORTS,
  },
  {
    label: "Tablet",
    platform: "tablet" as const,
    devices: TABLET_VIEWPORTS,
  },
  { label: "Phone", platform: "phone" as const, devices: PHONE_VIEWPORTS },
];

export const DESKTOP_SCENARIOS = [
  "scroll down through entire site",
  "scroll up through entire site",
  "round trip through entire site",
  "full scroll down with large wheel deltas",
  "full scroll down with trackpad inertia bursts",
  "full scroll respects boundaries at top and bottom",
] as const;

export const MOBILE_SCENARIOS = [
  "scroll down through entire site",
  "scroll up through entire site",
  "round trip through entire site",
  "full scroll keeps hijack disabled",
  "each horizontal swipe moves exactly one case",
  "full scroll boundaries at top and bottom",
] as const;

export const MAIN_SECTION_SELECTORS = [
  ".hero",
  ".services",
  ".c2",
  ".process-step",
  ".specs",
  ".pgrid",
  ".cta",
];
