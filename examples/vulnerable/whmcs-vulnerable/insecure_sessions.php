<?php
/**
 * Vulnerable WHMCS Module - Insecure Sessions & Race Conditions
 *
 * This module demonstrates insecure session configuration,
 * direct database access, and TOCTOU race conditions
 * that HostingLint should detect.
 *
 * SECURITY FLAW: Insecure session settings
 * SECURITY FLAW: TOCTOU race conditions in file operations
 * BEST PRACTICE: Direct DB access instead of Capsule ORM
 */

if (!defined("WHMCS")) {
    die("This file cannot be accessed directly");
}

function vulnerable_session_MetaData()
{
    return [
        'DisplayName' => 'Vulnerable Session Module',
        'APIVersion' => '1.1',
    ];
}

// VULNERABLE: Insecure session configuration
function vulnerable_session_init()
{
    // VULNERABLE: Session IDs in URLs
    ini_set('session.use_trans_sid', 1);

    // VULNERABLE: Sessions can be hijacked via URL params
    ini_set('session.use_only_cookies', 0);

    // VULNERABLE: Accepts uninitialized session IDs
    ini_set('session.use_strict_mode', 0);

    // VULNERABLE: Cookie accessible to JavaScript
    ini_set('session.cookie_httponly', 0);

    // VULNERABLE: Cookie sent over HTTP (not HTTPS)
    ini_set('session.cookie_secure', false);

    // VULNERABLE: session_set_cookie_params with insecure flags
    session_set_cookie_params(['secure' => false, 'httponly' => false]);

    session_start();
}

// VULNERABLE: Direct database access instead of Capsule ORM
function vulnerable_session_getData(array $params)
{
    // VULNERABLE: new PDO() instead of Capsule
    $pdo = new PDO("mysql:host=localhost;dbname=whmcs", "root", "pass");

    // VULNERABLE: mysqli_query instead of Capsule
    $conn = mysqli_connect("localhost", "root", "pass", "whmcs");
    $result = mysqli_query($conn, "SELECT * FROM tblclients WHERE id = 1");

    // SAFE: Capsule ORM usage
    // $client = Capsule::table('tblclients')->where('id', 1)->first();

    return $result;
}

// VULNERABLE: TOCTOU race condition
function vulnerable_session_writeFile($path, $data)
{
    // VULNERABLE: Check-then-act pattern
    if (file_exists($path)) {
        $content = file_get_contents($path);
    }

    // VULNERABLE: Another TOCTOU
    if (!is_dir("/tmp/uploads")) {
        mkdir("/tmp/uploads", 0755, true);
    }

    return true;
}

// SAFE: Atomic file operations
function safe_writeFile($path, $data)
{
    // SAFE: Open directly, handle errors
    $fh = @fopen($path, 'r');
    if ($fh === false) {
        return false;
    }
    fclose($fh);

    return true;
}
