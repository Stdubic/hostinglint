<?php
/**
 * Vulnerable WHMCS Module - SQL Injection Example
 *
 * This module demonstrates common SQL injection vulnerabilities
 * that HostingLint should detect.
 *
 * SECURITY FLAW: Direct use of user input in SQL queries
 */

if (!defined("WHMCS")) {
    die("This file cannot be accessed directly");
}

function vulnerable_MetaData()
{
    return [
        'DisplayName' => 'Vulnerable SQL Module',
        'APIVersion' => '1.1',
    ];
}

function vulnerable_ConfigOptions()
{
    return [
        'server_id' => [
            'FriendlyName' => 'Server ID',
            'Type' => 'text',
        ],
    ];
}

function vulnerable_CreateAccount(array $params)
{
    $userId = $_GET['userid']; // VULNERABLE: Unvalidated user input

    // VULNERABLE: Direct concatenation in SQL query
    $query = "SELECT * FROM tblclients WHERE id = " . $userId;
    $result = mysql_query($query);

    // VULNERABLE: Using deprecated mysql_ functions
    $data = mysql_fetch_assoc($result);

    // VULNERABLE: Another SQL injection via POST
    $domain = $_POST['domain'];
    full_query("INSERT INTO tblhosting (domain) VALUES ('" . $domain . "')");

    return 'success';
}

function vulnerable_SuspendAccount(array $params)
{
    // VULNERABLE: User input in SQL without escaping
    $serviceId = $params['serviceid'];
    $reason = $_POST['reason'];

    $sql = "UPDATE tblhosting SET domainstatus = 'Suspended',
            notes = '$reason' WHERE id = $serviceId";

    full_query($sql);

    return 'success';
}
