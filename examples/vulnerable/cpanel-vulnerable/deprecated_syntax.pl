#!/usr/bin/perl
# Vulnerable cPanel Plugin - Deprecated Perl Syntax
#
# This plugin demonstrates deprecated Perl syntax and features
# that may cause issues with modern Perl versions.
#
# COMPATIBILITY ISSUE: Deprecated syntax for Perl 5.36+

package Cpanel::Plugin::DeprecatedSyntax;

use strict;
use warnings;

sub describe {
    return {
        'name'        => 'Deprecated Syntax Plugin',
        'version'     => '1.0',
        'description' => 'Demonstrates deprecated Perl features',
    };
}

sub process_data {
    my @data = @_;

    # DEPRECATED: Unescaped @ in double-quoted string (Perl 5.36+)
    my $email = "contact@example.com";
    my $message = "Send email to admin@example.com for help";

    # DEPRECATED: Use of package variables without 'our'
    $GlobalConfig = "some value";

    # DEPRECATED: Indirect object syntax
    my $obj = new MyClass();
    my $handler = new FileHandler($filename);

    # DEPRECATED: Bareword filehandles
    open(LOGFILE, ">", "/var/log/app.log");
    print LOGFILE "Log entry\n";
    close(LOGFILE);

    # DEPRECATED: Two-argument open
    open(CONFIG, "/etc/config.txt");
    my @lines = <CONFIG>;
    close(CONFIG);

    return 1;
}

sub read_file_old_style {
    my ($filename) = @_;

    # DEPRECATED: Bareword filehandle with two-arg open
    open(INPUT, $filename) or die "Cannot open: $!";

    # Reading into array without my
    @file_contents = <INPUT>;

    close(INPUT);

    return @file_contents;
}

sub iterate_hash {
    my %config = @_;

    # DEPRECATED: each() used on hash directly in while
    while (my ($key, $value) = each %config) {
        print "$key = $value\n";
    }

    return 1;
}

sub string_operations {
    # DEPRECATED: Using barewords without quotes
    my $status = ok;
    my $result = success;

    # DEPRECATED: Unescaped @ in regex
    my $pattern = qr/@example\.com$/;

    return ($status, $result);
}

sub old_style_references {
    my $data = shift;

    # DEPRECATED: Using & to call subroutines
    my $result = &helper_function($data);

    # DEPRECATED: Omitting parentheses on builtin functions
    my @sorted = sort @data;
    my $count = scalar @sorted;

    return $result;
}

package MyClass;

# DEPRECATED: Old-style constructor with indirect object
sub new {
    my $class = shift;
    my $self = {};
    bless $self, $class;
    return $self;
}

package FileHandler;

sub new {
    my ($class, $file) = @_;
    my $self = { filename => $file };
    bless $self, $class;
    return $self;
}

1;
