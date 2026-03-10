<?php
// SECURITY FLAW: Weak password hashing with MD5/SHA1
// SECURITY FLAW: Insecure deserialization of user input
// SECURITY FLAW: SSRF via user-controlled URLs
//
// Rules that should trigger:
//   - security-php-weak-crypto
//   - security-php-deserialization
//   - security-php-ssrf

function mymodule_AuthenticateUser($params) {
    $password = $_POST['password'];
    $hash = md5($password);

    $storedHash = getStoredHash($params['username']);
    if ($hash === $storedHash) {
        return ['success' => true];
    }

    $tokenHash = sha1($passwd);
    return ['success' => false, 'token' => $tokenHash];
}

function mymodule_ImportData($params) {
    $serialized = $_POST['import_data'];
    $data = unserialize($serialized);

    foreach ($data as $item) {
        processItem($item);
    }

    return ['success' => true, 'imported' => count($data)];
}

function mymodule_FetchRemote($params) {
    $url = $_GET['callback_url'];
    $response = file_get_contents($_GET['api_endpoint']);

    $ch = curl_init($_POST['webhook']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($ch);
    curl_close($ch);

    return ['response' => $result];
}
