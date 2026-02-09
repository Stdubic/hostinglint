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

    it('should not flag each() when targeting PHP 7.4', () => {
      const code = `<?php
while (list($k, $v) = each($config)) { echo $k; }
`;
      const results = analyzePhp(code, 'test.php', { phpVersion: '7.4' });
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

  describe('create_function() detection', () => {
    it('should detect create_function() usage', () => {
      const code = `<?php
$func = create_function('$a,$b', 'return $a + $b;');
`;
      const results = analyzePhp(code, 'test.php');
      const cfResults = results.filter((r) => r.ruleId === 'php-compat-create-function');
      expect(cfResults).toHaveLength(1);
      expect(cfResults[0].severity).toBe('error');
    });

    it('should not flag create_function() when targeting PHP 7.4', () => {
      const code = `<?php
$func = create_function('$a,$b', 'return $a + $b;');
`;
      const results = analyzePhp(code, 'test.php', { phpVersion: '7.4' });
      const cfResults = results.filter((r) => r.ruleId === 'php-compat-create-function');
      expect(cfResults).toHaveLength(0);
    });
  });

  describe('mysql_* functions detection', () => {
    it('should detect mysql_connect()', () => {
      const code = `<?php
$conn = mysql_connect("localhost", "root", "pass");
`;
      const results = analyzePhp(code, 'test.php');
      const mysqlResults = results.filter((r) => r.ruleId === 'php-compat-mysql-functions');
      expect(mysqlResults).toHaveLength(1);
      expect(mysqlResults[0].severity).toBe('error');
    });

    it('should detect multiple mysql_* functions', () => {
      const code = `<?php
$conn = mysql_connect("localhost", "root", "pass");
$result = mysql_query("SELECT 1");
$row = mysql_fetch_assoc($result);
`;
      const results = analyzePhp(code, 'test.php');
      const mysqlResults = results.filter((r) => r.ruleId === 'php-compat-mysql-functions');
      expect(mysqlResults).toHaveLength(3);
    });

    it('should not flag mysqli_* functions', () => {
      const code = `<?php
$conn = mysqli_connect("localhost", "root", "pass", "db");
`;
      const results = analyzePhp(code, 'test.php');
      const mysqlResults = results.filter((r) => r.ruleId === 'php-compat-mysql-functions');
      expect(mysqlResults).toHaveLength(0);
    });
  });

  describe('XSS detection', () => {
    it('should detect echo with $_GET', () => {
      const code = `<?php
echo $_GET['name'];
`;
      const results = analyzePhp(code, 'test.php');
      const xssResults = results.filter((r) => r.ruleId === 'security-xss');
      expect(xssResults).toHaveLength(1);
      expect(xssResults[0].severity).toBe('error');
    });

    it('should detect echo with $params', () => {
      const code = `<?php
echo $params['domain'];
`;
      const results = analyzePhp(code, 'test.php');
      const xssResults = results.filter((r) => r.ruleId === 'security-xss');
      expect(xssResults).toHaveLength(1);
    });

    it('should not flag safe echo statements', () => {
      const code = `<?php
echo htmlspecialchars($name);
echo "Hello World";
`;
      const results = analyzePhp(code, 'test.php');
      const xssResults = results.filter((r) => r.ruleId === 'security-xss');
      expect(xssResults).toHaveLength(0);
    });
  });

  describe('Path traversal detection', () => {
    it('should detect include with user input', () => {
      const code = `<?php
include $_GET['page'];
`;
      const results = analyzePhp(code, 'test.php');
      const ptResults = results.filter((r) => r.ruleId === 'security-path-traversal');
      expect(ptResults).toHaveLength(1);
    });

    it('should detect file_get_contents with params', () => {
      const code = `<?php
$content = file_get_contents("/uploads/" . $params['file']);
`;
      const results = analyzePhp(code, 'test.php');
      const ptResults = results.filter((r) => r.ruleId === 'security-path-traversal');
      expect(ptResults).toHaveLength(1);
    });

    it('should not flag static includes', () => {
      const code = `<?php
include 'config.php';
require_once __DIR__ . '/helpers.php';
`;
      const results = analyzePhp(code, 'test.php');
      const ptResults = results.filter((r) => r.ruleId === 'security-path-traversal');
      expect(ptResults).toHaveLength(0);
    });
  });

  describe('WHMCS config function detection', () => {
    it('should warn when provisioning module lacks _Config()', () => {
      const code = `<?php
function mymodule_MetaData() { return array(); }
function mymodule_CreateAccount($params) { return 'success'; }
function mymodule_SuspendAccount($params) { return 'success'; }
`;
      const results = analyzePhp(code, 'mymodule.php');
      const configResults = results.filter((r) => r.ruleId === 'whmcs-config-function');
      expect(configResults).toHaveLength(1);
    });

    it('should not warn when _Config() is present', () => {
      const code = `<?php
function mymodule_MetaData() { return array(); }
function mymodule_Config() { return array(); }
function mymodule_CreateAccount($params) { return 'success'; }
`;
      const results = analyzePhp(code, 'mymodule.php');
      const configResults = results.filter((r) => r.ruleId === 'whmcs-config-function');
      expect(configResults).toHaveLength(0);
    });

    it('should not warn for non-provisioning modules', () => {
      const code = `<?php
function mymodule_MetaData() { return array(); }
function mymodule_Config() { return array(); }
`;
      const results = analyzePhp(code, 'mymodule.php');
      const configResults = results.filter((r) => r.ruleId === 'whmcs-config-function');
      expect(configResults).toHaveLength(0);
    });
  });

  describe('WHMCS return format detection', () => {
    it('should warn when CreateAccount does not return success', () => {
      const code = `<?php
function mymodule_CreateAccount($params) {
  // Do something
  return true;
}
`;
      const results = analyzePhp(code, 'mymodule.php');
      const returnResults = results.filter((r) => r.ruleId === 'whmcs-return-format');
      expect(returnResults).toHaveLength(1);
    });

    it('should not warn when returning success string', () => {
      const code = `<?php
function mymodule_CreateAccount($params) {
  // Create the account
  return 'success';
}
`;
      const results = analyzePhp(code, 'mymodule.php');
      const returnResults = results.filter((r) => r.ruleId === 'whmcs-return-format');
      expect(returnResults).toHaveLength(0);
    });
  });

  describe('Hardcoded credentials detection', () => {
    it('should detect hardcoded passwords', () => {
      const code = `<?php
$password = "s3cr3tP@ss!";
`;
      const results = analyzePhp(code, 'test.php');
      const credResults = results.filter((r) => r.ruleId === 'security-hardcoded-credentials');
      expect(credResults).toHaveLength(1);
    });

    it('should not flag placeholder values', () => {
      const code = `<?php
$password = "your_password_here";
$apiKey = "changeme";
`;
      const results = analyzePhp(code, 'test.php');
      const credResults = results.filter((r) => r.ruleId === 'security-hardcoded-credentials');
      expect(credResults).toHaveLength(0);
    });
  });

  describe('eval() detection', () => {
    it('should detect eval() usage', () => {
      const code = `<?php
eval('echo "Hello";');
`;
      const results = analyzePhp(code, 'test.php');
      const evalResults = results.filter((r) => r.ruleId === 'security-eval-usage');
      expect(evalResults).toHaveLength(1);
    });
  });

  describe('Inline disable', () => {
    it('should suppress findings with disable-next-line', () => {
      const code = `<?php
// hostinglint-disable-next-line php-compat-each
while (list($k, $v) = each($config)) { echo $k; }
`;
      const results = analyzePhp(code, 'test.php');
      const eachResults = results.filter((r) => r.ruleId === 'php-compat-each');
      expect(eachResults).toHaveLength(0);
    });

    it('should suppress all findings on a line with generic disable', () => {
      const code = `<?php
// hostinglint-disable-next-line
while (list($k, $v) = each($config)) { echo $k; }
`;
      const results = analyzePhp(code, 'test.php');
      const eachResults = results.filter((r) => r.ruleId === 'php-compat-each');
      expect(eachResults).toHaveLength(0);
    });
  });

  describe('Version-aware rules', () => {
    it('should not flag php-compat-each when targeting PHP 7.4', () => {
      const code = `<?php
while (list($k, $v) = each($config)) { echo $k; }
`;
      const results = analyzePhp(code, 'test.php', { phpVersion: '7.4' });
      const eachResults = results.filter((r) => r.ruleId === 'php-compat-each');
      expect(eachResults).toHaveLength(0);
    });

    it('should flag php-compat-each when targeting PHP 8.0+', () => {
      const code = `<?php
while (list($k, $v) = each($config)) { echo $k; }
`;
      const results = analyzePhp(code, 'test.php', { phpVersion: '8.0' });
      const eachResults = results.filter((r) => r.ruleId === 'php-compat-each');
      expect(eachResults).toHaveLength(1);
    });

    it('should flag php-compat-curly-braces for PHP 7.4+', () => {
      const code = `<?php
$char = $string{0};
`;
      const results = analyzePhp(code, 'test.php', { phpVersion: '8.0' });
      const curlyResults = results.filter((r) => r.ruleId === 'php-compat-curly-braces');
      expect(curlyResults).toHaveLength(1);
    });
  });

  describe('Best Practices', () => {
    it('should detect TODO comments', () => {
      const code = `<?php
// TODO: Fix this
`;
      const results = analyzePhp(code, 'test.php');
      const todoResults = results.filter((r) => r.ruleId === 'best-practice-todo-fixme');
      expect(todoResults).toHaveLength(1);
    });

    it('should not flag full-page license comments if they dont have TODO', () => {
      const code = `<?php
/**
 * My Module
 * (c) 2026 Company
 */
`;
      const results = analyzePhp(code, 'test.php');
      const todoResults = results.filter((r) => r.ruleId === 'best-practice-todo-fixme');
      expect(todoResults).toHaveLength(0);
    });
  });

  describe('Common Security Rules', () => {
    it('should detect hardcoded credentials', () => {
      const code = `<?php
$password = "secret123";
$apiKey = 'abcdef1234567890';
`;
      const results = analyzePhp(code, 'test.php');
      const credResults = results.filter((r) => r.ruleId === 'security-hardcoded-credentials');
      expect(credResults).toHaveLength(2);
    });

    it('should ignore example credentials', () => {
      const code = `<?php
$password = "your_password_here";
$apiKey = 'test_key';
`;
      const results = analyzePhp(code, 'test.php');
      const credResults = results.filter((r) => r.ruleId === 'security-hardcoded-credentials');
      expect(credResults).toHaveLength(0);
    });

    it('should detect eval() usage', () => {
      const code = `<?php
eval('$foo = "bar";');
`;
      const results = analyzePhp(code, 'test.php');
      const evalResults = results.filter((r) => r.ruleId === 'security-eval-usage');
      expect(evalResults).toHaveLength(1);
    });

    it('should ignore eval in comments', () => {
      const code = `<?php
// We should avoid using eval($code) here
`;
      const results = analyzePhp(code, 'test.php');
      const evalResults = results.filter((r) => r.ruleId === 'security-eval-usage');
      expect(evalResults).toHaveLength(0);
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
