<?php
/**
 * Vulnerable WHMCS Module - Insecure Random Example
 *
 * This module demonstrates cryptographically weak PRNG usage
 * that HostingLint should detect.
 *
 * SECURITY FLAW: Predictable random values used for security-sensitive operations (CWE-338)
 */

if (!defined("WHMCS")) {
    die("This file cannot be accessed directly");
}

function vulnerable_random_MetaData()
{
    return [
        'DisplayName' => 'Vulnerable Insecure Random Module',
        'APIVersion' => '1.1',
    ];
}

function vulnerable_random_Config()
{
    return [
        'api_endpoint' => [
            'FriendlyName' => 'API Endpoint',
            'Type' => 'text',
        ],
    ];
}

function vulnerable_random_CreateAccount(array $params)
{
    // VULNERABLE: rand() for token generation
    $token = rand(0, 999999);

    // VULNERABLE: mt_rand() for API key
    $key = mt_rand(100000, 999999);

    // VULNERABLE: uniqid() for nonce
    $nonce = uniqid('', true);

    // VULNERABLE: md5(mt_rand()) weak token pattern
    $apiToken = md5(mt_rand());

    // VULNERABLE: sha1(uniqid()) weak token pattern
    $sessionToken = sha1(uniqid('', true));

    // VULNERABLE: md5(time()) predictable CSRF token
    $csrf = md5(time());

    // VULNERABLE: hash with microtime
    $salt = hash('sha256', microtime());

    return 'success';
}

function vulnerable_random_SuspendAccount(array $params)
{
    // SAFE: random_bytes() - should NOT trigger
    $token = bin2hex(random_bytes(16));

    // SAFE: random_int() - should NOT trigger
    $code = random_int(100000, 999999);

    // SAFE: openssl_random_pseudo_bytes() - should NOT trigger
    $secret = bin2hex(openssl_random_pseudo_bytes(32));

    // SAFE: rand() for non-security use - should NOT trigger
    $delay = rand(1, 5);

    return 'success';
}
