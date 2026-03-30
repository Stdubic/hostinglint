<?php
/**
 * Vulnerable WHMCS Module - PHP 8.2 Deprecated Features
 *
 * This module demonstrates PHP 8.2 compatibility issues
 * that HostingLint should detect.
 *
 * COMPATIBILITY ISSUE: Features deprecated or removed in PHP 8.2
 */

if (!defined("WHMCS")) {
    die("This file cannot be accessed directly");
}

function vulnerable_php82_MetaData()
{
    return [
        'DisplayName' => 'Vulnerable PHP 8.2 Module',
        'APIVersion' => '1.1',
    ];
}

// DEPRECATED: utf8_encode() and utf8_decode() removed in PHP 8.2
function vulnerable_php82_encodeData($data)
{
    // VULNERABLE: utf8_encode() is deprecated
    $encoded = utf8_encode($data);

    // VULNERABLE: utf8_decode() is deprecated
    $decoded = utf8_decode($encoded);

    return $decoded;
}

// DEPRECATED: "${var}" string interpolation syntax
function vulnerable_php82_formatMessage($params)
{
    $domain = $params['domain'];
    $user = $params['username'];

    // VULNERABLE: "${var}" interpolation deprecated in PHP 8.2
    $msg = "Domain: ${domain}, User: ${user}";

    // SAFE: "{$var}" syntax is fine
    $safe = "Domain: {$domain}, User: {$user}";

    return $msg;
}

// DEPRECATED: Dynamic properties without declaration
class VulnerableModule
{
    public string $name;

    public function __construct()
    {
        // SAFE: $name is declared
        $this->name = 'My Module';

        // VULNERABLE: $version is not declared
        $this->version = '1.0';

        // VULNERABLE: $author is not declared
        $this->author = 'Admin';
    }
}

// SAFE: Class with #[AllowDynamicProperties]
#[AllowDynamicProperties]
class LegacyModule
{
    public function __construct()
    {
        // SAFE: AllowDynamicProperties attribute is present
        $this->name = 'Legacy Module';
        $this->version = '0.9';
    }
}

// SAFE: Class with all properties declared
class SafeModule
{
    public string $name;
    public string $version;
    public string $author;

    public function __construct()
    {
        $this->name = 'Safe Module';
        $this->version = '1.0';
        $this->author = 'Admin';
    }
}
