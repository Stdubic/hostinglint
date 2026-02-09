// Tests for the OpenPanel analyzer
import { describe, it, expect } from 'vitest';
import { analyzeOpenPanel } from '@hostinglint/core';

describe('OpenPanel Analyzer', () => {
  describe('Dockerfile best practices', () => {
    it('should warn when USER directive is missing', () => {
      const code = `FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "server.js"]
`;
      const results = analyzeOpenPanel(code, 'Dockerfile');
      const userResults = results.filter(
        (r) => r.ruleId === 'openpanel-dockerfile' && r.message.includes('USER')
      );
      expect(userResults).toHaveLength(1);
    });

    it('should not warn when USER directive is present', () => {
      const code = `FROM node:18
WORKDIR /app
COPY . .
RUN npm install
USER node
CMD ["node", "server.js"]
`;
      const results = analyzeOpenPanel(code, 'Dockerfile');
      const userResults = results.filter(
        (r) => r.ruleId === 'openpanel-dockerfile' && r.message.includes('non-root USER')
      );
      expect(userResults).toHaveLength(0);
    });

    it('should warn when HEALTHCHECK is missing', () => {
      const code = `FROM node:18
USER node
CMD ["node", "server.js"]
`;
      const results = analyzeOpenPanel(code, 'Dockerfile');
      const healthResults = results.filter(
        (r) => r.ruleId === 'openpanel-dockerfile' && r.message.includes('HEALTHCHECK')
      );
      expect(healthResults).toHaveLength(1);
    });

    it('should not warn when HEALTHCHECK is present', () => {
      const code = `FROM node:18
USER node
HEALTHCHECK CMD curl -f http://localhost:3000/ || exit 1
CMD ["node", "server.js"]
`;
      const results = analyzeOpenPanel(code, 'Dockerfile');
      const healthResults = results.filter(
        (r) => r.ruleId === 'openpanel-dockerfile' && r.message.includes('HEALTHCHECK')
      );
      expect(healthResults).toHaveLength(0);
    });
  });

  describe('Security capabilities detection', () => {
    it('should detect privileged mode', () => {
      const code = `version: '3'
services:
  myext:
    image: myext:latest
    privileged: true
`;
      const results = analyzeOpenPanel(code, 'docker-compose.yml');
      const capResults = results.filter((r) => r.ruleId === 'openpanel-security-capabilities');
      expect(capResults).toHaveLength(1);
      expect(capResults[0].severity).toBe('error');
    });

    it('should detect SYS_ADMIN capability', () => {
      const code = `version: '3'
services:
  myext:
    image: myext:latest
    cap_add:
      - SYS_ADMIN
`;
      const results = analyzeOpenPanel(code, 'docker-compose.yml');
      const capResults = results.filter((r) => r.ruleId === 'openpanel-security-capabilities');
      expect(capResults).toHaveLength(1);
    });

    it('should not flag minimal capabilities', () => {
      const code = `version: '3'
services:
  myext:
    image: myext:latest
    cap_add:
      - NET_BIND_SERVICE
`;
      const results = analyzeOpenPanel(code, 'docker-compose.yml');
      const capResults = results.filter((r) => r.ruleId === 'openpanel-security-capabilities');
      expect(capResults).toHaveLength(0);
    });
  });

  describe('Resource limits detection', () => {
    it('should warn when docker-compose services lack resource limits', () => {
      const code = `version: '3'
services:
  myext:
    image: myext:latest
    ports:
      - "8080:80"
`;
      const results = analyzeOpenPanel(code, 'docker-compose.yml');
      const resResults = results.filter((r) => r.ruleId === 'openpanel-resource-limits');
      expect(resResults).toHaveLength(1);
    });

    it('should not warn when memory limits are set', () => {
      const code = `version: '3'
services:
  myext:
    image: myext:latest
    mem_limit: 512m
`;
      const results = analyzeOpenPanel(code, 'docker-compose.yml');
      const resResults = results.filter((r) => r.ruleId === 'openpanel-resource-limits');
      expect(resResults).toHaveLength(0);
    });
  });

  describe('CLI validation detection', () => {
    it('should warn when shell script uses args without validation', () => {
      const code = `#!/bin/bash
echo "Processing: $1"
rm -rf /data/$1
`;
      const results = analyzeOpenPanel(code, 'cleanup.sh');
      const cliResults = results.filter((r) => r.ruleId === 'openpanel-cli-validation');
      expect(cliResults).toHaveLength(1);
    });

    it('should not warn when script validates arguments', () => {
      const code = `#!/bin/bash
if [ -z "$1" ]; then
  echo "Usage: $0 <name>"
  exit 1
fi
echo "Processing: $1"
`;
      const results = analyzeOpenPanel(code, 'cleanup.sh');
      const cliResults = results.filter((r) => r.ruleId === 'openpanel-cli-validation');
      expect(cliResults).toHaveLength(0);
    });

    it('should warn when python script uses sys.argv without validation', () => {
      const code = `import sys
print(f"Processing: {sys.argv[1]}")
`;
      const results = analyzeOpenPanel(code, 'cleanup.py');
      const cliResults = results.filter((r) => r.ruleId === 'openpanel-cli-validation');
      expect(cliResults).toHaveLength(1);
    });

    it('should not warn when python script uses argparse', () => {
      const code = `import argparse
parser = argparse.ArgumentParser()
parser.add_argument("name")
args = parser.parse_args()
print(f"Processing: {args.name}")
`;
      const results = analyzeOpenPanel(code, 'cleanup.py');
      const cliResults = results.filter((r) => r.ruleId === 'openpanel-cli-validation');
      expect(cliResults).toHaveLength(0);
    });
  });

  describe('API Versioning', () => {
    it('should warn when manifest lacks API version', () => {
      const code = `{
  "name": "my-extension",
  "version": "1.0.0"
}
`;
      const results = analyzeOpenPanel(code, 'openpanel-manifest.json');
      const apiResults = results.filter((r) => r.ruleId === 'openpanel-api-versioning');
      expect(apiResults).toHaveLength(1);
    });

    it('should not warn when manifest has api_version', () => {
      const code = `{
  "name": "my-extension",
  "api_version": "1.0"
}
`;
      const results = analyzeOpenPanel(code, 'manifest.json');
      const apiResults = results.filter((r) => r.ruleId === 'openpanel-api-versioning');
      expect(apiResults).toHaveLength(0);
    });

    it('should not warn for non-manifest JSON', () => {
      const code = `{ "foo": "bar" }`;
      const results = analyzeOpenPanel(code, 'data.json');
      const apiResults = results.filter((r) => r.ruleId === 'openpanel-api-versioning');
      expect(apiResults).toHaveLength(0);
    });

    it('should handle invalid JSON in manifest', () => {
      const code = `{ invalid: json }`;
      const results = analyzeOpenPanel(code, 'manifest.json');
      const apiResults = results.filter((r) => r.ruleId === 'openpanel-api-versioning');
      expect(apiResults).toHaveLength(0);
    });
  });

  describe('Options', () => {
    it('should respect security option when disabled', () => {
      const code = `version: '3'
services:
  myext:
    privileged: true
`;
      const results = analyzeOpenPanel(code, 'docker-compose.yml', { security: false });
      const secResults = results.filter((r) => r.category === 'security');
      expect(secResults).toHaveLength(0);
    });

    it('should respect bestPractices option when disabled', () => {
      const code = `FROM node:18
CMD ["node", "server.js"]
`;
      const results = analyzeOpenPanel(code, 'Dockerfile', { bestPractices: false });
      const bpResults = results.filter((r) => r.category === 'best-practice');
      expect(bpResults).toHaveLength(0);
    });
  });
});
