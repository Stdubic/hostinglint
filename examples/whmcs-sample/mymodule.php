<?php
/**
 * Sample WHMCS Module for HostingLint testing
 * This file intentionally contains issues for the linter to detect.
 */

// Missing MetaData function (WHMCS 8.0+ requirement)

function mymodule_Config() {
    return array(
        "name" => "My Sample Module",
        "description" => "A sample module for testing HostingLint",
        "version" => "1.0",
        "author" => "Test Author",
    );
}

function mymodule_CreateAccount($params) {
    // Deprecated function usage
    $client = getClientsDetails($params['clientsdetails']['userid']);

    // PHP 8.0 incompatibility: each() removed
    $config = array("key1" => "val1", "key2" => "val2");
    while (list($k, $v) = each($config)) {
        logActivity("Config: $k = $v");
    }

    // Potential SQL injection
    $domain = $params['domain'];
    $result = mysql_query("SELECT * FROM tblhosting WHERE domain = '$domain'");

    // Deprecated query function
    $data = select_query("tblhosting", "id,domain", array("userid" => $params['clientsdetails']['userid']));

    return "success";
}

function mymodule_SuspendAccount($params) {
    try {
        // Safe: using WHMCS Capsule ORM
        $hosting = \WHMCS\Database\Capsule::table('tblhosting')
            ->where('id', $params['serviceid'])
            ->first();

        return array('success' => true);
    } catch (\Exception $e) {
        return array('error' => $e->getMessage());
    }
}
