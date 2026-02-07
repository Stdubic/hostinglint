#!/usr/bin/perl
# Sample cPanel Plugin that follows best practices
# This file should pass HostingLint checks cleanly.

use strict;
use warnings;

use Cpanel::JSON;
use Cpanel::Logger;

my $logger = Cpanel::Logger->new();

sub get_user_info {
    my ($username) = @_;

    # Safe: validate input before use
    if ($username !~ /^[a-z][a-z0-9]{0,15}$/) {
        $logger->warn("Invalid username: $username");
        return;
    }

    my $home = "/home/$username";

    return {
        username => $username,
        home     => $home,
    };
}

1;
