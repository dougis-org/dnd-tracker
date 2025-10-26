# Non-Functional Requirements: User Registration and Profile Management

**Feature**: 002-when-a-user
**Created**: 2025-10-26
**Purpose**: Define performance, security, accessibility, and other quality attributes
**Status**: Comprehensive NFR specification

---

## 1. Performance Requirements

### 1.1 Response Time Requirements

**NFR-PERF-001**: Profile form submission SHALL complete within 2 seconds (95th percentile)
- **Measurement**: Server processing time from form POST to response
- **Target**: <2s for 95% of requests, <3s for 99% of requests
- **Test Method**: Load testing with 100 concurrent users
- **Failure Impact**: Degrades user experience during registration

**NFR-PERF-002**: Profile data retrieval SHALL complete within 500ms (95th percentile)
- **Measurement**: GET /api/users/[id]/profile response time
- **Target**: <500ms for 95% of requests, <1s for 99% of requests
- **Test Method**: API endpoint benchmarking with production-like data
- **Failure Impact**: Slows settings page load times

**NFR-PERF-003**: Dashboard page load SHALL complete within 1.5 seconds (95th percentile)
- **Measurement**: Time to Interactive (TTI) from navigation to dashboard
- **Target**: <1.5s for 95% of requests, <2.5s for 99% of requests
- **Test Method**: Lighthouse performance audits, Real User Monitoring (RUM)
- **Failure Impact**: Poor first impression for returning users

**NFR-PERF-004**: Settings page load SHALL complete within 800ms (95th percentile)
- **Measurement**: Time to Interactive for /settings pages
- **Target**: <800ms for 95% of requests, <1.2s for 99% of requests
- **Test Method**: Lighthouse audits, synthetic monitoring
- **Failure Impact**: Frustration during profile editing

**NFR-PERF-005**: Profile form interactions SHALL respond within 500ms
- **Measurement**: Client-side validation, field updates, dropdown interactions
- **Target**: <500ms for all form interactions
- **Test Method**: User interaction performance metrics
- **Failure Impact**: Form feels sluggish and unresponsive

**NFR-PERF-006**: Data validation SHALL complete within 100ms for all profile fields
- **Measurement**: Zod schema validation execution time
- **Target**: <100ms for complete profile validation
- **Test Method**: Unit test benchmarks with max-length inputs
- **Failure Impact**: Form validation delays user feedback

**NFR-PERF-007**: Clerk webhook processing SHALL complete within 5 seconds
- **Measurement**: Webhook handler execution time from receipt to database commit
- **Target**: <5s for 95% of webhooks, <10s for 99%
- **Test Method**: Webhook simulation with database latency
- **Failure Impact**: Clerk retries may cause duplicate processing

### 1.2 Concurrency Requirements

**NFR-PERF-008**: System SHALL support 10 concurrent profile updates per user without race conditions
- **Measurement**: Multiple simultaneous profile edit requests from different sessions
- **Target**: Last-write-wins or optimistic locking prevents data loss
- **Test Method**: Concurrent API request simulation
- **Failure Impact**: Profile data corruption or loss

**NFR-PERF-009**: System SHALL handle 100 concurrent user registrations (Clerk webhooks)
- **Measurement**: Parallel webhook processing without database deadlocks
- **Target**: 100 webhooks/second sustained throughput
- **Test Method**: Load testing webhook endpoint with concurrent requests
- **Failure Impact**: Webhook backlog causes registration delays

### 1.3 Scalability Targets

**NFR-PERF-010**: Profile database queries SHALL scale linearly to 100,000 users
- **Measurement**: Query response time with varying user counts
- **Target**: <100ms query time at 100K users with proper indexing
- **Test Method**: Database performance testing with production-size dataset
- **Failure Impact**: Performance degradation as user base grows

---

## 2. Security Requirements

### 2.1 Authentication & Authorization

**NFR-SEC-001**: All profile API endpoints SHALL require valid Clerk authentication token
- **Enforcement**: Middleware checks `Authorization` header before handler execution
- **Failure Behavior**: Return 401 Unauthorized with error message
- **Test Method**: API requests without auth tokens, expired tokens, invalid tokens
- **Compliance**: OWASP API Security Top 10 (API1:2023 Broken Object Level Authorization)

**NFR-SEC-002**: Users SHALL NOT access other users' profile data (authorization enforcement)
- **Enforcement**: Verify `userId` in request matches authenticated user ID
- **Failure Behavior**: Return 403 Forbidden with generic error (no data leakage)
- **Test Method**: Cross-user profile access attempts in E2E tests
- **Compliance**: OWASP API Security Top 10 (API1:2023 BOLA)

**NFR-SEC-003**: Admin role assignment SHALL only be possible via manual database updates
- **Enforcement**: API endpoints SHALL NOT accept `role` field in request bodies
- **Failure Behavior**: Ignore role field in updates, log attempt if present
- **Test Method**: Attempt to set role via profile API, verify rejection
- **Compliance**: Principle of Least Privilege

**NFR-SEC-004**: Protected pages SHALL redirect unauthenticated users to Clerk sign-in
- **Enforcement**: Next.js middleware checks auth state before rendering /dashboard, /settings
- **Failure Behavior**: 302 redirect to Clerk login with `returnUrl` parameter
- **Test Method**: Direct URL access without authentication
- **Compliance**: Secure by default architecture

**NFR-SEC-005**: Authentication sessions SHALL require re-authentication after 7 days of inactivity
- **Enforcement**: Clerk session management with 7-day idle timeout
- **Failure Behavior**: Redirect to login when session expires
- **Test Method**: Simulate inactivity period, verify session expiration
- **Compliance**: OWASP Session Management

### 2.2 Input Validation & Sanitization

**NFR-SEC-006**: All profile inputs SHALL be validated against Zod schemas before database persistence
- **Enforcement**: Server-side validation in API routes using Zod
- **Failure Behavior**: Return 400 Bad Request with field-level validation errors
- **Test Method**: Submit malformed inputs, SQL injection attempts, XSS payloads
- **Compliance**: OWASP Top 10 (A03:2021 Injection)

**NFR-SEC-007**: User-provided text fields SHALL be sanitized to prevent XSS attacks
- **Enforcement**: React auto-escaping + DOMPurify for rich text (if added later)
- **Failure Behavior**: Malicious scripts rendered as text, not executed
- **Test Method**: Submit `<script>` tags in displayName, verify rendering
- **Compliance**: OWASP Top 10 (A03:2021 Injection - XSS)

**NFR-SEC-008**: File uploads (profile images) SHALL validate file type, size, and scan for malware
- **Enforcement**: Clerk handles profile image uploads; our app doesn't accept file uploads in Phase 1
- **Future Consideration**: If custom uploads added, use file type whitelisting, 5MB limit, virus scanning
- **Compliance**: OWASP Top 10 (A04:2021 Insecure Design)

### 2.3 Data Privacy & Protection

**NFR-SEC-009**: Personally Identifiable Information (PII) SHALL NOT be logged in application logs
- **Enforcement**: Log userId, not email/name; redact sensitive fields in error logs
- **Failure Behavior**: N/A (preventative control)
- **Test Method**: Review log outputs for PII leakage
- **Compliance**: GDPR Article 5 (Data Minimization), CCPA

**NFR-SEC-010**: Password/credential fields SHALL NEVER be stored in MongoDB (Clerk handles auth)
- **Enforcement**: No password fields in User schema; Clerk manages credentials
- **Failure Behavior**: N/A (architecture decision)
- **Test Method**: Schema review confirms no password storage
- **Compliance**: OWASP Password Storage Cheat Sheet

**NFR-SEC-011**: Sensitive fields SHALL be excluded from API responses using schema sanitization
- **Enforcement**: Use `publicUserSchema` in API responses (excludes passwordHash, tokens)
- **Failure Behavior**: N/A (preventative)
- **Test Method**: Verify API responses don't include internal fields
- **Compliance**: OWASP API Security (API3:2023 Excessive Data Exposure)

**NFR-SEC-012**: User deletion SHALL retain audit logs but remove PII within 30 days
- **Enforcement**: Soft delete sets `deletedAt` timestamp, anonymize PII after 30 days
- **Failure Behavior**: N/A (compliance requirement)
- **Test Method**: Delete user, verify PII anonymization after retention period
- **Compliance**: GDPR Right to Erasure (Article 17), CCPA

### 2.4 Audit Logging

**NFR-SEC-013**: Admin actions on user profiles SHALL be logged with timestamp, admin ID, and changes
- **Enforcement**: Audit log entry created for any admin-initiated profile update
- **Log Fields**: `timestamp`, `adminUserId`, `targetUserId`, `action`, `changes`
- **Test Method**: Admin updates user, verify audit log entry
- **Compliance**: SOC 2 (CC6.2 Logical Access Controls)

**NFR-SEC-014**: Failed authentication attempts SHALL be logged for security monitoring
- **Enforcement**: Clerk provides authentication logs; review Clerk dashboard for anomalies
- **Test Method**: Intentional login failures, verify Clerk logging
- **Compliance**: NIST 800-53 AU-2 (Audit Events)

### 2.5 Clerk Webhook Security

**NFR-SEC-015**: Clerk webhooks SHALL verify Svix signatures to prevent spoofing
- **Enforcement**: Svix library validates `svix-signature` header using webhook secret
- **Failure Behavior**: Return 400 Bad Request for invalid signatures, don't process event
- **Test Method**: Send webhook with invalid signature, verify rejection
- **Compliance**: OWASP API Security (API2:2023 Broken Authentication)

**NFR-SEC-016**: Webhook secrets SHALL be stored in environment variables, never in code
- **Enforcement**: `CLERK_WEBHOOK_SECRET` from `.env.local`, not hardcoded
- **Failure Behavior**: N/A (preventative)
- **Test Method**: Code review confirms no hardcoded secrets
- **Compliance**: OWASP Top 10 (A02:2021 Cryptographic Failures)

---

## 3. Accessibility Requirements

### 3.1 WCAG 2.1 Level AA Compliance

**NFR-ACCESS-001**: Profile forms SHALL be operable via keyboard navigation (WCAG 2.1.1)
- **Enforcement**: All form fields, buttons, tabs accessible via Tab, Enter, Arrow keys
- **Test Method**: Axe DevTools automated scan, manual keyboard-only testing
- **Success Criteria**: No keyboard traps, logical tab order, visible focus indicators
- **Compliance**: WCAG 2.1 Level AA (2.1.1 Keyboard, 2.4.7 Focus Visible)

**NFR-ACCESS-002**: Form fields SHALL have associated labels for screen readers (WCAG 1.3.1)
- **Enforcement**: Every `<input>` has matching `<label>` or `aria-label`
- **Test Method**: Axe scan, NVDA/JAWS screen reader testing
- **Success Criteria**: Screen readers announce field names and validation errors
- **Compliance**: WCAG 2.1 Level A (1.3.1 Info and Relationships)

**NFR-ACCESS-003**: Validation errors SHALL be announced to screen readers (WCAG 3.3.1)
- **Enforcement**: Use `aria-live="polite"` for error messages, `aria-describedby` for field errors
- **Test Method**: Submit invalid form, verify screen reader announcements
- **Success Criteria**: Errors announced without page refresh, field-level error association
- **Compliance**: WCAG 2.1 Level A (3.3.1 Error Identification)

**NFR-ACCESS-004**: Color SHALL NOT be the only visual means of conveying information (WCAG 1.4.1)
- **Enforcement**: Error states use icon + color, success uses checkmark + color
- **Test Method**: Grayscale testing, color blindness simulation
- **Success Criteria**: Information perceivable in grayscale
- **Compliance**: WCAG 2.1 Level A (1.4.1 Use of Color)

**NFR-ACCESS-005**: Text contrast SHALL meet 4.5:1 ratio for normal text (WCAG 1.4.3)
- **Enforcement**: Tailwind CSS color palette meets contrast requirements
- **Test Method**: Axe automated contrast checking
- **Success Criteria**: All text passes WCAG AA contrast ratios
- **Compliance**: WCAG 2.1 Level AA (1.4.3 Contrast Minimum)

**NFR-ACCESS-006**: Dashboard progress bars SHALL include text alternatives (WCAG 1.1.1)
- **Enforcement**: Progress bars have `aria-label` with percentage and context
- **Test Method**: Screen reader announces "Parties: 1 of 1, 100% used"
- **Success Criteria**: Visual information available to assistive tech
- **Compliance**: WCAG 2.1 Level A (1.1.1 Non-text Content)

### 3.2 Settings Tab Accessibility

**NFR-ACCESS-007**: Settings tabs SHALL use proper ARIA roles and states (WCAG 4.1.2)
- **Enforcement**: Tab list uses `role="tablist"`, tabs use `role="tab"`, panels use `role="tabpanel"`
- **ARIA States**: `aria-selected`, `aria-controls`, `aria-labelledby`
- **Test Method**: Axe scan, manual ARIA attribute verification
- **Success Criteria**: Tab interface operates correctly with screen readers
- **Compliance**: WCAG 2.1 Level A (4.1.2 Name, Role, Value)

**NFR-ACCESS-008**: Settings tabs SHALL support arrow key navigation (WCAG 2.1.1)
- **Enforcement**: Left/Right arrows move between tabs, Home/End jump to first/last
- **Test Method**: Keyboard-only navigation testing
- **Success Criteria**: All tabs accessible without mouse
- **Compliance**: WCAG 2.1 Level A (2.1.1 Keyboard), ARIA Authoring Practices Guide

---

## 4. Browser Compatibility Requirements

**NFR-COMPAT-001**: Application SHALL function correctly in Chrome 120+, Firefox 120+, Safari 17+, Edge 120+
- **Test Method**: Cross-browser testing with BrowserStack or manual testing
- **Success Criteria**: All features work identically across browsers
- **Failure Impact**: User unable to complete profile on their preferred browser

**NFR-COMPAT-002**: Application SHALL function correctly on mobile browsers (iOS Safari, Chrome Android)
- **Test Method**: Responsive design testing, mobile device testing
- **Success Criteria**: Forms usable on 375px+ viewport widths
- **Failure Impact**: Mobile users cannot complete registration

**NFR-COMPAT-003**: Profile forms SHALL support autofill/autocomplete browser features
- **Enforcement**: Use standard HTML `autocomplete` attributes (`name`, `email`, etc.)
- **Test Method**: Browser autofill testing
- **Success Criteria**: Browsers offer to save/autofill profile data
- **Compliance**: WCAG 2.1 Level AA (1.3.5 Identify Input Purpose)

**NFR-COMPAT-004**: Application SHALL degrade gracefully if JavaScript is disabled
- **Enforcement**: Next.js server components provide basic content without JS
- **Limitation**: Forms require JavaScript; show message if disabled
- **Test Method**: Disable JavaScript, verify readable content
- **Failure Impact**: Non-JS users see error message, cannot submit forms

---

## 5. Reliability Requirements

**NFR-REL-001**: Profile data updates SHALL be atomic to prevent partial writes
- **Enforcement**: MongoDB transactions or single-document updates only
- **Test Method**: Kill process mid-update, verify no partial data
- **Success Criteria**: Update fully commits or fully rolls back
- **Failure Impact**: Corrupted user profiles

**NFR-REL-002**: Clerk webhook failures SHALL retry with exponential backoff (Clerk-managed)
- **Enforcement**: Return 500 for transient errors (DB down), 200 for permanent errors (duplicate event)
- **Test Method**: Simulate database unavailability during webhook processing
- **Success Criteria**: Clerk retries webhook after transient failures
- **Failure Impact**: User registration not persisted to MongoDB

**NFR-REL-003**: Database connection failures SHALL return 503 Service Unavailable with retry-after header
- **Enforcement**: API endpoints catch DB connection errors, return 503
- **Test Method**: Disconnect MongoDB during request
- **Success Criteria**: Graceful error response, client can retry
- **Failure Impact**: Unhandled errors crash server

**NFR-REL-004**: User data SHALL be backed up daily with 30-day retention
- **Enforcement**: MongoDB automated backups (managed by hosting provider)
- **Test Method**: Verify backup schedule in database configuration
- **Success Criteria**: Point-in-time recovery available for last 30 days
- **Failure Impact**: Data loss from accidental deletion or corruption

---

## 6. Data Retention & Compliance

**NFR-COMP-001**: User profile data SHALL be retained for account lifetime + 30 days after deletion
- **Purpose**: Allow grace period for account recovery
- **Enforcement**: Soft delete with `deletedAt` timestamp, purge after 30 days
- **Test Method**: Delete user, verify data present for 30 days, then purged
- **Compliance**: GDPR Article 17 (Right to Erasure)

**NFR-COMP-002**: Audit logs SHALL be retained for 7 years (admin actions)
- **Purpose**: Compliance with financial and legal regulations
- **Enforcement**: Separate audit log collection with 7-year retention policy
- **Test Method**: Verify audit log configuration
- **Compliance**: SOC 2, GDPR Article 30 (Records of Processing Activities)

**NFR-COMP-003**: User consent for data processing SHALL be recorded with timestamp
- **Purpose**: GDPR Article 7 (Conditions for Consent)
- **Enforcement**: Store `termsAcceptedAt`, `privacyPolicyAcceptedAt` timestamps
- **Test Method**: Verify consent timestamps in user documents
- **Compliance**: GDPR Article 7

---

## 7. Internationalization (Future Consideration)

**NFR-I18N-001**: Application SHALL support future localization without code changes
- **Preparation**: Use i18n library (next-intl), externalize all user-facing strings
- **Phase 1 Scope**: English only, but structure supports multi-language
- **Test Method**: Code review confirms no hardcoded user-facing strings
- **Future**: Spanish, French, German support

**NFR-I18N-002**: Timezone handling SHALL use IANA timezone identifiers (e.g., "America/New_York")
- **Enforcement**: Zod schema validates against IANA timezone list
- **Test Method**: Submit invalid timezone, verify rejection
- **Success Criteria**: User sees times in their local timezone

---

## 8. Monitoring & Observability

**NFR-OBS-001**: API response times SHALL be instrumented with percentile metrics (p50, p95, p99)
- **Enforcement**: Logging middleware tracks request duration
- **Metrics Exported**: Response time histogram by endpoint
- **Test Method**: Verify metrics in monitoring dashboard (Grafana, Datadog, etc.)
- **Purpose**: Detect performance degradation early

**NFR-OBS-002**: Error rates SHALL trigger alerts when exceeding 5% of requests
- **Enforcement**: Error tracking service (Sentry, LogRocket) with alert rules
- **Test Method**: Simulate errors, verify alert delivery
- **Purpose**: Rapid incident detection

**NFR-OBS-003**: User registration success rate SHALL be tracked as a business metric
- **Metric**: (Successful registrations / Total auth completions) × 100%
- **Target**: >95% success rate
- **Purpose**: Detect registration funnel issues

---

## 9. Test Environment Requirements

**NFR-TEST-001**: Integration tests SHALL use in-memory MongoDB instance for isolation
- **Enforcement**: mongodb-memory-server for test database
- **Test Method**: Verify tests don't connect to production/staging databases
- **Purpose**: Fast, isolated, repeatable tests

**NFR-TEST-002**: E2E tests SHALL use Clerk test mode with fixed test users
- **Enforcement**: `CLERK_TEST_MODE=true` in test environment
- **Test Method**: E2E tests create/delete test users via Clerk API
- **Purpose**: Consistent test data, no production pollution

**NFR-TEST-003**: Mock webhooks SHALL use valid Svix signatures for testing
- **Enforcement**: Test helper generates valid Svix signatures
- **Test Method**: Webhook tests verify signature validation logic
- **Purpose**: Test webhook security without relying on Clerk

---

## Traceability Matrix

| NFR ID | Functional Requirement | Test Requirement | Test File |
|--------|------------------------|------------------|-----------|
| NFR-PERF-001 | FR-002 (Profile form) | TR-004 (Profile editing) | tests/e2e/settings/profile-edit.spec.ts |
| NFR-PERF-002 | FR-011 (Profile updates) | TR-003 (Profile viewing) | tests/e2e/settings/profile-view.spec.ts |
| NFR-PERF-003 | FR-014 (Dashboard) | TR-002 (Dashboard access) | tests/e2e/dashboard/dashboard.spec.ts |
| NFR-SEC-001 | FR-017 (Auth requirement) | TR-005 (Auth enforcement) | tests/e2e/auth/auth-enforcement.spec.ts |
| NFR-SEC-002 | FR-018 (Authorization) | TR-006 (Cross-user access) | tests/e2e/auth/authorization.spec.ts |
| NFR-ACCESS-001 | FR-016 (Profile editing) | TR-010 (Validation UI) | tests/e2e/profile/validation.spec.ts |
| NFR-ACCESS-007 | FR-015 (Settings tabs) | E2E-009 (Settings navigation) | tests/e2e/settings/navigation.spec.ts |

---

## Summary

**Total NFRs**: 48 requirements across 9 categories
**Coverage**:
- Performance: 10 requirements (response times, concurrency, scalability)
- Security: 16 requirements (authentication, validation, privacy, audit)
- Accessibility: 8 requirements (WCAG 2.1 Level AA compliance)
- Compatibility: 4 requirements (browser, mobile, autofill support)
- Reliability: 4 requirements (atomicity, retries, backups)
- Compliance: 3 requirements (GDPR, SOC 2, data retention)
- Testing: 3 requirements (test environment setup)

**Gaps Addressed**:
- CHK061-CHK074: All non-functional requirement gaps filled
- CHK065-CHK074: Security, accessibility, compatibility requirements specified
- CHK101-CHK103: Test environment and test data requirements defined
