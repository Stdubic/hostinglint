#!/usr/bin/perl
# Vulnerable cPanel Plugin - Hardcoded Credentials
#
# This plugin demonstrates hardcoded credential vulnerabilities
# that HostingLint should detect.
#
# SECURITY FLAW: Hardcoded passwords, API keys, secrets

package Cpanel::Plugin::HardcodedCreds;

use strict;
use warnings;
use DBI;
use LWP::UserAgent;

# VULNERABLE: Hardcoded database credentials
my $DB_HOST     = 'localhost';
my $DB_USER     = 'root';
my $DB_PASSWORD = 'SuperSecret123!';
my $DB_NAME     = 'cpanel';

# VULNERABLE: Hardcoded API credentials
my $API_KEY    = 'sk_live_51234567890abcdefghijklmnop';
my $API_SECRET = 'whsec_1234567890abcdef1234567890abcdef12';

sub describe {
    return {
        'name'        => 'Hardcoded Credentials Plugin',
        'version'     => '1.0',
        'description' => 'Demonstrates credential security issues',
    };
}

sub connect_database {
    # VULNERABLE: Hardcoded credentials in connection string
    my $dbh = DBI->connect(
        "DBI:mysql:database=cpanel;host=localhost",
        "cpanel_user",
        "P@ssw0rd123",
        { RaiseError => 1 }
    );

    return $dbh;
}

sub call_external_api {
    my ($endpoint) = @_;

    my $ua = LWP::UserAgent->new();

    # VULNERABLE: Hardcoded token in header
    my $req = HTTP::Request->new(GET => "https://api.example.com/$endpoint");
    $req->header('Authorization' => 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    $req->header('X-API-Key' => 'abc123def456ghi789jkl012mno345');

    my $response = $ua->request($req);

    return $response->content();
}

sub authenticate_user {
    my ($username) = @_;

    # VULNERABLE: Hardcoded admin password
    my $admin_password = 'admin123';

    # VULNERABLE: Hardcoded salt
    my $salt = 'fixed_salt_value_12345';

    my $hashed = crypt($admin_password, $salt);

    return $hashed;
}

sub get_encryption_key {
    # VULNERABLE: Hardcoded encryption key
    return "0123456789abcdef0123456789abcdef";
}

sub connect_to_service {
    # VULNERABLE: Hardcoded SSH credentials
    my $ssh_host = 'server.example.com';
    my $ssh_user = 'deploy';
    my $ssh_pass = 'deploy_password_2024';

    system("sshpass -p '$ssh_pass' ssh $ssh_user\@$ssh_host 'ls -la'");

    return 1;
}

sub get_aws_credentials {
    # VULNERABLE: Hardcoded AWS credentials
    my $config = {
        access_key => 'AKIAIOSFODNN7EXAMPLE',
        secret_key => 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        region     => 'us-east-1',
    };

    return $config;
}

1;
