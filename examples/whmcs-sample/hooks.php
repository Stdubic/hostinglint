<?php
/**
 * Sample WHMCS Hooks file for HostingLint testing
 * This file intentionally contains issues for the linter to detect.
 */

// Hook without error handling (should trigger warning)
add_hook('ClientAdd', 1, function($vars) {
    $clientId = $vars['userid'];
    logActivity("New client added: $clientId");
    // No try/catch -- risky if logActivity fails
});

// Hook with proper error handling (should pass)
add_hook('AfterModuleCreate', 1, function($vars) {
    try {
        $serviceId = $vars['params']['serviceid'];
        logActivity("Service created: $serviceId");
    } catch (\Exception $e) {
        logActivity("Hook error: " . $e->getMessage());
    }
});
