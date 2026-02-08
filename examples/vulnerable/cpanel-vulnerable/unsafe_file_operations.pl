#!/usr/bin/perl
# Vulnerable cPanel Plugin - Unsafe File Operations
#
# This plugin demonstrates common file operation vulnerabilities
# that HostingLint should detect.
#
# SECURITY FLAW: Path traversal, command injection, insecure permissions

package Cpanel::Plugin::VulnerableFiles;

use strict;
use warnings;

sub describe {
    return {
        'name'        => 'Vulnerable File Plugin',
        'version'     => '1.0',
        'description' => 'Demonstrates file security issues',
    };
}

sub backup_file {
    my ($filename) = @_;

    # VULNERABLE: No path validation - allows directory traversal
    my $backup_path = "/home/user/backups/" . $filename;

    # VULNERABLE: Using system() with user input
    system("cp /var/www/$filename $backup_path");

    # VULNERABLE: Insecure file permissions
    chmod 0777, $backup_path;

    return 1;
}

sub read_config {
    my ($config_name) = @_;

    # VULNERABLE: Path traversal possible
    my $path = "/etc/app/" . $config_name;

    # VULNERABLE: No validation of file path
    open(my $fh, '<', $path) or die "Cannot open: $!";
    my $content = do { local $/; <$fh> };
    close($fh);

    return $content;
}

sub process_upload {
    my ($uploaded_file) = @_;

    # VULNERABLE: No file type validation
    my $dest = "/var/www/uploads/" . $uploaded_file;

    # VULNERABLE: Backticks with user input (command injection)
    my $result = `mv /tmp/$uploaded_file $dest`;

    # VULNERABLE: File created with wrong ownership
    system("chown www-data:www-data $dest");

    return $result;
}

sub create_user_file {
    my ($username, $content) = @_;

    # VULNERABLE: String concatenation without validation
    my $filename = "/home/" . $username . "/data.txt";

    # VULNERABLE: Two-argument open (deprecated and dangerous)
    open(FILE, ">$filename");
    print FILE $content;
    close(FILE);

    return $filename;
}

sub archive_logs {
    my ($log_dir) = @_;

    # VULNERABLE: Shell metacharacters not escaped
    my $cmd = "tar -czf /backups/logs.tar.gz $log_dir/*.log";
    system($cmd);

    return 1;
}

1;
