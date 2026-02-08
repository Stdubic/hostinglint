<?php
/**
 * Vulnerable WHMCS Module - Insecure API Usage
 *
 * This module demonstrates insecure API calls and authentication issues.
 *
 * SECURITY FLAW: Hardcoded credentials, insecure HTTP, missing validation
 */

if (!defined("WHMCS")) {
    die("This file cannot be accessed directly");
}

function insecureapi_MetaData()
{
    return [
        'DisplayName' => 'Insecure API Module',
        'APIVersion' => '1.1',
    ];
}

function insecureapi_ConfigOptions()
{
    return [
        'api_key' => [
            'FriendlyName' => 'API Key',
            'Type' => 'text',
            'Default' => 'hardcoded_key_12345', // VULNERABLE: Hardcoded default
        ],
        'api_secret' => [
            'FriendlyName' => 'API Secret',
            'Type' => 'password',
            'Default' => 'my_secret_password', // VULNERABLE: Hardcoded secret
        ],
    ];
}

function insecureapi_CreateAccount(array $params)
{
    // VULNERABLE: Hardcoded credentials
    $apiKey = 'sk_live_1234567890abcdef';
    $apiSecret = 'hardcoded_secret_key';

    // VULNERABLE: HTTP instead of HTTPS
    $apiUrl = 'http://api.example.com/create';

    // VULNERABLE: SSL verification disabled
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $postData = [
        'username' => $params['username'],
        'password' => $params['password'], // VULNERABLE: Password in plain text
        'api_key' => $apiKey,
    ];

    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
    $response = curl_exec($ch);
    curl_close($ch);

    // VULNERABLE: No response validation
    return 'success';
}

function insecureapi_AdminCustomButtonArray()
{
    // VULNERABLE: Exposing credentials in admin area
    $token = 'admin_token_12345';

    return [
        'Sync Account' => 'syncAccount',
        'Debug' => 'showCredentials', // VULNERABLE: Debug function exposed
    ];
}

function insecureapi_showCredentials(array $params)
{
    // VULNERABLE: Logging sensitive data
    logModuleCall(
        'insecureapi',
        'credentials',
        ['api_key' => $params['configoption1'], 'secret' => $params['configoption2']],
        'Debug output'
    );

    return 'success';
}
