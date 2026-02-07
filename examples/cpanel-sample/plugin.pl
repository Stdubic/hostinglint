#!/usr/bin/perl
# Sample cPanel Plugin for HostingLint testing
# This file intentionally contains issues for the linter to detect.

# Missing: use strict;
# Missing: use warnings;

use Cpanel::JSON;
use Cpanel::Logger;

my $logger = Cpanel::Logger->new();

sub get_user_info {
    my ($username) = @_;

    # Potential taint issue: system call with variable
    my $home = `echo $username`;
    chomp($home);

    # Another potential taint issue
    system("ls -la /home/$username");

    return {
        username => $username,
        home     => $home,
    };
}

sub safe_operation {
    my ($data) = @_;

    # This is safe -- no external input in system calls
    my @files = glob("/etc/cpanel/*.conf");

    return \@files;
}

1;
