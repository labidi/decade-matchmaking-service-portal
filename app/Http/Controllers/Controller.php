<?php

namespace App\Http\Controllers;

abstract class Controller
{
    /**
     * Detect if current route is an admin route
     */
    protected function isAdminRoute(): bool
    {
        return request()->route()->getPrefix() ===  'admin';
    }
}
