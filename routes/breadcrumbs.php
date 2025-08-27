<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;


Breadcrumbs::for('user.home', function (BreadcrumbTrail $trail) {
    $trail->push('Home', route('user.home'));
});

