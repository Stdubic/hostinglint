<?php
/**
 * Vulnerable WHMCS Module - Command Injection Example
 *
 * This module demonstrates common command injection vulnerabilities
 * that HostingLint should detect.
 *
 * SECURITY FLAW: User input passed directly to OS commands (CWE-78)
 */

if (!defined("WHMCS")) {
    die("This file cannot be accessed directly");
}

function vulnerable_cmd_MetaData()
{
    return [
        'DisplayName' => 'Vulnerable Command Injection Module',
        'APIVersion' => '1.1',
    ];
}

function vulnerable_cmd_Config()
{
    return [
        'server_ip' => [
            'FriendlyName' => 'Server IP',
            'Type' => 'text',
        ],
    ];
}

function vulnerable_cmd_CreateAccount(array $params)
{
    // VULNERABLE: exec() with $params input
    exec("ping -c 4 " . $params['domain'], $output, $retval);

    // VULNERABLE: shell_exec() with $params input
    $dns = shell_exec("dig " . $params['domain']);

    // VULNERABLE: system() with $_POST input
    system("nslookup " . $_POST['hostname']);

    // VULNERABLE: passthru() with $_REQUEST input
    passthru("whois " . $_REQUEST['domain']);

    // VULNERABLE: proc_open() with $_GET input
    $proc = proc_open("traceroute " . $_GET['target'], $descriptors, $pipes);

    // VULNERABLE: popen() with $params input
    $handle = popen("ls -la /home/" . $params['username'], "r");

    // VULNERABLE: Backtick operator with $_GET input
    $result = `host $_GET['domain']`;

    return 'success';
}

function vulnerable_cmd_SuspendAccount(array $params)
{
    // VULNERABLE: User input in system command
    $username = $_POST['username'];
    exec("userdel " . $_POST['username']);

    // SAFE: Using escapeshellarg() - should NOT trigger
    exec("ping -c 4 " . escapeshellarg($params['domain']));

    return 'success';
}
