<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;


try {
    Breadcrumbs::for('opportunity.create', function (BreadcrumbTrail $trail) {
        $trail->parent('user.home');
        $trail->push('Submit a new Opportunity', route('opportunity.create'));
    });
    Breadcrumbs::for('user.home', function (BreadcrumbTrail $trail) {
        $trail->push('Home', route('user.home'));
    });
    Breadcrumbs::for('me.opportunity.list', function (BreadcrumbTrail $trail) {
        $trail->parent('user.home');
        $trail->push('My submitted opportunities', route('me.opportunity.list'));
    });
    Breadcrumbs::for('opportunity.list', function (BreadcrumbTrail $trail) {
        $trail->parent('user.home');
        $trail->push('View and Apply for Partner Opportunities', route('opportunity.list'));
    });
    Breadcrumbs::for('me.opportunity.show', function (BreadcrumbTrail $trail) {
        $trail->parent('user.home');
        $trail->push('My submitted opportunities', route('me.opportunity.list'));
        $trail->push('My Opportunity details', route('me.opportunity.show', request('id')));
    });
} catch (\Diglactic\Breadcrumbs\Exceptions\DuplicateBreadcrumbException $e) {

}




Breadcrumbs::for('opportunity.show', function (BreadcrumbTrail $trail) {
    $trail->parent('user.home');
    $trail->push('View and Apply for Partner Opportunities', route('opportunity.list'));
    $trail->push('Opportunity details', route('opportunity.show', request('id')));
});

Breadcrumbs::for('opportunity.edit', function (BreadcrumbTrail $trail) {
    $trail->parent('user.home');
    $trail->push('My submitted opportunities', route('me.opportunity.list'));
    $trail->push('Edit Opportunity', route('opportunity.edit', request('id')));
});