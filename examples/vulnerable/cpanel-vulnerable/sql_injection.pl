#!/usr/bin/perl
# Vulnerable cPanel Plugin - SQL Injection
#
# This plugin demonstrates SQL injection vulnerabilities
# that HostingLint should detect.
#
# SECURITY FLAW: Unvalidated input in SQL queries

package Cpanel::Plugin::VulnerableSql;

use strict;
use warnings;
use DBI;

sub describe {
    return {
        'name'        => 'Vulnerable SQL Plugin',
        'version'     => '1.0',
        'description' => 'Demonstrates SQL injection issues',
    };
}

sub get_user_data {
    my ($user_id) = @_;

    my $dbh = DBI->connect("DBI:mysql:database=cpanel", "root", "password");

    # VULNERABLE: Direct string interpolation in SQL
    my $query = "SELECT * FROM users WHERE id = $user_id";
    my $sth = $dbh->prepare($query);
    $sth->execute();

    my $result = $sth->fetchrow_hashref();
    $sth->finish();
    $dbh->disconnect();

    return $result;
}

sub update_user_email {
    my ($username, $email) = @_;

    my $dbh = DBI->connect("DBI:mysql:database=cpanel", "root", "password");

    # VULNERABLE: String concatenation with user input
    my $sql = "UPDATE users SET email = '" . $email . "' WHERE username = '" . $username . "'";

    $dbh->do($sql);
    $dbh->disconnect();

    return 1;
}

sub search_accounts {
    my ($search_term) = @_;

    my $dbh = DBI->connect("DBI:mysql:database=cpanel", "root", "password");

    # VULNERABLE: LIKE clause with unescaped input
    my $query = "SELECT * FROM accounts WHERE name LIKE '%$search_term%'";
    my $sth = $dbh->prepare($query);
    $sth->execute();

    my @results;
    while (my $row = $sth->fetchrow_hashref()) {
        push @results, $row;
    }

    $sth->finish();
    $dbh->disconnect();

    return \@results;
}

sub delete_old_records {
    my ($table, $days) = @_;

    my $dbh = DBI->connect("DBI:mysql:database=cpanel", "root", "password");

    # VULNERABLE: Table name from user input
    my $sql = "DELETE FROM $table WHERE created_at < DATE_SUB(NOW(), INTERVAL $days DAY)";

    $dbh->do($sql);
    $dbh->disconnect();

    return 1;
}

sub get_config_value {
    my ($key) = @_;

    my $dbh = DBI->connect("DBI:mysql:database=cpanel", "root", "password");

    # VULNERABLE: No input validation on key
    my $query = "SELECT value FROM config WHERE key = '$key'";
    my ($value) = $dbh->selectrow_array($query);

    $dbh->disconnect();

    return $value;
}

1;
