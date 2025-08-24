# Product Requirements Document (PRD)

**Product Name:** D&D Encounter Tracker Web App
**Version:** 3.0
**Date:** August 23, 2025

## 1. Purpose

The D&D Encounter Tracker Web App enables Dungeon Masters to manage combat
efficiently with a freemium subscription model. It supports initiative tracking,
HP/AC management, class/race tracking, legendary actions, lair actions, and
Dexterity-based tiebreakers. The platform offers multiple subscription tiers to
monetize advanced features while providing a robust free tier for new users.

## 2. Scope

- **Core Features**: Party/encounter management, initiative and combat tracking
- **Monetization**: Multi-tier subscription system with usage limits and
  premium features
- **Data Management**: Cloud sync, automated backups, and data persistence
- **User Management**: Account creation, subscription management, and billing
  integration

## 3. Subscription Tiers & Monetization Strategy

### 3.1 Subscription Tiers

#### **Free Adventurer** - $0/month

**Target Audience:** New users, casual DMs, trial users

- 1 party, 3 encounters, 10 creatures
- 6 max participants per encounter
- Local storage only
- Basic combat tracking (including lair actions)
- Community support

#### **Seasoned Adventurer** - $4.99/month ($49.99/year)

**Target Audience:** Regular DMs running ongoing campaigns

- 3 parties, 15 encounters, 50 creatures
- 10 max participants per encounter
- Cloud sync and automated backups
- Advanced combat logging
- Export features (PDF, JSON)
- Email support

#### **Expert Dungeon Master** - $9.99/month ($99.99/year)

**Target Audience:** Serious DMs with multiple campaigns

- 10 parties, 50 encounters, 200 creatures
- 20 max participants per encounter
- Custom themes and UI customization
- Collaborative mode (shared campaigns)
- Priority email support
- Beta access to new features

#### **Master of Dungeons** - $19.99/month ($199.99/year)

**Target Audience:** Power users, content creators, professional DMs

- 25 parties, 100 encounters, 500 creatures
- 30 max participants per encounter
- Advanced analytics and reporting
- White-label options
- API access for integrations
- Priority phone/chat support

#### **Guild Master** - $39.99/month ($399.99/year)

**Target Audience:** Gaming communities, D&D clubs, professional operations

- Unlimited parties, encounters, creatures
- 50 max participants per encounter
- Multi-user organization management
- Custom branding and themes
- Dedicated account manager
- Custom integrations and enterprise features

### 3.2 Feature Gating Strategy

| Feature               | Free | Seasoned | Expert | Master | Guild |
| --------------------- | ---- | -------- | ------ | ------ | ----- |
| **Content Limits**    |      |          |        |        |       |
| Parties               | 1    | 3        | 10     | 25     | ∞     |
| Encounters            | 3    | 15       | 50     | 100    | ∞     |
| Creatures             | 10   | 50       | 200    | 500    | ∞     |
| Max Participants      | 6    | 10       | 20     | 30     | 50    |
| **Data & Sync**       |      |          |        |        |       |
| Cloud Sync            | ❌   | ✅       | ✅     | ✅     | ✅    |
| Automated Backups     | ❌   | ✅       | ✅     | ✅     | ✅    |
| **Advanced Features** |      |          |        |        |       |
| Advanced Combat Log   | ❌   | ✅       | ✅     | ✅     | ✅    |
| Custom Themes         | ❌   | ❌       | ✅     | ✅     | ✅    |
| Export Features       | ❌   | ✅       | ✅     | ✅     | ✅    |
| Collaborative Mode    | ❌   | ❌       | ✅     | ✅     | ✅    |
| **Support & Access**  |      |          |        |        |       |
| Beta Access           | ❌   | ❌       | ✅     | ✅     | ✅    |
| Priority Support      | ❌   | ❌       | ✅     | ✅     | ✅    |

## 4. Core Features

### 4.1 User Management & Authentication

- **Account Creation**: Email/password registration with email verification
- **Subscription Management**: Self-service upgrade/downgrade, billing history
- **Usage Tracking**: Real-time monitoring of limits and feature usage
- **Trial System**: 14-day free trial of premium features for new users

### 4.2 Party Management

- **Character Creation**: Name, race, class(es) with multiclassing support,
  Dexterity, AC, max/current HP
- **Player Assignment**: Link characters to player names and contact info
- **Party Templates**: Save and reuse common party compositions
- **Import/Export**: Character data import from D&D Beyond, Roll20, etc.

### 4.3 Encounter Management

- **NPC/Monster Creation**: Name, AC, Dexterity, initiative modifier, HP,
  legendary actions, lair actions
- **Creature Library**: Searchable database with filtering by CR, type, source,
  special abilities
- **Template System**: Save custom creatures as templates for reuse
- **Encounter Builder**: Drag-and-drop encounter creation with CR calculation
- **Lair Configuration**: Define lair action triggers, descriptions, and
  environmental effects

### 4.4 Initiative & Combat Tracker

- **Initiative Rolling**: Automated or manual initiative input
- **Smart Sorting**: Initiative > Dexterity > manual override with
  tie-breaking
- **Turn Management**: Clear current turn indication, next/previous controls
- **Round Tracking**: Automatic round advancement with duration tracking
- **Lair Action Integration**: Automatic lair action prompts on initiative
  count 20

### 4.5 Combat Management

- **HP Tracking**: Damage/healing with undo functionality
- **Status Effects**: Comprehensive condition tracking with duration timers
- **Legendary Actions**: Counter management with action descriptions and usage
  tracking
- **Lair Actions**: Automated initiative count 20 triggers with customizable
  effects
  - Environment-based action descriptions
  - Visual indicators for lair action timing
  - Optional automation for recurring environmental effects
  - Integration with initiative tracker for seamless flow
- **Combat Log**: Detailed action history with timestamps including lair action
  usage (premium feature)

### 4.6 Data Persistence & Sync

- **Local Storage**: IndexedDB for offline functionality (free tier)
- **Cloud Sync**: Real-time data synchronization across devices (paid tiers)
- **Automated Backups**: Regular data backups with restoration options
- **Import/Export**: JSON, PDF export for data portability

## 5. User Experience Requirements

### 5.1 Onboarding

- **Welcome Flow**: Feature tour highlighting key capabilities including lair
  actions
- **Quick Start**: Guided encounter creation for new users with lair action
  examples
- **Trial Promotion**: Clear value proposition for premium features
- **Upgrade Prompts**: Contextual subscription offers when hitting limits

### 5.2 Subscription Management

- **Billing Dashboard**: Current plan, usage metrics, billing history
- **Plan Comparison**: Feature matrix with clear upgrade benefits
- **Payment Integration**: Stripe/PayPal integration with saved payment
  methods
- **Cancellation Flow**: Retention offers and feedback collection

### 5.3 Responsive Design

- **Mobile-First**: Touch-optimized interface for tablets and phones
- **Desktop Enhancement**: Keyboard shortcuts and multi-panel layout
- **Accessibility**: WCAG 2.1 AA compliance with screen reader support

### 5.4 Combat Flow Enhancement

- **Lair Action UX**: Clear visual cues for initiative count 20
- **Action Notifications**: Prominent alerts when lair actions are available
- **Quick Actions**: One-click lair action execution with customizable
  descriptions
- **Environmental Integration**: Visual themes that reflect lair-specific
  effects

## 6. Technical Requirements

### 6.1 Performance

- **Load Time**: Initial page load < 3 seconds
- **Responsiveness**: UI interactions < 100ms response time
- **Offline Capability**: Core features available without internet
- **Scalability**: Support for 10,000+ concurrent users

### 6.2 Security

- **Data Encryption**: TLS 1.3 for data in transit, AES-256 for data at rest
- **Authentication**: Clerk for user authentication, session management, and user profiles
- **Payment Security**: PCI DSS compliance through payment processor
- **Data Privacy**: GDPR compliance with data export/deletion

### 6.3 Integration

- **Payment Processors**: Stripe (primary) for comprehensive payment handling
- **Analytics**: Fly.io Analytics and third-party services for user behavior and performance insights
- **Support**: Intercom for customer support and user communication
- **Email Service**: Resend for transactional emails and notifications

## 7. Technology Stack

### 7.1 Core Framework & Runtime

- **Framework**: Next.js 15.0+ with TypeScript and App Router
- **Runtime**: Node.js 22 LTS with Edge Runtime support
- **Language**: TypeScript 5.6+ for type safety across frontend and backend
- **Package Manager**: pnpm 9.0+ for efficient dependency management

### 7.2 Frontend & UI

- **UI Library**: React 18.3+ with Server Components and Client Components
- **Styling**: Tailwind CSS 3.4+ with custom design system
- **Component Library**: shadcn/ui v2.0+ for consistent, accessible components and layout system
- **UI Primitives**: Radix UI primitives via shadcn/ui for accessibility and customization
- **Icons**: Lucide React 0.400+ for consistent iconography
- **Fonts**: Inter via next/font for optimized web fonts
- **Layout System**: shadcn/ui layout components for responsive design patterns

### 7.3 Backend & Database

- **Database**: MongoDB 8.0+ with Atlas cloud hosting
- **ODM**: Mongoose 8.5+ for schema modeling and validation
- **API Layer**: Next.js 15 App Router API routes with edge optimization
- **Validation**: Zod 3.23+ for runtime type validation and schema definition
- **Data Fetching**: Native fetch with Next.js 15 caching strategies

### 7.4 State Management & Data

- **Client State**: Zustand 4.5+ for lightweight state management
- **Server State**: TanStack Query (React Query) v5.0+ for server state caching
- **Form Handling**: React Hook Form 7.52+ with Zod validation
- **Real-time**: Pusher 8.4+ or Socket.IO 4.7+ for live collaboration features

### 7.5 Authentication & Security

- **Authentication**: Clerk 5.0+ for user authentication, session management, and user profiles
- **User Management**: Clerk Dashboard for user administration and analytics
- **Social Login**: Clerk-supported OAuth providers (Google, GitHub, Discord)
- **Session Management**: Clerk automatic session handling with secure token management
- **Authorization**: Role-based access control (RBAC) with Clerk organizations and roles
- **Security Headers**: Next.js built-in security headers + Helmet.js 7.1+
- **Rate Limiting**: Built-in Next.js rate limiting for API routes

### 7.6 Payments & Monetization

- **Payment Processor**: Stripe 16.0+ with Next.js integration
- **Webhook Handling**: Stripe webhooks via Next.js API routes
- **Subscription Management**: Stripe Customer Portal integration with Clerk user sync
- **Tax Handling**: Stripe Tax for global compliance

### 7.7 File Storage & CDN

- **File Storage**: Fly.io Volumes for persistent storage and user uploads
- **Image Optimization**: Next.js 15 Image component with automatic optimization
- **CDN**: Fly.io Edge Network for global content delivery
- **Static Assets**: Next.js static file serving with caching via Fly.io edge locations

### 7.8 Testing & Quality

- **Unit Testing**: Jest 29.7+ + React Testing Library 16.0+
- **E2E Testing**: Playwright 1.46+ for cross-browser testing
- **Component Testing**: Storybook 8.2+ for UI component development
- **Code Quality**: ESLint 9.0+ + Prettier 3.3+ with Next.js recommended configs
- **Type Checking**: TypeScript 5.6+ strict mode with Next.js integration

### 7.9 Monitoring & Analytics

- **Error Tracking**: Sentry 8.0+ for error monitoring and performance tracking
- **Analytics**: Fly.io monitoring and third-party analytics for user insights
- **Performance**: Fly.io Metrics for application performance monitoring
- **User Analytics**: Clerk Analytics for authentication and user behavior insights
- **Logging**: Next.js built-in logging with structured JSON output via Fly.io logs
- **Uptime Monitoring**: Fly.io health checks with custom alerts and monitoring

### 7.10 Development & Deployment

- **Hosting**: Fly.io with automatic deployments and multiple regions
- **Version Control**: Git with GitHub integration
- **CI/CD**: GitHub Actions with Fly.io deployment automation
- **Environment Management**: Fly.io secrets and environment variables with staging/production separation
- **Database Migrations**: Custom MongoDB migration scripts via API routes
- **Scaling**: Fly.io auto-scaling based on demand and geographic distribution

### 7.11 Developer Experience

- **Development Server**: Next.js 15 dev server with Fast Refresh and Turbopack
- **Code Editor**: VS Code with Next.js, TypeScript, and Tailwind CSS extensions
- **API Documentation**: Swagger/OpenAPI with next-swagger-doc
- **Database GUI**: MongoDB Compass for development database management
- **Debugging**: React Developer Tools + Next.js debugging tools + Fly.io logs
- **UI Development**: shadcn/ui CLI for component generation and management
- **Deployment**: Fly.io CLI for streamlined deployment and scaling management

## 8. User Dashboard & Landing Page Requirements

### 8.1 Landing Page for Non-Authenticated Users

#### 8.1.1 Hero Section

- **Primary Headline**: "Master Your D&D Combat Encounters"
- **Sub-headline**: "The comprehensive tool that makes combat tracking effortless for Dungeon Masters"
- **Call-to-Action**: Prominent "Start Free Trial" button leading to sign-up
- **Visual Element**: Animated D&D dice or combat scene illustration
- **Trust Indicators**: "Trusted by 10,000+ Dungeon Masters" with user avatars

#### 8.1.2 Value Proposition Section

**Core Benefits Showcase** (3-column layout):

1. **"Streamline Combat Flow"**
   - Icon: ⚔️ Crossed swords
   - Description: "Track initiative, HP, and status effects in real-time"
   - Example: Screenshot of active combat tracker with sample characters

2. **"Never Lose Progress"**
   - Icon: ☁️ Cloud sync
   - Description: "Cloud sync keeps your campaigns safe across all devices"
   - Example: Multi-device illustration showing sync

3. **"Scale Your Adventures"**
   - Icon: 🏰 Castle
   - Description: "From single encounters to epic campaigns with unlimited possibilities"
   - Example: Tier comparison visual

#### 8.1.3 Feature Preview Section

**Interactive Demo** (tabbed interface):

- **Tab 1: "Initiative Tracker"**
  - Live example showing:
    - 4 sample characters: "Thorin (Fighter)", "Lyra (Wizard)", "Goblin Archer", "Orc Warrior"
    - Initiative order: 18, 15, 12, 8
    - Current turn indicator on "Lyra"
    - HP bars: Thorin (45/45), Lyra (28/32), Goblin (7/7), Orc (15/15)

- **Tab 2: "Lair Actions"**
  - Example lair action on initiative 20:
    - "The ancient dragon's lair trembles. Choose one:"
    - "• Stalactites fall (DC 15 Dex save)"
    - "• Poisonous gas fills area"
    - Visual countdown timer showing "Next in 3 turns"

- **Tab 3: "Status Effects"**
  - Character with multiple conditions:
    - "Sir Galahad" with "Poisoned (3 rounds)", "Blessed (5 rounds)"
    - Automatic duration tracking
    - Color-coded status indicators

#### 8.1.4 Subscription Tiers Comparison

**Freemium Focus Table**:

| Feature | Free Adventurer | Seasoned Adventurer | Expert DM |
|---------|----------------|-------------------|-----------|
| **Parties** | 1 | 3 | 10 |
| **Encounters** | 3 | 15 | 50 |
| **Max Participants** | 6 | 10 | 20 |
| **Cloud Sync** | ❌ | ✅ | ✅ |
| **Advanced Logging** | ❌ | ✅ | ✅ |
| **Custom Themes** | ❌ | ❌ | ✅ |

**Call-to-Action**: "Start with Free Forever Plan" with secondary "View All Plans" link

#### 8.1.5 Social Proof Section

**Testimonials** (3-card carousel):

1. **"Game Changer for My Campaign"**
   - "Finally, combat flows smoothly without losing track of anything. My players love how organized our sessions are now."
   - Sarah K., DM for 5 years
   - ⭐⭐⭐⭐⭐

2. **"Perfect for New DMs"**
   - "The automated initiative and lair actions helped me run my first dragon encounter confidently."
   - Mike R., New DM
   - ⭐⭐⭐⭐⭐

3. **"Scales with My Needs"**
   - "Started free, upgraded when my campaign grew. Worth every penny for the cloud sync alone."
   - Alex T., Professional DM
   - ⭐⭐⭐⭐⭐

#### 8.1.6 Example Content for Non-Users

**Sample Data Display**:

- **Pre-loaded Demo Party**: "The Crimson Blades"
  - Kael Brightblade (Human Paladin, Level 5)
  - Whisper Shadowstep (Halfling Rogue, Level 4)
  - Eldara Moonweaver (Elf Wizard, Level 5)
  - Thorek Ironbeard (Dwarf Cleric, Level 4)

- **Sample Encounter**: "Goblin Ambush"
  - 2x Goblin Warriors (CR 1/4)
  - 1x Goblin Boss (CR 1)
  - Tactical map reference
  - Pre-rolled initiatives

- **Lair Action Example**: "Ancient Red Dragon's Lair"
  - Initiative 20 effects
  - Environmental hazards
  - Timing indicators

### 8.2 Dashboard for Authenticated Users

#### 8.2.1 Quick Stats Overview

**Dashboard Cards** (responsive grid):

1. **Active Campaigns**
   - Count: "3 Active Parties"
   - Quick access to recent sessions
   - "Continue Last Session" button

2. **Usage Metrics** (tier-based)
   - Progress bars showing limits:
     - Parties: 2/3 used (Seasoned tier)
     - Encounters: 8/15 used
     - Creatures: 23/50 used
   - Upgrade prompt when approaching limits

3. **Recent Activity**
   - Last 3 combat sessions
   - Quick resume functionality
   - Session duration and participants

#### 8.2.2 Quick Actions Panel

**Primary Actions** (large buttons):

- "Start New Combat" (prominent primary button)
- "Create Character"
- "Build Encounter"
- "Manage Parties"

**Secondary Actions** (smaller buttons):

- "Import from D&D Beyond"
- "View Combat History"
- "Export Campaign Data"

#### 8.2.3 Content Shortcuts

**Recently Used** (horizontal scroll):

- Last 5 characters with quick edit access
- Last 3 encounters with copy/modify options
- Favorite creature templates

#### 8.2.4 Onboarding for New Users

**Progressive Disclosure**:

1. **First Login**: Tutorial overlay with key feature highlights
2. **First Week**: Weekly tips banner with dismiss option
3. **Achievement System**: "First Combat Completed", "Week 1 Survivor", etc.

### 8.3 Technical Implementation Requirements

#### 8.3.1 Performance Standards

- **Landing Page Load**: < 2 seconds on 3G connection
- **Interactive Demo**: < 500ms response time
- **Dashboard Load**: < 1.5 seconds for authenticated users
- **Mobile Optimization**: 95+ Lighthouse mobile score

#### 8.3.2 SEO & Accessibility

- **Meta Tags**: Comprehensive OpenGraph and Twitter Card support
- **Schema Markup**: SoftwareApplication and Organization schemas
- **WCAG 2.1 AA**: Full compliance with screen reader testing
- **Keyboard Navigation**: Tab order and focus management

#### 8.3.3 Analytics & Conversion Tracking

- **Key Metrics**:
  - Landing page conversion rate
  - Demo interaction rate
  - Sign-up completion rate
  - Free-to-paid conversion rate
- **A/B Testing**: Ready for hero message and CTA button testing
- **User Journey**: Funnel analysis from landing to first combat session

#### 8.3.4 Content Management

- **Dynamic Testimonials**: Admin panel for testimonial management
- **Feature Flags**: Toggle for promotional banners and feature highlights
- **Pricing Updates**: Dynamic pricing table with version control

### 8.4 Security & Privacy Requirements

#### 8.4.1 Data Protection

- **Anonymous Demo**: No personal data collection for demo interactions
- **GDPR Compliance**: Clear privacy policy and cookie consent
- **Session Security**: Secure session handling for authenticated users

#### 8.4.2 Rate Limiting

- **Demo Protection**: Rate limiting on demo interactions to prevent abuse
- **API Security**: Proper authentication for all dashboard data endpoints

### 8.5 Success Metrics

#### 8.5.1 Landing Page KPIs

- **Conversion Rate**: > 3% visitor-to-signup
- **Demo Engagement**: > 60% users interact with feature preview
- **Bounce Rate**: < 40% for landing page
- **Time on Page**: > 2 minutes average

#### 8.5.2 Dashboard KPIs

- **Daily Active Users**: Track engagement with dashboard features
- **Feature Adoption**: Monitor usage of quick actions and shortcuts
- **Retention Rate**: > 70% users return within 7 days of signup

## 9. Development Roadmap

### 9.1 Phase 1: MVP (Months 1-3)

- Core encounter tracking functionality
- Free tier with basic features including lair actions
- User registration and authentication
- Local data storage

### 9.2 Phase 2: Monetization (Months 4-6)

- Subscription system implementation
- Payment processing integration
- Cloud sync and backup features
- Advanced combat logging with lair action tracking

### 9.3 Phase 3: Growth Features (Months 7-9)

- Collaborative mode and sharing
- Mobile app development
- Advanced analytics and reporting
- Third-party integrations

### 9.4 Phase 4: Enterprise (Months 10-12)

- Organization management features
- White-label options
- API development
- Advanced customization options

## 10. Risk Assessment

### 10.1 Market Risks

- **Competition**: Established tools like Roll20, D&D Beyond
- **Market Size**: Limited to D&D community, potential for expansion
- **User Acquisition**: Competing for attention in crowded TTRPG market

### 10.2 Technical Risks

- **Scaling Challenges**: Database performance with large datasets
- **Payment Processing**: Integration complexity and fraud management
- **Data Synchronization**: Conflict resolution in collaborative features
- **Combat Complexity**: Managing multiple overlapping combat mechanics

### 10.3 Business Risks

- **Pricing Strategy**: Finding optimal price points for each tier
- **Feature Creep**: Balancing free vs. paid feature allocation
- **Churn Management**: Retaining subscribers long-term

## 11. Success Criteria

### 11.1 Launch Criteria

- All MVP features fully functional and tested including lair actions
- Payment processing integration complete and tested
- User onboarding flow optimized for conversion
- Basic customer support infrastructure in place

### 11.2 6-Month Success Metrics

- 1,000+ registered users with 10%+ paid conversion rate
- $5,000+ MRR with positive unit economics
- < 5% monthly churn rate for paid subscribers
- 95%+ uptime with responsive customer support

### 11.3 12-Month Success Metrics

- 5,000+ registered users with 15%+ paid conversion rate
- $25,000+ MRR with clear path to profitability
- Feature parity with major competitors
- Established brand presence in D&D community

## 12. Future Enhancement Opportunities

### 12.1 Platform Expansion

- **Mobile Apps**: Native iOS and Android applications
- **Desktop Apps**: Electron-based desktop applications for offline use
- **Browser Extensions**: Quick access tools for popular VTT platforms

### 12.2 Content Integration

- **Official Content**: Licensed D&D monster statblocks with lair actions
  and encounters
- **Community Content**: User-generated content marketplace for custom lairs
- **Third-Party APIs**: Integration with D&D Beyond, Roll20, Foundry VTT

### 12.3 Advanced Features

- **AI-Powered Tools**: Encounter balancing suggestions, automatic statblock
  generation with lair actions
- **Campaign Management**: Session planning, note-taking, story tracking
- **Analytics Dashboard**: Play style analytics and optimization suggestions
- **Environmental Effects**: Advanced lair action automation with visual
  effects

### 12.4 Lair Action Enhancements

- **Lair Templates**: Pre-built lair configurations for popular monster types
- **Environmental Animations**: Visual effects that trigger with lair
  actions
- **Conditional Lair Actions**: Complex triggers based on HP thresholds or
  turn counts
- **Lair Evolution**: Dynamic lair actions that change throughout combat

---

## Appendix: Source Documents

This consolidated Product Requirements document was created from the
following legacy documents:

- `legacy/Product Requirements Document.md` - Complete business and technical requirements

**Last Updated:** June 30, 2025
**Document Status:** Current and comprehensive
