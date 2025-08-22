<?php

namespace App\Http\Controllers\Request;

use App\Http\Controllers\Controller;
use App\Models\Request\Status;
use App\Services\RequestService;
use App\Traits\HasBreadcrumbs;
use Illuminate\Http\Request;


abstract class BaseRequestController extends Controller
{
    use HasBreadcrumbs;

}
