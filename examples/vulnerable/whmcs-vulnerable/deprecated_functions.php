<?php
/**
 * Vulnerable WHMCS Module - Deprecated PHP Functions
 *
 * This module demonstrates usage of deprecated PHP functions
 * that will cause compatibility issues.
 *
 * COMPATIBILITY ISSUE: Using removed PHP 7.4+ functions
 */

if (!defined("WHMCS")) {
    die("This file cannot be accessed directly");
}

function deprecated_MetaData()
{
    return [
        'DisplayName' => 'Deprecated Functions Module',
        'APIVersion' => '1.1',
    ];
}

function deprecated_CreateAccount(array $params)
{
    // DEPRECATED: each() removed in PHP 7.2
    $config = ['host' => 'localhost', 'port' => 3306];
    while (list($key, $value) = each($config)) {
        logModuleCall('deprecated', 'config', $key, $value);
    }

    // DEPRECATED: create_function() removed in PHP 8.0
    $callback = create_function('$a,$b', 'return $a + $b;');
    $total = $callback(5, 10);

    // DEPRECATED: mysql_* functions removed in PHP 7.0
    $conn = mysql_connect('localhost', 'user', 'pass');
    mysql_select_db('whmcs', $conn);

    // DEPRECATED: split() removed in PHP 7.0
    $parts = split(',', $params['options']);

    // DEPRECATED: ereg() removed in PHP 7.0
    if (ereg('^[a-z]+$', $params['domain'])) {
        $valid = true;
    }

    // DEPRECATED: money_format() removed in PHP 8.0
    $price = money_format('%.2n', $params['amount']);

    return 'success';
}

function deprecated_AdminServicesTabFields(array $params)
{
    // DEPRECATED: call_user_method() removed in PHP 7.0
    $obj = new stdClass();
    call_user_method('someMethod', $obj);

    return [];
}
