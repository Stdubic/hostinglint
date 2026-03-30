# HostingLint Rules Reference

Complete reference of all 34 rules across all platforms.

---

## PHP / WHMCS Rules (17 rules)

### Compatibility Rules

#### `php-compat-each`
| | |
|---|---|
| **Severity** | error |
| **Category** | compatibility |
| **Min PHP** | 8.0 |

Detects usage of `each()` which was removed in PHP 8.0.

```php
// Bad
while (list($k, $v) = each($config)) { ... }

// Good
foreach ($config as $k => $v) { ... }
```

#### `php-compat-create-function`
| | |
|---|---|
| **Severity** | error |
| **Category** | compatibility |
| **Min PHP** | 8.0 |

Detects usage of `create_function()` which was removed in PHP 8.0.

```php
// Bad
$func = create_function('$a,$b', 'return $a + $b;');

// Good
$func = function($a, $b) { return $a + $b; };
```

#### `php-compat-mysql-functions`
| | |
|---|---|
| **Severity** | error |
| **Category** | compatibility |

Detects usage of `mysql_*` functions (mysql_connect, mysql_query, etc.) which were removed in PHP 7.0.

```php
// Bad
$conn = mysql_connect("localhost", "root", "password");
$result = mysql_query("SELECT * FROM users");

// Good
use WHMCS\Database\Capsule;
$result = Capsule::table('users')->get();
```

#### `php-compat-curly-braces`
| | |
|---|---|
| **Severity** | error |
| **Category** | compatibility |
| **Min PHP** | 7.4 |

Detects curly brace array/string access syntax, deprecated in PHP 7.4 and removed in 8.0.

```php
// Bad
$char = $string{0};

// Good
$char = $string[0];
```

#### `whmcs-metadata`
| | |
|---|---|
| **Severity** | warning |
| **Category** | compatibility |

Detects missing `MetaData()` function in WHMCS modules (required since WHMCS 8.0).

#### `whmcs-deprecated`
| | |
|---|---|
| **Severity** | warning |
| **Category** | compatibility |

Detects deprecated WHMCS functions: `getClientsDetails`, `select_query`, `update_query`, `insert_query`, `full_query`.

#### `whmcs-config-function`
| | |
|---|---|
| **Severity** | warning |
| **Category** | compatibility |

Detects missing `_Config()` function in WHMCS provisioning modules.

#### `whmcs-return-format`
| | |
|---|---|
| **Severity** | warning |
| **Category** | best-practice |

Checks that WHMCS provisioning functions (CreateAccount, SuspendAccount, etc.) return proper result strings or arrays.

### Security Rules

#### `security-sql-injection`
| | |
|---|---|
| **Severity** | error |
| **Category** | security |

Detects potential SQL injection via unsanitized user input (`$_GET`, `$_POST`, `$params`) in SQL queries.

```php
// Bad
$result = mysql_query("SELECT * FROM users WHERE id = " . $params['userid']);

// Good
$result = Capsule::table('users')->where('id', $params['userid'])->first();
```

#### `security-xss`
| | |
|---|---|
| **Severity** | error |
| **Category** | security |

Detects potential XSS via unescaped output of user input.

```php
// Bad
echo $_GET['name'];

// Good
echo htmlspecialchars($_GET['name'], ENT_QUOTES, 'UTF-8');
```

#### `security-path-traversal`
| | |
|---|---|
| **Severity** | error |
| **Category** | security |

Detects potential path traversal via user input in file operations (include, require, file_get_contents, etc.).

#### `security-php-deserialization`
| | |
|---|---|
| **Severity** | error |
| **Category** | security |

Detects insecure `unserialize()` with user-controlled data (`$_GET`, `$_POST`, `$_REQUEST`, `$_COOKIE`, `$params`). Deserialization of untrusted data can lead to remote code execution (CWE-502).

```php
// Bad
$data = unserialize($_POST['payload']);

// Good
$data = json_decode($_POST['payload'], true);
// Or with allowed_classes restriction:
$data = unserialize($input, ['allowed_classes' => false]);
```

#### `security-php-ssrf`
| | |
|---|---|
| **Severity** | error |
| **Category** | security |

Detects potential server-side request forgery (SSRF) where user input controls URLs in HTTP functions (`file_get_contents`, `curl_init`, `fopen`). Attackers can reach internal services (CWE-918).

```php
// Bad
$response = file_get_contents($_GET['url']);

// Good
$allowedHosts = ['api.example.com', 'cdn.example.com'];
$url = $_GET['url'];
$parsed = parse_url($url);
if (in_array($parsed['host'], $allowedHosts)) {
    $response = file_get_contents($url);
}
```

#### `security-php-weak-crypto`
| | |
|---|---|
| **Severity** | error |
| **Category** | security |

Detects weak cryptographic algorithms (MD5, SHA1) used for password hashing. These are cryptographically broken for password storage (CWE-327).

```php
// Bad
$hash = md5($password);
$hash = sha1($passwd);

// Good
$hash = password_hash($password, PASSWORD_ARGON2ID);
if (password_verify($input, $hash)) { /* authenticated */ }
```

#### `security-command-injection`
| | |
|---|---|
| **Severity** | error |
| **Category** | security |

Detects potential command injection via unsanitized user input (`$_GET`, `$_POST`, `$_REQUEST`, `$_COOKIE`, `$params`) in OS command execution functions (`exec`, `shell_exec`, `system`, `passthru`, `proc_open`, `popen`) and backtick operators (CWE-78).

```php
// Bad
exec("ping " . $_GET['host']);
$output = shell_exec("dig " . $params['domain']);
$result = `host $_GET['domain']`;

// Good
exec("ping " . escapeshellarg($_GET['host']));
$output = shell_exec("dig " . escapeshellarg($params['domain']));
```

### Best Practice Rules

#### `whmcs-hook-error-handling`
| | |
|---|---|
| **Severity** | warning |
| **Category** | best-practice |

Detects WHMCS hook callbacks without try/catch error handling.

#### `whmcs-license-check`
| | |
|---|---|
| **Severity** | info |
| **Category** | best-practice |

Detects modules that appear to lack license validation (for commercial modules).

---

## Perl / cPanel Rules (7 rules)

### Compatibility Rules

#### `perl-cpanel-api-version`
| | |
|---|---|
| **Severity** | warning |
| **Category** | compatibility |

Detects deprecated cPanel API1 usage. Should use API2 or UAPI instead.

#### `perl-deprecated-modules`
| | |
|---|---|
| **Severity** | warning |
| **Category** | compatibility |

Detects usage of deprecated Perl modules (CGI.pm, Switch, Class::ISA, etc.).

### Security Rules

#### `perl-security-taint`
| | |
|---|---|
| **Severity** | error |
| **Category** | security |

Detects potential command injection via `system()`, `exec()`, backticks, or `open()` with pipe, using unsanitized variable input.

#### `perl-file-permissions`
| | |
|---|---|
| **Severity** | warning |
| **Category** | security |

Detects insecure file permission modes (0777, 0666, etc.).

#### `perl-input-validation`
| | |
|---|---|
| **Severity** | warning |
| **Category** | security |

Detects CGI params and environment variables used without apparent validation.

### Best Practice Rules

#### `perl-strict-warnings`
| | |
|---|---|
| **Severity** | warning |
| **Category** | best-practice |

Detects missing `use strict` and `use warnings` pragmas.

#### `perl-error-handling`
| | |
|---|---|
| **Severity** | warning |
| **Category** | best-practice |

Detects critical operations (database, HTTP) without eval/die error handling.

---

## OpenPanel Rules (7 rules)

#### `openpanel-dockerfile`
| | |
|---|---|
| **Severity** | warning / info |
| **Category** | best-practice |

Checks Dockerfile best practices: non-root USER directive and HEALTHCHECK definition.

#### `openpanel-api-versioning`
| | |
|---|---|
| **Severity** | warning |
| **Category** | compatibility |

Checks for missing API version in OpenPanel extension manifest files.

#### `openpanel-resource-limits`
| | |
|---|---|
| **Severity** | warning |
| **Category** | best-practice |

Checks for missing resource limits (memory/CPU) in Docker Compose configurations.

#### `openpanel-security-capabilities`
| | |
|---|---|
| **Severity** | error |
| **Category** | security |

Detects Docker containers with excessive capabilities (privileged mode, SYS_ADMIN, NET_ADMIN, ALL).

#### `openpanel-cli-validation`
| | |
|---|---|
| **Severity** | warning |
| **Category** | security |

Checks for missing input validation in OpenCLI command scripts.

#### `openpanel-security-host-network`
| | |
|---|---|
| **Severity** | error |
| **Category** | security |

Detects Docker containers using host network mode (`network_mode: host`), which bypasses container network isolation and allows containers to access all host network interfaces.

```yaml
# Bad
services:
  extension:
    network_mode: host

# Good
services:
  extension:
    networks:
      - internal
```

#### `openpanel-security-secrets-in-env`
| | |
|---|---|
| **Severity** | error |
| **Category** | security |

Detects hardcoded secrets (passwords, API keys, tokens) in docker-compose environment variables. Variable references (`${VAR}`) are excluded.

```yaml
# Bad
services:
  extension:
    environment:
      - DATABASE_PASSWORD=secretpass123
      - API_KEY=sk_live_abc123

# Good
services:
  extension:
    environment:
      - DATABASE_PASSWORD=${DB_PASS}
    secrets:
      - db_password
```

---

## Cross-Platform Rules (3 rules)

These rules apply to all platforms and languages.

#### `security-hardcoded-credentials`
| | |
|---|---|
| **Severity** | error |
| **Category** | security |

Detects hardcoded passwords, API keys, secrets, and tokens in source code.

#### `security-eval-usage`
| | |
|---|---|
| **Severity** | warning |
| **Category** | security |

Detects usage of `eval()` which can execute arbitrary code.

#### `best-practice-todo-fixme`
| | |
|---|---|
| **Severity** | info |
| **Category** | best-practice |

Detects TODO, FIXME, HACK, XXX, and BUG comments indicating incomplete code.

---

## Disabling Rules

### Configuration File

```json
{
  "rules": {
    "whmcs-license-check": "off",
    "security-sql-injection": "error"
  }
}
```

### Inline Comments

```php
// hostinglint-disable-next-line rule-id
// hostinglint-disable rule-id
// hostinglint-enable rule-id
```

```perl
# hostinglint-disable-next-line rule-id
# hostinglint-disable rule-id
# hostinglint-enable rule-id
```
