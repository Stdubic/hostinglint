// Tests for the PHP analyzer (WHMCS modules)
import { describe, it, expect } from 'vitest';
import { analyzePhp } from '@hostinglint/core';

describe('PHP Analyzer', () => {
  describe('each() removal detection', () => {
    it('should detect usage of each() function', () => {
      const code = `<?php
function mymodule_Config() {
  $config = array("key" => "value");
  while (list($k, $v) = each($config)) {
    echo "$k => $v";
  }
}
`;
      const results = analyzePhp(code, 'mymodule.php');
      const eachResults = results.filter((r) => r.ruleId === 'php-compat-each');

      expect(eachResults.length).toBeGreaterThanOrEqual(1);
      expect(eachResults[0].severity).toBe('error');
      expect(eachResults[0].line).toBe(4);
    });

    it('should not flag forEach or other methods containing "each"', () => {
      const code = `<?php
foreach ($items as $key => $value) {
  echo $value;
}
`;
      const results = analyzePhp(code, 'mymodule.php');
      const eachResults = results.filter((r) => r.ruleId === 'php-compat-each');

      expect(eachResults).toHaveLength(0);
    });
  });

  describe('WHMCS MetaData detection', () => {
    it('should warn when MetaData function is missing', () => {
      const code = `<?php
function mymodule_Config() {
  return array(
    "name" => "My Module",
    "version" => "1.0",
  );
}
`;
      const results = analyzePhp(code, 'mymodule.php');
      const metaResults = results.filter((r) => r.ruleId === 'whmcs-metadata');

      expect(metaResults).toHaveLength(1);
      expect(metaResults[0].severity).toBe('warning');
    });

    it('should not warn when MetaData function is present', () => {
      const code = `<?php
function mymodule_MetaData() {
  return array(
    "DisplayName" => "My Module",
    "APIVersion" => "1.1",
  );
}

function mymodule_Config() {
  return array(
    "name" => "My Module",
  );
}
`;
      const results = analyzePhp(code, 'mymodule.php');
      const metaResults = results.filter((r) => r.ruleId === 'whmcs-metadata');

      expect(metaResults).toHaveLength(0);
    });
  });

  describe('SQL injection detection', () => {
    it('should detect direct variable usage in SQL queries', () => {
      const code = `<?php
function mymodule_DoSomething($params) {
  $domain = $params['domain'];
  $result = mysql_query("SELECT * FROM tblhosting WHERE domain = '$domain'");
  $query = "SELECT * FROM users WHERE id = " . $params['clientsdetails']['userid'];
}
`;
      const results = analyzePhp(code, 'mymodule.php');
      const sqlResults = results.filter((r) => r.ruleId === 'security-sql-injection');

      expect(sqlResults.length).toBeGreaterThanOrEqual(1);
      expect(sqlResults[0].severity).toBe('error');
    });

    it('should not flag parameterized queries', () => {
      const code = `<?php
use WHMCS\\Database\\Capsule;

function mymodule_DoSomething() {
  $domain = "example.com";
  $result = Capsule::table('tblhosting')
    ->where('domain', $domain)
    ->first();
}
`;
      const results = analyzePhp(code, 'mymodule.php');
      const sqlResults = results.filter((r) => r.ruleId === 'security-sql-injection');

      expect(sqlResults).toHaveLength(0);
    });
  });

  describe('Deprecated WHMCS functions', () => {
    it('should detect deprecated function usage', () => {
      const code = `<?php
function mymodule_Config() {
  $client = getClientsDetails($params['clientsdetails']['userid']);
  $result = select_query("tblhosting", "id,domain", array("userid" => $uid));
}
`;
      const results = analyzePhp(code, 'mymodule.php');
      const deprecatedResults = results.filter((r) => r.ruleId === 'whmcs-deprecated');

      expect(deprecatedResults.length).toBeGreaterThanOrEqual(2);
      expect(deprecatedResults[0].severity).toBe('warning');
    });
  });

  describe('Hook error handling', () => {
    it('should warn when hook callback lacks try/catch', () => {
      const code = `<?php
add_hook('ClientAdd', 1, function($vars) {
    $clientId = $vars['userid'];
    logActivity("New client: $clientId");
});
`;
      const results = analyzePhp(code, 'hooks.php');
      const hookResults = results.filter((r) => r.ruleId === 'whmcs-hook-error-handling');

      expect(hookResults).toHaveLength(1);
      expect(hookResults[0].severity).toBe('warning');
    });

    it('should not warn when hook callback has try/catch', () => {
      const code = `<?php
add_hook('ClientAdd', 1, function($vars) {
    try {
        $clientId = $vars['userid'];
        logActivity("New client: $clientId");
    } catch (Exception $e) {
        logActivity("Hook error: " . $e->getMessage());
    }
});
`;
      const results = analyzePhp(code, 'hooks.php');
      const hookResults = results.filter((r) => r.ruleId === 'whmcs-hook-error-handling');

      expect(hookResults).toHaveLength(0);
    });
  });

  describe('Options', () => {
    it('should respect security option when disabled', () => {
      const code = `<?php
$result = mysql_query("SELECT * FROM users WHERE id = " . $_GET['id']);
`;
      const results = analyzePhp(code, 'test.php', { security: false });
      const secResults = results.filter((r) => r.category === 'security');

      expect(secResults).toHaveLength(0);
    });

    it('should respect bestPractices option when disabled', () => {
      const code = `<?php
add_hook('ClientAdd', 1, function($vars) {
    logActivity("test");
});
`;
      const results = analyzePhp(code, 'hooks.php', { bestPractices: false });
      const bpResults = results.filter((r) => r.category === 'best-practice');

      expect(bpResults).toHaveLength(0);
    });
  });
});
