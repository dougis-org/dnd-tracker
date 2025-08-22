import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('Deployment Configuration', () => {
  const rootDir = join(__dirname, '../../');

  describe('Docker Configuration', () => {
    it('should have a Dockerfile', () => {
      const dockerfilePath = join(rootDir, 'Dockerfile');
      expect(existsSync(dockerfilePath)).toBe(true);
    });

    it('should have a .dockerignore file', () => {
      const dockerignorePath = join(rootDir, '.dockerignore');
      expect(existsSync(dockerignorePath)).toBe(true);
    });

    it('Dockerfile should use correct Node.js version', () => {
      const dockerfilePath = join(rootDir, 'Dockerfile');
      const dockerfileContent = readFileSync(dockerfilePath, 'utf-8');
      expect(dockerfileContent).toContain('FROM node:24-alpine');
    });

    it('Dockerfile should expose port 3000', () => {
      const dockerfilePath = join(rootDir, 'Dockerfile');
      const dockerfileContent = readFileSync(dockerfilePath, 'utf-8');
      expect(dockerfileContent).toContain('EXPOSE 3000');
    });

    it('Dockerfile should run as non-root user', () => {
      const dockerfilePath = join(rootDir, 'Dockerfile');
      const dockerfileContent = readFileSync(dockerfilePath, 'utf-8');
      expect(dockerfileContent).toContain('USER nextjs');
    });
  });

  describe('Fly.io Configuration', () => {
    it('should have a fly.toml file', () => {
      const flyTomlPath = join(rootDir, 'fly.toml');
      expect(existsSync(flyTomlPath)).toBe(true);
    });

    it('fly.toml should have correct app name', () => {
      const flyTomlPath = join(rootDir, 'fly.toml');
      const flyTomlContent = readFileSync(flyTomlPath, 'utf-8');
      expect(flyTomlContent).toContain('app = \'dnd-tracker-next-js\'');
    });

    it('fly.toml should configure internal port 3000', () => {
      const flyTomlPath = join(rootDir, 'fly.toml');
      const flyTomlContent = readFileSync(flyTomlPath, 'utf-8');
      expect(flyTomlContent).toContain('internal_port = 3000');
    });

    it('fly.toml should force HTTPS', () => {
      const flyTomlPath = join(rootDir, 'fly.toml');
      const flyTomlContent = readFileSync(flyTomlPath, 'utf-8');
      expect(flyTomlContent).toContain('force_https = true');
    });

    it('fly.toml should use modern http_service configuration', () => {
      const flyTomlPath = join(rootDir, 'fly.toml');
      const flyTomlContent = readFileSync(flyTomlPath, 'utf-8');
      expect(flyTomlContent).toContain('[http_service]');
      expect(flyTomlContent).toContain('auto_stop_machines');
      expect(flyTomlContent).toContain('auto_start_machines');
    });

    it('fly.toml should not have conflicting http_service and services configuration', () => {
      const flyTomlPath = join(rootDir, 'fly.toml');
      const flyTomlContent = readFileSync(flyTomlPath, 'utf-8');
      
      const hasHttpService = flyTomlContent.includes('[http_service]');
      const hasServicesSection = flyTomlContent.includes('[[services]]');
      
      // Should use http_service (modern) but not both
      expect(hasHttpService).toBe(true);
      expect(hasServicesSection).toBe(false);
    });
  });

  describe('GitHub Actions Configuration', () => {
    it('should have CI workflow file', () => {
      const workflowPath = join(rootDir, '.github/workflows/ci.yml');
      expect(existsSync(workflowPath)).toBe(true);
    });

    it('CI workflow should run on push to main', () => {
      const workflowPath = join(rootDir, '.github/workflows/ci.yml');
      const workflowContent = readFileSync(workflowPath, 'utf-8');
      expect(workflowContent).toContain('branches: [ main, develop ]');
    });

    it('CI workflow should include test job', () => {
      const workflowPath = join(rootDir, '.github/workflows/ci.yml');
      const workflowContent = readFileSync(workflowPath, 'utf-8');
      expect(workflowContent).toContain('jobs:');
      expect(workflowContent).toContain('test:');
    });

    it('CI workflow should include coverage push job', () => {
      const workflowPath = join(rootDir, '.github/workflows/ci.yml');
      const workflowContent = readFileSync(workflowPath, 'utf-8');
      expect(workflowContent).toContain('Codacy Coverage');
    });

    it('CI workflow should use MongoDB service', () => {
      const workflowPath = join(rootDir, '.github/workflows/ci.yml');
      const workflowContent = readFileSync(workflowPath, 'utf-8');
      expect(workflowContent).toContain('services:');
      expect(workflowContent).toContain('mongodb:');
    });
  });

  describe('Next.js Configuration', () => {
    it('next.config.mjs should have standalone output', () => {
      const nextConfigPath = join(rootDir, 'next.config.mjs');
      const nextConfigContent = readFileSync(nextConfigPath, 'utf-8');
      expect(nextConfigContent).toContain('output: \'standalone\'');
    });
  });

  describe('Environment Variables', () => {
    it('should have .env.example file', () => {
      const envExamplePath = join(rootDir, '.env.example');
      expect(existsSync(envExamplePath)).toBe(true);
    });

    it('.env.example should include deployment variables', () => {
      const envExamplePath = join(rootDir, '.env.example');
      const envExampleContent = readFileSync(envExamplePath, 'utf-8');
      expect(envExampleContent).toContain('NODE_ENV=production');
      expect(envExampleContent).toContain('PORT=3000');
      expect(envExampleContent).toContain('HOSTNAME=0.0.0.0');
      expect(envExampleContent).toContain('NEXT_PUBLIC_APP_URL=https://dnd-tracker-next-js.fly.dev');
    });

    it('.env.example should include required authentication variables', () => {
      const envExamplePath = join(rootDir, '.env.example');
      const envExampleContent = readFileSync(envExamplePath, 'utf-8');
      expect(envExampleContent).toContain('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
      expect(envExampleContent).toContain('CLERK_SECRET_KEY');
    });

    it('.env.example should include database configuration', () => {
      const envExamplePath = join(rootDir, '.env.example');
      const envExampleContent = readFileSync(envExamplePath, 'utf-8');
      expect(envExampleContent).toContain('MONGODB_URI');
    });
  });
});